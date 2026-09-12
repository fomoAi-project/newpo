"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import type { BusinessSession } from "@/lib/browser-session";
import { onboardingQuestions } from "@/lib/onboarding-prompts";
import { getBusinessProfile, useFirebaseUser } from "@/lib/firebase-auth";
import { addKnowledgeEntry, appendTrainingMessages, emptyWorkspace, getWorkspaceData, type WorkspaceKnowledge, type WorkspaceTrainingMessage } from "@/lib/workspace-store";
import { AuthGate } from "@/app/components/auth-gate";
import { WorkspaceShell } from "@/app/components/workspace-shell";

export default function OnboardingPage() {
  const { user } = useFirebaseUser();
  const [business, setBusiness] = useState<BusinessSession | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<WorkspaceTrainingMessage[]>([]);
  const [facts, setFacts] = useState<WorkspaceKnowledge[]>(emptyWorkspace.knowledge);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [turn, setTurn] = useState(0);

  useEffect(() => {
    if (!user) return;
    Promise.all([getBusinessProfile(user), getWorkspaceData(user.uid)]).then(([profile, data]) => {
      setBusiness(profile);
      setFacts(data.knowledge);
      setMessages(data.trainingMessages);
      setTurn(data.trainingMessages.filter((item) => item.sender === "owner").length);
    });
  }, [user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isSending || !user) return;

    setIsSending(true);
    setError("");
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmedMessage,
          turn,
          businessName: business?.businessName,
          conversation: [...messages, { sender: "owner", body: trimmedMessage }],
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Training message could not be saved.");

      const entry = await addKnowledgeEntry(user.uid, trimmedMessage);
      const newMessages: WorkspaceTrainingMessage[] = [
        { id: `${Date.now()}-owner`, sender: "owner", body: trimmedMessage },
        { id: `${Date.now()}-ai`, sender: "ai", body: result.reply },
      ];
      await appendTrainingMessages(user.uid, newMessages);
      setMessages((current) => [...current, ...newMessages]);
      setFacts((current) => [...current, entry]);
      setTurn((current) => current + 1);
      setMessage("");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Training message could not be saved.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <AuthGate>
      <WorkspaceShell>
        <main className="min-h-screen bg-[#f3f6fb] text-[#172033]">
          <header className="border-b border-zinc-200 bg-white px-5 py-5 sm:px-8">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-5">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  <span className="h-2 w-2 rounded-full bg-zinc-950" /> AI employee setup
                </div>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Teach it how your business works.</h1>
                <p className="mt-1 text-sm text-zinc-500">{business?.businessName ?? "Loading your business"} {business?.industry ? `· ${business.industry}` : ""}</p>
              </div>
              <Link href="/dashboard" className="hidden rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-950 hover:text-zinc-950 sm:inline-flex">Exit training</Link>
            </div>
          </header>

          <div className="mx-auto grid max-w-6xl gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[minmax(0,1fr),300px] lg:py-8">
            <section className="flex min-h-[650px] flex-col border border-zinc-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950 text-xs font-bold text-white">AI</div>
                  <div><div className="text-sm font-semibold">Your AI employee</div><div className="text-xs text-zinc-500">Learning from you</div></div>
                </div>
                <span className="text-xs font-medium text-zinc-500">{facts.length} {facts.length === 1 ? "detail" : "details"} learned</span>
              </div>

              <div className="flex-1 space-y-5 overflow-y-auto bg-zinc-50 px-5 py-6 sm:px-8">
                {messages.length === 0 && <div className="max-w-xl"><p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">Your first conversation</p><div className="rounded-2xl rounded-tl-sm border border-zinc-200 bg-white p-5 text-[15px] leading-7 text-zinc-700 shadow-sm">Hi, I&apos;m your new AI employee. I want to understand the business properly before I speak with customers. What does your business do, and who do you serve?</div></div>}
                {messages.map((item, index) => <div key={`${item.sender}-${index}`} className={item.sender === "owner" ? "ml-auto max-w-xl" : "max-w-xl"}><p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">{item.sender === "owner" ? "You" : "AI employee"}</p><div className={item.sender === "owner" ? "training-owner-message rounded-2xl text-white rounded-tr-sm bg-zinc-950 p-5 text-[15px] leading-7" : "rounded-2xl rounded-tl-sm border border-zinc-200 bg-white p-5 text-[15px] leading-7 text-zinc-700 shadow-sm"}>{item.body}</div></div>)}
              </div>

              <div className="border-t border-zinc-200 bg-white p-4 sm:p-5">
                <form onSubmit={handleSubmit}>
                  <div className="flex items-end gap-3 rounded-2xl border border-zinc-300 bg-zinc-50 p-2 focus-within:border-zinc-950 focus-within:bg-white">
                    <textarea name="message" rows={2} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Explain it naturally, like you are talking to a new employee..." className="min-h-12 flex-1 resize-none bg-transparent px-3 py-2 text-sm leading-6 text-zinc-950 outline-none placeholder:text-zinc-400" />
                    <button type="submit" disabled={isSending || !message.trim()} className="training-send-button text-white rounded-xl bg-zinc-950 px-4 py-3 text-sm font-semibold transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300">{isSending ? "Saving" : "Send"}</button>
                  </div>
                </form>
                {error && <p className="mt-2 px-2 text-sm text-red-600">{error}</p>}
                <p className="mt-3 px-2 text-xs text-zinc-400">Your answers are saved to this business workspace and used as training context.</p>
              </div>
            </section>

            <aside className="space-y-4">
              <section className="border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between"><h2 className="font-semibold">Training progress</h2><span className="text-sm text-zinc-500">{Math.min(facts.length, 4)} / 4</span></div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-200"><div className="h-full rounded-full bg-zinc-950 transition-all" style={{ width: `${Math.min(facts.length / 4, 1) * 100}%` }} /></div>
                <p className="mt-3 text-sm leading-6 text-zinc-500">There is no fixed script. Keep answering naturally and the AI will guide the interview.</p>
              </section>

              <section className="border border-zinc-200 bg-white p-5 shadow-sm">
                <h2 className="font-semibold">Good topics to cover</h2>
                <div className="mt-4 space-y-2">{onboardingQuestions.map((question) => <button type="button" key={question} onClick={() => setMessage(question)} className="block w-full border border-zinc-200 px-3 py-3 text-left text-sm leading-5 text-zinc-600 transition hover:border-zinc-950 hover:text-zinc-950">{question}</button>)}</div>
              </section>

              <section className="border border-zinc-200 bg-zinc-950 p-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">Workspace status</p>
                <p className="mt-3 text-sm leading-6 text-zinc-300">The AI stays offline until you finish teaching it and connect a customer channel.</p>
                <Link href="/dashboard/channels" className="mt-4 inline-flex text-sm font-semibold text-white underline underline-offset-4">Connect channels</Link>
              </section>
            </aside>
          </div>
        </main>
      </WorkspaceShell>
    </AuthGate>
  );
}
