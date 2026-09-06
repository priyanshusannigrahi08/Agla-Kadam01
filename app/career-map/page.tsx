"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle, Compass, Map, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Row = Record<string, any>;

type MapItem = { id: string; kind: "context" | "conversation" | "action"; title: string; detail: string; date?: string | null; done?: boolean; href?: string };

function formatDate(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(d);
}

export default function CareerMapPage() {
  const [user, setUser] = useState<any>(null);
  const [mentee, setMentee] = useState<Row | null>(null);
  const [bookings, setBookings] = useState<Row[]>([]);
  const [actions, setActions] = useState<Row[]>([]);
  const [mentors, setMentors] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      if (!currentUser) { setLoading(false); return; }
      const [m, b, a] = await Promise.all([
        supabase.from("mentees").select("stage,area,challenge,situation,background,stuck_on").eq("user_id", currentUser.id).maybeSingle(),
        supabase.from("bookings").select("id,status,mentor_id,scheduled_for,created_at").eq("mentee_user_id", currentUser.id).order("created_at", { ascending: false }).limit(30),
        supabase.from("conversation_actions").select("id,booking_id,action_text,completed,created_at").eq("user_id", currentUser.id).order("created_at", { ascending: false }).limit(40),
      ]);
      setMentee(m.data || null); setBookings(b.data || []); setActions(a.data || []);
      const ids = Array.from(new Set((b.data || []).map((x: Row) => x.mentor_id).filter(Boolean)));
      if (ids.length) { const { data } = await supabase.from("mentors_public").select("id,name,headline").in("id", ids); setMentors(data || []); }
      setLoading(false);
    }
    load();
  }, []);

  const mentorMap = useMemo(() => new Map(mentors.map(m => [m.id, m])), [mentors]);
  const contextText = useMemo(() => [mentee?.stage, mentee?.area, mentee?.challenge, mentee?.situation, mentee?.stuck_on].filter(Boolean).join(" · "), [mentee]);
  const completed = bookings.filter(b => b.status === "completed").length;
  const completedActions = actions.filter(a => a.completed).length;

  const timeline = useMemo<MapItem[]>(() => {
    const result: MapItem[] = [];
    if (mentee && contextText) result.push({ id: "context", kind: "context", title: "Where you are now", detail: contextText });
    bookings.filter(b => b.status !== "cancelled").forEach(b => result.push({ id: `b-${b.id}`, kind: "conversation", title: `Conversation with ${mentorMap.get(b.mentor_id)?.name || "your mentor"}`, detail: b.status === "completed" ? "Conversation completed" : b.status === "confirmed" ? "Conversation confirmed" : "Booking requested", date: b.scheduled_for || b.created_at, done: b.status === "completed", href: b.status === "completed" ? `/conversation/${b.id}` : "/dashboard" }));
    actions.forEach(a => result.push({ id: `a-${a.id}`, kind: "action", title: a.action_text || "Next action", detail: a.completed ? "Completed" : "In progress", date: a.created_at, done: Boolean(a.completed), href: `/conversation/${a.booking_id}` }));
    return result.slice(0, 60).sort((a,b) => {
      if (a.kind === "context") return -1;
      return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
    });
  }, [mentee, contextText, bookings, actions, mentorMap]);

  if (loading) return <main className="min-h-screen bg-paper flex items-center justify-center"><p className="font-mono text-sm text-ink/50">Loading your career map…</p></main>;
  if (!user) return <main className="min-h-screen bg-paper flex items-center justify-center px-6"><div className="max-w-sm rounded-sm border border-ink/10 bg-white p-8 text-center pin-shadow"><Map className="mx-auto text-board" size={24}/><h1 className="mt-4 font-display text-2xl">Your career map</h1><p className="mt-2 text-sm text-ink/55">Sign in to see your journey.</p><Link href="/auth?next=/career-map" className="mt-5 inline-flex rounded-sm bg-amber px-6 py-3 font-semibold">Sign in</Link></div></main>;

  return <main className="min-h-screen bg-paper text-ink"><header className="border-b border-ink/10 bg-white"><div className="mx-auto max-w-5xl px-6 py-10 sm:py-14"><Link href="/dashboard" className="font-mono text-xs uppercase tracking-[0.15em] text-board/60">← Dashboard</Link><div className="mt-7 flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-board/10 text-board"><Map size={21}/></div><div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-board/60">Career map</p><h1 className="mt-2 font-display text-4xl sm:text-5xl">See the path you’re building.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-ink/60">A private, simple map of your context, conversations and experiments. It is a record of movement—not a score or prediction.</p></div></div></div></header><div className="mx-auto max-w-5xl px-6 py-8 sm:py-12"><div className="grid gap-3 sm:grid-cols-3"><div className="rounded-sm border border-ink/10 bg-white p-5"><p className="font-mono text-[10px] uppercase tracking-wide text-board/60">Conversations</p><p className="mt-2 font-display text-3xl">{completed}</p><p className="mt-1 text-xs text-ink/45">completed</p></div><div className="rounded-sm border border-ink/10 bg-white p-5"><p className="font-mono text-[10px] uppercase tracking-wide text-board/60">Experiments</p><p className="mt-2 font-display text-3xl">{completedActions}</p><p className="mt-1 text-xs text-ink/45">actions completed</p></div><div className="rounded-sm border border-ink/10 bg-white p-5"><p className="font-mono text-[10px] uppercase tracking-wide text-board/60">Current direction</p><p className="mt-2 font-semibold">{mentee?.area || "Not set"}</p><p className="mt-1 text-xs text-ink/45">{mentee?.stage || "Add your stage"}</p></div></div>

