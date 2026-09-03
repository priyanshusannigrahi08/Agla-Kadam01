"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

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
  calendly?: string;
  calendly_url?: string;
  photo_url?: string;
  verification_status?: string;
};

function years(text = "") {
  const match = text.match(/(\d+)\s*\+?\s*year/i);
  return match ? Number(match[1]) : 0;
}

function scoreMentor(mentor: Mentor, context: string) {
  const words = context.toLowerCase().split(/[^a-z0-9+#]+/).filter((word) => word.length > 2);
  const haystack = [mentor.name, mentor.headline, mentor.bio, mentor.expertise, mentor.experience, mentor.company, mentor.role].filter(Boolean).join(" ").toLowerCase();
  const hits = words.reduce((score, word) => score + (haystack.includes(word) ? 1 : 0), 0);
  return hits * 10 + Math.min(years(mentor.experience), 15);
}

export default function AiHumanHandoff({ context }: { context: string }) {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      const { data } = await supabase
        .from("mentors_public")
        .select("id,name,headline,bio,expertise,experience,company,role,location,calendly,calendly_url,photo_url,verification_status")
        .limit(50);
      if (active) setMentors((data || []) as Mentor[]);
      if (active) setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, []);

  const recommendations = useMemo(() => {
    if (!context.trim()) return [];
    return [...mentors]
      .map((mentor) => ({ mentor, score: scoreMentor(mentor, context) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ mentor, score }) => ({ mentor, match: Math.min(98, 72 + score) }));
  }, [mentors, context]);

  if (loading || !context.trim() || recommendations.length === 0) return null;

  return (
    <div className="mx-auto w-full max-w-4xl px-1 pb-2">
      <div className="rounded-md border border-board/15 bg-board/[0.035] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber/70"><UserRound size={17} /></div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-board/60">A useful next step</p>
            <h3 className="mt-1 font-display text-xl">Ready for advice from someone who has done it?</h3>
            <p className="mt-1 text-sm leading-6 text-ink/60">Your AI conversation can help you get oriented. A human mentor can add lived experience and answer questions specific to your situation.</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {recommendations.map(({ mentor, match }) => {
            const booking = mentor.calendly || mentor.calendly_url;
            return (
              <article key={mentor.id} className="rounded-sm border border-ink/10 bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 overflow-hidden rounded-full bg-board/10">
                    {mentor.photo_url ? <img src={mentor.photo_url} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full w-full items-center justify-center font-display">{mentor.name?.charAt(0) || "M"}</span>}
                  </div>
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-semibold">{mentor.name}</h4>
                    <p className="truncate text-[11px] text-ink/45">{mentor.role || mentor.headline || "Mentor"}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="rounded-full bg-board/10 px-2 py-1 font-mono text-[9px] uppercase tracking-wide text-board">{match}% match</span>
                  {years(mentor.experience) > 0 && <span className="text-[10px] text-ink/40">{years(mentor.experience)}+ yrs</span>}
                </div>
                <p className="mt-3 line-clamp-2 text-xs leading-5 text-ink/55">{mentor.headline || mentor.bio || "Explore their experience and see whether they are a fit."}</p>
                <div className="mt-4 flex gap-2">
                  <Link href={`/mentors/${mentor.id}`} className="flex-1 rounded-sm border border-ink/12 px-3 py-2 text-center text-[11px] font-semibold hover:bg-paper">View profile</Link>
                  {booking ? <Link href={`/book/${mentor.id}`} className="inline-flex items-center justify-center rounded-sm bg-amber px-3 py-2" aria-label={`Book a call with ${mentor.name}`}><CalendarDays size={13} /></Link> : <Link href={`/mentors/${mentor.id}`} className="inline-flex items-center justify-center rounded-sm bg-amber px-3 py-2" aria-label={`View ${mentor.name}`}><ArrowRight size={13} /></Link>}
                </div>
              </article>
            );
          })}
        </div>
        <div className="mt-4 flex justify-end"><Link href={`/mentors?q=${encodeURIComponent(context.slice(0, 80))}`} className="inline-flex items-center gap-1 text-xs font-semibold text-board hover:underline">Browse all human mentors <ArrowRight size={13} /></Link></div>
      </div>
    </div>
  );
}
