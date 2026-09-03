"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { ArrowRight, CheckCircle2, Search, ShieldCheck, SlidersHorizontal, Star, Users, X } from "lucide-react";
import { virtualMentors } from "@/app/data/virtualMentors";

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
  linkedin_url?: string;
  calendly?: string;
  calendly_url?: string;
  photo_url?: string;
  created_at?: string;
  verification_status?: string;
};

type Review = { mentor_id: string; rating: number };

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function years(text: string) {
  const match = text.match(/(\d+)\s*\+?\s*year/i);
  return match ? Number(match[1]) : 0;
}

function MentorsPage() {
  const params = useSearchParams();
  const initialQuery = params.get("q") || "";
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialQuery);
  const [field, setField] = useState("all");
  const [experienceFilter, setExperienceFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [mobileFilters, setMobileFilters] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setSearch(initialQuery), [initialQuery]);

  useEffect(() => {
    async function load() {
      try {
        const [{ data: mentorData, error: mentorError }, { data: reviewData, error: reviewError }] = await Promise.all([
          supabase.from("mentors_public").select("*").order("created_at", { ascending: false }),
          supabase.from("reviews").select("mentor_id,rating").eq("status", "published"),
        ]);
        if (mentorError) throw mentorError;
        if (reviewError) throw reviewError;
        setMentors((mentorData || []) as Mentor[]);
        setReviews((reviewData || []) as Review[]);
      } catch (err) {
        console.error(err);
        setError("We couldn't load the mentors right now. Please refresh and try again.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const ratingMap = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    reviews.forEach((review) => {
      if (!map[review.mentor_id]) map[review.mentor_id] = { total: 0, count: 0 };
      map[review.mentor_id].total += Number(review.rating);
      map[review.mentor_id].count += 1;
    });
    return map;
  }, [reviews]);

  const fields = useMemo(
    () => Array.from(new Set(mentors.flatMap((mentor) => (mentor.expertise || "").split(",").map((item) => item.trim()).filter(Boolean)))).sort((a, b) => a.localeCompare(b)),
    [mentors]
  );

  const query = search.trim().toLowerCase();

  const filteredVirtualMentors = useMemo(
    () => !query ? virtualMentors : virtualMentors.filter((mentor) => [mentor.name, mentor.profession, mentor.bio, ...mentor.expertise].join(" ").toLowerCase().includes(query)),
    [query]
  );

  const filteredHumanMentors = useMemo(() => {
    const result = mentors.filter((mentor) => {
      const haystack = [mentor.name, mentor.headline, mentor.bio, mentor.expertise, mentor.experience, mentor.company, mentor.role, mentor.location].filter(Boolean).join(" ").toLowerCase();
      const exp = years(mentor.experience || "");
      const matchesExperience =
        experienceFilter === "all" ||
        (experienceFilter === "early" && exp <= 5 && exp > 0) ||
        (experienceFilter === "mid" && exp >= 6 && exp <= 10) ||
        (experienceFilter === "senior" && (exp >= 11 || /(senior|lead|director|head|founder)/i.test(mentor.experience || "")));
      const matchesField = field === "all" || (mentor.expertise || "").split(",").map((item) => item.trim().toLowerCase()).includes(field.toLowerCase());
      return (!query || haystack.includes(query)) && matchesField && matchesExperience;
    });

    return result.sort((a, b) => {
      if (sort === "rating") {
        return (ratingMap[b.id]?.total / (ratingMap[b.id]?.count || 1) || 0) - (ratingMap[a.id]?.total / (ratingMap[a.id]?.count || 1) || 0);
      }
      if (sort === "experience") return years(b.experience || "") - years(a.experience || "");
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  }, [mentors, query, field, experienceFilter, sort, ratingMap]);

  const activeFilters = field !== "all" || experienceFilter !== "all";
  const clearFilters = () => {
    setField("all");
    setExperienceFilter("all");
    setSort("newest");
  };

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="border-b border-ink/10 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Link href="/" className="font-mono text-xs uppercase tracking-[0.15em] text-board/60 hover:text-board">← AglaKadam</Link>
              <p className="mt-7 font-mono text-xs uppercase tracking-[0.18em] text-board/60">Mentor marketplace</p>
              <h1 className="mt-2 max-w-3xl font-display text-4xl leading-tight sm:text-5xl">Find someone who has been where you want to go.</h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-ink/60 sm:text-base">Search real people by field, experience and expertise. Read their profile, check published reviews, then book a focused conversation.</p>
            </div>
            <div className="flex shrink-0 gap-3">
              <Link href="/find-mentor" className="inline-flex items-center justify-center gap-2 rounded-sm bg-amber px-5 py-3 text-sm font-semibold">Help me find one <ArrowRight size={15} /></Link>
              <Link href="/mentor" className="hidden items-center justify-center rounded-sm border border-ink/15 px-5 py-3 text-sm font-semibold hover:bg-ink/5 sm:inline-flex">Become a mentor</Link>
            </div>
          </div>

          <div className="mt-8 flex max-w-4xl items-center rounded-sm border border-ink/15 bg-paper p-1 shadow-sm">
            <Search size={19} className="ml-3 shrink-0 text-ink/35" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by role, field, skill, company or problem..." className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm outline-none placeholder:text-ink/35 sm:text-base" aria-label="Search mentors" />
            {search && <button type="button" onClick={() => setSearch("")} className="mr-1 rounded-full p-2 text-ink/40 hover:bg-ink/5" aria-label="Clear search"><X size={16} /></button>}
            <button type="button" onClick={() => setMobileFilters(true)} className="mr-1 hidden rounded-sm bg-white px-4 py-2.5 text-sm font-semibold shadow-sm sm:block">Browse filters</button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-4 border-b border-ink/10 py-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setMobileFilters(!mobileFilters)} className="inline-flex items-center gap-2 rounded-sm border border-ink/20 bg-white px-4 py-2.5 text-sm font-semibold sm:hidden"><SlidersHorizontal size={15} /> Filters {activeFilters && <span className="rounded-full bg-amber px-2 py-0.5 text-xs">On</span>}</button>
            <span className="hidden text-sm text-ink/50 sm:inline">Refine your search</span>
          </div>
          <div className={`${mobileFilters ? "flex" : "hidden"} w-full flex-col gap-3 sm:flex sm:w-auto sm:flex-row`}>
            <label className="flex items-center gap-2 text-sm"><span className="text-ink/50">Field</span><select value={field} onChange={(event) => setField(event.target.value)} className="rounded-sm border border-ink/15 bg-white px-3 py-2.5"><option value="all">All fields</option>{fields.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
            <label className="flex items-center gap-2 text-sm"><span className="text-ink/50">Experience</span><select value={experienceFilter} onChange={(event) => setExperienceFilter(event.target.value)} className="rounded-sm border border-ink/15 bg-white px-3 py-2.5"><option value="all">Any level</option><option value="early">0–5 years</option><option value="mid">6–10 years</option><option value="senior">11+ years / senior</option></select></label>
          </div>
          <label className="ml-auto flex items-center gap-2 text-sm"><span className="text-ink/50">Sort</span><select value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-sm border border-ink/15 bg-white px-3 py-2.5"><option value="newest">Newest</option><option value="rating">Highest rated</option><option value="experience">Most experienced</option></select></label>
          {activeFilters && <button type="button" onClick={clearFilters} className="text-sm font-semibold text-board hover:underline">Clear filters</button>}
        </div>
      </div>

      {query && <div className="mx-auto max-w-7xl px-4 pt-6 text-sm text-ink/55 sm:px-6">Results for <span className="font-semibold text-ink">“{search.trim()}”</span></div>}

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        {filteredVirtualMentors.length > 0 && (
          <div className="mb-14">
            <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-board/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-board"><span className="h-1.5 w-1.5 rounded-full bg-board" /> Instant guidance</div>
                <h2 className="mt-4 font-display text-2xl sm:text-3xl">Need a starting point?</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/60">Talk to an AI mentor now, then move to a human mentor when you know what experience you need.</p>
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredVirtualMentors.slice(0, 6).map((mentor) => (
                <article key={mentor.id} className="flex flex-col rounded-sm border border-board/15 bg-board/[0.035] p-6">
                  <div className="flex items-center gap-4"><img src={mentor.image} alt={`${mentor.name} profile`} className="h-16 w-16 rounded-full border border-ink/10 object-cover" /><div><h3 className="font-display text-xl">{mentor.name}</h3><p className="text-xs text-ink/50">{mentor.profession}</p></div></div>
                  <div className="mt-5 flex flex-wrap gap-2">{mentor.expertise.slice(0, 3).map((item) => <span key={item} className="rounded-full bg-white px-3 py-1 text-xs text-board">{item}</span>)}</div>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-ink/65">{mentor.bio}</p>
                  <Link href={`/ai-mentor/${mentor.id}`} className="mt-6 inline-flex items-center justify-center rounded-sm border border-board/20 bg-white px-5 py-2.5 text-sm font-semibold text-board hover:bg-board/5">Start a conversation <ArrowRight size={14} className="ml-2" /></Link>
                </article>
              ))}
            </div>
          </div>
        )}

        <div className="mb-7 flex flex-col gap-3 border-b border-ink/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div><div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-board/60"><Users size={13} /> Human mentors</div><h2 className="mt-3 font-display text-2xl sm:text-3xl">People worth learning from</h2></div>
          <p className="text-sm text-ink/50">{loading ? "Loading…" : `${filteredHumanMentors.length} ${filteredHumanMentors.length === 1 ? "mentor" : "mentors"}`}</p>
        </div>

        {loading && <div className="grid gap-5 sm:grid-cols-2">{[1, 2, 3, 4].map((item) => <div key={item} className="h-72 animate-pulse rounded-sm border border-ink/10 bg-white" />)}</div>}
        {!loading && error && <div className="rounded-sm border border-red-200 bg-white p-8 text-sm text-red-700">{error}</div>}
        {!loading && !error && filteredHumanMentors.length === 0 && (
          <div className="rounded-sm border border-dashed border-ink/15 bg-white p-10 text-center"><p className="font-display text-xl">No mentors match that search.</p><p className="mt-2 text-sm text-ink/55">Try a broader search or remove a filter.</p><button type="button" onClick={() => { setSearch(""); clearFilters(); }} className="mt-5 rounded-sm bg-amber px-5 py-2.5 text-sm font-semibold">Show all mentors</button></div>
        )}
        {!loading && !error && filteredHumanMentors.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2">
            {filteredHumanMentors.map((mentor) => {
              const rating = ratingMap[mentor.id];
              const average = rating ? (rating.total / rating.count).toFixed(1) : null;
              const initial = mentor.name?.trim().charAt(0).toUpperCase() || "M";
              const tags = (mentor.expertise || "").split(",").map((item) => item.trim()).filter(Boolean).slice(0, 4);
              const booking = mentor.calendly || mentor.calendly_url;
              return (
                <article key={mentor.id} className="group flex flex-col rounded-sm border border-ink/10 bg-white p-6 shadow-[0_10px_30px_-24px_rgba(23,34,28,0.8)] transition duration-200 hover:-translate-y-1 hover:border-ink/20 hover:shadow-[0_18px_36px_-24px_rgba(23,34,28,0.55)]">
                  <div className="flex items-start gap-4">
                    <Link href={`/mentors/${mentor.id}`} className="shrink-0" aria-label={`View ${mentor.name}'s profile`}>
                      {mentor.photo_url ? <img src={mentor.photo_url} alt={`${mentor.name}'s profile`} className="h-20 w-20 rounded-full border border-ink/10 object-cover" /> : <div className="flex h-20 w-20 items-center justify-center rounded-full bg-board/10 font-display text-3xl text-board">{initial}</div>}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2"><Link href={`/mentors/${mentor.id}`} className="font-display text-xl hover:underline">{mentor.name}</Link>{mentor.verification_status === "verified" && <span className="inline-flex items-center gap-1 rounded-full bg-board/10 px-2 py-1 text-[10px] font-mono uppercase tracking-wide text-board"><ShieldCheck size={12} /> Verified</span>}</div>
                      <p className="mt-1 text-sm leading-5 text-ink/55">{mentor.headline || mentor.role || "Mentor"}</p>
                      {mentor.company && <p className="mt-1 text-xs font-medium text-ink/45">{mentor.company}</p>}
                      {average && <p className="mt-2 inline-flex items-center gap-1 text-xs text-ink/65"><Star size={13} className="fill-amber text-amber" /> <strong>{average}</strong> <span>({rating.count} {rating.count === 1 ? "review" : "reviews"})</span></p>}
                    </div>
                  </div>
                  {tags.length > 0 && <div className="mt-5 flex flex-wrap gap-2">{tags.map((tag) => <span key={tag} className="rounded-full bg-board/7 px-3 py-1 text-xs text-board">{tag}</span>)}</div>}
                  <div className="mt-5 grid grid-cols-2 gap-3 rounded-sm bg-paper p-3 text-xs"><div><p className="text-ink/40">Experience</p><p className="mt-1 font-medium text-ink/75">{mentor.experience || "Not listed"}</p></div><div><p className="text-ink/40">Location</p><p className="mt-1 truncate font-medium text-ink/75">{mentor.location || "Open to connect"}</p></div></div>
                  <p className="mt-4 line-clamp-3 flex-1 text-sm leading-relaxed text-ink/65">{mentor.bio || "Experience and practical guidance for your next step."}</p>
                  <div className="mt-6 flex flex-col gap-2 sm:flex-row"><Link href={`/mentors/${mentor.id}`} className="inline-flex flex-1 items-center justify-center rounded-sm bg-amber px-4 py-2.5 text-sm font-semibold">View profile</Link>{booking && <Link href={`/book/${mentor.id}`} className="inline-flex flex-1 items-center justify-center rounded-sm border border-ink/15 px-4 py-2.5 text-sm font-semibold hover:bg-ink/5">Book a call</Link>}</div>
                  <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-ink/40"><CheckCircle2 size={13} /> Review profiles before booking</p>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default function MentorsPageWithSuspense() {
  return <MentorsPage />;
}
