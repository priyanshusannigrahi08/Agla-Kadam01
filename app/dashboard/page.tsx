"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, Clock3, ExternalLink, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Booking = { id: string; mentor_id: string; scheduled_for: string | null; status: string; created_at: string; booking_url: string | null };
type Mentor = { id: string; name: string; headline?: string; status: string; verification_status: string; expertise: string; experience: string | null };
type Mentee = { id: string; name: string; situation: string; stuck_on: string; status: string; matched_mentor_id: string | null };

type PublicMentor = { id: string; name: string; headline?: string };

function formatStatus(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default function DashboardPage() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingMentors, setBookingMentors] = useState<Record<string, PublicMentor>>({});
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [mentee, setMentee] = useState<Mentee | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.replace("/auth?next=/dashboard"); return; }
      setUser(user);

      const [{ data: bookingData, error: bookingError }, { data: mentorData }, { data: menteeData }] = await Promise.all([
        supabase.from("bookings").select("id,mentor_id,scheduled_for,status,created_at,booking_url").order("created_at", { ascending: false }),
        supabase.from("mentors").select("id,name,headline,status,verification_status,expertise,experience").eq("user_id", user.id).maybeSingle(),
        supabase.from("mentees").select("id,name,situation,stuck_on,status,matched_mentor_id").eq("user_id", user.id).maybeSingle(),
      ]);

      if (bookingError) setLoadError("We couldn't load your booking history. Please refresh and try again.");
      const nextBookings = (bookingData || []) as Booking[];
      setBookings(nextBookings);
      setMentor((mentorData || null) as Mentor | null);
      setMentee((menteeData || null) as Mentee | null);

      const mentorIds = [...new Set(nextBookings.map((booking) => booking.mentor_id).filter(Boolean))];
      if (mentorIds.length) {
        const { data: publicMentors } = await supabase.from("mentors_public").select("id,name,headline").in("id", mentorIds);
        const map: Record<string, PublicMentor> = {};
        (publicMentors || []).forEach((item) => { map[item.id] = item as PublicMentor; });
        setBookingMentors(map);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function signOut() { await supabase.auth.signOut(); window.location.replace("/"); }

  if (loading) return <main className="min-h-screen bg-paper px-6 py-24 text-center text-ink/60">Loading your dashboard…</main>;

  return <main className="min-h-screen bg-paper text-ink">
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-14">
      <header className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-board/60">YOUR SPACE</p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl">Welcome back.</h1>
          <p className="mt-2 break-all text-sm text-ink/50">{user?.email}</p>
        </div>
        <button type="button" onClick={signOut} className="inline-flex items-center gap-2 rounded-sm border border-ink/20 px-4 py-2.5 text-sm hover:bg-white"><LogOut size={15}/> Sign out</button>
      </header>

      {loadError && <div className="mt-6 rounded-sm border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">{loadError}</div>}

      <div className="mt-9 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-sm border border-ink/10 bg-white p-6 pin-shadow sm:p-7">
          <div className="flex items-center justify-between gap-4"><div className="flex items-center gap-3"><CalendarDays size={21} className="text-board"/><div><p className="font-mono text-[10px] uppercase tracking-[0.15em] text-board/60">YOUR CALLS</p><h2 className="mt-1 font-display text-xl">Conversations</h2></div></div><span className="rounded-full bg-paper px-3 py-1 text-xs text-ink/50">{bookings.length}</span></div>

          {bookings.length === 0 ? <div className="mt-7 rounded-sm border border-dashed border-ink/15 bg-paper p-6 text-center"><CalendarDays size={28} className="mx-auto text-ink/30"/><p className="mt-3 font-semibold">No conversations yet</p><p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-ink/55">Find a mentor whose experience matches the question you’re trying to solve.</p><Link href="/find-mentor" className="mt-5 inline-flex items-center gap-2 rounded-sm bg-amber px-5 py-2.5 text-sm font-semibold">Find my mentor <ArrowRight size={15}/></Link></div> : <div className="mt-5 space-y-3">
            {bookings.map((booking) => {
              const matchedMentor = bookingMentors[booking.mentor_id];
              const scheduled = formatDate(booking.scheduled_for);
              return <article key={booking.id} className="rounded-sm border border-ink/10 bg-paper p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><p className="font-semibold">{matchedMentor?.name || "Mentor conversation"}</p><p className="mt-1 text-sm text-ink/55">{matchedMentor?.headline || "30-minute mentorship call"}</p></div>
                  <span className="rounded-full bg-board/10 px-2.5 py-1 text-xs font-medium text-board">{formatStatus(booking.status)}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink/50">
                  {scheduled ? <span className="inline-flex items-center gap-1.5"><Clock3 size={14}/> {scheduled}</span> : <span className="inline-flex items-center gap-1.5"><Clock3 size={14}/> Time not recorded in AglaKadam</span>}
                  <span>Added {new Date(booking.created_at).toLocaleDateString()}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  {booking.booking_url && <a href={booking.booking_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-board hover:underline">Open calendar <ExternalLink size={14}/></a>}
                  <Link href={`/review?mentor=${booking.mentor_id}`} className="text-sm font-semibold text-ink/55 hover:text-board">Leave a review →</Link>
                </div>
              </article>;
            })}
          </div>}
        </section>

        <section className="rounded-sm border border-ink/10 bg-white p-6 pin-shadow sm:p-7">
          <div className="flex items-center gap-3"><UserRound size={21} className="text-board"/><div><p className="font-mono text-[10px] uppercase tracking-[0.15em] text-board/60">YOUR PROFILE</p><h2 className="mt-1 font-display text-xl">Account</h2></div></div>
          {mentor ? <div className="mt-6"><p className="font-display text-2xl">{mentor.name}</p><p className="mt-1 text-sm text-ink/55">Mentor · {mentor.status}</p><p className="mt-4 text-sm leading-6 text-ink/65">{mentor.expertise || "No expertise added yet."}</p><div className="mt-4 inline-flex items-center gap-2 rounded-full bg-board/10 px-3 py-1.5 text-xs text-board">{mentor.verification_status === "verified" ? <><ShieldCheck size={14}/> Verified mentor</> : "Verification pending"}</div></div> : mentee ? <div className="mt-6"><p className="font-display text-2xl">{mentee.name}</p><p className="mt-1 text-sm text-ink/55">Mentee · {mentee.status}</p><div className="mt-5 rounded-sm bg-paper p-4"><p className="text-xs font-semibold uppercase tracking-wide text-ink/45">Where you’re at</p><p className="mt-2 text-sm leading-6 text-ink/70">{mentee.situation}</p><p className="mt-3 text-xs font-semibold uppercase tracking-wide text-ink/45">What you’re working through</p><p className="mt-2 text-sm leading-6 text-ink/60">{mentee.stuck_on}</p></div></div> : <div className="mt-6 rounded-sm bg-paper p-5"><p className="text-sm text-ink/55">You haven’t completed a mentor or mentee profile yet.</p><Link href="/onboarding" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-board">Complete onboarding <ArrowRight size={14}/></Link></div>}
        </section>
      </div>

      <section className="mt-6 rounded-sm border border-ink/10 bg-board p-6 text-chalk sm:p-7">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-chalk/50">KEEP MOVING</p>
        <div className="mt-2 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><h2 className="font-display text-2xl">Your next step is still out there.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-chalk/65">Browse people, compare experiences, or use the guided match if you’re not sure where to start.</p></div><div className="flex flex-wrap gap-3"><Link href="/find-mentor" className="inline-flex items-center gap-2 rounded-sm bg-amber px-5 py-2.5 text-sm font-semibold text-ink">Find a mentor <ArrowRight size={15}/></Link><Link href="/mentors" className="rounded-sm border border-chalk/20 px-5 py-2.5 text-sm font-semibold hover:bg-chalk/5">Browse all</Link></div></div>
      </section>
    </div>
  </main>;
}
