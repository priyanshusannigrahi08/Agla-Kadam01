"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle, Compass, Edit3, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Row = Record<string, any>;

const fields = [
  ["stage", "Career stage"], ["area", "Area of interest"], ["challenge", "Current challenge"],
  ["situation", "What I'm figuring out"], ["stuck_on", "Where I'm stuck"], ["background", "Background"]
] as const;

export default function CareerMemoryPage() {
  const [user, setUser] = useState<any>(null);
  const [mentee, setMentee] = useState<Row | null>(null);
  const [actions, setActions] = useState<Row[]>([]);
  const [bookings, setBookings] = useState<Row[]>([]);
  const [mentors, setMentors] = useState<Row[]>([]);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Row>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { async function load() {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    setUser(currentUser);
    if (!currentUser) { setLoading(false); return; }
    const [m, a, b] = await Promise.all([
      supabase.from("mentees").select("stage,area,challenge,situation,stuck_on,background").eq("user_id", currentUser.id).maybeSingle(),
      supabase.from("conversation_actions").select("action_text,completed,created_at,booking_id").eq("user_id", currentUser.id).order("created_at", { ascending: false }).limit(20),
      supabase.from("bookings").select("id,status,mentor_id,scheduled_for,created_at").eq("mentee_user_id", currentUser.id).order("created_at", { ascending: false }).limit(20),
    ]);
    setMentee(m.data || null); setDraft(m.data || {}); setActions(a.data || []); setBookings(b.data || []);
    const ids = Array.from(new Set((b.data || []).map((x: Row) => x.mentor_id).filter(Boolean)));
    if (ids.length) { const { data } = await supabase.from("mentors_public").select("id,name,headline").in("id", ids); setMentors(data || []); }
    setLoading(false);
  } load(); }, []);

  const completed = useMemo(() => actions.filter(a => a.completed).length, [actions]);
  const open = useMemo(() => actions.filter(a => !a.completed).length, [actions]);
  const mentorMap = useMemo(() => new Map(mentors.map(m => [m.id, m])), [mentors]);

  async function save() {
    if (!user || saving) return;
    setSaving(true); setMessage("");
    const payload = Object.fromEntries(fields.map(([key]) => [key, String(draft[key] || "").trim().slice(0, 4000)]));
    const { data, error } = await (supabase.from("mentees") as any).update(payload).eq("user_id", user.id).select("*").maybeSingle();
    if (error) setMessage("We couldn't save your context. Please try again.");
    else { setMentee(data || { ...mentee, ...payload }); setDraft(data || { ...mentee, ...payload }); setEditing(false); setMessage("Your context is updated."); }
    setSaving(false);
  }

  if (loading) return <main className="min-h-screen bg-paper flex items-center justify-center"><p className="font-mono text-sm text-ink/50">Loading your career memory…</p></main>;
  if (!user) return <main className="min-h-screen bg-paper flex items-center justify-center px-6"><div className="max-w-sm rounded-sm border border-ink/10 bg-white p-8 text-center pin-shadow"><Compass className="mx-auto text-board" size={24}/><h1 className="mt-4 font-display text-2xl">Your career memory</h1><p className="mt-2 text-sm text-ink/55">Sign in to see and manage your saved journey.</p><Link href="/auth?next=/career-memory" className="mt-5 inline-flex rounded-sm bg-amber px-6 py-3 font-semibold">Sign in</Link></div></main>;

  return <main className="min-h-screen bg-paper text-ink"><header className="border-b border-ink/10 bg-white"><div className="mx-auto max-w-4xl px-6 py-10 sm:py-14"><Link href="/dashboard" className="font-mono text-xs uppercase tracking-[0.15em] text-board/60">← Dashboard</Link><div className="mt-7 flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-board/10 text-board"><Compass size={21}/></div><div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-board/60">Career memory</p><h1 className="mt-2 font-display text-4xl sm:text-5xl">Your journey, in one place.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-ink/60">Keep the context you want AglaKadam to use for better discovery and next-step suggestions. You control what is saved.</p></div></div></div></header><div className="mx-auto max-w-4xl px-6 py-8 sm:py-12"><section className="rounded-sm border border-ink/10 bg-white p-6 pin-shadow sm:p-8"><div className="flex items-center justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-wide text-board/60">Saved context</p><h2 className="mt-2 font-display text-2xl">What you're working through</h2></div>{!editing&&<button type="button" onClick={()=>{setDraft(mentee||{});setEditing(true);setMessage("")}} className="inline-flex items-center gap-2 rounded-sm border border-ink/15 px-4 py-2 text-sm font-semibold"><Edit3 size={14}/> Edit</button>}</div>{editing?<div className="mt-6 space-y-4">{fields.map(([key,label])=><label key={key} className="block"><span className="font-mono text-[10px] uppercase tracking-wide text-ink/45">{label}</span><textarea value={draft[key]||""} onChange={e=>setDraft({...draft,[key]:e.target.value.slice(0,4000)})} rows={key === "background" || key === "situation" ? 4 : 2} className="mt-2 w-full rounded-sm border border-ink/15 bg-paper px-4 py-3 text-sm outline-none focus:border-board/40" /></label>)}<div className="flex flex-wrap gap-2"><button type="button" onClick={save} disabled={saving} className="rounded-sm bg-amber px-5 py-3 text-sm font-semibold disabled:opacity-60">{saving?"Saving…":"Save context"}</button><button type="button" onClick={()=>setEditing(false)} className="rounded-sm border border-ink/15 px-5 py-3 text-sm font-semibold">Cancel</button></div></div>:<div className="mt-6 grid gap-4 sm:grid-cols-2">{fields.map(([key,label])=><div key={key} className="rounded-sm bg-paper p-4"><p className="font-mono text-[9px] uppercase tracking-wide text-ink/40">{label}</p><p className="mt-2 text-sm leading-6 text-ink/70">{mentee?.[key] || "Not added yet"}</p></div>)}</div>}{message&&<p className="mt-4 text-sm text-board">{message}</p>}<p className="mt-6 border-t border-ink/10 pt-5 text-xs leading-5 text-ink/45">Private profile context stays in your account and is used to personalize discovery features. It is not shown as public mentor-profile content.</p></section>

