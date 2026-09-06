"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Compass, MessageCircle, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Row = Record<string, any>;

const stages = ["Exploring", "Choosing", "Preparing", "Trying", "Re-evaluating"];

export default function JourneyPage() {
  const [user, setUser] = useState<any>(null);
  const [mentee, setMentee] = useState<Row | null>(null);
  const [bookings, setBookings] = useState<Row[]>([]);
  const [actions, setActions] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { async function load() {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) { window.location.replace("/auth?next=/journey"); return; }
    setUser(currentUser);
    const [{ data: menteeData }, { data: bookingData }] = await Promise.all([
      supabase.from("mentees").select("*").eq("user_id", currentUser.id).maybeSingle(),
      supabase.from("bookings").select("id,status,created_at,mentor_id").eq("mentee_user_id", currentUser.id).order("created_at", { ascending: true }),
    ]);
    setMentee(menteeData);
    const completed = (bookingData || []).filter((b: Row) => b.status === "completed");
    if (completed.length) {
      const { data: actionData } = await supabase.from("conversation_actions").select("id,booking_id,action_text,completed,created_at").eq("user_id", currentUser.id).order("created_at", { ascending: true });
      setActions(actionData || []);
    }
    setBookings(bookingData || []); setLoading(false);
  } load(); }, []);

  const currentStage = mentee?.stage || (bookings.length ? "Trying" : "Exploring");
  const stageIndex = Math.max(0, stages.indexOf(currentStage));
  const completedCalls = bookings.filter((b) => b.status === "completed").length;
  const doneActions = actions.filter((a) => a.completed).length;
  const next = useMemo(() => {
    if (!mentee) return "Tell us what you're figuring out so AglaKadam can understand your starting point.";
    if (!bookings.length) return "Talk to someone who has navigated a similar problem.";
    if (!completedCalls) return "Prepare one decision and three questions for your upcoming conversation.";
    if (actions.length && doneActions < actions.length) return "Complete one of the actions you chose after your conversation.";
    return "Take stock of what you learned and decide what perspective would help next.";
  }, [mentee, bookings.length, completedCalls, actions.length, doneActions]);

  if (loading) return <main className="min-h-screen bg-paper flex items-center justify-center"><p className="text-sm text-ink/50">Loading your journey…</p></main>;
  if (!user) return null;

  return <main className="min-h-screen bg-paper text-ink"><div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-14"><Link href="/dashboard" className="font-mono text-xs uppercase tracking-[0.15em] text-board/60 hover:text-board">← Dashboard</Link>
    <header className="mt-9 max-w-3xl"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-board/10 text-board"><Compass size={22}/></div><p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-board/60">YOUR AGLAKADAM JOURNEY</p><h1 className="mt-2 font-display text-4xl leading-tight sm:text-5xl">You don't need to know the whole route.</h1><p className="mt-4 text-base leading-7 text-ink/60">Keep track of where you are, what you've learned and the next useful move. Your journey is private to your account.</p></header>
    <section className="mt-9 rounded-sm border border-ink/10 bg-white p-6 pin-shadow sm:p-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-board/60">Current stage</p><h2 className="mt-2 font-display text-3xl">{currentStage}</h2></div><span className="rounded-full bg-amber/20 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide">Step {stageIndex + 1} of {stages.length}</span></div><div className="mt-7 grid gap-2 sm:grid-cols-5">{stages.map((stage, index) => <div key={stage} className={`rounded-sm p-4 ${index <= stageIndex ? "bg-board text-chalk" : "bg-paper text-ink/40"}`}><span className="font-mono text-[10px]">0{index + 1}</span><p className="mt-2 text-sm font-semibold">{stage}</p></div>)}</div></section>
    <section className="mt-6 rounded-sm border border-board/15 bg-board p-6 text-chalk sm:p-8"><div className="flex gap-3"><Sparkles className="mt-0.5 shrink-0 text-amber" size={20}/><div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-chalk/50">YOUR NEXT STEP</p><h2 className="mt-2 font-display text-2xl">{next}</h2><div className="mt-5 flex flex-wrap gap-2"><Link href="/find-mentor" className="inline-flex items-center gap-2 rounded-sm bg-amber px-5 py-2.5 text-sm font-semibold text-ink">Find a mentor <ArrowRight size={14}/></Link><Link href="/career-navigator" className="inline-flex items-center gap-2 rounded-sm border border-chalk/15 px-5 py-2.5 text-sm font-semibold">Ask AI to plan it <ArrowRight size={14}/></Link></div></div></div></section>
    <div className="mt-6 grid gap-6 lg:grid-cols-2"><section className="rounded-sm border border-ink/10 bg-white p-6 sm:p-8"><div className="flex items-center gap-3"><MessageCircle size={18} className="text-board"/><div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-board/60">Conversations</p><h2 className="mt-1 font-display text-2xl">What you've done</h2></div></div><p className="mt-5 text-4xl font-display">{completedCalls}</p><p className="mt-1 text-sm text-ink/50">completed mentor conversations</p>{completedCalls > 0 && <p className="mt-5 text-sm leading-6 text-ink/60">Each conversation is a checkpoint, not the finish line. Capture what changed and choose what to test next.</p>}{completedCalls === 0 && <Link href="/find-mentor" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-board">Find your first conversation <ArrowRight size={14}/></Link>}</section>
      <section className="rounded-sm border border-ink/10 bg-white p-6 sm:p-8"><div className="flex items-center gap-3"><CheckCircle2 size={18} className="text-board"/><div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-board/60">Actions</p><h2 className="mt-1 font-display text-2xl">Keep moving</h2></div></div>{actions.length === 0 ? <p className="mt-5 text-sm leading-6 text-ink/55">After your first completed conversation, your chosen next actions will appear here.</p> : <div className="mt-5 space-y-3">{actions.slice(-5).map((action) => <div key={action.id} className="flex gap-3 rounded-sm bg-paper p-4"><CheckCircle2 size={17} className={`mt-0.5 shrink-0 ${action.completed ? "text-board" : "text-ink/20"}`}/><p className={`text-sm leading-6 ${action.completed ? "text-ink/45 line-through" : "text-ink/70"}`}>{action.action_text}</p></div>)}</div>}</section></div>
    <div className="mt-8 border-t border-ink/10 pt-6 text-xs leading-5 text-ink/40">AglaKadam uses this journey to organize your own progress. It does not make decisions for you.</div>
  </div></main>;
}
