"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, MessageCircle, Plus, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Booking = Record<string, any>;
type Action = { id: string; action_text: string; completed: boolean };

export default function ConversationFollowupPage() {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [actions, setActions] = useState<Action[]>([]);
  const [actionText, setActionText] = useState("");
  const [reflection, setReflection] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.replace(`/auth?next=/conversation/${encodeURIComponent(location.pathname.split("/").pop() || "")}`); return; }
    const id = location.pathname.split("/").pop();
    if (!id) return;
    const [{ data: bookingData, error: bookingError }, { data: actionData }] = await Promise.all([
      supabase.from("bookings").select("*").eq("id", id).eq("mentee_user_id", user.id).maybeSingle(),
      supabase.from("conversation_actions").select("id,action_text,completed").eq("booking_id", id).eq("user_id", user.id).order("created_at", { ascending: true }),
    ]);
    if (bookingError || !bookingData) { setError("We couldn't find this completed conversation."); setLoading(false); return; }
    if (bookingData.status !== "completed") { setError("Follow-up actions are available after a conversation is completed."); setLoading(false); return; }
    setBooking(bookingData); setActions((actionData || []) as Action[]); setLoading(false);
  } load(); }, []);

  async function addAction(event: FormEvent) {
    event.preventDefault(); const text = actionText.trim(); if (!booking || !text || text.length > 500) return;
    setSaving(true); setError("");
    const { data, error: insertError } = await supabase.from("conversation_actions").insert({ booking_id: booking.id, user_id: booking.mentee_user_id, action_text: text }).select("id,action_text,completed").single();
    if (insertError) setError(insertError.message.includes("conversation_actions") ? "Run supabase/career_journey.sql in Supabase first." : "Couldn't add that action."); else { setActions((current) => [...current, data as Action]); setActionText(""); }
    setSaving(false);
  }

  async function toggleAction(action: Action) {
    const { data, error: updateError } = await supabase.from("conversation_actions").update({ completed: !action.completed }).eq("id", action.id).select("id,action_text,completed").single();
    if (!updateError && data) setActions((current) => current.map((item) => item.id === action.id ? data as Action : item));
  }

  if (loading) return <main className="min-h-screen bg-paper flex items-center justify-center"><p className="text-sm text-ink/50">Loading your reflection…</p></main>;
  if (error && !booking) return <main className="min-h-screen bg-paper px-6 py-24 text-center"><p className="text-sm text-red-700">{error}</p><Link href="/dashboard" className="mt-5 inline-flex rounded-sm bg-amber px-5 py-2.5 font-semibold">Back to dashboard</Link></main>;
  if (!booking) return null;
  const completedCount = actions.filter((item) => item.completed).length;

  return <main className="min-h-screen bg-paper text-ink"><div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-14"><Link href="/dashboard" className="font-mono text-xs uppercase tracking-[0.15em] text-board/60 hover:text-board">← Dashboard</Link><div className="mt-9"><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-board/60">CONVERSATION COMPLETE</p><h1 className="mt-2 font-display text-4xl sm:text-5xl">What changed after the call?</h1><p className="mt-4 max-w-2xl text-base leading-7 text-ink/60">A good conversation should leave you with something you can carry forward. Capture one or two actions while the conversation is still fresh.</p></div>
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
      <section className="space-y-6"><div className="rounded-sm border border-ink/10 bg-white p-6 pin-shadow sm:p-8"><div className="flex gap-3"><MessageCircle size={20} className="mt-0.5 text-board"/><div><p className="font-semibold">Reflection</p><p className="mt-1 text-sm text-ink/50">Optional — keep this for yourself.</p></div></div><textarea value={reflection} onChange={(e) => setReflection(e.target.value)} maxLength={1500} rows={6} className="input mt-5 resize-y" placeholder="What was most useful? What surprised you? What feels clearer now?"/></div>
      <div className="rounded-sm border border-ink/10 bg-white p-6 pin-shadow sm:p-8"><div className="flex items-end justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-board/60">Your next actions</p><h2 className="mt-2 font-display text-2xl">Turn advice into movement.</h2></div><span className="font-mono text-xs text-board">{completedCount}/{actions.length}</span></div><form onSubmit={addAction} className="mt-5 flex gap-2"><input value={actionText} onChange={(e) => setActionText(e.target.value)} maxLength={500} className="input" placeholder="e.g. Finish one SQL project this week"/><button type="submit" disabled={saving || !actionText.trim()} className="inline-flex shrink-0 items-center justify-center rounded-sm bg-amber px-4 disabled:opacity-50"><Plus size={18}/></button></form>{actions.length === 0 ? <div className="mt-5 rounded-sm border border-dashed border-ink/15 bg-paper p-5 text-sm text-ink/55">Add one concrete action. Keep it small enough to actually do.</div> : <div className="mt-5 space-y-2">{actions.map((action) => <button key={action.id} type="button" onClick={() => toggleAction(action)} className="flex w-full items-start gap-3 rounded-sm border border-ink/10 p-4 text-left hover:bg-paper"><CheckCircle2 size={18} className={`mt-0.5 shrink-0 ${action.completed ? "text-board" : "text-ink/20"}`}/><span className={`text-sm leading-6 ${action.completed ? "text-ink/45 line-through" : "text-ink/75"}`}>{action.action_text}</span></button>)}</div>}</div></section>
      <aside className="space-y-5"><div className="rounded-sm border border-board/15 bg-board p-6 text-chalk"><Sparkles size={20} className="text-amber"/><h2 className="mt-4 font-display text-2xl">Keep the next step small.</h2><p className="mt-2 text-sm leading-6 text-chalk/70">You don't need to transform everything after one conversation. One useful action is enough.</p></div><Link href="/mentors" className="flex items-center justify-between rounded-sm border border-ink/10 bg-white p-5 text-sm font-semibold hover:bg-ink/5">Ready for another perspective <ArrowRight size={15}/></Link><Link href="/career-navigator" className="flex items-center justify-between rounded-sm border border-ink/10 bg-white p-5 text-sm font-semibold hover:bg-ink/5">Revisit your career plan <ArrowRight size={15}/></Link></aside>
    </div></div></main>;
}
