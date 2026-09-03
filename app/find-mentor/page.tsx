"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles } from "lucide-react";

type Mentor = {
  id: string;
  name: string;
  headline?: string;
  bio?: string;
  expertise?: string;
  experience?: string;
  company?: string;
  role?: string;
  location?: string;
  photo_url?: string;
};

type Match = { id: string; score: number; label: string; reason: string };

const stages = ["Student", "Recent graduate", "Early career", "Changing careers", "Working professional", "Not sure yet"];
const areas = ["Technology & data", "Business & finance", "Design & creative", "Marketing & communication", "Entrepreneurship", "Other"];
const goals = ["Choose a goal", "Choose a direction", "Build the right skills", "Understand a career path", "Prepare for applications/interviews", "Decide on higher studies", "Make a career switch"];

export default function FindMentorPage() {
  const [context, setContext] = useState("");
  const [stage, setStage] = useState("");
  const [area, setArea] = useState("");
  const [goal, setGoal] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  async function findMatches(event: FormEvent) {
    event.preventDefault();
    if (context.trim().length < 20) {
      setError("Give us a little more context — a few sentences helps us find a better fit.");
      return;
    }
    setLoading(true);
    setSearched(false);
    setError("");
    try {
      const response = await fetch("/api/ai-mentor/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: context.trim(), stage, area, goal: goal === "Choose a goal" ? "" : goal }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "We couldn't find matches right now.");
      setMatches(Array.isArray(data?.matches) ? data.matches : []);
      if (Array.isArray(data?.mentors)) setMentors(data.mentors);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setContext(""); setStage(""); setArea(""); setGoal(""); setMatches([]); setMentors([]); setSearched(false); setError("");
  }

  const mentorMap = new Map(mentors.map((mentor) => [mentor.id, mentor]));

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-6 sm:py-12">
        <Link href="/" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-board/60 hover:text-board"><ArrowLeft size={14} /> Back to AglaKadam</Link>

        {!searched ? (
          <section className="mx-auto mt-12 max-w-3xl sm:mt-16">
            <div className="mb-8 flex items-center gap-2 text-board"><Sparkles size={18} /><span className="font-mono text-xs uppercase tracking-[0.15em]">Smart mentor matching</span></div>
            <h1 className="font-display text-4xl leading-tight sm:text-6xl">Tell us what you&apos;re trying to figure out.</h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink/60 sm:text-lg">You don&apos;t need the perfect question. Explain where you are, what you&apos;re considering, and what feels unclear. We&apos;ll look for people whose actual experience fits.</p>

            <form onSubmit={findMatches} className="mt-10 space-y-6">
              <div className="rounded-sm border border-ink/10 bg-white p-5 sm:p-7">
                <label htmlFor="context" className="block font-display text-xl">What&apos;s going on?</label>
                <p className="mt-1 text-sm text-ink/50">For example: “I&apos;m studying commerce but getting interested in data analytics. I know some Excel and Python and I&apos;m not sure what role to target next.”</p>
                <textarea id="context" value={context} onChange={(event) => setContext(event.target.value.slice(0, 6000))} placeholder="Tell us about your situation, skills, doubts, or the decision you&apos;re facing…" rows={7} className="mt-5 w-full resize-y rounded-sm border border-ink/15 bg-paper/50 p-4 text-sm leading-relaxed outline-none transition placeholder:text-ink/35 focus:border-board/50 focus:ring-2 focus:ring-board/10" />
                <div className="mt-2 text-right font-mono text-[10px] text-ink/35">{context.length}/6000</div>
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                <label className="block rounded-sm border border-ink/10 bg-white p-5"><span className="font-display text-lg">Where are you?</span><select value={stage} onChange={(event) => setStage(event.target.value)} className="mt-3 w-full border-b border-ink/15 bg-transparent py-2 text-sm outline-none"><option value="">Optional</option>{stages.map((item) => <option key={item}>{item}</option>)}</select></label>
                <label className="block rounded-sm border border-ink/10 bg-white p-5"><span className="font-display text-lg">Area</span><select value={area} onChange={(event) => setArea(event.target.value)} className="mt-3 w-full border-b border-ink/15 bg-transparent py-2 text-sm outline-none"><option value="">Optional</option>{areas.map((item) => <option key={item}>{item}</option>)}</select></label>
                <label className="block rounded-sm border border-ink/10 bg-white p-5"><span className="font-display text-lg">What do you want?</span><select value={goal} onChange={(event) => setGoal(event.target.value)} className="mt-3 w-full border-b border-ink/15 bg-transparent py-2 text-sm outline-none">{goals.map((item) => <option key={item}>{item}</option>)}</select></label>
              </div>

              {error && <p role="alert" className="rounded-sm border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
              <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-amber px-6 py-3.5 text-sm font-semibold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">{loading ? <><Loader2 size={17} className="animate-spin" /> Finding people…</> : <>Find my matches <ArrowRight size={17} /></>}</button>
            </form>

            <div className="mt-10 flex flex-wrap items-center gap-3 text-xs text-ink/45"><Check size={14} className="text-board" /> AI ranks public mentor profiles; you always see the real profile before booking.</div>
          </section>
        ) : (
          <section className="mx-auto mt-12 max-w-4xl sm:mt-16">
            <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="font-mono text-xs uppercase tracking-[0.15em] text-board/60">YOUR MATCHES</p><h1 className="mt-3 font-display text-4xl sm:text-5xl">A few people worth talking to.</h1><p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink/60">These are AI fit estimates based on what you told us and the mentors&apos; public profiles — not guarantees. Read the profile, then decide.</p></div><button onClick={reset} className="text-sm font-semibold text-board hover:underline">Start again</button></div>

            {matches.length === 0 ? (
              <div className="mt-10 rounded-sm border border-ink/10 bg-white p-7 sm:p-9"><p className="font-display text-2xl">We don&apos;t have a strong match yet.</p><p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/60">That&apos;s better than inventing one. Try broadening your situation or browse the full mentor marketplace.</p><div className="mt-6 flex flex-wrap gap-3"><Link href="/mentors" className="rounded-sm bg-amber px-5 py-2.5 text-sm font-semibold">Browse mentors</Link><Link href="/ai-mentor" className="rounded-sm border border-ink/15 px-5 py-2.5 text-sm">Talk to an AI mentor</Link></div></div>
            ) : (
              <div className="mt-8 grid gap-5">{matches.map((match) => { const mentor = mentorMap.get(match.id); if (!mentor) return null; const initial = mentor.name.trim().charAt(0).toUpperCase() || "M"; return <article key={match.id} className="pin-shadow rounded-sm border border-ink/10 bg-white p-5 sm:p-7"><div className="flex items-start gap-4">{mentor.photo_url ? <img src={mentor.photo_url} alt={`${mentor.name}'s profile`} className="h-20 w-20 shrink-0 rounded-full border border-ink/10 object-cover" /> : <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-board/10 font-display text-3xl text-board">{initial}</div>}<div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="font-display text-2xl">{mentor.name}</h2><span className="rounded-full bg-board/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-board">{match.label}</span></div><p className="mt-1 text-sm text-ink/55">{mentor.headline || mentor.role || "Mentor"}{mentor.company ? ` · ${mentor.company}` : ""}</p>{mentor.experience && <p className="mt-2 text-xs text-ink/45">{mentor.experience}</p>}</div></div>{mentor.expertise && <div className="mt-5 flex flex-wrap gap-2">{mentor.expertise.split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 5).map((tag) => <span key={tag} className="rounded-full bg-board/10 px-3 py-1 text-xs text-board">{tag}</span>)}</div>}<div className="mt-5 rounded-sm bg-paper/70 p-4"><p className="font-mono text-[10px] uppercase tracking-[0.12em] text-board/70">WHY THIS COULD FIT</p><p className="mt-2 text-sm leading-relaxed text-ink/70">{match.reason}</p></div><div className="mt-5 flex flex-wrap gap-3"><Link href={`/mentors/${mentor.id}`} className="rounded-sm bg-amber px-5 py-2.5 text-sm font-semibold">View profile</Link><Link href={`/book/${mentor.id}`} className="rounded-sm border border-ink/15 px-5 py-2.5 text-sm hover:bg-ink/5">Book a call</Link></div></article>})}</div>
            )}

            <div className="mt-10 rounded-sm border border-board/15 bg-board/5 p-5 sm:p-6"><div className="flex gap-3"><Sparkles size={18} className="mt-0.5 shrink-0 text-board" /><div><p className="font-display text-lg">Want to keep exploring?</p><p className="mt-1 text-sm text-ink/60">If you&apos;re still not sure what direction fits, talk through the problem with an AI mentor first, then come back to the human marketplace.</p><Link href="/ai-mentor" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-board hover:underline">Continue with AI <ArrowRight size={15} /></Link></div></div></div>
          </section>
        )}
      </div>
    </main>
  );
}
