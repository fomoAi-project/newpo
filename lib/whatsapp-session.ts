import makeWASocket, { Browsers, DisconnectReason, useMultiFileAuthState as loadMultiFileAuthState, type WAMessageContent, type WASocket } from "@whiskeysockets/baileys";
import QRCode from "qrcode";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import OpenAI from "openai";

export type WhatsAppConnectionStatus = "starting" | "qr" | "connected" | "disconnected" | "error";

export type WhatsAppConnectionSnapshot = {
  sessionId: string;
  status: WhatsAppConnectionStatus;
  qr?: string;
  account?: { name?: string; phoneNumber?: string; jid?: string };
  error?: string;
  messages?: WhatsAppIncomingMessage[];
  trainingContext?: WhatsAppTrainingContext;
};

export type WhatsAppIncomingMessage = {
  id: string;
  sender: string;
  body: string;
  receivedAt: number;
  messageType: "business" | "normal";
  aiReply?: string;
  replySent?: boolean;
  recipient?: string;
};

export type WhatsAppTrainingContext = { businessName?: string; industry?: string; knowledge?: string[] };

type WhatsAppSession = WhatsAppConnectionSnapshot & { socket?: WASocket; trainingContext?: WhatsAppTrainingContext; processingMessageIds?: Set<string> };

const globalForWhatsApp = globalThis as typeof globalThis & { whatsappSession?: WhatsAppSession };

function getSession() {
  return globalForWhatsApp.whatsappSession;
}

export async function startWhatsAppSession() {
  const existing = getSession();
  if (existing && ["starting", "qr", "connected"].includes(existing.status)) return existing;

  const session: WhatsAppSession = { sessionId: crypto.randomUUID(), status: "starting" };
  globalForWhatsApp.whatsappSession = session;
  void connectWhatsApp(session);
  return session;
}

export function updateWhatsAppTrainingContext(context: WhatsAppTrainingContext) {
  const session = getSession();
  if (session) session.trainingContext = context;
}

export function getWhatsAppMessages() {
  const session = getSession();
  return session?.messages ?? [];
}

export async function processWhatsAppBacklog() {
  const session = getSession();
  if (!session?.messages?.length) return;
  for (const message of session.messages) {
    if (message.messageType === "business" && !message.aiReply) await generateAndSendReply(session, message.recipient, message);
  }
}

export function getWhatsAppSession(): WhatsAppConnectionSnapshot | null {
  const session = getSession();
  if (!session) return null;
  const snapshot = { ...session };
  delete snapshot.socket;
  return snapshot;
}

export async function disconnectWhatsAppSession() {
  const session = getSession();
  if (!session) return;
  await session.socket?.logout().catch(() => undefined);
  globalForWhatsApp.whatsappSession = undefined;
}

export async function resetWhatsAppSession() {
  await disconnectWhatsAppSession();
  await rm(path.join(process.cwd(), ".data", "whatsapp"), { recursive: true, force: true });
}

async function connectWhatsApp(session: WhatsAppSession) {
  try {
    const authDirectory = path.join(process.cwd(), ".data", "whatsapp");
    await mkdir(authDirectory, { recursive: true });
    const { state, saveCreds } = await loadMultiFileAuthState(authDirectory);
    const socket = makeWASocket({ auth: state, browser: Browsers.ubuntu("Chrome"), markOnlineOnConnect: false, syncFullHistory: false });
    session.socket = socket;
    socket.ev.on("creds.update", saveCreds);
    socket.ev.on("messages.upsert", ({ messages, type }) => {
      if (type !== "notify" && type !== "append") return;
      for (const message of messages) {
        if (message.key.fromMe || !message.message) continue;
        const body = getMessageText(message.message);
        if (!body?.trim()) continue;
        void processIncomingMessage(session, message.key.id ?? crypto.randomUUID(), message.pushName ?? message.key.remoteJid?.split("@")[0] ?? "Unknown contact", body.trim(), message.key.remoteJid ?? undefined);
      }
    });
    socket.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
      if (qr) {
        session.qr = await QRCode.toDataURL(qr, { margin: 1, width: 320 });
        session.status = "qr";
      }
      if (connection === "open") {
        session.status = "connected";
        session.qr = undefined;
        session.account = { name: socket.user?.name, phoneNumber: socket.user?.id?.split(":")[0], jid: socket.user?.id };
      }
      if (connection === "close") {
        const statusCode = (lastDisconnect?.error as { output?: { statusCode?: number } })?.output?.statusCode;
        if (statusCode === 515) {
          session.status = "starting";
          session.error = undefined;
          session.socket = undefined;
          setTimeout(() => void connectWhatsApp(session), 250);
          return;
        }
        session.status = statusCode === DisconnectReason.loggedOut ? "disconnected" : "error";
        session.error = statusCode === DisconnectReason.loggedOut ? "WhatsApp logged out this device. Start a new connection to try again." : "The WhatsApp connection closed. Start a new connection to try again.";
        session.socket = undefined;
      }
    });
  } catch (error) {
    session.status = "error";
    session.error = error instanceof Error ? error.message : "WhatsApp could not be started.";
  }
}

