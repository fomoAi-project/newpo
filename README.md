# AIBiz Employee

A multi-tenant SaaS platform where every business gets its own AI employee that starts with zero knowledge, learns from the owner, and handles customer conversations across channels.

## Features

- Business onboarding and AI training flow
- Multi-tenant business architecture
- Customer conversation inbox
- Lead qualification and hot lead tracking
- Human takeover and escalation workflow
- WhatsApp-ready architecture
- Business knowledge summaries and onboarding extraction

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- App Router

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Key routes

- `/` — marketing landing page
- `/login` — sign in
- `/signup` — create account
- `/onboarding` — AI training conversation
- `/dashboard` — business dashboard

## API routes

- `/api/health` — health check
- `/api/business` — business and knowledge summary
- `/api/onboarding` — training message extraction simulation

## Data foundation

Signup and login now use Firebase Email/Password Authentication. Business profiles and training knowledge are stored in Firebase Realtime Database under the authenticated user ID. The local `.env.local` file contains the Firebase web configuration and is ignored by Git.

Deploy `database.rules.json` to the Realtime Database to keep each business account isolated. The `/api/onboarding` route classifies the owner&apos;s latest answer, while the client saves the answer to that user&apos;s workspace.

## WhatsApp Embedded Signup

The Channels page uses Meta Embedded Signup, so users do not need to copy a WABA ID manually. Add these values to `.env.local`:

```env
NEXT_PUBLIC_META_APP_ID=your_meta_app_id
NEXT_PUBLIC_META_CONFIG_IDyour_embedded_signup_config_id
META_APP_SECRET=your_meta_app_secret
META_REDIRECT_URI=http://localhost:3000/dashboard/channels
```

The Meta app must have WhatsApp configured, Embedded Signup enabled, and the local callback URL allowed. `META_APP_SECRET` remains server-only. Restart Next.js after adding the values, then use **Channels -> Connect with Meta**.

Meta blocks Facebook login on plain HTTP. For local testing, run `npm run dev:https` and use the generated `https://localhost:3000` URL, or use an HTTPS tunnel such as ngrok/Cloudflare Tunnel. Update `META_REDIRECT_URI` and the allowed Meta callback URL to match that HTTPS address.

## Next milestones

1. Connect Supabase client and replace the local session bridge
2. Add Supabase Auth and server-side RBAC enforcement
3. Connect WhatsApp webhook
4. Add OpenAI-powered responses
5. Add usage billing and subscriptions
