import Link from "next/link";

const features = [
  ["01", "Teach it your business", "Give your AI employee the facts, policies, products, and tone that make your business different."],
  ["02", "Turn questions into leads", "Qualify intent, capture details, and surface the conversations most likely to become revenue."],
  ["03", "Keep humans in control", "Jump into any conversation instantly when context, empathy, or a final decision matters."],
];

const workflow = ["Create your workspace", "Train your AI employee", "Connect customer channels", "Grow with every conversation"];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f7f4] text-[#13231f]">
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="AIBiz Employee home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#173d32] text-sm font-black text-[#d7f36b]">AI</span>
          <span className="text-lg font-bold tracking-tight">AIBiz Employee</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-[#53645e] md:flex">
          <a href="#platform" className="hover:text-[#13231f]">Platform</a>
          <a href="#workflow" className="hover:text-[#13231f]">How it works</a>
          <a href="#pricing" className="hover:text-[#13231f]">Pricing</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden px-3 py-2 text-sm font-semibold md:block">Sign in</Link>
          <Link href="/signup" className="rounded-full bg-[#173d32] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#173d32]/15 transition hover:-translate-y-0.5">Get started</Link>
        </div>
      </header>

      <section className="relative mx-auto max-w-7xl px-6 pb-24 pt-12 lg:px-8 lg:pb-32 lg:pt-20">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-[#d7f36b]/50 blur-3xl" />
        <div className="relative grid items-center gap-16 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#c7d1c8] bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#416058]">
              <span className="h-2 w-2 rounded-full bg-[#9bc83d]" /> Built for the next kind of team
            </div>
            <h1 className="max-w-3xl text-5xl font-black leading-[0.98] tracking-[-0.06em] text-[#173d32] sm:text-7xl lg:text-[6.3rem]">Your best employee never sleeps.</h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-[#53645e]">AIBiz gives every business an AI employee that learns the way you work, handles customer conversations, and brings your team the opportunities that matter.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup" className="rounded-full bg-[#173d32] px-7 py-4 text-center text-sm font-bold text-white transition hover:bg-[#245746]">Build your AI employee <span className="ml-2">→</span></Link>
              <a href="#platform" className="rounded-full border border-[#bac8bd] bg-white/50 px-7 py-4 text-center text-sm font-bold text-[#173d32] transition hover:bg-white">See how it works</a>
            </div>
            <p className="mt-5 text-xs font-medium text-[#71817a]">No credit card required · Start with one workspace</p>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -left-8 top-16 z-10 rounded-2xl border border-[#d5e0d4] bg-white px-4 py-3 shadow-xl shadow-[#173d32]/10">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#81918a]">Today</p><p className="mt-1 text-sm font-bold text-[#173d32]">24 leads qualified</p>
            </div>
            <div className="rotate-2 rounded-[2rem] bg-[#173d32] p-3 shadow-2xl shadow-[#173d32]/25">
              <div className="rounded-[1.5rem] bg-[#f8fbf7] p-6">
                <div className="flex items-center justify-between border-b border-[#dce6dc] pb-5"><div><p className="text-xs font-bold uppercase tracking-widest text-[#81918a]">AI employee</p><h2 className="mt-1 text-xl font-black text-[#173d32]">Maya is on it.</h2></div><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d7f36b] text-[#173d32]">✦</span></div>
                <div className="mt-6 space-y-3"><div className="rounded-2xl rounded-tl-sm bg-[#e8f0e6] p-4 text-sm leading-6 text-[#315047]">Hi Daniel, thanks for reaching out. I can help you find the right plan for your team.</div><div className="ml-8 rounded-2xl rounded-tr-sm bg-[#173d32] p-4 text-sm leading-6 text-white">We need WhatsApp support for 5 people.</div><div className="rounded-2xl rounded-tl-sm bg-[#e8f0e6] p-4 text-sm leading-6 text-[#315047]">Perfect. The Business plan is a great fit. Want me to book a quick setup call?</div></div>
                <div className="mt-5 flex items-center gap-2 border-t border-[#dce6dc] pt-4 text-xs font-semibold text-[#71817a]"><span className="h-2 w-2 rounded-full bg-[#9bc83d]" /> Responding in your brand voice</div>
              </div>
            </div>
            <div className="absolute -bottom-7 -right-7 rounded-2xl border border-[#d5e0d4] bg-[#d7f36b] px-5 py-4 shadow-xl"><p className="text-[10px] font-bold uppercase tracking-widest text-[#48622f]">Human takeover</p><p className="mt-1 text-sm font-black text-[#173d32]">Always one click away</p></div>
          </div>
        </div>
      </section>

      <section id="platform" className="bg-[#173d32] px-6 py-24 text-white lg:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl"><div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d7f36b]">More than a chatbot</p><h2 className="mt-5 text-4xl font-black tracking-[-0.04em] md:text-6xl">Make the busy work feel invisible.</h2><p className="mt-6 text-lg leading-8 text-[#b6c9bd]">Your AI employee takes care of the repeatable work, so your team can focus on the relationships and decisions that move the business forward.</p></div><div className="mt-16 grid gap-px overflow-hidden rounded-3xl bg-[#47705e] md:grid-cols-3">{features.map(([number, title, description]) => <article key={number} className="bg-[#173d32] p-8 lg:p-10"><p className="text-sm font-bold text-[#d7f36b]">{number}</p><h3 className="mt-16 text-2xl font-bold">{title}</h3><p className="mt-4 leading-7 text-[#b6c9bd]">{description}</p></article>)}</div></div>
      </section>

      <section id="workflow" className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32"><div className="grid gap-14 lg:grid-cols-[0.75fr_1.25fr]"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#668071]">A simple start</p><h2 className="mt-5 text-4xl font-black tracking-[-0.04em] text-[#173d32] md:text-5xl">From blank page to business momentum.</h2></div><div className="divide-y divide-[#d4ded4]">{workflow.map((step, index) => <div key={step} className="flex items-center gap-6 py-6"><span className="text-sm font-bold text-[#91ad45]">0{index + 1}</span><span className="text-xl font-bold text-[#173d32]">{step}</span><span className="ml-auto text-2xl text-[#91ad45]">↗</span></div>)}</div></div></section>

      <section id="pricing" className="bg-[#d7f36b] px-6 py-20 lg:px-8"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 md:flex-row md:items-center"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#536d34]">Start small. Grow smart.</p><h2 className="mt-4 text-4xl font-black tracking-[-0.04em] text-[#173d32] md:text-5xl">Your first AI employee starts free.</h2></div><Link href="/signup" className="rounded-full bg-[#173d32] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#245746]">Create your workspace →</Link></div></section>
      <footer className="flex flex-col justify-between gap-4 bg-[#f5f7f4] px-6 py-8 text-sm text-[#71817a] md:flex-row lg:px-8"><span className="font-bold text-[#173d32]">AIBiz Employee</span><span>AI workforce for businesses that want to move forward.</span></footer>
    </main>
  );
}