<section className="mt-6 grid gap-4 sm:grid-cols-3"><div className="rounded-sm border border-ink/10 bg-white p-5"><p className="font-mono text-[10px] uppercase tracking-wide text-board/60">Conversations</p><p className="mt-2 font-display text-3xl">{bookings.filter(b=>b.status === "completed").length}</p><p className="mt-1 text-xs text-ink/45">completed</p></div><div className="rounded-sm border border-ink/10 bg-white p-5"><p className="font-mono text-[10px] uppercase tracking-wide text-board/60">Actions</p><p className="mt-2 font-display text-3xl">{completed}</p><p className="mt-1 text-xs text-ink/45">completed · {open} open</p></div><div className="rounded-sm border border-ink/10 bg-white p-5"><p className="font-mono text-[10px] uppercase tracking-wide text-board/60">Mentors met</p><p className="mt-2 font-display text-3xl">{new Set(bookings.filter(b=>b.status === "completed").map(b=>b.mentor_id)).size}</p><p className="mt-1 text-xs text-ink/45">across conversations</p></div></section>

<section className="mt-6 rounded-sm border border-ink/10 bg-white p-6 sm:p-8"><p className="font-mono text-[10px] uppercase tracking-wide text-board/60">Recent journey</p><div className="mt-5 space-y-3">{bookings.slice(0,6).map(b=><div key={b.id} className="flex items-center gap-3 rounded-sm bg-paper p-4"><div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${b.status === "completed" ? "bg-board text-chalk" : "border border-ink/15 text-board"}`}>{b.status === "completed"?<CheckCircle2 size={15}/>:<Circle size={14}/>}</div><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{mentorMap.get(b.mentor_id)?.name || "Mentor conversation"}</p><p className="mt-1 text-xs text-ink/45">{b.status} · {b.scheduled_for ? new Date(b.scheduled_for).toLocaleDateString("en-IN") : "Date not set"}</p></div>{b.status === "completed"&&<Link href={`/conversation/${b.id}`} className="text-xs font-semibold text-board">Actions →</Link>}</div>)}</div></section>

<section className="mt-6 rounded-sm border border-board/15 bg-board/[0.035] p-6"><div className="flex gap-3"><Sparkles className="mt-0.5 shrink-0 text-board" size={18}/><div><p className="font-semibold">Your memory should evolve.</p><p className="mt-2 text-sm leading-6 text-ink/60">As your goals change, update your context. AglaKadam can then make discovery suggestions based on where you are now—not where you started.</p><div className="mt-4 flex flex-wrap gap-3"><Link href="/recommendations" className="inline-flex items-center gap-2 text-sm font-semibold text-board">See recommendations <ArrowRight size={14}/></Link><Link href="/reflection" className="inline-flex items-center gap-2 text-sm font-semibold text-board">Reflect on conversations <ArrowRight size={14}/></Link></div></div></div></section></div></main>;
}
