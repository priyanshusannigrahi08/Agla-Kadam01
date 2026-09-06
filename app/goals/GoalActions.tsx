"use client";

import { CheckCircle2, Circle, Plus, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Goal = { id: string; text: string; completed: boolean; created_at: string; completed_at?: string | null };

export default function GoalActions() {
  const [goals, setGoals] = useState<Goal[]>([]); const [text, setText] = useState(""); const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(false); const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => { supabase.auth.getUser().then(async ({ data }) => { if (!data.user) { setLoading(false); return; } setUserId(data.user.id); const { data: rows } = await supabase.from("career_goals").select("id,text,completed,created_at,completed_at").order("completed", { ascending: true }).order("created_at", { ascending: false }); setGoals((rows || []) as Goal[]); setLoading(false); }); }, []);
  async function add(e: FormEvent) { e.preventDefault(); const value=text.trim().slice(0,500); if(!value||!userId)return; setBusy(true); const { data }=await supabase.from("career_goals").insert({user_id:userId,text:value}).select("id,text,completed,created_at,completed_at").single(); if(data)setGoals([data as Goal,...goals]); setText(""); setBusy(false); }
  async function toggle(g:Goal) { setBusy(true); const completed=!g.completed; const {data}=await supabase.from("career_goals").update({completed,completed_at:completed?new Date().toISOString():null}).eq("id",g.id).select("id,text,completed,created_at,completed_at").single(); if(data)setGoals(goals.map(x=>x.id===g.id?data as Goal:x)); setBusy(false); }
  async function remove(g:Goal) { setBusy(true); const {error}=await supabase.from("career_goals").delete().eq("id",g.id); if(!error)setGoals(goals.filter(x=>x.id!==g.id)); setBusy(false); }
  if(loading)return <p className="text-sm text-ink/40">Loading goals…</p>;
  return <div><form onSubmit={add} className="flex flex-col gap-2 sm:flex-row"><input value={text} onChange={e=>setText(e.target.value)} maxLength={500} placeholder="Add a concrete next step…" className="min-w-0 flex-1 rounded-sm border border-ink/15 bg-paper px-4 py-3 text-sm outline-none focus:border-board/40"/><button disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-sm bg-amber px-5 py-3 text-sm font-semibold disabled:opacity-50"><Plus size={15}/> Add goal</button></form><div className="mt-5 space-y-2">{goals.length===0?<p className="py-5 text-center text-sm text-ink/40">No goals yet. Start with one small experiment.</p>:goals.map(g=><div key={g.id} className="flex items-center gap-3 rounded-sm bg-paper p-4"><button disabled={busy} onClick={()=>toggle(g)} className="shrink-0 text-board">{g.completed?<CheckCircle2 size={19}/>:<Circle size={19}/>}</button><p className={`flex-1 text-sm leading-6 ${g.completed?"text-ink/40 line-through":"text-ink/70"}`}>{g.text}</p><button disabled={busy} onClick={()=>remove(g)} aria-label="Delete goal" className="text-ink/25 hover:text-ink/60"><Trash2 size={15}/></button></div>)}</div></div>;
}
