"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Booking = { id: string; mentor_id: string; scheduled_for: string | null; status: string; created_at: string; booking_url: string | null };
type Mentor = { id: string; name: string; status: string; verification_status: string; expertise: string; experience: string | null };
type Mentee = { id: string; name: string; situation: string; stuck_on: string; status: string; matched_mentor_id: string | null };

const statusLabel: Record<string, string> = { requested: "Booking recorded", confirmed: "Confirmed", completed: "Completed", cancelled: "Cancelled" };

export default function DashboardPage() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [mentee, setMentee] = useState<Mentee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.replace("/auth?next=/dashboard"); return; }
      setUser(user);
      const [{ data: bookingData }, { data: mentorData }, { data: menteeData }] = await Promise.all([
        supabase.from("bookings").select("id,mentor_id,scheduled_for,status,created_at,booking_url").order("created_at", { ascending: false }),
        supabase.from("mentors").select("id,name,status,verification_status,expertise,experience").eq("user_id", user.id).maybeSingle(),
        supabase.from("mentees").select("id,name,situation,stuck_on,status,matched_mentor_id").eq("user_id", user.id).maybeSingle(),
      ]);
      setBookings((bookingData || []) as Booking[]);
      setMentor((mentorData || null) as Mentor | null);
      setMentee((menteeData || null) as Mentee | null);
      setLoading(false);
    }
    load();
  }, []);

  async function signOut() { await supabase.auth.signOut(); window.location.replace("/"); }

  const activeBookings = useMemo(() => bookings.filter((booking) => !["cancelled", "completed"].includes(booking.status)), [bookings]);
  const completedBookings = useMemo(() => bookings.filter((booking) => booking.status === "completed"), [bookings]);

  function formatDate(value: string | null) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
  }

  if (loading) return <main className="min-h-screen bg-paper px-6 py-24 text-center text-ink/60">Loading your dashboard…</main>;

  return <main className="min-h-screen bg-paper text-ink">
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-col gap-5 border-b border-ink/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="font-mono text-xs uppercase tracking-[0.15em] text-board/60">YOUR SPACE</p><h1 className="mt-2 font-display text-3xl sm:text-4xl">Welcome back.</h1><p className="mt-2 text-sm text-ink/55">{user?.email}</p></div>
        <button type="button" onClick={signOut} className="inline-flex w-fit items-center gap-2 border border-ink/20 px-4 py-2.5 text-sm hover:bg-white"><LogOut size={15}/> Sign out</button>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-sm border border-ink/10 bg-white p-5"><p className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink/45">Active conversations</p><p className="mt-2 font-display text-3xl">{activeBookings.length}</p></div>
        <div className="rounded-sm border border-ink/10 bg-white p-5"><p className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink/45">Completed</p><p className="mt-2 font-display text-3xl">{completedBookings.length}</p></div>
        <div className="rounded-sm border border-ink/10 bg-white p-5"><p className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink/45">Profile</p><p className="mt-2 font-display text-xl">{mentor ? "Mentor" : mentee ? "Mentee" : "Not set up"}</p></div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_330px] lg:items-start">
        <section className="rounded-sm border border-ink/10 bg-white p-6 pin-shadow sm:p-7">
          <div className="flex items-center justify-between gap-4"><div><p className="font-mono text-xs uppercase tracking-[0.15em] text-board/60">CONVERSATIONS</p><h2 className="mt-2 font-display text-2xl">Your calls</h2></div><CalendarDays size={21} className="text-board"/></div>
          {bookings.length === 0 ? <div className="mt-7 rounded-sm border border-dashed border-ink/15 bg-paper p-7 text-center"><Clock3 size={26} className="mx-auto text-board/60"/><p className="mt-3 font-semibold">No conversations yet.</p><p className="mt-1 text-sm text-ink/55">Find someone who can help you take the next step.</p><Link href="/find-mentor" className="mt-5 inline-flex items-center gap-2 rounded-sm bg-amber px-5 py-2.5 text-sm font-semibold">Find a mentor <ArrowRight size={15}/></Link></div> : <div className="mt-6 space-y-3">{bookings.map((booking) => { const scheduled = formatDate(booking.scheduled_for); return <article key={booking.id} className="rounded-sm border border-ink/10 bg-paper p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-semibold">30-minute mentor call</p><p className="mt-1 text-xs text-ink/50">Recorded {new Date(booking.created_at).toLocaleDateString()}</p></div><span className="w-fit rounded-full bg-board/10 px-2.5 py-1 text-xs font-medium text-board">{statusLabel[booking.status] || booking.status}</span></div>{scheduled ? <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium"><CalendarDays size={15} className="text-board"/> {scheduled}</p> : <p className="mt-4 text-xs leading-relaxed text-ink/50">Appointment time is managed by the mentor’s external booking service.</p>}{booking.booking_url && <a href={booking.booking_url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-board hover:underline">Open booking calendar <ArrowRight size={14}/></a>}</article>; })}</div>}
        </section>

        <aside className="space-y-6">
          <section className="rounded-sm border border-ink/10 bg-white p-6">
            <div className="flex items-center gap-3"><UserRound size={20} className="text-board"/><h2 className="font-display text-xl">Your profile</h2></div>
            {mentor ? <><p className="mt-5 font-semibold">{mentor.name}</p><p className="mt-1 text-sm text-ink/55">Mentor · {mentor.status}</p><p className="mt-3 text-sm leading-6 text-ink/65">{mentor.expertise}</p><div className="mt-4 inline-flex items-center gap-2 rounded-full bg-board/10 px-3 py-1.5 text-xs text-board"><ShieldCheck size={13}/>{mentor.verification_status === "verified" ? "Verified mentor" : "Verification pending"}</div></> : mentee ? <><p className="mt-5 font-semibold">{mentee.name}</p><p className="mt-1 text-sm text-ink/55">Mentee · {mentee.status}</p><p className="mt-3 text-sm leading-6 text-ink/65">{mentee.situation}</p><p className="mt-2 text-sm leading-6 text-ink/55">{mentee.stuck_on}</p></> : <><p className="mt-5 text-sm leading-6 text-ink/55">Complete a profile so AglaKadam can personalize your experience.</p><Link href="/onboarding" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-board">Set up profile <ArrowRight size={14}/></Link></>}
          </section>

          <section className="rounded-sm border border-ink/10 bg-board p-6 text-chalk"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-chalk/50">NEXT STEP</p><h2 className="mt-2 font-display text-2xl">Keep moving.</h2><p className="mt-2 text-sm leading-6 text-chalk/70">A good conversation starts with one honest question.</p><div className="mt-5 flex flex-col gap-2">{!mentor && <Link href="/find-mentor" className="inline-flex items-center justify-center gap-2 rounded-sm bg-amber px-4 py-2.5 text-sm font-semibold text-ink">Find my mentor <ArrowRight size={14}/></Link>}<Link href="/mentors" className="inline-flex items-center justify-center rounded-sm border border-chalk/20 px-4 py-2.5 text-sm hover:bg-chalk/10">Browse mentors</Link>{bookings.some((booking) => ["requested", "confirmed", "completed"].includes(booking.status)) && <Link href="/review" className="inline-flex items-center justify-center gap-2 rounded-sm border border-chalk/20 px-4 py-2.5 text-sm hover:bg-chalk/10"><CheckCircle2 size={14}/> Leave a review</Link>}</div></section>
        </aside>
      </div>
    </div>
  </main>;
}
