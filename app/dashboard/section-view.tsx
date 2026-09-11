"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { BusinessSession } from "@/lib/browser-session";
import { getBusinessProfile, saveBusinessProfile, useFirebaseUser } from "@/lib/firebase-auth";
import { emptyWorkspace, getWorkspaceData, saveWorkspaceData, deleteKnowledgeEntry, getWhatsAppOwner, setWhatsAppOwner, clearWhatsAppOwner, type WorkspaceData } from "@/lib/workspace-store";

declare global {
  interface Window {
    FB?: {
      init: (options: Record<string, unknown>) => void;
      login: (callback: (response: { authResponse?: { code?: string }; status?: string; error?: { message?: string; code?: number } }) => void, options: Record<string, unknown>) => void;
    };
  }
}

const copy: Record<string, { title: string; description: string }> = {
  customers: { title: "Customers", description: "Keep the people your business serves organized and ready for follow-up." },
  products: { title: "Products and services", description: "Add the offers your AI employee should understand and explain." },
  appointments: { title: "Appointments", description: "Keep upcoming visits and customer bookings visible to your team." },
  automations: { title: "Automations", description: "Prepare follow-ups and rules for the work your team repeats." },
  analytics: { title: "Analytics", description: "Your workspace metrics will appear here as conversations and leads arrive." },
  billing: { title: "Billing", description: "Plan and usage management will appear here when billing is connected." },
};

export function SectionView({ section }: { section: string }) {
  const { user } = useFirebaseUser();
  const [business, setBusiness] = useState<BusinessSession | null>(null);
  const [workspace, setWorkspace] = useState<WorkspaceData>(emptyWorkspace);

  useEffect(() => {
    if (!user) return;
    Promise.all([getBusinessProfile(user), getWorkspaceData(user.uid)]).then(([profile, data]) => {
      setBusiness(profile);
      setWorkspace(data);
    });
  }, [user]);

  if (section === "settings") return <SettingsView key={business?.email ?? "loading"} business={business} userId={user?.uid} onSaved={setBusiness} />;
  if (section === "channels") return <ChannelsView workspace={workspace} userId={user?.uid} onSaved={setWorkspace} />;
  if (section === "inbox") return <InboxView workspace={workspace} userId={user?.uid} onSaved={setWorkspace} />;
  if (section === "leads") return <LeadsView workspace={workspace} userId={user?.uid} onSaved={setWorkspace} />;
  if (section === "knowledge") return <KnowledgeView workspace={workspace} userId={user?.uid} onSaved={setWorkspace} />;

  const content = copy[section] ?? { title: "Workspace", description: "This workspace area is ready for your business configuration." };
  return <PageFrame title={content.title} description={content.description}><div className="border border-zinc-200 bg-white p-6 text-sm text-zinc-500">There is no data here yet. As your team uses the workspace, this page will show real information instead of sample records.</div></PageFrame>;
}

