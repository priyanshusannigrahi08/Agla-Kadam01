"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, Target, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Row = Record<string, any>;
type NextItem = { kind: "goal" | "action" | "conversation"; id?: string; title: string; detail: string; href: string };

export default function NextStepPage() {
  const [item, setItem] = useState<NextItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);

  async function loadNextStep() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSignedIn(false); setLoading(false); return; }

    const [goalResult, actionResult, bookingResult] = await Promise.all([
      supabase.from("career_goals").select("id,text,completed,created_at").eq("user_id", user.id).eq("completed", false).order("created_at", { ascending: false }).limit(1),
      supabase.from("conversation_actions").select("id,action_text,completed,created_at,booking_id").eq("user_id", user.id).eq("completed", false).order("created_at", { ascending: false }).limit(1),
      supabase.from("bookings").select("id,mentor_id,status,scheduled_for").eq("mentee_user_id", user.id).in("status", ["requested", "confirmed"]).order("scheduled_for", { ascending: true, nullsFirst: false }).limit(1),
    ]);

    const goal = (goalResult.data || [])[0] as Row | undefined;
    if (goal) { setItem({ kind: "goal", id: goal.id, title: goal.text, detail: "Your active career goal. Keep it small enough to act on today.", href: "/goals" }); setLoading(false); return; }

    const action = (actionResult.data || [])[0] as Row | undefined;
    if (action) {
      setItem({ kind: "action", id: action.id, title: action.action_text || "Finish an action from your mentoring conversation", detail: "An unfinished action from a mentoring conversation.", href: action.booking_id ? `/conversation/${action.booking_id}` : "/progress" });
      setLoading(false);
      return;
    }

    const booking = (bookingResult.data || [])[0] as Row | undefined;
    if (booking) {
      const date = booking.scheduled_for ? new Date(booking.scheduled_for) : null;
      const detail = date && !Number.isNaN(date.getTime())
        ? `Your next conversation is ${new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(date)}.`
        : "Your mentor conversation is active. Bring one decision and one question.";
      setItem({ kind: "conversation", id: booking.id, title: "Prepare for your next mentor conversation", detail, href: `/book/${booking.mentor_id}` });
    }
    setLoading(false);
  }

  useEffect(() => { loadNextStep(); }, []);

  async function completeItem() {
    if (!item?.id || item.kind === "conversation") return;
    setCompleting(true);
    const now = new Date().toISOString();
    const result = item.kind === "goal"
      ? await supabase.from("career_goals").update({ completed: true, completed_at: now }).eq("id", item.id)
      : await supabase.from("conversation_actions").update({ completed: true, completed_at: now }).eq("id", item.id);
    setCompleting(false);
    if (!result.error) {
      setCompleted(true);
      setTimeout(() => { setCompleted(false); setLoading(true); loadNextStep(); }, 700);
    }
  }

  const icon = item?.kind === "goal" ? <Target size={21} /> : item?.kind === "action" ? <CheckCircle2 size={21} /> : <CalendarDays size={21} />;

  if (loading) return <main className="min-h-screen bg-paper flex items-center justify-center"><p className="font-mono text-sm text-ink/50">Finding your next step…</p></main>;
  if (!signedIn) return <main className="min-h-screen bg-paper flex items-center justify-center px-6"><div className="max-w-md rounded-sm border border-ink/10 bg-white p-8 text-center pin-shadow"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-board/60">Next step</p><h1 className="mt-3 font-display text-3xl">Your path starts here.</h1><p className="mt-3 text-sm leading-6 text-ink/55">Sign in to keep your goals, actions and mentoring conversations together.</p><Link href="/auth?next=/next-step" className="mt-6 inline-flex rounded-sm bg-amber px-6 py-3 text-sm font-semibold">Sign in</Link></div></main>;

  return <main className="min-h-screen bg-paper text-ink"><div className="mx-auto max-w-3xl px-6 py-10 sm:py-16"><Link href="/dashboard" className="font-mono text-xs uppercase tracking-[0.15em] text-board/60">← Dashboard</Link><div className="mt-14 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-board/10 text-board">{item ? icon : <Zap size={21}/>}</div><p className="mt-7 font-mono text-[10px] uppercase tracking-[0.18em] text-board/60">Today’s next step</p><h1 className="mx-auto mt-3 max-w-2xl font-display text-4xl leading-tight sm:text-6xl">{completed ? "Nice. Keep moving." : item?.title || "Choose one small thing to move forward."}</h1><p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-ink/55 sm:text-base">{completed ? "That step is marked complete. AglaKadam is finding what makes sense next." : item?.detail || "Start with a goal, find a mentor, or use the Career Navigator to turn uncertainty into an experiment."}</p>{item ? <div className="mt-8 flex flex-wrap justify-center gap-2">{item.kind !== "conversation" && <button type="button" onClick={completeItem} disabled={completing} className="inline-flex items-center gap-2 rounded-sm bg-amber px-7 py-3.5 text-sm font-semibold disabled:opacity-50">{completing ? "Saving…" : "Mark complete"} <CheckCircle2 size={15}/></button>}<Link href={item.href} className="inline-flex items-center gap-2 rounded-sm border border-ink/15 px-6 py-3.5 text-sm font-semibold">{item.kind === "conversation" ? "Prepare for the call" : "Open details"} <ArrowRight size={15}/></Link></div> : <div className="mt-8 flex flex-wrap justify-center gap-2"><Link href="/goals" className="inline-flex items-center gap-2 rounded-sm bg-amber px-6 py-3 text-sm font-semibold">Set a goal <ArrowRight size={14}/></Link><Link href="/find-mentor" className="inline-flex items-center gap-2 rounded-sm border border-ink/15 px-6 py-3 text-sm font-semibold">Find a mentor</Link></div>}</div><div className="mt-20 border-t border-ink/10 pt-6 text-center"><p className="text-xs text-ink/40">AglaKadam helps you choose a next step; you remain in control of the decision.</p></div></div></main>;
}
