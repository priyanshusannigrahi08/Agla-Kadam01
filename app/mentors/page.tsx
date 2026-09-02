"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { ArrowRight, Search, SlidersHorizontal, Star, X } from "lucide-react";
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
  calendly?: string;
  photo_url?: string;
  created_at?: string;
};

type Rating = { mentor_id: string; rating: number };

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function MentorsPage() {
  const params = useSearchParams();
  const initialQuery = params.get("q") || "";
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialQuery);
  const [field, setField] = useState("all");
  const [experienceFilter, setExperienceFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [mobileFilters, setMobileFilters] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setSearch(initialQuery), [initialQuery]);

  useEffect(() => {
    async function loadMentors() {
      try {
        const { data: mentorData, error: mentorError } = await supabase.from("mentors").select("*").order("created_at", { ascending: false });
        if (mentorError) throw mentorError;
        const { data: ratingData, error: ratingError } = await supabase.from("mentor_ratings").select("mentor_id, rating");
        if (ratingError) console.error("Could not load ratings:", ratingError);
        setMentors((mentorData || []) as Mentor[]);
        setRatings((ratingData || []) as Rating[]);
      } catch (err) {
        console.error(err);
        setError("We couldn't load the mentors right now. Please refresh and try again.");
      } finally { setLoading(false); }
    }
    loadMentors();
  }, []);

  const ratingMap = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    ratings.forEach(({ mentor_id, rating }) => {
      if (!map[mentor_id]) map[mentor_id] = { total: 0, count: 0 };
      map[mentor_id].total += Number(rating);
      map[mentor_id].count += 1;
    });
    return map;
  }, [ratings]);

  const fields = useMemo(() => {
    const values = mentors.flatMap((mentor) => (mentor.expertise || "").split(",").map((x) => x.trim()).filter(Boolean));
    return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
  }, [mentors]);

  const query = search.trim().toLowerCase();

  const filteredVirtualMentors = useMemo(() => {
    if (!query) return virtualMentors;
    return virtualMentors.filter((mentor) => [mentor.name, mentor.profession, mentor.bio, ...mentor.expertise].join(" ").toLowerCase().includes(query));
  }, [query]);

  const filteredHumanMentors = useMemo(() => {
    const result = mentors.filter((mentor) => {
      const haystack = [mentor.name, mentor.headline, mentor.bio, mentor.expertise, mentor.experience, mentor.company, mentor.role, mentor.location].filter(Boolean).join(" ").toLowerCase();
      const matchesSearch = !query || haystack.includes(query);
      const expertise = (mentor.expertise || "").split(",").map((x) => x.trim().toLowerCase());
      const matchesField = field === "all" || expertise.includes(field.toLowerCase());
      const experience = (mentor.experience || "").toLowerCase();
      const matchesExperience = experienceFilter === "all" || (experienceFilter === "early" && /0|1|2|3|4|5\s*year/.test(experience)) || (experienceFilter === "mid" && /[6-9]|10\s*year/.test(experience)) || (experienceFilter === "senior" && /(1[1-9]|[2-9][0-9])\s*year|senior|lead|director|head|founder/.test(experience));
      return matchesSearch && matchesField && matchesExperience;
    });
    return result.sort((a, b) => {
      if (sort === "rating") return (ratingMap[b.id]?.total / (ratingMap[b.id]?.count || 1) || 0) - (ratingMap[a.id]?.total / (ratingMap[a.id]?.count || 1) || 0);
      if (sort === "experience") return Number.parseInt(b.experience || "0") - Number.parseInt(a.experience || "0");
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  }, [mentors, query, field, experienceFilter, sort, ratingMap]);

  const activeFilters = field !== "all" || experienceFilter !== "all";
  const clearFilters = () => { setField("all"); setExperienceFilter("all"); setSort("newest"); };

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-20">
        <Link href="/" className="font-mono text-xs uppercase tracking-[0.15em] text-board/60 hover:text-board">← Back to AglaKadam</Link>

        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-board/60">Mentor marketplace</p>
            <h1 className="mt-2 font-display text-3xl sm:text-4xl">Find someone for your next step.</h1>
            <p className="mt-3 max-w-2xl text-ink/65">Search by profession, expertise, experience, company or the kind of problem you want to think through.</p>
          </div>
          <Link href="/mentor" className="inline-flex w-fit items-center gap-2 rounded-sm border border-ink/20 px-4 py-2.5 text-sm font-semibold hover:bg-ink/5">Become a mentor <ArrowRight size={15} /></Link>
        </div>

        <div className="relative mt-8 max-w-3xl">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/35" />
          <input type="text" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search mentors, fields, skills or problems..." className="input pl-11 pr-10" aria-label="Search mentors" />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink/40 hover:bg-ink/5 hover:text-ink" aria-label="Clear search"><X size={16} /></button>}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 border-b border-ink/10 pb-6">
          <button onClick={() => setMobileFilters(!mobileFilters)} className="inline-flex items-center gap-2 rounded-sm border border-ink/20 px-4 py-2.5 text-sm font-semibold hover:bg-ink/5 sm:hidden"><SlidersHorizontal size={15} /> Filters {activeFilters && <span className="rounded-full bg-amber px-2 py-0.5 text-xs">Active</span>}</button>
          <div className={`${mobileFilters ? "flex" : "hidden"} w-full flex-col gap-3 sm:flex sm:w-auto sm:flex-row`}>
            <label className="flex items-center gap-2 text-sm"><span className="text-ink/55">Field</span><select value={field} onChange={(e) => setField(e.target.value)} className="rounded-sm border border-ink/15 bg-white px-3 py-2"><option value="all">All fields</option>{fields.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
            <label className="flex items-center gap-2 text-sm"><span className="text-ink/55">Experience</span><select value={experienceFilter} onChange={(e) => setExperienceFilter(e.target.value)} className="rounded-sm border border-ink/15 bg-white px-3 py-2"><option value="all">Any level</option><option value="early">0–5 years</option><option value="mid">6–10 years</option><option value="senior">11+ years / senior</option></select></label>
          </div>
          <label className="ml-auto flex items-center gap-2 text-sm"><span className="text-ink/55">Sort</span><select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-sm border border-ink/15 bg-white px-3 py-2"><option value="newest">Newest</option><option value="rating">Highest rated</option><option value="experience">Most experienced</option></select></label>
          {activeFilters && <button onClick={clearFilters} className="text-sm font-semibold text-board hover:underline">Clear filters</button>}
        </div>

        {query && <div className="mt-4 text-xs text-ink/50">Showing results for <span className="font-semibold text-board">{search}</span></div>}

        {filteredVirtualMentors.length > 0 && (
          <section className="mt-12 mb-16">
            <div className="mb-7"><p className="font-mono text-xs uppercase tracking-[0.15em] text-board/60">INSTANT GUIDANCE</p><h2 className="mt-3 font-display text-2xl sm:text-3xl">Start with an AI mentor</h2><p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/60">Get immediate guidance while you decide what kind of human experience would be most useful.</p></div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{filteredVirtualMentors.slice(0, 6).map((mentor) => <article key={mentor.id} className="pin-shadow flex flex-col rounded-sm border border-ink/10 bg-white p-6"><div className="flex items-center gap-4"><img src={mentor.image} alt={`${mentor.name} profile`} className="h-16 w-16 shrink-0 rounded-full border border-ink/10 object-cover" /><div className="min-w-0"><h3 className="truncate font-display text-xl">{mentor.name}</h3><p className="truncate text-xs text-ink/50">{mentor.profession}</p></div></div><div className="mt-5 flex flex-wrap gap-2">{mentor.expertise.slice(0, 3).map((skill) => <span key={skill} className="rounded-full bg-board/10 px-3 py-1 text-xs text-board">{skill}</span>)}</div><p className="mt-4 flex-1 text-sm leading-relaxed text-ink/70">{mentor.bio}</p><Link href={`/ai-mentor/${mentor.id}`} className="mt-6 inline-flex w-fit items-center justify-center rounded-sm bg-amber px-5 py-2.5 text-sm font-semibold">Start a conversation →</Link></article>)}</div>
          </section>
        )}

        <section>
          <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono text-xs uppercase tracking-[0.15em] text-board/60">HUMAN MENTORS</p><h2 className="mt-3 font-display text-2xl sm:text-3xl">Learn from real experiences</h2></div><p className="text-sm text-ink/50">{loading ? "Loading…" : `${filteredHumanMentors.length} ${filteredHumanMentors.length === 1 ? "mentor" : "mentors"}`}</p></div>
          <p className="mb-8 max-w-2xl text-sm leading-relaxed text-ink/60">Compare people by experience and expertise, then open a profile before you decide to book.</p>

          {loading && <p className="font-mono text-sm text-ink/50">Loading mentors…</p>}
          {!loading && error && <p className="text-sm text-red-700">{error}</p>}
          {!loading && !error && filteredHumanMentors.length === 0 && <div className="rounded-sm border border-ink/10 bg-white p-8"><p className="font-display text-xl">No mentors match your search.</p><p className="mt-2 text-sm text-ink/60">Try a broader field or remove a filter.</p><button onClick={() => { setSearch(""); clearFilters(); }} className="mt-5 rounded-sm bg-amber px-5 py-2.5 text-sm font-semibold">Show all mentors</button></div>}

          <div className="grid gap-5 sm:grid-cols-2">{!loading && !error && filteredHumanMentors.map((mentor) => { const rating = ratingMap[mentor.id]; const average = rating ? (rating.total / rating.count).toFixed(1) : null; const initial = mentor.name?.trim().charAt(0).toUpperCase() || "M"; const tags = mentor.expertise ? mentor.expertise.split(",").map((x) => x.trim()).filter(Boolean).slice(0, 4) : []; return <article key={mentor.id} className="pin-shadow flex flex-col rounded-sm border border-ink/10 bg-white p-5 sm:p-6 transition-transform hover:-translate-y-0.5"><div className="flex items-start gap-4">{mentor.photo_url ? <img src={mentor.photo_url} alt={`${mentor.name}'s profile`} className="h-20 w-20 shrink-0 rounded-full border border-ink/10 object-cover" /> : <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-board/10 bg-board/10 font-display text-3xl text-board">{initial}</div>}<div className="min-w-0 flex-1"><h2 className="truncate font-display text-xl">{mentor.name}</h2><p className="mt-1 text-sm text-ink/55">{mentor.headline || mentor.role || mentor.experience || "Mentor"}</p>{average && <p className="mt-2 inline-flex items-center gap-1 text-xs text-ink/60"><Star size={13} className="fill-amber text-amber" /> {average} ({rating.count} {rating.count === 1 ? "review" : "reviews"})</p>}</div></div>{tags.length > 0 && <div className="mt-5 flex flex-wrap gap-2">{tags.map((tag) => <span key={tag} className="rounded-full bg-board/10 px-3 py-1 text-xs text-board">{tag}</span>)}</div>}<p className="mt-4 flex-1 text-sm leading-relaxed text-ink/70">{mentor.bio || "Experience and guidance for your next step."}</p><div className="mt-6 flex flex-wrap gap-3"><Link href={`/mentors/${mentor.id}`} className="inline-flex flex-1 items-center justify-center rounded-sm bg-amber px-4 py-2.5 text-sm font-semibold sm:flex-none">View profile</Link>{mentor.calendly && <a href={mentor.calendly} target="_blank" rel="noopener noreferrer" className="inline-flex flex-1 items-center justify-center rounded-sm border border-ink/20 px-4 py-2.5 text-sm hover:bg-ink/5 sm:flex-none">Book a call</a>}</div></article>; })}</div>
        </section>
      </div>
    </main>
  );
}
