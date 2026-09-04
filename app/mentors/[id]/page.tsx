"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, Clock3, MapPin, ShieldCheck, Star } from "lucide-react";

type Mentor = { id: string; name: string; headline?: string; bio?: string; expertise?: string; experience?: string; company?: string; role?: string; location?: string; availability?: string; linkedin?: string; linkedin_url?: string; calendly?: string; calendly_url?: string; photo_url?: string; verification_status?: string };
type Review = { rating: number; reviewer_name: string; comment?: string | null; created_at: string };
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

function safeHttpsUrl(value?: string | null) {
  if (!value) return null;
  try { const url = new URL(value); return url.protocol === "https:" ? url.toString() : null; } catch { return null; }
}

export default function MentorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (!id) return; async function load() { const [{ data }, { data: reviewData }] = await Promise.all([supabase.from("mentors_public").select("*").eq("id", id).single(), supabase.from("reviews").select("rating,reviewer_name,comment,created_at").eq("mentor_id", id).eq("status", "published").order("created_at", { ascending: false })]); setMentor(data as Mentor | null); setReviews((reviewData || []) as Review[]); setLoading(false); } load(); }, [id]);

  if (loading) return <main className="min-h-screen bg-paper px-6 py-24 text-center text-ink/60">Loading mentor profile…</main>;
  if (!mentor) return <main className="min-h-screen bg-paper px-6 py-24 text-center"><h1 className="font-display text-3xl">Mentor not found</h1><Link href="/mentors" className="mt-6 inline-flex rounded-sm bg-amber px-5 py-2.5 font-semibold">Browse mentors</Link></main>;

  const average = reviews.length ? reviews.reduce((sum, item) => sum + Number(item.rating), 0) / reviews.length : 0;
  const initial = mentor.name?.trim().charAt(0).toUpperCase() || "M";
  const tags = mentor.expertise ? mentor.expertise.split(",").map((item) => item.trim()).filter(Boolean) : [];
  const bookingUrl = safeHttpsUrl(mentor.calendly || mentor.calendly_url);
  const linkedinUrl = safeHttpsUrl(mentor.linkedin || mentor.linkedin_url);
  const ratingCounts = useMemo(() => [5, 4, 3, 2, 1].map((rating) => ({ rating, count: reviews.filter((review) => Number(review.rating) === rating).length })), [reviews]);
  const hasAvailability = Boolean(mentor.availability?.trim());

  return <main className="min-h-screen bg-paper text-ink">
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-14">
      <Link href="/mentors" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-board/60 hover:text-board"><ArrowLeft size={14}/> Back to mentors</Link>

      <section className="mt-7 overflow-hidden rounded-sm border border-ink/10 bg-white pin-shadow">
        <div className="h-2 bg-board" />
        <div className="p-6 sm:p-10">
          <div className="flex flex-col gap-7 sm:flex-row sm:items-start">
            {mentor.photo_url ? <img src={mentor.photo_url} alt={`${mentor.name} profile`} className="h-32 w-32 shrink-0 rounded-full border-4 border-paper object-cover"/> : <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full border-4 border-paper bg-board/10 font-display text-5xl text-board">{initial}</div>}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-board/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-board">Human mentor</span>{mentor.verification_status === "verified" && <span className="inline-flex items-center gap-1 rounded-full bg-board/10 px-2.5 py-1 text-[11px] font-semibold text-board"><ShieldCheck size={13}/> Verified profile</span>}</div>
              <h1 className="mt-3 font-display text-3xl sm:text-5xl">{mentor.name}</h1>
              <p className="mt-2 max-w-2xl text-base leading-relaxed text-ink/60 sm:text-lg">{mentor.headline || mentor.role || "Mentor"}</p>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink/55">
                {reviews.length > 0 && <span className="inline-flex items-center gap-1 font-semibold text-ink/70"><Star size={15} className="fill-amber text-amber"/> {average.toFixed(1)} <span className="font-normal">({reviews.length} {reviews.length === 1 ? "review" : "reviews"})</span></span>}
                {mentor.location && <span className="inline-flex items-center gap-1"><MapPin size={15}/> {mentor.location}</span>}
                {mentor.experience && <span>{mentor.experience} experience</span>}
                {mentor.company && <span>{mentor.company}</span>}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                {bookingUrl && <Link href={`/book/${mentor.id}`} className="inline-flex items-center gap-2 rounded-sm bg-amber px-6 py-3 text-sm font-semibold transition hover:brightness-95"><CalendarDays size={16}/> Check availability & book <ArrowRight size={15}/></Link>}
                {linkedinUrl && <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-sm border border-ink/20 px-5 py-3 text-sm hover:bg-ink/5"><span className="flex h-4 w-4 items-center justify-center rounded-[3px] bg-ink text-[10px] font-bold leading-none text-white">in</span> LinkedIn</a>}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-7 grid gap-7 lg:grid-cols-[1fr_330px] lg:items-start">
        <div className="space-y-7">
          <section className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-sm border border-ink/10 bg-white p-5"><div className="flex items-center gap-2 text-board"><Clock3 size={17}/><span className="font-mono text-[10px] uppercase tracking-[0.14em]">Availability</span></div><p className="mt-3 text-sm font-semibold">{hasAvailability ? mentor.availability : bookingUrl ? "See live slots" : "Not listed"}</p><p className="mt-1 text-xs leading-relaxed text-ink/50">{bookingUrl ? "Times are confirmed on the mentor's booking calendar." : "This mentor has not added a booking calendar."}</p></div>
            <div className="rounded-sm border border-ink/10 bg-white p-5"><div className="flex items-center gap-2 text-board"><CalendarDays size={17}/><span className="font-mono text-[10px] uppercase tracking-[0.14em]">Session</span></div><p className="mt-3 text-sm font-semibold">30 minutes</p><p className="mt-1 text-xs leading-relaxed text-ink/50">One focused conversation around your question.</p></div>
            <div className="rounded-sm border border-ink/10 bg-white p-5"><div className="flex items-center gap-2 text-board"><ShieldCheck size={17}/><span className="font-mono text-[10px] uppercase tracking-[0.14em]">Trust</span></div><p className="mt-3 text-sm font-semibold">{mentor.verification_status === "verified" ? "Profile verified" : "Profile reviewed"}</p><p className="mt-1 text-xs leading-relaxed text-ink/50">Verification status is shown transparently; professional claims remain the mentor's responsibility.</p></div>
          </section>

          <section className="rounded-sm border border-ink/10 bg-white p-6 sm:p-8">
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-board/60">About this mentor</p>
            <h2 className="mt-3 font-display text-2xl sm:text-3xl">What I can help you with</h2>
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-ink/70">{mentor.bio || "Practical guidance for your next step."}</p>
            {tags.length > 0 && <div className="mt-7"><p className="font-mono text-xs uppercase tracking-[0.15em] text-board/60">Areas of guidance</p><div className="mt-3 flex flex-wrap gap-2">{tags.map((tag) => <span key={tag} className="rounded-full bg-board/10 px-3 py-1.5 text-xs text-board">{tag}</span>)}</div></div>}
          </section>

          <section className="rounded-sm border border-ink/10 bg-white p-6 sm:p-8">
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-board/60">The conversation</p>
            <h2 className="mt-3 font-display text-2xl">A focused 30 minutes</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">{["Bring your real question", "Share your context", "Leave with clearer next steps"].map((item, index) => <div key={item} className="rounded-sm border border-ink/10 bg-paper p-5"><span className="font-mono text-xs text-amber">0{index + 1}</span><p className="mt-3 text-sm font-semibold leading-relaxed">{item}</p></div>)}</div>
            <p className="mt-5 text-xs leading-relaxed text-ink/50">Guidance is experience-based and isn't a guarantee of a particular outcome.</p>
          </section>

          <section className="rounded-sm border border-ink/10 bg-white p-6 sm:p-8">
            <div className="flex items-end justify-between gap-4"><div><p className="font-mono text-xs uppercase tracking-[0.15em] text-board/60">Reviews</p><h2 className="mt-2 font-display text-2xl">What mentees found useful</h2></div>{reviews.length > 0 && <span className="text-sm text-ink/50">{reviews.length} total</span>}</div>
            {reviews.length === 0 ? <p className="mt-5 text-sm text-ink/55">No published reviews yet. Be the first after your conversation.</p> : <>
              <div className="mt-6 grid gap-6 sm:grid-cols-[180px_1fr] sm:items-center">
                <div className="text-center"><p className="font-display text-4xl">{average.toFixed(1)}</p><div className="mt-1 text-amber tracking-wider">★★★★★</div><p className="mt-1 text-xs text-ink/50">Based on {reviews.length} published {reviews.length === 1 ? "review" : "reviews"}</p></div>
                <div className="space-y-2">{ratingCounts.map(({ rating, count }) => <div key={rating} className="flex items-center gap-3 text-xs"><span className="w-8 text-ink/55">{rating} star</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-ink/8"><div className="h-full rounded-full bg-amber" style={{ width: `${reviews.length ? (count / reviews.length) * 100 : 0}%` }}/></div><span className="w-5 text-right text-ink/45">{count}</span></div>)}</div>
              </div>
              <div className="mt-7 grid gap-4 sm:grid-cols-2">{reviews.slice(0, 6).map((review, index) => <article key={`${review.created_at}-${index}`} className="rounded-sm border border-ink/10 bg-paper p-5"><div className="flex items-center justify-between gap-3"><span className="text-amber tracking-wider">{"★".repeat(Number(review.rating))}</span><span className="text-xs text-ink/45">{review.reviewer_name}</span></div>{review.comment && <p className="mt-3 text-sm leading-relaxed text-ink/70">“{review.comment}”</p>}</article>)}</div>
            </>}
          </section>
        </div>

        <aside className="lg:sticky lg:top-24">
          <div className="rounded-sm border border-ink/10 bg-board p-6 text-chalk shadow-lg">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-chalk/50">Ready for your next step?</p>
            <h2 className="mt-3 font-display text-2xl">Talk to {mentor.name.split(" ")[0]}.</h2>
            <p className="mt-3 text-sm leading-relaxed text-chalk/70">Read the profile, check the mentor's availability, then choose a time that works for you.</p>
            {bookingUrl ? <Link href={`/book/${mentor.id}`} className="mt-6 flex w-full items-center justify-center gap-2 rounded-sm bg-amber px-5 py-3 font-semibold text-ink transition hover:brightness-95">Check availability <ArrowRight size={15}/></Link> : <div className="mt-6 rounded-sm border border-chalk/15 bg-chalk/5 p-4 text-xs leading-relaxed text-chalk/60">This mentor hasn't added a booking calendar yet.</div>}
            <div className="mt-5 space-y-3 border-t border-chalk/10 pt-5 text-xs text-chalk/65"><p className="flex gap-2"><CheckCircle2 size={15} className="shrink-0 text-amber"/> Review the mentor's experience before booking</p><p className="flex gap-2"><CheckCircle2 size={15} className="shrink-0 text-amber"/> See published mentee feedback</p><p className="flex gap-2"><CheckCircle2 size={15} className="shrink-0 text-amber"/> Choose a time through their calendar</p><p className="flex gap-2"><CheckCircle2 size={15} className="shrink-0 text-amber"/> Keep the conversation focused on your question</p></div>
          </div>
          {mentor.verification_status === "verified" && <div className="mt-4 rounded-sm border border-ink/10 bg-white p-5"><div className="flex gap-3"><ShieldCheck size={20} className="shrink-0 text-board"/><div><p className="text-sm font-semibold">What verified means</p><p className="mt-1 text-xs leading-relaxed text-ink/55">AglaKadam has marked this profile as verified. This badge does not guarantee outcomes or independently validate every professional claim.</p></div></div></div>}
        </aside>
      </div>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-ink/10 pt-6"><Link href={`/review?mentor=${mentor.id}&name=${encodeURIComponent(mentor.name)}`} className="text-sm font-semibold text-board hover:text-board/70">Leave a review →</Link><Link href="/mentors" className="text-sm text-ink/50 hover:text-ink">Explore more mentors</Link></div>
    </div>
  </main>;
}
