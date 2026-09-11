import { disconnectWhatsAppSession, getWhatsAppMessages, getWhatsAppSession, processWhatsAppBacklog, resetWhatsAppSession, startWhatsAppSession, updateWhatsAppTrainingContext, type WhatsAppTrainingContext } from "@/lib/whatsapp-session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (body?.reset === true) await resetWhatsAppSession();
  await startWhatsAppSession();
  updateWhatsAppTrainingContext(body as WhatsAppTrainingContext);
  if (body?.processBacklog === true) await processWhatsAppBacklog();
  return Response.json({ ...(getWhatsAppSession() ?? { status: "starting" }), messages: getWhatsAppMessages() });
}

export async function GET() {
  await startWhatsAppSession();
  return Response.json({ ...(getWhatsAppSession() ?? { status: "disconnected" }), messages: getWhatsAppMessages() });
}

export async function DELETE() {
  await disconnectWhatsAppSession();
  return Response.json({ status: "disconnected" });
}