function PageFrame({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <main className="min-h-screen px-5 py-7 text-black sm:px-8 lg:px-12 lg:py-10"><div className="mx-auto max-w-6xl"><div className="flex items-center justify-between border-b border-black pb-5"><div><p className="workspace-kicker text-[10px] font-bold uppercase text-gray-600">AIBiz / Workspace</p><h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">{description}</p></div><div className="hidden items-center gap-2 text-xs text-gray-600 sm:flex"><span className="h-2 w-2 rounded-full bg-black" />Live workspace</div></div><div className="mt-8">{children}</div></div></main>;
}

function SettingsView({ business, userId, onSaved }: { business: BusinessSession | null; userId?: string; onSaved: (value: BusinessSession) => void }) {
  const [form, setForm] = useState(business ?? { businessName: "", industry: "", ownerName: "", email: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  async function submit(event: FormEvent) { event.preventDefault(); if (!userId) return; setSaving(true); await saveBusinessProfile(userId, form); onSaved(form); setNotice("Business settings saved."); setSaving(false); }
  return <PageFrame title="Settings" description="Keep your business profile accurate so your AI employee has the right context."><form onSubmit={submit} className="max-w-2xl space-y-5 border border-black bg-white p-6">{([['businessName','Business name'],['ownerName','Your name'],['industry','Industry'],['email','Email'],['phone','Phone']] as const).map(([key,label]) => <label key={key} className="block text-sm font-medium text-black">{label}<input required={key !== 'phone'} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} className="mt-2 block w-full border border-black bg-white px-3 py-3 font-normal text-black placeholder-gray-500 outline-none focus:bg-gray-50 focus:border-black" /></label>)}{notice && <p className="text-sm font-medium text-black">{notice}</p>}<button disabled={saving} className="bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60">{saving ? "Saving..." : "Save changes"}</button></form></PageFrame>;
}

function ChannelsView({ workspace, userId, onSaved }: { workspace: WorkspaceData; userId?: string; onSaved: (value: WorkspaceData) => void }) {
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const pollRef = useRef<number | null>(null);
  const workspaceRef = useRef(workspace);
  const connected = workspace.channels.find((item) => item.type === "whatsapp");

  useEffect(() => {
    return () => { if (pollRef.current) window.clearInterval(pollRef.current); };
  }, []);

  async function finishConnection(data: { account?: { name?: string; phoneNumber?: string; jid?: string } }) {
    if (!userId || !data.account) return;
    const owner = await getWhatsAppOwner(data.account.phoneNumber);
    if (owner && owner !== userId) {
      setError("This WhatsApp account is already connected to another user. Disconnect it there first.");
      setIsConnecting(false);
      const clearedWorkspace = { ...workspace, channels: workspace.channels.filter((item) => item.type !== "whatsapp") };
      await saveWorkspaceData(userId, clearedWorkspace);
      onSaved(clearedWorkspace);
      return;
    }
    await setWhatsAppOwner(data.account.phoneNumber, userId);
    const next = { ...workspace, channels: [...workspace.channels.filter((item) => item.type !== "whatsapp"), { id: `whatsapp-${Date.now()}`, type: "whatsapp" as const, name: data.account.name ?? "WhatsApp", phoneNumber: data.account.phoneNumber, businessAccountId: data.account.jid, status: "connected" as const }] };
    await saveWorkspaceData(userId, next);
    onSaved(next);
    setNotice("WhatsApp connected. Your account is ready to receive messages.");
    setQrCode("");
    setIsConnecting(false);
  }

  async function saveIncomingMessages(messages: Array<{ id: string; sender: string; body: string; messageType: "business" | "normal" }>) {
    if (!userId || messages.length === 0) return;
    const current = workspaceRef.current;
    const freshMessages = messages.filter((message) => !current.conversations.some((conversation) => conversation.id === `whatsapp-${message.id}`));
    if (freshMessages.length === 0) return;
    const next = { ...current, conversations: [...current.conversations, ...freshMessages.map((message) => ({ id: `whatsapp-${message.id}`, name: message.sender, channel: "WhatsApp", note: message.body, messageType: message.messageType, status: message.messageType === "business" ? "AI handling" as const : "Needs owner" as const }))] };
    await saveWorkspaceData(userId, next);
    workspaceRef.current = next;
    onSaved(next);
  }

  async function connectWhatsApp() {
    setError("");
    setNotice("");
    if (!userId) return;
    setIsConnecting(true);
    setQrCode("");
    try {
      const clearedWorkspace = { ...workspace, channels: workspace.channels.filter((item) => item.type !== "whatsapp") };
      await saveWorkspaceData(userId, clearedWorkspace);
      onSaved(clearedWorkspace);
      const result = await fetch("/api/whatsapp/connect", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reset: true, knowledge: workspace.knowledge.map((item) => item.content) }) });
      const data = await result.json();
      if (!result.ok) throw new Error(data.error ?? "WhatsApp could not be started.");
      await saveIncomingMessages(data.messages ?? []);
      setQrCode(data.qr ?? "");
      if (data.status === "connected") { await finishConnection(data); return; }
      pollRef.current = window.setInterval(async () => {
        const statusResult = await fetch("/api/whatsapp/connect");
        const status = await statusResult.json();
        await saveIncomingMessages(status.messages ?? []);
        if (status.qr) setQrCode(status.qr);
        if (status.status === "connected") {
          if (pollRef.current) window.clearInterval(pollRef.current);
          await finishConnection(status);
        } else if (status.status === "error" || status.status === "disconnected") {
          if (pollRef.current) window.clearInterval(pollRef.current);
          setError(status.error ?? "WhatsApp could not be connected.");
          setIsConnecting(false);
        }
      }, 1500);
    } catch (connectionError) {
      setError(connectionError instanceof Error ? connectionError.message : "WhatsApp could not be connected.");
      setIsConnecting(false);
    }
  }

  async function disconnectWhatsApp() {
    setError("");
    setNotice("");
    if (!userId) return;
    try {
      const phoneNumber = connected?.phoneNumber;
      const result = await fetch("/api/whatsapp/connect", { method: "DELETE" });
      if (!result.ok) throw new Error("Failed to disconnect WhatsApp.");
      await clearWhatsAppOwner(phoneNumber);
      const next = { ...workspace, channels: workspace.channels.filter((item) => item.type !== "whatsapp") };
      await saveWorkspaceData(userId, next);
      onSaved(next);
      setNotice("WhatsApp disconnected successfully.");
      setQrCode("");
    } catch (disconnectError) {
      setError(disconnectError instanceof Error ? disconnectError.message : "Failed to disconnect WhatsApp.");
    }
  }

  return <PageFrame title="Channels" description="Connect the channels where customers already reach your business."><div className="grid gap-6 lg:grid-cols-2"><div className="border border-black bg-white p-6"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold">WhatsApp</h2><span className="text-xs font-medium text-gray-600">{connected?.status ?? "Not connected"}</span></div><p className="mt-3 text-sm leading-6 text-gray-600">Scan the QR code with WhatsApp on your phone. This uses a direct WhatsApp Web connection and does not require Meta Business setup.</p>{qrCode && <div className="mt-6 flex flex-col items-center border border-black p-4"><Image src={qrCode} alt="Scan this QR code with WhatsApp" width={256} height={256} unoptimized /><p className="mt-3 text-center text-xs text-gray-600">Open WhatsApp on your phone, then choose Linked devices and Link a device.</p></div>}<div className="mt-6 flex gap-3"><button type="button" onClick={connectWhatsApp} disabled={isConnecting} className="bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60">{isConnecting ? "Waiting for phone..." : connected ? "Reconnect WhatsApp" : "Connect WhatsApp"}</button>{connected && <button type="button" onClick={disconnectWhatsApp} className="bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800">Disconnect</button>}</div>{notice && <p className="mt-4 text-sm text-black font-medium">{notice}</p>}{error && <p className="mt-4 text-sm text-black">{error}</p>}</div><div className="border border-dashed border-black bg-white p-6"><h2 className="text-lg font-semibold">Connection requirements</h2><ul className="mt-3 space-y-2 text-sm leading-6 text-gray-600"><li>Keep the phone with WhatsApp available while linking.</li><li>Use WhatsApp or WhatsApp Business on the phone.</li><li>The server must keep its local WhatsApp session directory.</li></ul></div></div></PageFrame>;
}

