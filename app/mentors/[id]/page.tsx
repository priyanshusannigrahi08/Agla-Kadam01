"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { ArrowLeft, CalendarDays, MapPin, ShieldCheck, Star } from "lucide-react";

type Mentor = { id: string; name: string; headline?: string; bio?: string; expertise?: string; experience?: string; company?: string; role?: string; location?: string; linkedin?: string; linkedin_url?: string; calendly?: string; calendly_url?: string; photo_url?: string; verification_status?: string };
type Review = { rating: number; reviewer_name: string; comment?: string | null; created_at: string };
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

function safeHttpsUrl(value?: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export default function MentorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (!id) return; async function load() { const [{ data }, { data: reviewData }] = await Promise.all([supabase.from("mentors_public").select("*").eq("id", id).single(), supabase.from("reviews").select("rating,reviewer_name,comment,created_at").eq("mentor_id", id).eq("status", "published").order("created_at", { ascending: false })]); setMentor(data as Mentor | null); setReviews((reviewData || []) as Review[]); setLoading(false); } load(); }, [id]);

  if (loading) return <main className="min-h-screen bg-paper px-6 py-24 text-center text-ink/60">Loading mentor profile…</main>;
  if (!mentor) return <main className="min-h-screen bg-paper px-6 py-24 text-center"><h1 className="font-display text-3xl">Mentor not found</h1><Link href="/mentors" className="mt-6 inline-flex rounded-sm bg-amber px-5 py-2.5 font-semibold">Browse mentors</Link></main>;

  const average = reviews.length ? (reviews.reduce((sum, item) => sum + Number(item.rating), 0) / reviews.length).toFixed(1) : null;
  const initial = mentor.name?.trim().charAt(0).toUpperCase() || "M";
  const tags = mentor.expertise ? mentor.expertise.split(",").map((item) => item.trim()).filter(Boolean) : [];
  const bookingUrl = safeHttpsUrl(mentor.calendly || mentor.calendly_url);
  const linkedinUrl = safeHttpsUrl(mentor.linkedin || mentor.linkedin_url);

  return <main className="min-h-screen bg-paper text-ink"><div className="mx-auto max-w-5xl px-6 py-12 sm:py-20"><Link href="/mentors" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-board/60 hover:text-board"><ArrowLeft size={14}/> Back to mentors</Link>
  <section className="mt-8 rounded-sm border border-ink/10 bg-white p-6 pin-shadow sm:p-10"><div className="flex flex-col gap-8 sm:flex-row sm:items-start">{mentor.photo_url ? <img src={mentor.photo_url} alt={`${mentor.name} profile`} className="h-28 w-28 shrink-0 rounded-full border border-ink/10 object-cover"/> : <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-board/10 font-display text-5xl text-board">{initial}</div>}<div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-mono text-xs uppercase tracking-[0.15em] text-board/60">Human mentor</p>{mentor.verification_status === "verified" && <span className="inline-flex items-center gap-1 rounded-full bg-board/10 px-2.5 py-1 text-[11px] font-semibold text-board"><ShieldCheck size={13}/> Verified</span>}</div><h1 className="mt-2 font-display text-3xl sm:text-4xl">{mentor.name}</h1><p className="mt-2 text-base text-ink/60">{mentor.headline || mentor.role || "Mentor"}</p><div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink/55">{average && <span className="inline-flex items-center gap-1"><Star size={15} className="fill-amber text-amber"/> {average} ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})</span>}{mentor.location && <span className="inline-flex items-center gap-1"><MapPin size={15}/> {mentor.location}</span>}{mentor.experience && <span>{mentor.experience}</span>}{mentor.company && <span>{mentor.company}</span>}</div><div className="mt-6 flex flex-wrap gap-3">{bookingUrl && <Link href={`/book/${mentor.id}`} className="inline-flex items-center gap-2 rounded-sm bg-amber px-6 py-3 text-sm font-semibold"><CalendarDays size={16}/> Book a 30-min call</Link>}{linkedinUrl && <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-sm border border-ink/20 px-6 py-3 text-sm hover:bg-ink/5"><span aria-hidden="true" className="font-bold">in</span> LinkedIn</a>}</div></div></div></section>
  <div className="mt-8 grid gap-6 sm:grid-cols-[1.5fr_1fr]"><section className="rounded-sm border border-ink/10 bg-white p-6 sm:p-8"><p className="font-mono text-xs uppercase tracking-[0.15em] text-board/60">About</p><h2 className="mt-3 font-display text-2xl">What I can help you with</h2><p className="mt-4 whitespace-pre-line text-sm leading-7 text-ink/70">{mentor.bio || "Practical guidance for your next step."}</p>{tags.length > 0 && <div className="mt-7"><p className="font-mono text-xs uppercase tracking-[0.15em] text-board/60">Areas of guidance</p><div className="mt-3 flex flex-wrap gap-2">{tags.map((tag) => <span key={tag} className="rounded-full bg-board/10 px-3 py-1.5 text-xs text-board">{tag}</span>)}</div></div>}</section><aside className="rounded-sm border border-ink/10 bg-white p-6 sm:p-8"><p className="font-mono text-xs uppercase tracking-[0.15em] text-board/60">Before you book</p><h2 className="mt-3 font-display text-xl">Make the most of 30 minutes.</h2><ul className="mt-4 space-y-3 text-sm leading-relaxed text-ink/65"><li>• Bring one or two questions you really want to unpack.</li><li>• Share a little context so the conversation can be practical.</li><li>• Guidance is experience-based, not a guarantee of an outcome.</li></ul></aside></div>
  <section className="mt-8 rounded-sm border border-ink/10 bg-white p-6 sm:p-8"><div className="flex items-end justify-between gap-4"><div><p className="font-mono text-xs uppercase tracking-[0.15em] text-board/60">Reviews</p><h2 className="mt-2 font-display text-2xl">What mentees found useful</h2></div>{reviews.length > 0 && <span className="text-sm text-ink/50">{reviews.length} total</span>}</div>{reviews.length === 0 ? <p className="mt-5 text-sm text-ink/55">No published reviews yet. Be the first after your conversation.</p> : <div className="mt-6 grid gap-4 sm:grid-cols-2">{reviews.slice(0, 6).map((review, index) => <article key={`${review.created_at}-${index}`} className="rounded-sm border border-ink/10 bg-paper p-5"><div className="flex items-center justify-between gap-3"><span className="text-amber tracking-wider">{"★".repeat(Number(review.rating))}</span><span className="text-xs text-ink/45">{review.reviewer_name}</span></div>{review.comment && <p className="mt-3 text-sm leading-relaxed text-ink/70">“{review.comment}”</p>}</article>)}</div>}</section>
  <div className="mt-8 flex items-center justify-between border-t border-ink/10 pt-6"><Link href={`/review?mentor=${mentor.id}&name=${encodeURIComponent(mentor.name)}`} className="text-sm font-semibold text-board hover:text-board/70">Leave a review →</Link><Link href="/mentors" className="text-sm text-ink/50 hover:text-ink">Explore more mentors</Link></div>
  </div></main>;
}
