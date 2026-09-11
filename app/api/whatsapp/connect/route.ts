import { disconnectWhatsAppSession, getWhatsAppMessages, getWhatsAppSession, processWhatsAppBacklog, resetWhatsAppSession, startWhatsAppSession, updateWhatsAppTrainingContext, type WhatsAppTrainingContext } from "@/lib/whatsapp-session";

export const runtime = "nodejs";

async function proxyToWorker(request: Request) {
  const workerUrl = process.env.WHATSAPP_WORKER_URL;
  if (!workerUrl) return null;
  const target = new URL("/whatsapp/connect", workerUrl);
  const headers = new Headers({ "Content-Type": "application/json" });
  if (process.env.WHATSAPP_WORKER_SECRET) headers.set("x-whatsapp-worker-secret", process.env.WHATSAPP_WORKER_SECRET);
  const response = await fetch(target, {
    method: request.method,
    headers,
    body: request.method === "GET" ? undefined : await request.text(),
    cache: "no-store",
  });
  return new Response(response.body, { status: response.status, headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" } });
}

export async function POST(request: Request) {
  const workerResponse = await proxyToWorker(request);
  if (workerResponse) return workerResponse;
  const body = await request.json().catch(() => ({}));
  if (body?.reset === true) await resetWhatsAppSession();
  await startWhatsAppSession();
  updateWhatsAppTrainingContext(body as WhatsAppTrainingContext);
  if (body?.processBacklog === true) await processWhatsAppBacklog();
  return Response.json({ ...(getWhatsAppSession() ?? { status: "starting" }), messages: getWhatsAppMessages() });
}

export async function GET(request: Request) {
  const workerResponse = await proxyToWorker(request);
  if (workerResponse) return workerResponse;
  await startWhatsAppSession();
  return Response.json({ ...(getWhatsAppSession() ?? { status: "disconnected" }), messages: getWhatsAppMessages() });
}

export async function DELETE(request: Request) {
  const workerResponse = await proxyToWorker(request);
  if (workerResponse) return workerResponse;
  await disconnectWhatsAppSession();
  return Response.json({ status: "disconnected" });
}
