"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

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
  calendly?: string;
  photo_url?: string;
};

const steps = [
  { title: "Where are you right now?", options: ["Figuring out my career direction", "Changing fields or careers", "Looking for my first role", "Considering higher studies", "Stuck after college"] },
  { title: "What area do you want help with?", options: ["Technology & data", "Business & finance", "Design & creative", "Marketing & communication", "Other"] },
  { title: "What kind of mentor would help most?", options: ["Someone in my target field", "Someone who has changed careers", "Someone with 5+ years of experience", "No preference"] },
];

function scoreMentor(mentor: Mentor, answers: string[]) {
  const text = [mentor.name, mentor.headline, mentor.bio, mentor.expertise, mentor.company, mentor.role, mentor.location, mentor.experience].filter(Boolean).join(" ").toLowerCase();
  let score = 0;
  const [situation, area, preference] = answers.map((x) => x.toLowerCase());
  if (area.includes("technology") && /(tech|data|software|analytics|ai|engineering|product)/.test(text)) score += 5;
  if (area.includes("finance") && /(finance|business|account|bank|investment|consult)/.test(text)) score += 5;
  if (area.includes("design") && /(design|creative|ux|ui|brand)/.test(text)) score += 5;
  if (area.includes("marketing") && /(marketing|communication|content|sales|growth|media)/.test(text)) score += 5;
  if (situation.includes("career") && /(career|switch|transition|strategy|consult)/.test(text)) score += 2;
  if (situation.includes("first role") && /(hiring|recruit|talent|career|manager)/.test(text)) score += 2;
  if (situation.includes("higher studies") && /(education|academic|university|research|mba|master)/.test(text)) score += 2;
  if (preference.includes("target field")) score += 1;
  if (preference.includes("changed careers") && /(switch|transition|career change|changed)/.test(text)) score += 4;
  if (preference.includes("5+ years") && /(5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20)\s*\+?\s*year/.test(text)) score += 4;
  return score;
}

export default function FindMentorPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState("");

  const current = steps[step];
  const results = useMemo(() => mentors.map((mentor) => ({ mentor, score: scoreMentor(mentor, answers) })).sort((a, b) => b.score - a.score).slice(0, 3), [mentors, answers]);

  async function choose(option: string) {
    const next = [...answers.slice(0, step), option];
    setSelected(option);
    setAnswers(next);
    if (step < steps.length - 1) {
      window.setTimeout(() => { setSelected(""); setStep(step + 1); }, 180);
      return;
    }
    setLoading(true);
    const { data } = await supabase.from("mentors").select("id,name,headline,bio,expertise,experience,company,role,location,calendly,photo_url");
    setMentors((data || []) as Mentor[]);
    setLoading(false);
    setStep(steps.length);
  }

  function restart() { setStep(0); setAnswers([]); setSelected(""); setMentors([]); }

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-6 sm:py-16">
        <Link href="/" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-board/60 hover:text-board"><ArrowLeft size={14} /> Back to AglaKadam</Link>
        <div className="mx-auto mt-12 max-w-2xl">
          {step < steps.length ? (
            <>
              <div className="mb-10 flex items-center gap-2" aria-label={`Step ${step + 1} of ${steps.length}`}>{steps.map((_, index) => <div key={index} className={`h-1.5 flex-1 rounded-full ${index <= step ? "bg-board" : "bg-ink/10"}`} />)}</div>
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-board/60">Step {step + 1} of {steps.length}</p>
              <h1 className="mt-3 font-display text-3xl leading-tight sm:text-5xl">{current.title}</h1>
              <p className="mt-4 text-ink/60">Choose the answer that feels closest. There are no wrong answers.</p>
              <div className="mt-8 grid gap-3">{current.options.map((option) => <button key={option} onClick={() => choose(option)} className={`flex w-full items-center justify-between rounded-sm border p-4 text-left transition hover:-translate-y-0.5 hover:border-board/30 hover:bg-white ${selected === option ? "border-board bg-white" : "border-ink/10 bg-white/70"}`}><span className="text-sm font-medium sm:text-base">{option}</span>{selected === option ? <Check size={18} /> : <ArrowRight size={16} className="text-ink/30" />}</button>)}</div>
              {step > 0 && <button onClick={() => { setStep(step - 1); setSelected(""); }} className="mt-6 text-sm text-ink/55 hover:text-ink">← Previous question</button>}
            </>
          ) : (
            <>
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-board/60">YOUR MATCHES</p>
              <h1 className="mt-3 font-display text-3xl sm:text-5xl">A few people worth talking to.</h1>
              <p className="mt-4 text-ink/60">These suggestions are based on what you told us. Open a profile to see the person’s actual experience before booking.</p>
              {loading ? <p className="mt-10 text-sm text-ink/50">Finding matches…</p> : results.length === 0 ? <div className="mt-10 rounded-sm border border-ink/10 bg-white p-7"><p className="font-display text-xl">No matches yet.</p><p className="mt-2 text-sm text-ink/60">Try the mentor marketplace and search directly.</p><Link href="/mentors" className="mt-5 inline-flex rounded-sm bg-amber px-5 py-2.5 text-sm font-semibold">Browse mentors</Link></div> : <div className="mt-8 grid gap-5">{results.map(({ mentor }) => { const initial = mentor.name?.trim().charAt(0).toUpperCase() || "M"; return <article key={mentor.id} className="pin-shadow rounded-sm border border-ink/10 bg-white p-5 sm:p-6"><div className="flex items-start gap-4">{mentor.photo_url ? <img src={mentor.photo_url} alt={`${mentor.name}'s profile`} className="h-20 w-20 shrink-0 rounded-full border border-ink/10 object-cover" /> : <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-board/10 font-display text-3xl text-board">{initial}</div>}<div><h2 className="font-display text-xl sm:text-2xl">{mentor.name}</h2><p className="mt-1 text-sm text-ink/55">{mentor.headline || mentor.role || "Mentor"}</p>{mentor.experience && <p className="mt-2 text-xs text-ink/50">{mentor.experience}</p>}</div></div>{mentor.expertise && <div className="mt-4 flex flex-wrap gap-2">{mentor.expertise.split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 4).map((tag) => <span key={tag} className="rounded-full bg-board/10 px-3 py-1 text-xs text-board">{tag}</span>)}</div>}<p className="mt-4 text-sm leading-relaxed text-ink/70">{mentor.bio || "Experience and guidance for your next step."}</p><div className="mt-5 flex flex-wrap gap-3"><Link href={`/mentors/${mentor.id}`} className="rounded-sm bg-amber px-5 py-2.5 text-sm font-semibold">View profile</Link>{mentor.calendly && <a href={mentor.calendly} target="_blank" rel="noopener noreferrer" className="rounded-sm border border-ink/20 px-5 py-2.5 text-sm hover:bg-ink/5">Book a call</a>}</div></article>})}</div>}
              <div className="mt-8 flex flex-wrap gap-4"><button onClick={restart} className="text-sm font-semibold text-board hover:underline">Start again</button><Link href="/mentors" className="text-sm text-ink/55 hover:text-ink">Browse all mentors →</Link></div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
