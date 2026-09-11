"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { BusinessSession } from "@/lib/browser-session";
import { getBusinessProfile, useFirebaseUser } from "@/lib/firebase-auth";
import { emptyWorkspace, getWorkspaceData, type WorkspaceData } from "@/lib/workspace-store";
import { AuthGate } from "@/app/components/auth-gate";
import { WorkspaceShell } from "@/app/components/workspace-shell";

export default function DashboardPage() {
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

  const conversations = workspace.conversations.length;
  const leads = workspace.leads.length;
  const hotLeads = workspace.leads.filter((lead) => lead.intent === "Hot").length;

  return (
    <AuthGate>
    <WorkspaceShell>
      <main className="min-h-screen bg-transparent text-zinc-950">
          <header className="flex flex-col gap-4 border-b border-zinc-200/80 bg-white/80 backdrop-blur px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
            <div>
              <p className="text-sm text-zinc-500">{business ? `Welcome back, ${business.ownerName}` : "Workspace setup"}</p>
              <h1 className="text-2xl font-bold text-zinc-950">Overview</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full border border-white/15 px-3 py-1 text-sm text-zinc-500">AI employee offline</span>
              <Link href="/onboarding" className="rounded-full bg-[#635bff] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-200">Train AI employee</Link>
            </div>
          </header>

          <div className="space-y-8 p-5 lg:p-8">
            {!business && (
              <section className="border border-dashed border-zinc-300 bg-white p-8 text-black">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">Setup required</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight">Create your business workspace.</h2>
                <p className="mt-3 max-w-xl text-zinc-600">Your workspace has no account or business data yet. Register to start training an AI employee.</p>
                <Link href="/signup" className="mt-6 inline-flex rounded-full bg-black px-5 py-3 text-sm font-semibold text-zinc-950">Create account</Link>
              </section>
            )}

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Conversations", value: conversations, detail: "created in workspace", href: "/dashboard/inbox" },
                { label: "Leads", value: leads, detail: "captured in workspace", href: "/dashboard/leads" },
                { label: "Hot leads", value: hotLeads, detail: "ready for follow-up", href: "/dashboard/leads" },
                { label: "Knowledge entries", value: workspace.knowledge.length, detail: "added by your team", href: "/dashboard/knowledge" },
              ].map((stat) => (
                <Link key={stat.label} href={stat.href} className="border border-zinc-200 bg-white shadow-sm p-5 transition hover:border-zinc-400">
                  <div className="text-sm text-zinc-500">{stat.label}</div>
                  <div className="mt-3 text-3xl font-bold text-zinc-950">{stat.value}</div>
                  <div className="mt-1 text-xs text-zinc-500">{stat.detail}</div>
                </Link>
              ))}
            </section>

            <section className="grid gap-8 xl:grid-cols-2">
              <WorkspacePanel title="Inbox" href="/dashboard/inbox" action="Open inbox">
                {workspace.conversations.length === 0 ? <EmptyState title="No conversations yet" description="Connected channels will appear here when customers message your business." href="/dashboard/channels" action="Connect a channel" /> : workspace.conversations.slice(0, 4).map((item) => <DataRow key={item.id} title={item.name} detail={`${item.channel} · ${item.note}`} badge={item.status} />)}
              </WorkspacePanel>
              <WorkspacePanel title="Knowledge" href="/dashboard/knowledge" action="Manage knowledge">
                {workspace.knowledge.length === 0 ? <EmptyState title="Knowledge base is empty" description="Train your AI employee or add business facts before it handles customers." href="/onboarding" action="Start training" /> : workspace.knowledge.slice(0, 4).map((item) => <DataRow key={item.id} title={item.label} detail={item.content} />)}
              </WorkspacePanel>
            </section>

            <section className="border border-dashed border-indigo-200 bg-indigo-50/70 p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">Next step</p>
              <h2 className="mt-3 text-2xl font-semibold text-zinc-950">Build the knowledge your AI employee can trust.</h2>
              <p className="mt-3 max-w-2xl text-zinc-500">Nothing is pre-filled. Add your own business information, products, policies, and customer rules to make this workspace useful.</p>
              <Link href="/onboarding" className="mt-6 inline-flex rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950">Open AI training</Link>
            </section>
          </div>
      </main>
    </WorkspaceShell>
    </AuthGate>
  );
}

function WorkspacePanel({ children, title, href, action }: { children: React.ReactNode; title: string; href: string; action: string }) {
  return <section className="border border-zinc-200 bg-white shadow-sm p-6"><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-semibold text-zinc-950">{title}</h2><Link href={href} className="text-sm text-emerald-300">{action}</Link></div><div className="space-y-3">{children}</div></section>;
}

function DataRow({ title, detail, badge }: { title: string; detail: string; badge?: string }) {
  return <div className="flex items-center justify-between gap-4 border border-white/10 bg-zinc-50 p-4"><div><div className="font-medium text-zinc-950">{title}</div><div className="mt-1 text-sm text-zinc-500">{detail}</div></div>{badge && <span className="shrink-0 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-300">{badge}</span>}</div>;
}

function EmptyState({ title, description, href, action }: { title: string; description: string; href: string; action: string }) {
  return <div className="border border-dashed border-white/15 p-6"><h3 className="font-medium text-zinc-950">{title}</h3><p className="mt-2 text-sm leading-6 text-zinc-500">{description}</p><Link href={href} className="mt-4 inline-flex text-sm font-semibold text-emerald-300">{action} →</Link></div>;
}