function InboxView({ workspace, userId, onSaved }: { workspace: WorkspaceData; userId?: string; onSaved: (value: WorkspaceData) => void }) {
  const [name, setName] = useState(""); const [note, setNote] = useState("");
  const workspaceRef = useRef(workspace);
  useEffect(() => { workspaceRef.current = workspace; }, [workspace]);
  useEffect(() => {
    if (!userId) return;
    let syncing = false;
      const sync = async () => {
      if (syncing) return;
      syncing = true;
      try {
        const result = await fetch("/api/whatsapp/connect", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ knowledge: workspaceRef.current.knowledge.map((item) => item.content) }) });
        if (!result.ok) return;
        const data = await result.json();
        const messages = Array.isArray(data.messages) ? data.messages : [];
        if (messages.length === 0) return;
        const current = workspaceRef.current;
        const nextConversations = [...current.conversations];
        for (const message of messages as Array<{ id: string; sender: string; body: string; messageType: "business" | "normal"; aiReply?: string; replySent?: boolean }>) {
          const id = `whatsapp-${message.id}`;
          const index = nextConversations.findIndex((conversation) => conversation.id === id);
          const conversation = { id, name: message.sender, channel: "WhatsApp", note: message.body, messageType: message.messageType, aiReply: message.aiReply, status: "AI handled" as const };
          if (index === -1) nextConversations.push(conversation);
          else if (message.aiReply && nextConversations[index].aiReply !== message.aiReply) nextConversations[index] = { ...nextConversations[index], aiReply: message.aiReply };
        }
        if (nextConversations.length === current.conversations.length && nextConversations.every((conversation, index) => conversation === current.conversations[index])) return;
        const next = { ...current, conversations: nextConversations };
        workspaceRef.current = next;
        await saveWorkspaceData(userId, next);
        onSaved(next);
      } catch {
        // The dev server or WhatsApp session can restart between polls.
      } finally {
        syncing = false;
      }
      };
      void sync();
      const poll = window.setInterval(() => void sync(), 1500);
    return () => window.clearInterval(poll);
  }, [userId, onSaved]);
  
  async function submit(event: FormEvent) { event.preventDefault(); if (!userId || !name || !note) return; const next = { ...workspace, conversations: [...workspace.conversations, { id: `${Date.now()}`, name, channel: "Manual", note, status: "Needs owner" as const }] }; await saveWorkspaceData(userId, next); onSaved(next); setName(""); setNote(""); }
  
  return <PageFrame title="Inbox" description="Your AI assistant is responding to all incoming messages. Review responses and the conversations they're handling."><form onSubmit={submit} className="mb-6 grid gap-3 border border-black bg-white p-5 sm:grid-cols-[0.4fr,1fr,auto]"><input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Customer name" className="border border-black bg-white px-3 py-3 text-black placeholder-gray-500" /><input required value={note} onChange={(event) => setNote(event.target.value)} placeholder="What do they need help with?" className="border border-black bg-white px-3 py-3 text-black placeholder-gray-500" /><button className="bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800">Add conversation</button></form><div className="space-y-3">{workspace.conversations.length === 0 ? <Empty title="No conversations yet" text="Connect WhatsApp or add a conversation to start working here." /> : workspace.conversations.map((item) => <div key={item.id} className="border border-black bg-white p-5"><div className="flex justify-between gap-4"><div><p className="font-semibold">{item.name}</p><p className="mt-1 text-sm text-gray-600">{item.channel} · {item.note}</p></div><div className="text-right"><span className="text-xs text-gray-600 font-medium">{item.status}</span>{item.messageType && <p className={`mt-1 text-xs font-semibold ${item.messageType === "business" ? "text-black" : "text-gray-500"}`}>{item.messageType === "business" ? "Business inquiry" : "Normal message"}</p>}</div></div>{item.aiReply && <div className="mt-4 border-l-2 border-black bg-gray-50 px-4 py-3 text-sm text-black"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-600">AI reply sent</p><p className="mt-1">{item.aiReply}</p></div>}</div>)}</div></PageFrame>;
}

