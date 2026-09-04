"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Compass, LayoutDashboard } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const params = useSearchParams();
  const mentor = params.get("mentor") || "your mentor";

  return <main className="min-h-screen bg-paper text-ink"><div className="mx-auto flex min-h-screen max-w-2xl items-center px-6 py-16"><section className="w-full rounded-sm border border-ink/10 bg-white p-7 text-center pin-shadow sm:p-10"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-board/10 text-board"><CheckCircle2 size={28}/></div><p className="mt-6 font-mono text-xs uppercase tracking-[0.15em] text-board/60">CONVERSATION COMPLETE</p><h1 className="mt-3 font-display text-3xl sm:text-4xl">Thanks for sharing.</h1><p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-ink/60">Your feedback helps future mentees understand what a conversation with {mentor} can be like.</p><div className="mt-8 grid gap-3 sm:grid-cols-2"><Link href="/mentors" className="inline-flex items-center justify-center gap-2 rounded-sm bg-amber px-5 py-3 text-sm font-semibold">Explore another mentor <Compass size={15}/></Link><Link href="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-sm border border-ink/15 px-5 py-3 text-sm font-semibold hover:bg-paper"><LayoutDashboard size={15}/> Go to dashboard</Link></div><div className="mt-8 border-t border-ink/10 pt-6"><Link href="/find-mentor" className="inline-flex items-center gap-2 text-sm font-semibold text-board hover:underline">Not sure who to talk to next? Get matched <ArrowRight size={14}/></Link></div></section></div></main>;
}

export default function ReviewSuccessPage() { return <Suspense fallback={null}><SuccessContent/></Suspense>; }
