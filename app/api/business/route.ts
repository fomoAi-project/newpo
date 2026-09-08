export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const name = String(body?.name ?? "").trim();
  const industry = String(body?.industry ?? "").trim();

  if (!name || !industry) {
    return Response.json({ error: "Business name and industry are required." }, { status: 400 });
  }

  return Response.json({ business: { name, industry } }, { status: 201 });
}
