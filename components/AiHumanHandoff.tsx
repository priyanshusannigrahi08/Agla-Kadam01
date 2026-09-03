"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, Sparkles, UserRound } from "lucide-react";
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
type Match = { id: string; score: number; reason: string };

export default function AiHumanHandoff({ context }: { context: string }) {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("mentors_public")
        .select("id,name,headline,bio,expertise,experience,company,role,location,calendly,calendly_url,photo_url,verification_status")
        .limit(50);
      if (active) {
        if (error) console.error("Mentor handoff load error:", error);
        setMentors((data || []) as Mentor[]);
        setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, []);

  const mentorMap = useMemo(() => new Map(mentors.map((mentor) => [mentor.id, mentor])), [mentors]);

  useEffect(() => {
    let active = true;
    async function match() {
      if (!context.trim() || mentors.length === 0) { setMatches([]); setMatching(false); return; }
      setMatching(true);
      try {
        const response = await fetch("/api/ai-mentor/match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ context: context.slice(0, 6000), mentors }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data?.error || "Matching failed");
        const next = Array.isArray(data?.matches) ? data.matches.filter((item: unknown): item is Match => Boolean(item && typeof item === "object" && typeof (item as Match).id === "string" && Number.isFinite(Number((item as Match).score)) && typeof (item as Match).reason === "string")) : [];
        if (active) setMatches(next.slice(0, 3));
      } catch (error) {
        console.error("AI mentor matching error:", error);
        if (active) setMatches([]);
      } finally {
        if (active) setMatching(false);
      }
    }
    void match();
    return () => { active = false; };
  }, [context, mentors]);

  const recommendations = matches.map((match) => ({ ...match, mentor: mentorMap.get(match.id) })).filter((item): item is Match & { mentor: Mentor } => Boolean(item.mentor));
  if (loading || matching || !context.trim() || recommendations.length === 0) return null;

  return (
    <div className="mx-auto w-full max-w-4xl px-1 pb-2">
      <div className="rounded-md border border-board/15 bg-board/[0.035] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber/70"><Sparkles size={17} /></div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-board/60">AI-powered match</p>
            <h3 className="mt-1 font-display text-xl">Someone who may actually fit your situation</h3>
            <p className="mt-1 text-sm leading-6 text-ink/60">These recommendations use what you shared with your AI mentor and the experience in each mentor's profile.</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {recommendations.map(({ mentor, score, reason }) => {
            const booking = mentor.calendly || mentor.calendly_url;
            return (
              <article key={mentor.id} className="rounded-sm border border-ink/10 bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 overflow-hidden rounded-full bg-board/10">
                    {mentor.photo_url ? <img src={mentor.photo_url} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full w-full items-center justify-center font-display">{mentor.name?.charAt(0) || "M"}</span>}
                  </div>
                  <div className="min-w-0"><h4 className="truncate text-sm font-semibold">{mentor.name}</h4><p className="truncate text-[11px] text-ink/45">{mentor.role || mentor.headline || "Mentor"}</p></div>
                </div>
                <div className="mt-3"><span className="rounded-full bg-board/10 px-2 py-1 font-mono text-[9px] uppercase tracking-wide text-board">{score}% match</span></div>
                <p className="mt-3 line-clamp-3 text-xs leading-5 text-ink/60">{reason}</p>
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