<section className="mt-8 rounded-sm border border-ink/10 bg-white p-6 sm:p-8"><div className="flex items-center justify-between border-b border-ink/10 pb-5"><div><p className="font-mono text-[10px] uppercase tracking-wide text-board/60">Your path</p><h2 className="mt-2 font-display text-2xl">Context → conversations → experiments</h2></div><Link href="/career-memory" className="hidden text-sm font-semibold text-board sm:block">Edit memory →</Link></div>{timeline.length ? <div className="relative mt-7 space-y-5 before:absolute before:bottom-3 before:left-[15px] before:top-3 before:w-px before:bg-ink/10">{timeline.map(item => <div key={item.id} className="relative flex gap-4"><div className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-4 border-white ${item.kind === "context" ? "bg-amber text-ink" : item.done ? "bg-board text-chalk" : "bg-paper text-board"}`}>{item.kind === "context" ? <Compass size={14}/> : item.done ? <CheckCircle2 size={15}/> : <Circle size={14}/>}</div><div className="min-w-0 flex-1 rounded-sm border border-ink/10 bg-paper/50 p-4"><div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"><h3 className="font-semibold">{item.title}</h3>{item.date&&<span className="font-mono text-[9px] uppercase tracking-wide text-ink/35">{formatDate(item.date)}</span>}</div><p className="mt-1 text-sm leading-6 text-ink/55">{item.detail}</p>{item.href&&<Link href={item.href} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-board">{item.kind === "action" ? "Open action plan" : item.done ? "Reflect" : "View booking"}<ArrowRight size={13}/></Link>}</div></div>)}</div> : <div className="py-10 text-center"><Sparkles className="mx-auto text-board" size={22}/><p className="mt-3 font-display text-xl">Nothing on your map yet.</p><p className="mt-2 text-sm text-ink/50">Start with your career context or find a mentor.</p></div>}</section>

<section className="mt-6 rounded-sm border border-board/15 bg-board/[0.035] p-6"><div className="flex gap-3"><Sparkles className="mt-0.5 shrink-0 text-board" size={18}/><div><p className="font-semibold">The map is yours to change.</p><p className="mt-2 text-sm leading-6 text-ink/60">Careers rarely move in a straight line. Update your context when your direction changes, use conversations to test assumptions, and treat small actions as experiments.</p><div className="mt-4 flex flex-wrap gap-3"><Link href="/career-memory" className="inline-flex items-center gap-2 text-sm font-semibold text-board">Manage memory <ArrowRight size={14}/></Link><Link href="/reflection" className="inline-flex items-center gap-2 text-sm font-semibold text-board">AI reflection <ArrowRight size={14}/></Link><Link href="/recommendations" className="inline-flex items-center gap-2 text-sm font-semibold text-board">Next mentors <ArrowRight size={14}/></Link></div></div></div></section>

<div className="mt-8 flex flex-wrap gap-3"><Link href="/progress" className="inline-flex rounded-sm border border-ink/15 px-5 py-3 text-sm font-semibold">Progress</Link><Link href="/find-mentor" className="inline-flex items-center gap-2 rounded-sm bg-amber px-5 py-3 text-sm font-semibold">Take the next step <ArrowRight size={14}/></Link></div></div></main>;
}
