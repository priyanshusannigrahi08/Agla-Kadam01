"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Mentor = {
  id: string;
  name: string;
  linkedin: string;
  calendly: string;
  expertise: string;
  experience: string | null;
  journey: string | null;
  why_mentor: string | null;
};

function MentorDirectoryContent() {
  const searchParams = useSearchParams();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    async function loadMentors() {
      const { data, error: fetchError } = await supabase
        .from("mentors_public")
        .select("id, name, linkedin, calendly, expertise, experience, journey, why_mentor")
        .order("name", { ascending: true });

      if (fetchError) {
        setError("Couldn't load mentors right now. Try refreshing.");
      } else {
        setMentors(data ?? []);
      }
      setLoading(false);
    }

    loadMentors();
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return mentors;
    const q = query.toLowerCase();
    return mentors.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.expertise.toLowerCase().includes(q) ||
        (m.experience ?? "").toLowerCase().includes(q)
    );
  }, [mentors, query]);

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
        <Link href="/" className="font-mono text-xs uppercase tracking-[0.15em] text-board/60 hover:text-board">
          ← Back to AglaKadam
        </Link>

        <h1 className="font-display text-3xl sm:text-4xl mt-6 mb-2">Browse mentors</h1>
        <p className="text-ink/70 mb-8 max-w-lg">
          Search by name or what someone knows. Book directly, no form, no
          waiting on a match.
        </p>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search e.g. product management or switched careers"
          className="input mb-10 max-w-xl"
          aria-label="Search mentors"
        />

        {loading && <p className="font-mono text-sm text-ink/50">Loading mentors...</p>}

        {error && <p className="text-sm text-red-700">{error}</p>}

        {!loading && !error && filtered.length === 0 && (
          <div className="bg-white rounded-sm border border-ink/10 p-8 pin-shadow max-w-xl">
            <p className="font-body text-ink/70">
              {mentors.length === 0
                ? "No mentors listed yet, check back soon, or "
                : "No mentors match that search, try a different term, or "}
              <Link href="/mentee" className="underline text-board hover:text-board/70">
                submit your situation instead
              </Link>{" "}
              and we will match you directly.
            </p>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-6">
          {filtered.map((mentor) => (
            <MentorCard key={mentor.id} mentor={mentor} />
          ))}
        </div>
      </div>
    </main>
  );
}

export default function MentorDirectory() {
  return (
    <Suspense fallback={null}>
      <MentorDirectoryContent />
    </Suspense>
  );
}

function MentorCard({ mentor }: { mentor: Mentor }) {
  const bio = mentor.why_mentor || mentor.journey || mentor.experience;

  return (
    <div className="bg-white rounded-sm border border-ink/10 p-6 pin-shadow flex flex-col">
      <h2 className="font-display text-xl mb-1">{mentor.name}</h2>
      <p className="font-body text-sm text-ink/70 leading-relaxed mb-2 flex-1">
        {mentor.expertise}
      </p>
      {bio && (
        <p className="font-body text-xs text-ink/50 leading-relaxed mb-4 italic">
          {bio}
        </p>
      )}
      <div className="flex flex-wrap gap-3 mt-auto">
        
          href={mentor.calendly}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-sm bg-amber text-ink font-body font-semibold text-sm px-5 py-2.5 hover:brightness-95 transition"
        >
          Book a call
        </a>
        
          href={mentor.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-sm border border-ink/20 text-ink font-body text-sm px-5 py-2.5 hover:bg-ink/5 transition"
        >
          LinkedIn
        </a>
      </div>
    </div>
  );
}
