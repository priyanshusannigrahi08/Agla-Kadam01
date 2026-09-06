"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle, Compass, MessageCircle, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Row = Record<string, any>;

type TimelineItem = { id: string; type: "conversation" | "action"; title: string; detail: string; date?: string | null; done?: boolean; href?: string };

function dateLabel(value?: string | null) {
  if (!value) return "Date not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date not set";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

export default function ProgressPage() {
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasContext, setHasContext] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      if (!currentUser) { setLoading(false); return; }

      const [bookingResult, menteeResult] = await Promise.all([
        supabase.from("bookings").select("id,status,scheduled_for,created_at,mentor_id").eq("mentee_user_id", currentUser.id).order("created_at", { ascending: false }),
        supabase.from("mentees").select("stage,area,challenge,situation,background,stuck_on").eq("user_id", currentUser.id).maybeSingle(),
      ]);
      const bookings = (bookingResult.data || []) as Row[];
      const mentorIds = Array.from(new Set(bookings.map(b => b.mentor_id).filter(Boolean)));
      let mentors: Row[] = [];
      if (mentorIds.length) {
        const { data } = await supabase.from("mentors_public").select("id,name,headline").in("id", mentorIds);
        mentors = data || [];
      }
      const mentorMap = new Map(mentors.map(m => [m.id, m]));
      const conversationItems: TimelineItem[] = bookings.filter(b => b.status !== "cancelled").map(b => ({ id: `conversation-${b.id}`, type: "conversation", title: b.status === "completed" ? `Conversation with ${mentorMap.get(b.mentor_id)?.name || "your mentor"}` : `Conversation with ${mentorMap.get(b.mentor_id)?.name || "your mentor"}`, detail: b.status === "completed" ? "Completed conversation" : b.status === "confirmed" ? "Confirmed conversation" : "Booking in progress", date: b.scheduled_for || b.created_at, done: b.status === "completed", href: b.status === "completed" ? `/conversation/${b.id}` : "/dashboard" }));

      const completedIds = bookings.filter(b => b.status === "completed").map(b => b.id);
      let actionItems: TimelineItem[] = [];
      if (completedIds.length) {
        const { data } = await supabase.from("conversation_actions").select("id,booking_id,action_text,completed,created_at").eq("user_id", currentUser.id).order("created_at", { ascending: false });
        actionItems = ((data || []) as Row[]).map(a => ({ id: `action-${a.id}`, type: "action", title: a.action_text || "Next step", detail: a.completed ? "Action completed" : "Action still open", date: a.created_at, done: Boolean(a.completed), href: `/conversation/${a.booking_id}` }));
      }
      const context = [menteeResult.data?.stage, menteeResult.data?.area, menteeResult.data?.challenge, menteeResult.data?.situation, menteeResult.data?.background, menteeResult.data?.stuck_on].filter(Boolean).join(" ");
      setHasContext(Boolean(context));
      setItems([...conversationItems, ...actionItems].sort((a,b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()));
      setLoading(false);
    }
    load();
  }, []);

  const completedConversations = useMemo(() => items.filter(i => i.type === "conversation" && i.done).length, [items]);
  const completedActions = useMemo(() => items.filter(i => i.type === "action" && i.done).length, [items]);
  const openActions = useMemo(() => items.filter(i => i.type === "action" && !i.done).length, [items]);

  if (loading) return <main className="min-h-screen bg-paper flex items-center justify-center"><p className="font-mono text-sm text-ink/50">Loading your progress…</p></main>;
  if (!user) return <main className="min-h-screen bg-paper flex items-center justify-center px-6"><div className="max-w-sm rounded-sm border border-ink/10 bg-white p-8 text-center pin-shadow"><Compass className="mx-auto text-board" size={24}/><h1 className="mt-4 font-display text-2xl">Your progress</h1><p className="mt-2 text-sm text-ink/55">Sign in to see your conversations and next steps.</p><Link href="/auth?next=/progress" className="mt-5 inline-flex rounded-sm bg-amber px-6 py-3 font-semibold">Sign in</Link></div></main>;

  return <main className="min-h-screen bg-paper text-ink"><header className="border-b border-ink/10 bg-white"><div className="mx-auto max-w-4xl px-6 py-10 sm:py-14"><Link href="/dashboard" className="font-mono text-xs uppercase tracking-[0.15em] text-board/60">← Dashboard</Link><div className="mt-7 flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-board/10 text-board"><Compass size={21}/></div><div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-board/60">Progress</p><h1 className="mt-2 font-display text-4xl sm:text-5xl">Keep moving.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-ink/60">See the path from conversation to action. Progress here is about what you tried, not a score.</p></div></div></div></header><div className="mx-auto max-w-4xl px-6 py-8 sm:py-12"><div className="grid gap-3 sm:grid-cols-3"><div className="rounded-sm border border-ink/10 bg-white p-5"><p className="font-mono text-[10px] uppercase tracking-wide text-board/60">Conversations</p><p className="mt-2 font-display text-3xl">{completedConversations}</p></div><div className="rounded-sm border border-ink/10 bg-white p-5"><p className="font-mono text-[10px] uppercase tracking-wide text-board/60">Actions done</p><p className="mt-2 font-display text-3xl">{completedActions}</p></div><div className="rounded-sm border border-ink/10 bg-white p-5"><p className="font-mono text-[10px] uppercase tracking-wide text-board/60">Actions open</p><p className="mt-2 font-display text-3xl">{openActions}</p></div></div>

      {!items.length ? <section className="mt-8 rounded-sm border border-dashed border-ink/15 bg-white p-8 text-center"><Sparkles className="mx-auto text-board" size={22}/><h2 className="mt-4 font-display text-2xl">Your journey starts with a conversation.</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink/55">Find someone who has relevant experience, then turn the conversation into one small experiment.</p><div className="mt-5 flex justify-center gap-2"><Link href="/find-mentor" className="inline-flex items-center gap-2 rounded-sm bg-amber px-5 py-3 text-sm font-semibold">Find a mentor <ArrowRight size={14}/></Link><Link href="/mentors" className="inline-flex items-center px-5 py-3 text-sm font-semibold">Browse</Link></div></section> : <section className="mt-8 rounded-sm border border-ink/10 bg-white p-6 sm:p-8"><div className="flex items-end justify-between border-b border-ink/10 pb-5"><div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-board/60">Your timeline</p><h2 className="mt-2 font-display text-2xl">Conversations → actions</h2></div><span className="font-mono text-[10px] uppercase tracking-wide text-ink/40">{items.length} moments</span></div><div className="relative mt-7 space-y-6 before:absolute before:bottom-2 before:left-[15px] before:top-2 before:w-px before:bg-ink/10">{items.map(item => <div key={item.id} className="relative flex gap-4"><div className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-4 border-white ${item.done ? "bg-board text-chalk" : "bg-paper text-board"}`}>{item.done ? <CheckCircle2 size={15}/> : item.type === "action" ? <Circle size={14}/> : <MessageCircle size={14}/>}</div><div className="min-w-0 flex-1 rounded-sm border border-ink/10 bg-paper/50 p-4"><div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"><h3 className="font-semibold">{item.title}</h3><span className="font-mono text-[9px] uppercase tracking-wide text-ink/35">{dateLabel(item.date)}</span></div><p className="mt-1 text-sm text-ink/50">{item.detail}</p>{item.href&&<Link href={item.href} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-board">{item.type === "action" ? "Open action plan" : item.done ? "Reflect on conversation" : "View dashboard"}<ArrowRight size={13}/></Link>}</div></div>)}</div></section>}

      {!hasContext && <section className="mt-6 rounded-sm border border-board/15 bg-board/[0.035] p-6"><p className="font-mono text-[10px] uppercase tracking-wide text-board/60">Next step</p><h2 className="mt-2 font-display text-xl">Give your journey a little context.</h2><p className="mt-2 text-sm leading-6 text-ink/60">Your saved situation helps AglaKadam make better discovery suggestions.</p><Link href="/mentee" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-board">Update my context <ArrowRight size={14}/></Link></section>}
      <div className="mt-8 flex flex-wrap gap-3"><Link href="/dashboard" className="inline-flex rounded-sm border border-ink/15 px-5 py-3 text-sm font-semibold">Dashboard</Link><Link href="/recommendations" className="inline-flex items-center gap-2 rounded-sm bg-amber px-5 py-3 text-sm font-semibold">What next? <ArrowRight size={14}/></Link></div>
    </div></main>;
}
