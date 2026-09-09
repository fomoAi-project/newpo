"use client";

import { FormEvent, useEffect, useState } from "react";
import type { BusinessSession } from "@/lib/browser-session";
import { getBusinessProfile, saveBusinessProfile, useFirebaseUser } from "@/lib/firebase-auth";
import { emptyWorkspace, getWorkspaceData, saveWorkspaceData, type WorkspaceData } from "@/lib/workspace-store";

declare global {
  interface Window {
    FB?: {
      init: (options: Record<string, unknown>) => void;
      login: (callback: (response: { authResponse?: { code?: string } }) => void, options: Record<string, unknown>) => void;
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
  return <main className="min-h-screen bg-zinc-100 px-5 py-8 text-zinc-950 sm:px-8 lg:py-10"><div className="mx-auto max-w-5xl"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Workspace</p><h1 className="mt-3 text-4xl font-semibold tracking-tight">{title}</h1><p className="mt-3 max-w-2xl text-zinc-500">{description}</p><div className="mt-8">{children}</div></div></main>;
}

function SettingsView({ business, userId, onSaved }: { business: BusinessSession | null; userId?: string; onSaved: (value: BusinessSession) => void }) {
  const [form, setForm] = useState(business ?? { businessName: "", industry: "", ownerName: "", email: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  async function submit(event: FormEvent) { event.preventDefault(); if (!userId) return; setSaving(true); await saveBusinessProfile(userId, form); onSaved(form); setNotice("Business settings saved."); setSaving(false); }
  return <PageFrame title="Settings" description="Keep your business profile accurate so your AI employee has the right context."><form onSubmit={submit} className="max-w-2xl space-y-5 border border-zinc-200 bg-white p-6">{([['businessName','Business name'],['ownerName','Your name'],['industry','Industry'],['email','Email'],['phone','Phone']] as const).map(([key,label]) => <label key={key} className="block text-sm font-medium text-zinc-700">{label}<input required={key !== 'phone'} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} className="mt-2 block w-full border border-zinc-300 px-3 py-3 font-normal text-zinc-950 outline-none focus:border-zinc-950" /></label>)}{notice && <p className="text-sm text-green-700">{notice}</p>}<button disabled={saving} className="bg-zinc-950 px-5 py-3 text-sm font-semibold text-white">{saving ? "Saving..." : "Save changes"}</button></form></PageFrame>;
}

function ChannelsView({ workspace, userId, onSaved }: { workspace: WorkspaceData; userId?: string; onSaved: (value: WorkspaceData) => void }) {
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const connected = workspace.channels.find((item) => item.type === "whatsapp");

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_META_APP_ID || document.getElementById("facebook-jssdk")) return;
    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.onload = () => {
      window.FB?.init({ appId: process.env.NEXT_PUBLIC_META_APP_ID, cookie: true, xfbml: false, version: "v23.0" });
    };
    document.body.appendChild(script);
  }, []);

  function connectWhatsApp() {
    setError("");
    setNotice("");
    if (!userId) return;
    if (!process.env.NEXT_PUBLIC_META_APP_ID || !process.env.NEXT_PUBLIC_META_CONFIG_ID) {
      setError("Meta Embedded Signup is not configured yet. Add NEXT_PUBLIC_META_APP_ID and the separate NEXT_PUBLIC_META_CONFIG_ID from Facebook Login for Business, then restart the dev server.");
      return;
    }
    if (!window.FB) {
      setError("Meta login is still loading. Try again in a moment.");
      return;
    }
    if (window.location.protocol !== "https:") {
      setError("Meta requires HTTPS for Embedded Signup. Start the app with npm run dev:https or open it through an HTTPS tunnel, then try again.");
      return;
    }
    setIsConnecting(true);
    window.FB.login(async (response) => {
      const code = response.authResponse?.code;
      if (!code) {
        setError("Meta signup was cancelled or did not return a code.");
        setIsConnecting(false);
        return;
      }
      try {
        const result = await fetch("/api/whatsapp/connect", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
        const data = await result.json();
        if (!result.ok) throw new Error(data.error ?? "WhatsApp could not be connected.");
        const next = { ...workspace, channels: [...workspace.channels.filter((item) => item.type !== "whatsapp"), { id: `whatsapp-${Date.now()}`, type: "whatsapp" as const, name: data.account.accountName, phoneNumber: data.account.phoneNumber, businessAccountId: data.account.businessAccountId, status: "connected" as const }] };
        await saveWorkspaceData(userId, next);
        onSaved(next);
        setNotice("WhatsApp Business connected through Meta.");
      } catch (connectionError) {
        setError(connectionError instanceof Error ? connectionError.message : "WhatsApp could not be connected.");
      } finally {
        setIsConnecting(false);
      }
    }, { config_id: process.env.NEXT_PUBLIC_META_CONFIG_ID, response_type: "code", override_default_response_type: true, scope: "whatsapp_business_management,whatsapp_business_messaging" });
  }

  return <PageFrame title="Channels" description="Connect the channels where customers already reach your business."><div className="grid gap-6 lg:grid-cols-2"><div className="border border-zinc-200 bg-white p-6"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold">WhatsApp Business</h2><span className="text-xs font-medium text-zinc-500">{connected?.status ?? "Not connected"}</span></div><p className="mt-3 text-sm leading-6 text-zinc-500">Connect through Meta. You will choose the business and phone number in Meta&apos;s secure signup flow, so no account ID needs to be copied here.</p><button type="button" onClick={connectWhatsApp} disabled={isConnecting} className="mt-6 bg-zinc-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{isConnecting ? "Connecting to Meta..." : connected ? "Reconnect WhatsApp" : "Connect with Meta"}</button>{notice && <p className="mt-4 text-sm text-green-700">{notice}</p>}{error && <p className="mt-4 text-sm text-red-600">{error}</p>}</div><div className="border border-dashed border-zinc-300 bg-white p-6"><h2 className="text-lg font-semibold">Connection requirements</h2><ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-500"><li>Use a WhatsApp Business number.</li><li>Have access to the Meta Business account.</li><li>Complete Meta webhook verification after signup.</li></ul></div></div></PageFrame>;
}

function InboxView({ workspace, userId, onSaved }: { workspace: WorkspaceData; userId?: string; onSaved: (value: WorkspaceData) => void }) {
  const [name, setName] = useState(""); const [note, setNote] = useState("");
  async function submit(event: FormEvent) { event.preventDefault(); if (!userId || !name || !note) return; const next = { ...workspace, conversations: [...workspace.conversations, { id: `${Date.now()}`, name, channel: "Manual", note, status: "Needs owner" as const }] }; await saveWorkspaceData(userId, next); onSaved(next); setName(""); setNote(""); }
  return <PageFrame title="Inbox" description="Review conversations from connected channels and take over when a human is needed."><form onSubmit={submit} className="mb-6 grid gap-3 border border-zinc-200 bg-white p-5 sm:grid-cols-[0.4fr,1fr,auto]"><input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Customer name" className="border border-zinc-300 px-3 py-3" /><input required value={note} onChange={(event) => setNote(event.target.value)} placeholder="What do they need help with?" className="border border-zinc-300 px-3 py-3" /><button className="bg-zinc-950 px-4 py-3 text-sm font-semibold text-white">Add conversation</button></form><div className="space-y-3">{workspace.conversations.length === 0 ? <Empty title="No conversations yet" text="Connect WhatsApp or add a conversation to start working here." /> : workspace.conversations.map((item) => <div key={item.id} className="flex justify-between border border-zinc-200 bg-white p-5"><div><p className="font-semibold">{item.name}</p><p className="mt-1 text-sm text-zinc-500">{item.channel} · {item.note}</p></div><span className="text-xs text-zinc-500">{item.status}</span></div>)}</div></PageFrame>;
}

function LeadsView({ workspace, userId, onSaved }: { workspace: WorkspaceData; userId?: string; onSaved: (value: WorkspaceData) => void }) {
  const [name, setName] = useState(""); const [interest, setInterest] = useState("");
  async function submit(event: FormEvent) { event.preventDefault(); if (!userId || !name || !interest) return; const next = { ...workspace, leads: [...workspace.leads, { id: `${Date.now()}`, name, interest, budget: "Not provided", intent: "Warm" as const }] }; await saveWorkspaceData(userId, next); onSaved(next); setName(""); setInterest(""); }
  return <PageFrame title="Leads" description="Capture prospects and keep their interest visible to your team."><form onSubmit={submit} className="mb-6 flex flex-col gap-3 border border-zinc-200 bg-white p-5 sm:flex-row"><input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Lead name" className="border border-zinc-300 px-3 py-3" /><input required value={interest} onChange={(event) => setInterest(event.target.value)} placeholder="What are they interested in?" className="flex-1 border border-zinc-300 px-3 py-3" /><button className="bg-zinc-950 px-4 py-3 text-sm font-semibold text-white">Add lead</button></form><div className="space-y-3">{workspace.leads.length === 0 ? <Empty title="No leads yet" text="Leads captured through connected channels will appear here." /> : workspace.leads.map((lead) => <div key={lead.id} className="flex justify-between border border-zinc-200 bg-white p-5"><div><p className="font-semibold">{lead.name}</p><p className="mt-1 text-sm text-zinc-500">{lead.interest}</p></div><span className="text-xs text-zinc-500">{lead.intent}</span></div>)}</div></PageFrame>;
}

function KnowledgeView({ workspace, userId, onSaved }: { workspace: WorkspaceData; userId?: string; onSaved: (value: WorkspaceData) => void }) {
  const [content, setContent] = useState("");
  async function submit(event: FormEvent) { event.preventDefault(); if (!userId || !content) return; const next = { ...workspace, knowledge: [...workspace.knowledge, { id: `${Date.now()}`, label: "Business information", content }] }; await saveWorkspaceData(userId, next); onSaved(next); setContent(""); }
  return <PageFrame title="Knowledge" description="Manage the facts and rules your AI employee can use in customer conversations."><form onSubmit={submit} className="mb-6 flex gap-3 border border-zinc-200 bg-white p-5"><textarea required value={content} onChange={(event) => setContent(event.target.value)} placeholder="Add a business fact, policy, product detail, or FAQ..." className="min-h-24 flex-1 resize-y border border-zinc-300 p-3" /><button className="self-end bg-zinc-950 px-4 py-3 text-sm font-semibold text-white">Save entry</button></form><div className="space-y-3">{workspace.knowledge.length === 0 ? <Empty title="Knowledge base is empty" text="Add your first business rule or train the AI employee." /> : workspace.knowledge.map((item) => <div key={item.id} className="border border-zinc-200 bg-white p-5 text-sm leading-6 text-zinc-700">{item.content}</div>)}</div></PageFrame>;
}

function Empty({ title, text }: { title: string; text: string }) { return <div className="border border-dashed border-zinc-300 bg-white p-8"><h2 className="font-semibold">{title}</h2><p className="mt-2 text-sm text-zinc-500">{text}</p></div>; }
