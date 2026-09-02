"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { ArrowLeft, CalendarDays, Linkedin, MapPin, Star } from "lucide-react";

type Mentor = {
  id: string;
  name: string;
  headline?: string;
  bio?: string;
  expertise?: string;
  experience?: string;
  company?: string;
  role?: string;
  location?: string;
  linkedin?: string;
  calendly?: string;
  photo_url?: string;
};

type Rating = { rating: number };

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function MentorProfilePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function load() {
      const [{ data }, { data: ratingData }] = await Promise.all([
        supabase.from("mentors").select("*").eq("id", id).single(),
        supabase.from("mentor_ratings").select("rating").eq("mentor_id", id),
      ]);
      setMentor((data || null) as Mentor | null);
      setRatings((ratingData || []) as Rating[]);
      setLoading(false);
    }

    load();
  }, [id]);

  if (loading) {
    return <main className="min-h-screen bg-paper px-6 py-24 text-center text-ink/60">Loading mentor profile…</main>;
  }

  if (!mentor) {
    return (
      <main className="min-h-screen bg-paper px-6 py-24 text-center">
        <h1 className="font-display text-3xl">Mentor not found</h1>
        <p className="mt-2 text-sm text-ink/60">This mentor may no longer be available.</p>
        <Link href="/mentors" className="mt-6 inline-flex rounded-sm bg-amber px-5 py-2.5 text-sm font-semibold">Browse mentors</Link>
      </main>
    );
  }

  const average = ratings.length
    ? (ratings.reduce((sum, item) => sum + Number(item.rating), 0) / ratings.length).toFixed(1)
    : null;
  const initial = mentor.name?.trim().charAt(0).toUpperCase() || "M";
  const tags = mentor.expertise
    ? mentor.expertise.split(",").map((item) => item.trim()).filter(Boolean)
    : [];

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-5xl px-6 py-12 sm:py-20">
        <Link href="/mentors" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-board/60 hover:text-board">
          <ArrowLeft size={14} /> Back to mentors
        </Link>

        <section className="mt-8 rounded-sm border border-ink/10 bg-white p-6 pin-shadow sm:p-10">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
            {mentor.photo_url ? (
              <img src={mentor.photo_url} alt={`${mentor.name} profile`} className="h-28 w-28 shrink-0 rounded-full border border-ink/10 object-cover" />
            ) : (
              <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full border border-board/10 bg-board/10 font-display text-5xl text-board">{initial}</div>
            )}

            <div className="min-w-0 flex-1">
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-board/60">Human mentor</p>
              <h1 className="mt-2 font-display text-3xl sm:text-4xl">{mentor.name}</h1>
              <p className="mt-2 text-base text-ink/60">{mentor.headline || mentor.role || "Mentor"}</p>

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink/55">
                {average && <span className="inline-flex items-center gap-1"><Star size={15} className="fill-amber text-amber" /> {average} ({ratings.length} {ratings.length === 1 ? "review" : "reviews"})</span>}
                {mentor.location && <span className="inline-flex items-center gap-1"><MapPin size={15} /> {mentor.location}</span>}
                {mentor.experience && <span>{mentor.experience}</span>}
                {mentor.company && <span>{mentor.company}</span>}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {mentor.calendly && <a href={mentor.calendly} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-sm bg-amber px-6 py-3 text-sm font-semibold"><CalendarDays size={16} /> Book a 30-min call</a>}
                {mentor.linkedin && <a href={mentor.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-sm border border-ink/20 px-6 py-3 text-sm hover:bg-ink/5"><Linkedin size={16} /> LinkedIn</a>}
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-6 sm:grid-cols-[1.5fr_1fr]">
          <section className="rounded-sm border border-ink/10 bg-white p-6 sm:p-8">
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-board/60">About</p>
            <h2 className="mt-3 font-display text-2xl">What I can help you with</h2>
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-ink/70">{mentor.bio || "Practical guidance for your next step."}</p>

            {tags.length > 0 && (
              <div className="mt-7">
                <p className="font-mono text-xs uppercase tracking-[0.15em] text-board/60">Areas of guidance</p>
                <div className="mt-3 flex flex-wrap gap-2">{tags.map((tag) => <span key={tag} className="rounded-full bg-board/10 px-3 py-1.5 text-xs text-board">{tag}</span>)}</div>
              </div>
            )}
          </section>

          <aside className="rounded-sm border border-ink/10 bg-white p-6 sm:p-8">
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-board/60">Before you book</p>
            <h2 className="mt-3 font-display text-xl">Make the most of 30 minutes.</h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ink/65">
              <li>• Bring one or two questions you really want to unpack.</li>
              <li>• Share a little context so the conversation can be practical.</li>
              <li>• This is guidance from experience, not a guarantee of an outcome.</li>
            </ul>
          </aside>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-ink/10 pt-6">
          <Link href={`/review?mentor=${mentor.id}`} className="text-sm font-semibold text-board hover:text-board/70">Leave a review →</Link>
          <Link href="/mentors" className="text-sm text-ink/50 hover:text-ink">Explore more mentors</Link>
        </div>
      </div>
    </main>
  );
}
