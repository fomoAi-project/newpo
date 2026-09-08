import Link from "next/link";

const features = [
  {
    title: "AI employee onboarding",
    description:
      "Every business gets a trained AI employee that starts with zero knowledge and learns from the owner through conversation.",
  },
  {
    title: "Knowledge-first answers",
    description:
      "The AI uses business facts, rules, FAQs, products, policies and uploaded documents to answer customers with grounded information.",
  },
  {
    title: "Lead qualification",
    description:
      "It qualifies buyers, scores intent, captures data, identifies hot leads and hands serious opportunities to the team.",
  },
  {
    title: "Human takeover",
    description:
      "Owners can take over conversations instantly when discounts, complaints, or sensitive issues require a human.",
  },
  {
    title: "Multi-channel inbox",
    description:
      "A single inbox brings WhatsApp, website chat, Instagram and other channels into one operational view.",
  },
  {
    title: "Usage-based billing",
    description:
      "Track AI requests, WhatsApp usage, storage, documents and automations with a subscription + usage model.",
  },
];

const steps = [
  "Create business profile",
  "Train AI employee with business info",
  "Connect customer channels",
  "Handle leads and appointments",
];

const pricing = [
  {
    name: "Free",
    price: "₦0",
    description: "For testing and early product feedback.",
    features: ["AI training", "Limited conversations", "Basic knowledge base"],
    highlight: false,
  },
  {
    name: "Starter",
    price: "₦25,000",
    description: "Best for small businesses launching online.",
    features: ["1 AI employee", "Website chat", "Lead capture", "Human takeover"],
    highlight: true,
  },
  {
    name: "Business",
    price: "₦60,000",
    description: "For growing teams handling WhatsApp and more.",
    features: ["WhatsApp", "Multi-channel inbox", "Lead scoring", "Follow-ups"],
    highlight: false,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-lg font-bold text-emerald-300">
              AI
            </div>
            <div>
              <div className="text-lg font-semibold">AIBiz Employee</div>
              <div className="text-xs text-slate-400">AI workforce for businesses</div>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            <a href="#platform" className="transition hover:text-white">Platform</a>
            <a href="#workflow" className="transition hover:text-white">Workflow</a>
            <a href="#pricing" className="transition hover:text-white">Pricing</a>
            <a href="#roadmap" className="transition hover:text-white">Roadmap</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-emerald-400 hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 pb-20 pt-16 lg:px-8 lg:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr,0.9fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-300">
              Multi-tenant AI employee platform
            </div>

            <h1 className="max-w-xl text-5xl font-black leading-tight tracking-tight text-white lg:text-6xl">
              Give every business its own AI employee.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              A SaaS platform where each business trains its own AI worker, answers customer questions using verified knowledge, qualifies leads, books appointments and escalates to a human when needed.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="rounded-full bg-emerald-500 px-6 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Open your workspace
              </Link>
              <a
                href="#platform"
                className="rounded-full border border-white/15 px-6 py-3 text-center text-sm font-semibold text-white transition hover:border-white/35 hover:bg-white/5"
              >
                Explore platform
              </a>
            </div>

          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-2xl shadow-emerald-950/30">
            <div className="rounded-2xl border border-emerald-500/20 bg-slate-950 p-4">
              <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <div className="text-sm text-slate-400">New workspace</div>
                  <div className="text-lg font-semibold text-white">Start with your knowledge</div>
                </div>
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-300">
                  Ready
                </span>
              </div>

              <div className="space-y-4 text-sm">
                <div className="border border-dashed border-white/15 p-5 text-slate-400">
                  Your AI employee begins with an empty knowledge base. Add your business facts, policies, products, and customer rules during setup.
                </div>
                <Link href="/signup" className="inline-flex rounded-full bg-emerald-500 px-4 py-2 font-semibold text-slate-950">
                  Create workspace
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="platform" className="border-t border-white/10 bg-slate-900/60">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Platform features</p>
            <h2 className="mt-4 text-3xl font-bold text-white md:text-4xl">Built for real business operations.</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-2xl border border-white/10 bg-slate-950/70 p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-lg text-emerald-300">
                  ✓
                </div>
                <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">How it works</p>
          <h2 className="mt-4 text-3xl font-bold text-white md:text-4xl">Train once. Serve customers all day.</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step} className="rounded-2xl border border-white/10 bg-slate-900 p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-slate-950">
                {index + 1}
              </div>
              <p className="text-lg font-semibold text-white">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="roadmap" className="border-t border-white/10 bg-slate-900/70">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Development roadmap</p>
            <h2 className="mt-4 text-3xl font-bold text-white md:text-4xl">A focused MVP first, then expansion.</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Stage 1</p>
              <h3 className="mt-3 text-2xl font-bold text-white">MVP</h3>
              <ul className="mt-5 space-y-2 text-sm text-slate-200">
                <li>• Registration and onboarding</li>
                <li>• AI training conversation</li>
                <li>• Multi-tenant knowledge base</li>
                <li>• Lead capture and takeover</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Stage 2</p>
              <h3 className="mt-3 text-2xl font-bold text-white">WhatsApp</h3>
              <ul className="mt-5 space-y-2 text-sm text-slate-200">
                <li>• Incoming message handling</li>
                <li>• Human handoff and escalation</li>
                <li>• Unified inbox</li>
                <li>• Lead scoring and alerts</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Stage 3</p>
              <h3 className="mt-3 text-2xl font-bold text-white">Growth</h3>
              <ul className="mt-5 space-y-2 text-sm text-slate-200">
                <li>• Appointments and follow-ups</li>
                <li>• Alerts and analytics</li>
                <li>• Staff roles and billing</li>
                <li>• Expansion to new channels</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Pricing</p>
          <h2 className="mt-4 text-3xl font-bold text-white md:text-4xl">Simple plans for real businesses.</h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {pricing.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl border p-6 ${
                plan.highlight
                  ? "border-emerald-400 bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-900/30"
                  : "border-white/10 bg-slate-950 text-white"
              }`}
            >
              <p className={`text-sm font-semibold uppercase tracking-[0.2em] ${plan.highlight ? "text-slate-900/80" : "text-emerald-300"}`}>
                {plan.name}
              </p>
              <div className="mt-6 flex items-end gap-2">
                <span className="text-4xl font-black">{plan.price}</span>
                <span className={`text-sm ${plan.highlight ? "text-slate-900/80" : "text-slate-400"}`}>/month</span>
              </div>
              <p className={`mt-4 text-sm ${plan.highlight ? "text-slate-900/80" : "text-slate-300"}`}>{plan.description}</p>

              <ul className={`mt-6 space-y-3 text-sm ${plan.highlight ? "text-slate-900/80" : "text-slate-200"}`}>
                {plan.features.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>

              <Link
                href="/signup"
                className={`mt-8 inline-flex w-full justify-center rounded-full px-4 py-3 text-sm font-semibold transition ${
                  plan.highlight
                    ? "bg-slate-950 text-white hover:bg-slate-900"
                    : "bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                Choose plan
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-white/10 bg-slate-950/60">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center lg:px-8">
          <h2 className="text-3xl font-bold text-white md:text-5xl">Launch an AI employee for your business.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
            Start with one niche, prove the workflow and grow into a complete AI workforce platform.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/signup" className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400">
              Create your account
            </Link>
            <a href="#pricing" className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/35 hover:bg-white/5">
              View pricing
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
