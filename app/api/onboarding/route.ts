type ConversationMessage = {
  sender: "owner" | "ai";
  body: string;
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const message = String(body?.message ?? "").trim();
  const businessName = String(body?.businessName ?? "the business").trim() || "the business";
  const conversation = Array.isArray(body?.conversation) ? body.conversation as ConversationMessage[] : [];

  if (!message) {
    return Response.json({ error: "A training message is required." }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "OpenAI is not configured. Add OPENAI_API_KEY to .env.local and restart the dev server." }, { status: 503 });
  }

  const history = conversation
    .filter((item) => item && (item.sender === "owner" || item.sender === "ai") && typeof item.body === "string")
    .slice(-20)
    .map((item) => ({ role: item.sender === "owner" ? "user" : "assistant", content: item.body }));

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 220,
      messages: [
        {
          role: "system",
          content: `You are a warm, observant AI employee being onboarded by the owner of ${businessName}. Have a natural conversation like a thoughtful new hire. Acknowledge what the owner said specifically, then ask one useful follow-up question about how the business works. Do not repeat questions already answered. Ask about services, customers, pricing, policies, hours, handoffs, and communication over several turns. Keep replies concise and conversational. Do not claim to have contacted customers or completed actions.`,
        },
        ...history,
        { role: "user", content: message },
      ],
    }),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    return Response.json({ error: result?.error?.message ?? "OpenAI could not generate a response." }, { status: 502 });
  }

  const reply = result?.choices?.[0]?.message?.content?.trim();
  if (!reply) {
    return Response.json({ error: "OpenAI returned an empty response." }, { status: 502 });
  }

  return Response.json({ reply, categories: [] });
}
