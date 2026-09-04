"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, ExternalLink, ShieldCheck, Star } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Mentor = { id: string; name: string; headline?: string; calendly?: string; calendly_url?: string; availability?: string; verification_status?: string };
type Review = { rating: number };
const supabaseClient = supabase;

function safeHttpsUrl(value?: string | null) { if (!value) return null; try { const url = new URL(value); return url.protocol === "https:" ? url.toString() : null; } catch { return null; } }

export default function BookMentorPage() {
  const { id } = require("next/navigation").useParams<{ id: string }>();
  const router = require("next/navigation").useRouter();
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { if (!id) return; async function load() { const [{ data, error: fetchError }, { data: reviewData }] = await Promise.all([supabaseClient.from("mentors_public").select("id,name,headline,calendly,calendly_url,availability,verification_status").eq("id", id).single(), supabaseClient.from("reviews").select("rating").eq("mentor_id", id).eq("status", "published")]); if (fetchError) setError("We couldn't load this mentor."); setMentor(data as Mentor | null); setReviews((reviewData || []) as Review[]); setLoading(false); } load(); }, [id]);

  async function confirmBooking() {
    if (saving) return; setSaving(true); setError("");
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { setSaving(false); router.push(`/auth?next=/book/${id}`); return; }
    const bookingUrl = safeHttpsUrl(mentor?.calendly || mentor?.calendly_url);
    if (!bookingUrl) { setError("This mentor's booking link is unavailable or invalid."); setSaving(false); return; }
    const { error: insertError } = await supabaseClient.from("bookings").insert({ mentee_user_id: user.id, mentor_id: id, duration_minutes: 30, status: "requested", booking_url: bookingUrl });
    if (insertError) { const message = insertError.message.toLowerCase(); setError(message.includes("already") || message.includes("duplicate") || message.includes("unique") ? "You already have an active booking request for this mentor. Check your dashboard for the existing request." : "We couldn't record the booking right now. Please try again."); } else setDone(true);
    setSaving(false);
  }

  if (loading) return <main className="min-h-screen bg-paper px-6 py-24 text-center text-ink/60">Loading booking page…</main>;
  if (!mentor) return <main className="min-h-screen bg-paper px-6 py-24 text-center"><h1 className="font-display text-3xl">Mentor unavailable</h1><Link href="/mentors" className="mt-6 inline-flex rounded-sm bg-amber px-5 py-2.5 font-semibold">Browse mentors</Link></main>;

  const bookingUrl = safeHttpsUrl(mentor.calendly || mentor.calendly_url);
  const average = reviews.length ? reviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviews.length : 0;

  return <main className="min-h-screen bg-paper text-ink"><div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-16">
    <Link href={`/mentors/${id}`} className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-board/60 hover:text-board"><ArrowLeft size={14}/> Back to profile</Link>
    <section className="mt-7 overflow-hidden rounded-sm border border-ink/10 bg-white pin-shadow sm:mt-9"><div className="h-2 bg-board"/><div className="p-6 sm:p-10">
      {done ? <div className="text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-board/10"><CheckCircle2 size={30} className="text-board"/></div><p className="mt-5 font-mono text-xs uppercase tracking-[0.15em] text-board/60">BOOKING RECORDED</p><h1 className="mt-3 font-display text-3xl sm:text-4xl">You’re all set.</h1><p className="mx-auto mt-4 max-w-md text-sm leading-7 text-ink/65">Your AglaKadam dashboard has a record of this booking request. The mentor’s booking service remains the source of truth for the actual appointment time.</p><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-sm bg-amber px-6 py-3 font-semibold">Open dashboard <ArrowRight size={15}/></Link><Link href="/mentors" className="inline-flex items-center justify-center rounded-sm border border-ink/15 px-6 py-3 text-sm font-semibold hover:bg-paper">Explore more mentors</Link></div></div> : <>
        <div className="flex flex-wrap items-center gap-2"><p className="font-mono text-xs uppercase tracking-[0.15em] text-board/60">30-MINUTE CALL</p>{mentor.verification_status === "verified" && <span className="inline-flex items-center gap-1 rounded-full bg-board/10 px-2 py-1 text-[10px] font-semibold text-board"><ShieldCheck size={12}/> Verified profile</span>}</div>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl">Book a call with {mentor.name}.</h1><p className="mt-3 text-sm leading-6 text-ink/65 sm:text-base">{mentor.headline || "A focused conversation about your next step."}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-sm border border-ink/10 bg-paper p-4"><p className="text-xs font-mono uppercase tracking-wide text-board/60">Availability</p><p className="mt-2 text-sm font-semibold">{mentor.availability?.trim() || (bookingUrl ? "See live slots on calendar" : "Not listed")}</p></div>{reviews.length > 0 && <div className="rounded-sm border border-ink/10 bg-paper p-4"><p className="text-xs font-mono uppercase tracking-wide text-board/60">Mentee feedback</p><p className="mt-2 flex items-center gap-1 text-sm font-semibold"><Star size={14} className="fill-amber text-amber"/> {average.toFixed(1)} · {reviews.length} {reviews.length === 1 ? "review" : "reviews"}</p></div>}</div>
        <div className="mt-8 space-y-3"><div className="flex gap-4 rounded-sm border border-ink/10 bg-paper p-5"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-board text-xs font-bold text-chalk">1</span><div><p className="font-semibold">Choose a time</p><p className="mt-1 text-sm leading-6 text-ink/60">Open the mentor’s calendar and choose a slot that works for you.</p>{bookingUrl ? <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-sm border border-ink/20 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-ink/5">Open booking calendar <ExternalLink size={14}/></a> : <p className="mt-4 text-sm font-medium text-red-700">This mentor’s booking link is unavailable.</p>}</div></div><div className="flex gap-4 rounded-sm border border-ink/10 bg-paper p-5"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-board text-xs font-bold text-chalk">2</span><div><p className="font-semibold">Record your booking</p><p className="mt-1 text-sm leading-6 text-ink/60">After confirming a time externally, return here to keep your AglaKadam booking history up to date.</p></div></div></div>
        {error && <div className="mt-5 rounded-sm border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800" role="alert">{error}<Link href="/dashboard" className="mt-2 block font-semibold underline">Go to dashboard</Link></div>}
        <button type="button" disabled={!bookingUrl || saving} onClick={confirmBooking} className="mt-6 flex w-full items-center justify-center gap-2 rounded-sm bg-amber px-6 py-3.5 font-semibold transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Recording…" : "I booked a slot — record it"}<ArrowRight size={15}/></button>
        <div className="mt-5 flex gap-2 border-t border-ink/10 pt-5 text-xs leading-5 text-ink/50"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-board"/><p>AglaKadam does not claim to verify the external calendar booking. The mentor’s booking service is the source of truth for the actual appointment.</p></div>
      </>}
    </div></section>
  </div></main>;
}
