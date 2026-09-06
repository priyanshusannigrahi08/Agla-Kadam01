import { ArrowRight, CheckCircle2 } from "lucide-react";

type MentorStoryProps = { journey?: string | null; whyMentor?: string | null; name: string };

export default function MentorStory({ journey, whyMentor, name }: MentorStoryProps) {
  if (!journey?.trim() && !whyMentor?.trim()) return null;
  const steps = journey?.split(/\n+|\s*→\s*|\s*->\s*/).map((item) => item.trim()).filter(Boolean).slice(0, 6) || [];
  return <section className="rounded-sm border border-ink/10 bg-white p-6 sm:p-8"><p className="font-mono text-xs uppercase tracking-[0.15em] text-board/60">The journey</p><h2 className="mt-3 font-display text-2xl sm:text-3xl">How {name.split(" ")[0]} got here</h2>{steps.length > 1 ? <div className="mt-7 space-y-3">{steps.map((step, index) => <div key={`${step}-${index}`} className="flex items-center gap-3 rounded-sm bg-paper p-4"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-board text-[11px] font-bold text-chalk">{index + 1}</span><p className="text-sm font-semibold text-ink/75">{step}</p>{index < steps.length - 1 && <ArrowRight size={14} className="ml-auto shrink-0 text-ink/20"/>}</div>)}</div> : <p className="mt-5 whitespace-pre-line text-sm leading-7 text-ink/70">{journey}</p>}{whyMentor?.trim() && <div className="mt-7 rounded-sm border border-board/10 bg-board/[0.035] p-5"><div className="flex gap-3"><CheckCircle2 size={18} className="mt-0.5 shrink-0 text-board"/><div><p className="font-semibold">Why I mentor</p><p className="mt-2 whitespace-pre-line text-sm leading-6 text-ink/65">{whyMentor}</p></div></div></div>}<p className="mt-5 text-xs leading-5 text-ink/40">This story is shared by the mentor to help you understand their perspective. It isn't a guarantee of the same outcome for you.</p></section>;
}
