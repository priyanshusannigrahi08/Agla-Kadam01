"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, LogOut, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Booking = { id: string; mentor_id: string; scheduled_for: string | null; status: string; created_at: string; booking_url: string | null };
type Mentor = { id: string; name: string; status: string; verification_status: string; expertise: string; experience: string | null };
type Mentee = { id: string; name: string; situation: string; stuck_on: string; status: string; matched_mentor_id: string | null };

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

  if (loading) return <main className="min-h-screen bg-paper px-6 py-24 text-center text-ink/60">Loading your dashboard…</main>;

  return <main className="min-h-screen bg-paper text-ink"><div className="mx-auto max-w-5xl px-6 py-10 sm:py-16"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="font-mono text-xs uppercase tracking-[0.15em] text-board/60">YOUR SPACE</p><h1 className="mt-2 font-display text-3xl sm:text-4xl">Welcome back.</h1><p className="mt-2 text-sm text-ink/55">{user?.email}</p></div><button onClick={signOut} className="inline-flex items-center gap-2 border border-ink/20 px-4 py-2.5 text-sm hover:bg-white"><LogOut size={15}/> Sign out</button></div>

<div className="mt-10 grid gap-6 sm:grid-cols-2">
<section className="rounded-sm border border-ink/10 bg-white p-6 pin-shadow"><div className="flex items-center gap-3"><CalendarDays size={21} className="text-board"/><h2 className="font-display text-xl">Your calls</h2></div>{bookings.length === 0 ? <p className="mt-5 text-sm text-ink/55">No bookings yet. <Link href="/mentors" className="font-semibold text-board">Find a mentor →</Link></p> : <div className="mt-5 space-y-3">{bookings.map((booking) => <div key={booking.id} className="rounded-sm border border-ink/10 bg-paper p-4"><div className="flex items-center justify-between gap-3"><span className="font-semibold">30-minute call</span><span className="rounded-full bg-board/10 px-2.5 py-1 text-xs text-board">{booking.status}</span></div><p className="mt-2 text-xs text-ink/50">Saved {new Date(booking.created_at).toLocaleDateString()}</p>{booking.booking_url && <a href={booking.booking_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-semibold text-board hover:underline">Open booking calendar →</a>}</div>)}</div>}</section>

<section className="rounded-sm border border-ink/10 bg-white p-6 pin-shadow"><div className="flex items-center gap-3"><ShieldCheck size={21} className="text-board"/><h2 className="font-display text-xl">Your profile</h2></div>{mentor ? <><p className="mt-5 font-semibold">{mentor.name}</p><p className="mt-1 text-sm text-ink/55">Mentor · {mentor.status}</p><p className="mt-3 text-sm text-ink/65">{mentor.expertise}</p><div className="mt-4 inline-flex items-center gap-2 rounded-full bg-board/10 px-3 py-1.5 text-xs text-board">{mentor.verification_status === "verified" ? "Verified mentor" : "Verification pending"}</div></> : mentee ? <><p className="mt-5 font-semibold">{mentee.name}</p><p className="mt-1 text-sm text-ink/55">Mentee · {mentee.status}</p><p className="mt-3 text-sm text-ink/65">{mentee.situation}</p><p className="mt-2 text-sm text-ink/55">{mentee.stuck_on}</p></> : <p className="mt-5 text-sm text-ink/55">You haven’t completed a mentor or mentee profile yet.</p>}</section>
</div>

<section className="mt-6 rounded-sm border border-ink/10 bg-white p-6"><p className="font-mono text-xs uppercase tracking-[0.15em] text-board/60">NEXT STEPS</p><div className="mt-4 flex flex-wrap gap-3"><Link href="/find-mentor" className="rounded-sm bg-amber px-5 py-2.5 text-sm font-semibold">Find my mentor</Link><Link href="/mentors" className="rounded-sm border border-ink/20 px-5 py-2.5 text-sm hover:bg-paper">Browse mentors</Link>{bookings.length > 0 && <Link href="/review" className="rounded-sm border border-ink/20 px-5 py-2.5 text-sm hover:bg-paper">Leave a review</Link>}</div></section>
</div></main>;
}
