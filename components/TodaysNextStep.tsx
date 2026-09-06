"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Target, Zap } from "lucide-react";

type Item = { kind: "goal" | "action" | "conversation"; text: string; href: string; label: string };

export default function TodaysNextStep({ goal, action, conversation }: { goal?: Item | null; action?: Item | null; conversation?: Item | null }) {
  const next = goal || action || conversation;
  if (!next) return <section className="rounded-sm border border-board/15 bg-board p-6 text-chalk sm:p-8"><div className="flex gap-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-chalk/10 text-amber"><Zap size={19}/></div><div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-amber">Today’s next step</p><h2 className="mt-2 font-display text-2xl">Start with one small experiment.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-chalk/70">Set a goal or find a mentor. You don’t need to map everything before taking the next step.</p><Link href="/goals" className="mt-5 inline-flex items-center gap-2 rounded-sm bg-amber px-5 py-2.5 text-sm font-semibold text-ink">Set a goal <ArrowRight size={14}/></Link></div></div></section>;
  return <section className="rounded-sm border border-board/15 bg-board p-6 text-chalk sm:p-8"><div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-chalk/10 text-amber"><Zap size={19}/></div><div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-amber">Today’s next step</p><p className="mt-2 font-mono text-[9px] uppercase tracking-wide text-chalk/45">{next.label}</p><h2 className="mt-1 max-w-2xl font-display text-2xl">{next.text}</h2><p className="mt-2 text-sm leading-6 text-chalk/65">One useful action is better than a perfect plan.</p></div></div><Link href={next.href} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-sm bg-amber px-5 py-3 text-sm font-semibold text-ink">Do this next <ArrowRight size={15}/></Link></div></section>;
}
