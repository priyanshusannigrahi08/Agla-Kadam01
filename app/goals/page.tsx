"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle, Plus, Target, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Goal = { id: string; goal_text: string; completed: boolean; created_at: string; completed_at?: string | null };

export default function GoalsPage() {
  const [user, setUser] = useState<any>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function loadGoals(userId: string) {
    const { data, error } = await supabase.from("career_goals").select("id,goal_text,completed,created_at,completed_at").eq("user_id", userId).order("completed", { ascending: true }).order("created_at", { ascending: false });
    if (error) setMessage("Goals could not be loaded right now.");
    else setGoals((data || []) as Goal[]);
  }

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (data.user) await loadGoals(data.user.id);
      setLoading(false);
    });
  }, []);

  const next = useMemo(() => goals.find(g => !g.completed), [goals]);
  const done = goals.filter(g => g.completed).length;

  async function add(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    const value = text.trim().slice(0, 240);
    if (!value) return;
    setBusy(true); setMessage("");
    const { data, error } = await supabase.from("career_goals").insert({ user_id: user.id, goal_text: value }).select("id,goal_text,completed,created_at,completed_at").single();
    if (error) setMessage("Could not save that goal. Please try again.");
    else if (data) { setGoals([data as Goal, ...goals]); setText(""); }
    setBusy(false);
  }

  async function toggle(goal: Goal) {
    setBusy(true); setMessage("");
    const { data, error } = await supabase.from("career_goals").update({ completed: !goal.completed }).eq("id", goal.id).eq("user_id", user.id).select("id,goal_text,completed,created_at,completed_at").single();
    if (error) setMessage("Could not update that goal.");
    else if (data) setGoals(goals.map(g => g.id === goal.id ? data as Goal : g));
    setBusy(false);
  }

  async function remove(goal: Goal) {
    setBusy(true); setMessage("");
    const { error } = await supabase.from("career_goals").delete().eq("id", goal.id).eq("user_id", user.id);
    if (error) setMessage("Could not delete that goal.");
    else setGoals(goals.filter(g => g.id !== goal.id));
    setBusy(false);
  }

  if (loading) return <main className="min-h-screen bg-paper flex items-center justify-center"><p className="font-mono text-sm text-ink/50">Loading goals…</p></main>;
  if (!user) return <main className="min-h-screen bg-paper flex items-center justify-center px-6"><div className="max-w-sm rounded-sm border border-ink/10 bg-white p-8 text-center pin-shadow"><Target className="mx-auto text-board" size={24}/><h1 className="mt-4 font-display text-2xl">Your goals</h1><p className="mt-2 text-sm text-ink/55">Sign in to keep a private list of career goals and next steps.</p><Link href="/auth?next=/goals" className="mt-5 inline-flex rounded-sm bg-amber px-6 py-3 font-semibold">Sign in</Link></div></main>;

  return <main className="min-h-screen bg-paper text-ink"><header className="border-b border-ink/10 bg-white"><div className="mx-auto max-w-3xl px-6 py-10 sm:py-14"><Link href="/career-map" className="font-mono text-xs uppercase tracking-[0.15em] text-board/60">← Career map</Link><div className="mt-7 flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-board/10 text-board"><Target size={21}/></div><div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-board/60">My goals</p><h1 className="mt-2 font-display text-4xl sm:text-5xl">Choose your next step.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-ink/60">Keep a short list of things you actually want to try. Goals are private to your account and are never shown as public mentor information.</p></div></div></div></header><div className="mx-auto max-w-3xl px-6 py-8 sm:py-12"><section className="rounded-sm border border-board/15 bg-board p-6 text-chalk sm:p-8"><p className="font-mono text-[10px] uppercase tracking-wide text-amber">Next step</p><h2 className="mt-2 font-display text-2xl">{next?.goal_text || "Add one small, concrete goal."}</h2><p className="mt-2 text-sm text-chalk/65">Keep it specific enough that you can tell when you’ve done it.</p></section><form onSubmit={add} className="mt-6 rounded-sm border border-ink/10 bg-white p-5 sm:p-6"><label className="font-mono text-[10px] uppercase tracking-wide text-ink/45">Add a goal</label><div className="mt-3 flex flex-col gap-2 sm:flex-row"><input value={text} onChange={e=>setText(e.target.value)} maxLength={240} placeholder="e.g. Speak to two people working in analytics" className="min-w-0 flex-1 rounded-sm border border-ink/15 bg-paper px-4 py-3 text-sm outline-none focus:border-board/40"/><button disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-sm bg-amber px-5 py-3 text-sm font-semibold disabled:opacity-50"><Plus size={15}/> Add</button></div></form><section className="mt-6 rounded-sm border border-ink/10 bg-white p-5 sm:p-6"><div className="flex items-end justify-between"><div><p className="font-mono text-[10px] uppercase tracking-wide text-board/60">Goal list</p><h2 className="mt-2 font-display text-2xl">{goals.length} goal{goals.length===1?"":"s"}</h2></div><span className="font-mono text-[10px] uppercase tracking-wide text-ink/40">{done} done</span></div><div className="mt-5 space-y-3">{goals.length===0?<p className="py-6 text-center text-sm text-ink/45">No goals yet. Start with one experiment.</p>:goals.map(g=><div key={g.id} className="flex items-center gap-3 rounded-sm bg-paper p-4"><button type="button" disabled={busy} onClick={()=>toggle(g)} className="shrink-0 text-board">{g.completed?<CheckCircle2 size={19}/>:<Circle size={19}/>}</button><p className={`min-w-0 flex-1 text-sm leading-6 ${g.completed?"text-ink/40 line-through":"text-ink/70"}`}>{g.goal_text}</p><button type="button" disabled={busy} aria-label="Delete goal" onClick={()=>remove(g)} className="shrink-0 text-ink/30 hover:text-ink/60"><Trash2 size={15}/></button></div>)}</div></section>{message&&<p className="mt-4 text-center text-sm text-red-700/70">{message}</p>}<section className="mt-6 grid gap-3 sm:grid-cols-3"><Link href="/reflection" className="rounded-sm border border-ink/10 bg-white p-5"><p className="font-mono text-[9px] uppercase tracking-wide text-board/60">Reflect</p><p className="mt-2 text-sm font-semibold">Review what you learned <ArrowRight size={13} className="inline"/></p></Link><Link href="/recommendations" className="rounded-sm border border-ink/10 bg-white p-5"><p className="font-mono text-[9px] uppercase tracking-wide text-board/60">Discover</p><p className="mt-2 text-sm font-semibold">Find relevant mentors <ArrowRight size={13} className="inline"/></p></Link><Link href="/progress" className="rounded-sm border border-ink/10 bg-white p-5"><p className="font-mono text-[9px] uppercase tracking-wide text-board/60">Progress</p><p className="mt-2 text-sm font-semibold">See your journey <ArrowRight size={13} className="inline"/></p></Link></section><p className="mt-6 text-center text-xs text-ink/40">Goals are a planning aid. You decide what to pursue and when.</p></div></main>;
}
