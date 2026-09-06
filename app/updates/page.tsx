"use client";

import Link from "next/link";
import { ArrowRight, Bell, CalendarDays, CheckCircle2, MessageCircle, Sparkles, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Row = Record<string, any>;
type Update = { icon: typeof Bell; title: string; body: string; href: string; cta: string };

function formatDate(value?: string | null) { if (!value) return "your scheduled time"; const date = new Date(value); return Number.isNaN(date.getTime()) ? "your scheduled time" : new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(date); }

export default function UpdatesPage() {
  const [user, setUser] = useState<any>(null);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { async function load() {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    setUser(currentUser);
    if (!currentUser) { setLoading(false); return; }
    const [menteeResult, profileResult, bookingResult, actionResult] = await Promise.all([
      supabase.from("mentees").select("stage,area,challenge,situation,background,stuck_on").eq("user_id", currentUser.id).maybeSingle(),
      supabase.from("profiles").select("name,bio,city,current_status").eq("id", currentUser.id).maybeSingle(),
      supabase.from("bookings").select("id,status,scheduled_for,mentor_id").eq("mentee_user_id", currentUser.id).order("scheduled_for", { ascending: true }),
      supabase.from("conversation_actions").select("id,completed,booking_id").eq("user_id", currentUser.id).eq("completed", false),
    ]);
    const bookings = (bookingResult.data || []) as Row[];
    const actions = (actionResult.data || []) as Row[];
    const active = bookings.filter(b => ["requested", "confirmed"].includes(b.status));
    const completed = bookings.filter(b => b.status === "completed");
    const context = [menteeResult.data?.stage, menteeResult.data?.area, menteeResult.data?.challenge, menteeResult.data?.situation, menteeResult.data?.background, menteeResult.data?.stuck_on].filter(Boolean).join(" ");
    const profile = profileResult.data;
    const next: Update[] = [];
    if (active.length) next.push({ icon: CalendarDays, title: active.length === 1 ? "Your next conversation is scheduled." : `${active.length} conversations are on your calendar.`, body: `Your next conversation is ${formatDate(active[0].scheduled_for)}. Bring one decision, one question and a little context.`, href: "/dashboard", cta: "Prepare for the call" });
    if (actions.length) next.push({ icon: CheckCircle2, title: `${actions.length} action${actions.length === 1 ? "" : "s"} still open.`, body: "Keep momentum by choosing the smallest useful action you can take this week.", href: actions[0]?.booking_id ? `/conversation/${actions[0].booking_id}` : "/dashboard", cta: "Continue your plan" });
    if (completed.length) next.push({ icon: MessageCircle, title: "Your last conversation can teach you something.", body: "Capture feedback while the conversation is still fresh. It helps you reflect and helps mentors improve.", href: "/review", cta: "Leave feedback" });
    const profileFields = [profile?.name, profile?.bio, profile?.city, profile?.current_status].filter(Boolean).length;
    if (profileFields < 3) next.push({ icon: UserRound, title: "Add more context to your profile.", body: "A clearer profile can make your discovery experience more useful.", href: "/profile-setup", cta: "Improve profile" });
    if (!context && !active.length) next.push({ icon: Sparkles, title: "Tell AglaKadam where you're stuck.", body: "Your situation gives the matching system better context for finding relevant human mentors.", href: "/find-mentor", cta: "Find a mentor" });
    setUpdates(next);
    setLoading(false);
  } load(); }, []);

  if (loading) return <main className="min-h-screen bg-paper flex items-center justify-center"><p className="font-mono text-sm text-ink/50">Loading updates…</p></main>;
  if (!user) return <main className="min-h-screen bg-paper flex items-center justify-center px-6"><div className="max-w-sm rounded-sm border border-ink/10 bg-white p-8 text-center pin-shadow"><Bell className="mx-auto text-board" size={24}/><h1 className="mt-4 font-display text-2xl">Your updates</h1><p className="mt-2 text-sm text-ink/55">Sign in to see personalized next steps.</p><Link href="/auth?next=/updates" className="mt-5 inline-flex rounded-sm bg-amber px-6 py-3 font-semibold">Sign in</Link></div></main>;

  return <main className="min-h-screen bg-paper text-ink"><header className="border-b border-ink/10 bg-white"><div className="mx-auto max-w-3xl px-6 py-12"><Link href="/dashboard" className="font-mono text-xs uppercase tracking-[0.15em] text-board/60">← Dashboard</Link><div className="mt-7 flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-board/10 text-board"><Bell size={21}/></div><div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-board/60">Your updates</p><h1 className="mt-2 font-display text-4xl">What matters now.</h1><p className="mt-3 text-sm leading-6 text-ink/60">A short list of useful next steps based on your activity. No noise, no generic notifications.</p></div></div></div></header><div className="mx-auto max-w-3xl px-6 py-10">{updates.length ? <div className="space-y-3">{updates.map(item => { const Icon = item.icon; return <article key={item.title} className="rounded-sm border border-ink/10 bg-white p-6 pin-shadow"><div className="flex gap-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-board/10 text-board"><Icon size={17}/></div><div><h2 className="font-display text-xl">{item.title}</h2><p className="mt-2 text-sm leading-6 text-ink/60">{item.body}</p><Link href={item.href} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-board">{item.cta}<ArrowRight size={14}/></Link></div></div></article> })}</div> : <section className="rounded-sm border border-dashed border-ink/15 bg-white p-8 text-center"><Sparkles className="mx-auto text-board" size={22}/><h2 className="mt-4 font-display text-2xl">You're caught up.</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink/55">There is nothing urgent to act on right now. Keep exploring when you're ready for your next step.</p><Link href="/mentors" className="mt-5 inline-flex items-center gap-2 rounded-sm bg-amber px-5 py-3 text-sm font-semibold">Explore mentors <ArrowRight size={14}/></Link></section>}<p className="mt-8 text-center font-mono text-[10px] uppercase tracking-wide text-ink/35">Updates are generated from your account activity and are not guarantees or reminders of external events.</p></div></main>;
}