async function processIncomingMessage(session: WhatsAppSession, id: string, sender: string, body: string, recipient: string | undefined) {
  session.processingMessageIds ??= new Set();
  if (session.processingMessageIds.has(id)) return;
  session.processingMessageIds.add(id);
  const incoming: WhatsAppIncomingMessage = {
    id,
    sender,
    body,
    receivedAt: Date.now(),
    messageType: classifyWhatsAppMessage(body, session.trainingContext),
    recipient,
  };
  session.messages = [...(session.messages ?? []), incoming].slice(-100);
  void classifyAndRespond(session, incoming);
}

async function classifyAndRespond(session: WhatsAppSession, incoming: WhatsAppIncomingMessage) {
  const messageType = await classifyWithOpenAI(incoming.body, session.trainingContext);
  incoming.messageType = messageType;
  await generateAndSendReply(session, incoming.recipient, incoming);
}

async function classifyWithOpenAI(body: string, context?: WhatsAppTrainingContext): Promise<"business" | "normal"> {
  if (!process.env.OPENAI_API_KEY) return classifyWhatsAppMessage(body, context);
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: `Is this a customer message to a business? Answer BUSINESS or SPAM. BUSINESS = anything a customer says when contacting a business: greetings, questions, inquiries, requests about products/services. SPAM = obvious spam or clearly not a business inquiry. When in doubt, mark as BUSINESS. One word only.\nBusiness: ${(context?.knowledge ?? []).join(" | ")}\nMessage: ${body}`,
      }],
      max_tokens: 5,
    });
    return response.choices[0]?.message?.content?.trim().toUpperCase().startsWith("BUSINESS") ? "business" : "normal";
  } catch {
    return classifyWhatsAppMessage(body, context);
  }
}

function classifyWhatsAppMessage(body: string, context?: WhatsAppTrainingContext): "business" | "normal" {
  const text = normalize(body);
  const trainedTerms = (context?.knowledge ?? []).flatMap((entry) => meaningfulWords(entry));
  const profileTerms = meaningfulWords(`${context?.businessName ?? ""} ${context?.industry ?? ""}`);
  const businessTerms = new Set([...trainedTerms, ...profileTerms, "price", "cost", "buy", "order", "book", "booking", "appointment", "service", "product", "location", "hours", "available", "quote", "delivery", "support"]);
  return [...businessTerms].some((term) => text.includes(term)) ? "business" : "normal";
}

function meaningfulWords(value: string) {
  return normalize(value).split(" ").filter((word) => word.length >= 4);
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function getMessageText(message: WAMessageContent | undefined): string | undefined {
  if (!message) return undefined;
  return message.conversation ?? message.extendedTextMessage?.text ?? message.ephemeralMessage?.message?.conversation ?? message.ephemeralMessage?.message?.extendedTextMessage?.text ?? message.viewOnceMessage?.message?.conversation ?? message.viewOnceMessage?.message?.extendedTextMessage?.text ?? undefined;
}

async function generateAndSendReply(session: WhatsAppSession, recipient: string | undefined, incoming: WhatsAppIncomingMessage) {
  if (!process.env.OPENAI_API_KEY || !session.socket) return;
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const knowledge = session.trainingContext?.knowledge?.join("\n") || "We'll have the team follow up with you shortly.";
    const systemPrompt = `You are a WhatsApp assistant for ${session.trainingContext?.businessName ?? "this business"}. Answer customer messages based on the business info below. If asked about something you don't know, say the team will follow up. Be friendly, brief, and natural for WhatsApp.\n\nBusiness Info:\n${knowledge}`;
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: incoming.body },
      ],
      max_tokens: 150,
    });
    const reply = response.choices[0]?.message?.content?.trim();
    if (!reply) return;
    if (recipient) await session.socket.sendMessage(recipient, { text: reply });
    incoming.aiReply = reply;
    incoming.replySent = true;
  } catch (error) {
    incoming.aiReply = error instanceof Error ? `AI reply failed: ${error.message}` : "AI reply failed.";
    incoming.replySent = false;
  }
}