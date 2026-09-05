"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { ArrowRight, CalendarDays, CheckCircle2, MapPin, ShieldCheck, Star, UserRound } from "lucide-react";
import ArticlesSection from "@/components/ArticlesSection";

type Mentor = {
  id: string;
  name: string;
  headline?: string;
  role?: string;
  company?: string;
  location?: string;
  expertise?: string;
  experience?: string;
  bio?: string;
  photo_url?: string;
  calendly?: string;
  verification_status?: string;
};

type Rating = { mentor_id: string; rating: number };

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function FeaturedMentors() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: mentorData, error: mentorError }, { data: reviewData, error: reviewError }] = await Promise.all([
        supabase
          .from("mentors_public")
          .select("id,name,headline,role,company,location,expertise,experience,bio,photo_url,calendly,verification_status")
          .order("created_at", { ascending: false })
          .limit(3),
        supabase.from("reviews").select("mentor_id,rating").eq("status", "published"),
      ]);

      if (mentorError) console.error("FEATURED MENTORS LOAD ERROR:", mentorError);
      if (reviewError) console.error("FEATURED REVIEWS LOAD ERROR:", reviewError);
      setMentors((mentorData || []) as Mentor[]);
      setRatings((reviewData || []) as Rating[]);
      setLoading(false);
    }

    load();
  }, []);

  const ratingFor = (id: string) => {
    const values = ratings.filter((r) => r.mentor_id === id);
    if (!values.length) return null;
    return {
      average: (values.reduce((sum, r) => sum + Number(r.rating), 0) / values.length).toFixed(1),
      count: values.length,
    };
  };

  return (
    <>
      <section className="border-t border-ink/10 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-board/60">
                Meet the community
              </p>
              <h2 className="max-w-xl font-display text-2xl sm:text-3xl">
                People who have already walked the path.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/60">
                Explore mentors by experience, field and the problems they can help you think through.
              </p>
            </div>
            <Link href="/mentors" className="hidden items-center gap-1 font-mono text-xs uppercase tracking-[0.1em] text-board hover:text-board/70 sm:inline-flex">
              View all mentors <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-3">
              {[1, 2, 3].map((item) => <div key={item} className="h-72 animate-pulse rounded-sm border border-ink/10 bg-paper" />)}
            </div>
          ) : mentors.length === 0 ? (
            <div className="rounded-sm border border-dashed border-ink/15 bg-paper p-8 text-center">
              <UserRound className="mx-auto mb-3 text-board/50" size={28} />
              <p className="font-display text-lg">The mentor community is growing.</p>
              <p className="mt-1 text-sm text-ink/60">Be one of the first people to share your experience.</p>
              <Link href="/mentor" className="mt-5 inline-flex rounded-sm bg-amber px-5 py-2.5 text-sm font-semibold">Become a mentor</Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-3">
              {mentors.map((mentor) => {
                const rating = ratingFor(mentor.id);
                const initial = mentor.name?.trim().charAt(0).toUpperCase() || "M";
                const title = mentor.headline || mentor.role || mentor.experience || "Mentor";
                const tags = mentor.expertise ? mentor.expertise.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 3) : [];

                return (
                  <article key={mentor.id} className="pin-shadow flex flex-col rounded-sm border border-ink/10 bg-paper p-6 transition-transform hover:-translate-y-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        {mentor.photo_url ? <img src={mentor.photo_url} alt={`${mentor.name} profile`} className="h-20 w-20 rounded-full border border-ink/10 object-cover" /> : <div className="flex h-20 w-20 items-center justify-center rounded-full border border-board/10 bg-board/10 font-display text-3xl text-board">{initial}</div>}
                      </div>
                      {mentor.verification_status === "verified" && <span className="inline-flex items-center gap-1 rounded-full bg-board/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-board"><ShieldCheck size={12} /> Verified</span>}
                    </div>
                    <div className="mt-5"><h3 className="font-display text-xl">{mentor.name}</h3><p className="mt-1 text-sm text-ink/60">{title}</p></div>
                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-ink/55">
                      {rating && <span className="inline-flex items-center gap-1"><Star size={13} className="fill-amber text-amber" /> {rating.average} ({rating.count})</span>}
                      {mentor.location && <span className="inline-flex items-center gap-1"><MapPin size={13} /> {mentor.location}</span>}
                      {mentor.experience && <span>{mentor.experience}</span>}
                    </div>
                    {tags.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{tags.map((tag) => <span key={tag} className="rounded-full bg-board/10 px-3 py-1 text-xs text-board">{tag}</span>)}</div>}
                    <p className="mt-4 flex-1 text-sm leading-relaxed text-ink/65">{mentor.bio || "Experience and practical guidance for your next step."}</p>
                    <div className="mt-6 flex flex-wrap gap-2">
                      <Link href={`/mentors/${mentor.id}`} className="inline-flex items-center justify-center rounded-sm bg-amber px-4 py-2.5 text-sm font-semibold">View profile</Link>
                      {mentor.calendly && <a href={mentor.calendly} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-sm border border-ink/20 px-4 py-2.5 text-sm hover:bg-ink/5"><CalendarDays size={14} /> Book</a>}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <div className="mt-10 grid gap-3 border-t border-ink/10 pt-6 sm:grid-cols-3">
            <div className="flex gap-3 rounded-sm bg-paper p-4">
              <ShieldCheck size={18} className="mt-0.5 shrink-0 text-board" />
              <div><p className="text-sm font-semibold">Transparent profiles</p><p className="mt-1 text-xs leading-relaxed text-ink/55">See experience, expertise and verification status before you book.</p></div>
            </div>
            <div className="flex gap-3 rounded-sm bg-paper p-4">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-board" />
              <div><p className="text-sm font-semibold">Published feedback</p><p className="mt-1 text-xs leading-relaxed text-ink/55">Reviews come from completed conversations on AglaKadam.</p></div>
            </div>
            <div className="flex gap-3 rounded-sm bg-paper p-4">
              <CalendarDays size={18} className="mt-0.5 shrink-0 text-board" />
              <div><p className="text-sm font-semibold">One focused call</p><p className="mt-1 text-xs leading-relaxed text-ink/55">A simple 30-minute conversation around your actual question.</p></div>
            </div>
          </div>

          <Link href="/mentors" className="mt-8 inline-flex items-center gap-1 text-sm font-semibold text-board sm:hidden">View all mentors <ArrowRight size={15} /></Link>
        </div>
      </section>
      <ArticlesSection />
    </>
  );
}
