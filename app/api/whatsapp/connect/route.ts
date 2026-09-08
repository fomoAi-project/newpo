export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const code = String(body?.code ?? "").trim();
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const redirectUri = process.env.META_REDIRECT_URI ?? "";

  if (!code) {
    return Response.json({ error: "Meta did not return an authorization code." }, { status: 400 });
  }

  if (!appId || !appSecret) {
    return Response.json({ error: "Meta Embedded Signup is not configured. Add META_APP_ID and META_APP_SECRET to .env.local." }, { status: 503 });
  }

  const tokenParams = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    code,
  });
  if (redirectUri) tokenParams.set("redirect_uri", redirectUri);

  const tokenResponse = await fetch(`https://graph.facebook.com/v23.0/oauth/access_token?${tokenParams.toString()}`);
  const tokenResult = await tokenResponse.json().catch(() => ({}));

  if (!tokenResponse.ok || !tokenResult.access_token) {
    return Response.json({ error: tokenResult?.error?.message ?? "Meta could not exchange the signup code." }, { status: 502 });
  }

  const accessToken = String(tokenResult.access_token);
  const accountResponse = await fetch(`https://graph.facebook.com/v23.0/me/businesses?fields=id,name&access_token=${encodeURIComponent(accessToken)}`);
  const accountResult = await accountResponse.json().catch(() => ({}));

  if (!accountResponse.ok) {
    return Response.json({ error: accountResult?.error?.message ?? "Meta connected, but the business account could not be read." }, { status: 502 });
  }

  const businesses = Array.isArray(accountResult.data) ? accountResult.data : [];
  const connectedAccounts = [] as Array<{ businessAccountId: string; accountName: string; phoneNumberId?: string; phoneNumber?: string }>;

  for (const business of businesses.slice(0, 5)) {
    const whatsappResponse = await fetch(`https://graph.facebook.com/v23.0/${business.id}/owned_whatsapp_business_accounts?fields=id,name&access_token=${encodeURIComponent(accessToken)}`);
    const whatsappResult = await whatsappResponse.json().catch(() => ({}));
    const whatsappAccounts = Array.isArray(whatsappResult.data) ? whatsappResult.data : [];

    for (const whatsappAccount of whatsappAccounts.slice(0, 5)) {
      const phoneResponse = await fetch(`https://graph.facebook.com/v23.0/${whatsappAccount.id}/phone_numbers?fields=id,display_phone_number,verified_name&access_token=${encodeURIComponent(accessToken)}`);
      const phoneResult = await phoneResponse.json().catch(() => ({}));
      const phone = Array.isArray(phoneResult.data) ? phoneResult.data[0] : undefined;
      connectedAccounts.push({
        businessAccountId: whatsappAccount.id,
        accountName: whatsappAccount.name ?? business.name ?? "WhatsApp Business",
        phoneNumberId: phone?.id,
        phoneNumber: phone?.display_phone_number,
      });
    }
  }

  if (connectedAccounts.length === 0) {
    return Response.json({ error: "Meta login succeeded, but no WhatsApp Business Account was available for this Meta business." }, { status: 422 });
  }

  return Response.json({
    status: "connected",
    account: connectedAccounts[0],
    message: "WhatsApp Business was connected through Meta.",
  });
}