function LeadsView({ workspace, userId, onSaved }: { workspace: WorkspaceData; userId?: string; onSaved: (value: WorkspaceData) => void }) {
  const [name, setName] = useState(""); const [interest, setInterest] = useState("");
  async function submit(event: FormEvent) { event.preventDefault(); if (!userId || !name || !interest) return; const next = { ...workspace, leads: [...workspace.leads, { id: `${Date.now()}`, name, interest, budget: "Not provided", intent: "Warm" as const }] }; await saveWorkspaceData(userId, next); onSaved(next); setName(""); setInterest(""); }
  return <PageFrame title="Leads" description="Capture prospects and keep their interest visible to your team."><form onSubmit={submit} className="mb-6 flex flex-col gap-3 border border-black bg-white p-5 sm:flex-row"><input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Lead name" className="border border-black bg-white px-3 py-3 text-black placeholder-gray-500" /><input required value={interest} onChange={(event) => setInterest(event.target.value)} placeholder="What are they interested in?" className="flex-1 border border-black bg-white px-3 py-3 text-black placeholder-gray-500" /><button className="bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800">Add lead</button></form><div className="space-y-3">{workspace.leads.length === 0 ? <Empty title="No leads yet" text="Leads captured through connected channels will appear here." /> : workspace.leads.map((lead) => <div key={lead.id} className="flex justify-between border border-black bg-white p-5"><div><p className="font-semibold">{lead.name}</p><p className="mt-1 text-sm text-gray-600">{lead.interest}</p></div><span className="text-xs text-gray-600 font-medium">{lead.intent}</span></div>)}</div></PageFrame>;
}

