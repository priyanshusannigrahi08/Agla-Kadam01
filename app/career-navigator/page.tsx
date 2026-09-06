"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2, Compass, MessageCircle, Sparkles } from "lucide-react";

type Plan = { summary: string; stage: string; decisions: string[]; steps: { title: string; detail: string; timeframe: string }[]; questions: string[] };

export default function CareerNavigatorPage() {
  const [situation, setSituation] = useState("");
  const [stage, setStage] = useState("");
  const [goal, setGoal] = useState("");
  const [options, setOptions] = useState("");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function buildPlan(event: FormEvent) {
    event.preventDefault();
    setError(""); setPlan(null);
    if (situation.trim().length < 20) { setError("Tell us a little more about what's going on (at least 20 characters)."); return; }
    setLoading(true);
    try {
      const response = await fetch("/api/ai-mentor/navigator", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ situation, stage, goal, options: options.split(",").map((item) => item.trim()).filter(Boolean) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Couldn't build your plan.");
      setPlan(data as Plan);
    } catch (err) { setError(err instanceof Error ? err.message : "Couldn't build your plan. Please try again."); }
    finally { setLoading(false); }
  }

  return <main className="min-h-screen bg-paper text-ink">
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-14">
      <Link href="/" className="font-mono text-xs uppercase tracking-[0.15em] text-board/60 hover:text-board">← AglaKadam</Link>
      <div className="mt-10 grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <section>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-board/10 text-board"><Compass size={22}/></div>
          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-board/60">AI CAREER NAVIGATOR</p>
          <h1 className="mt-2 font-display text-4xl leading-tight sm:text-5xl">You don't need the whole answer. Just the next step.</h1>
          <p className="mt-4 text-base leading-7 text-ink/60">Tell AglaKadam what's on your mind. We'll turn the situation into a practical plan, useful questions and a path to a real conversation.</p>
          <div className="mt-7 space-y-3 text-sm text-ink/60"><p className="flex gap-3"><CheckCircle2 size={17} className="mt-0.5 shrink-0 text-board"/> Small, testable actions instead of vague advice.</p><p className="flex gap-3"><CheckCircle2 size={17} className="mt-0.5 shrink-0 text-board"/> Explore options without forcing a decision.</p><p className="flex gap-3"><CheckCircle2 size={17} className="mt-0.5 shrink-0 text-board"/> Bring better questions to a human mentor.</p></div>
        </section>
        <form onSubmit={buildPlan} className="rounded-sm border border-ink/10 bg-white p-6 pin-shadow sm:p-8">
          <label className="mb-2 block font-mono text-xs uppercase tracking-[0.1em] text-ink/60" htmlFor="situation">What's going on? *</label>
          <textarea id="situation" value={situation} onChange={(e) => setSituation(e.target.value)} maxLength={5000} rows={7} className="input resize-y" placeholder="I'm in my second year of college and I'm interested in analytics, but I'm not sure whether to focus on finance, data science or business analytics…" required />
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Select label="Where are you?" value={stage} onChange={setStage} options={["School", "College", "Recently graduated", "Working", "Career switch", "Exploring"]} />
            <div><label className="mb-2 block font-mono text-xs uppercase tracking-[0.1em] text-ink/60" htmlFor="goal">What do you want?</label><input id="goal" value={goal} onChange={(e) => setGoal(e.target.value)} maxLength={300} className="input" placeholder="Choose a direction" /></div>
          </div>
          <div className="mt-5"><label className="mb-2 block font-mono text-xs uppercase tracking-[0.1em] text-ink/60" htmlFor="options">Options you're considering <span className="text-ink/35">(optional)</span></label><input id="options" value={options} onChange={(e) => setOptions(e.target.value)} maxLength={600} className="input" placeholder="Data analytics, finance, consulting"/><p className="mt-2 text-xs text-ink/40">Separate options with commas.</p></div>
          {error && <p className="mt-5 rounded-sm bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
          <button type="submit" disabled={loading} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-amber px-5 py-3 font-semibold disabled:opacity-60">{loading ? "Building your next steps…" : "Build my plan"} <ArrowRight size={16}/></button>
          <p className="mt-3 text-center text-xs text-ink/40">AI guidance is a starting point, not a guarantee or a substitute for professional advice.</p>
        </form>
      </div>

      {plan && <section className="mt-10 space-y-6">
        <div className="rounded-sm border border-board/15 bg-board p-6 text-chalk sm:p-8"><div className="flex flex-wrap items-center gap-3"><span className="rounded-full bg-chalk/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide">Current stage: {plan.stage}</span></div><h2 className="mt-4 font-display text-2xl sm:text-3xl">Your next-step plan</h2><p className="mt-3 max-w-3xl text-sm leading-7 text-chalk/75">{plan.summary}</p></div>
        <div className="grid gap-6 lg:grid-cols-[1fr_330px]">
          <div className="rounded-sm border border-ink/10 bg-white p-6 sm:p-8"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-board/60">The path</p><div className="mt-6 space-y-4">{plan.steps.map((step, index) => <article key={`${step.title}-${index}`} className="flex gap-4 rounded-sm bg-paper p-5"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-board text-xs font-bold text-chalk">{index + 1}</span><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{step.title}</h3>{step.timeframe && <span className="rounded-full bg-amber/20 px-2 py-1 font-mono text-[9px] uppercase">{step.timeframe}</span>}</div><p className="mt-2 text-sm leading-6 text-ink/60">{step.detail}</p></div></article>)}</div></div>
          <aside className="space-y-6"><div className="rounded-sm border border-ink/10 bg-white p-6"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-board/60">Questions for a human</p><div className="mt-4 space-y-3">{plan.questions.map((q, i) => <p key={i} className="flex gap-3 text-sm leading-6 text-ink/65"><MessageCircle size={15} className="mt-1 shrink-0 text-board"/>{q}</p>)}</div><Link href={`/find-mentor?q=${encodeURIComponent(situation.slice(0, 500))}`} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-amber px-4 py-3 text-sm font-semibold">Find someone who's done it <ArrowRight size={14}/></Link></div>{plan.decisions.length > 0 && <div className="rounded-sm border border-ink/10 bg-white p-6"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-board/60">What to think about</p><div className="mt-4 space-y-3">{plan.decisions.map((item, i) => <p key={i} className="flex gap-3 text-sm leading-6 text-ink/65"><Sparkles size={14} className="mt-1 shrink-0 text-board"/>{item}</p>)}</div></div>}</aside>
        </div>
      </section>}
    </div>
  </main>;
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) { return <div><label className="mb-2 block font-mono text-xs uppercase tracking-[0.1em] text-ink/60">{label}</label><select value={value} onChange={(e) => onChange(e.target.value)} className="input"><option value="">Not specified</option>{options.map((option) => <option key={option}>{option}</option>)}</select></div>; }