function KnowledgeView({ workspace, userId, onSaved }: { workspace: WorkspaceData; userId?: string; onSaved: (value: WorkspaceData) => void }) {
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  
  async function submit(event: FormEvent) { event.preventDefault(); if (!userId || !content) return; const next = { ...workspace, knowledge: [...workspace.knowledge, { id: `${Date.now()}`, label: "Business information", content }] }; await saveWorkspaceData(userId, next); onSaved(next); setContent(""); }
  
  async function deleteKnowledge(knowledgeId: string) { if (!userId) return; await deleteKnowledgeEntry(userId, knowledgeId); const next = { ...workspace, knowledge: workspace.knowledge.filter((item) => item.id !== knowledgeId) }; onSaved(next); }
  
  async function updateKnowledge(knowledgeId: string) { if (!userId || !editingContent) return; const next = { ...workspace, knowledge: workspace.knowledge.map((item) => item.id === knowledgeId ? { ...item, content: editingContent } : item) }; await saveWorkspaceData(userId, next); onSaved(next); setEditingId(null); setEditingContent(""); }
  
  function startEdit(knowledgeId: string, currentContent: string) { setEditingId(knowledgeId); setEditingContent(currentContent); }
  
  return <PageFrame title="Business Knowledge" description="Add and update information about your business, products, services, availability, and pricing. The AI uses the latest information to respond to customer messages. Update prices, availability, and status changes in real-time."><form onSubmit={submit} className="mb-6 flex gap-3 border border-black bg-white p-5"><textarea required value={content} onChange={(event) => setContent(event.target.value)} placeholder="Add business info: room availability, pricing, products in stock, service hours, booking info, special offers, etc. E.g., 'Room 1: Available, $100/night' or 'Car A: Sold' or 'Price update: Room 2 now $120'" className="min-h-24 flex-1 resize-y border border-black bg-white p-3 text-black placeholder-gray-500" /><button className="self-end bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800">Add</button></form><div className="space-y-3">{workspace.knowledge.length === 0 ? <Empty title="No business info yet" text="Start by adding details about what you sell, availability, pricing, and policies. Update this whenever something changes: prices, availability, inventory sold, status updates, etc." /> : workspace.knowledge.map((item) => editingId === item.id ? <div key={item.id} className="flex gap-3 border border-black bg-gray-100 p-5"><div className="flex-1"><textarea value={editingContent} onChange={(event) => setEditingContent(event.target.value)} className="w-full resize-y border border-black bg-white p-3 text-sm text-black" /></div><div className="flex flex-col gap-2"><button type="button" onClick={() => updateKnowledge(item.id)} className="bg-black px-3 py-2 text-xs font-semibold text-white hover:bg-gray-800">Update</button><button type="button" onClick={() => { setEditingId(null); setEditingContent(""); }} className="bg-gray-600 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-700">Cancel</button></div></div> : <div key={item.id} className="flex justify-between gap-4 border border-black bg-white p-5 text-sm leading-6 text-black"><div className="flex-1">{item.content}</div><div className="flex flex-col gap-2"><button type="button" onClick={() => startEdit(item.id, item.content)} className="whitespace-nowrap bg-black px-3 py-2 text-xs font-semibold text-white hover:bg-gray-800">Edit</button><button type="button" onClick={() => deleteKnowledge(item.id)} className="whitespace-nowrap bg-black px-3 py-2 text-xs font-semibold text-white hover:bg-gray-800">Delete</button></div></div>)}</div></PageFrame>;
}

function Empty({ title, text }: { title: string; text: string }) { return <div className="border border-dashed border-black bg-white p-8"><h2 className="font-semibold">{title}</h2><p className="mt-2 text-sm text-gray-600">{text}</p></div>; }
