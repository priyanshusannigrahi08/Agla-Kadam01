"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
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
};

type Rating = {
  mentor_id: string;
  rating: number;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMentors() {
      try {
        const { data: mentorData, error: mentorError } = await supabase
          .from("mentors")
          .select("*")
          .order("created_at", { ascending: false });

        if (mentorError) {
          throw mentorError;
        }

        const { data: ratingData, error: ratingError } = await supabase
          .from("mentor_ratings")
          .select("mentor_id, rating");

        if (ratingError) {
          console.error("Could not load ratings:", ratingError);
        }

        setMentors((mentorData || []) as Mentor[]);
        setRatings((ratingData || []) as Rating[]);
      } catch (err) {
        console.error(err);

        setError(
          "We couldn't load the mentors right now. Please refresh and try again."
        );
      } finally {
        setLoading(false);
      }
    }

    loadMentors();
  }, []);

  const ratingMap = useMemo(() => {
    const map: Record<
      string,
      {
        total: number;
        count: number;
      }
    > = {};

    ratings.forEach(({ mentor_id, rating }) => {
      if (!map[mentor_id]) {
        map[mentor_id] = {
          total: 0,
          count: 0,
        };
      }

      map[mentor_id].total += Number(rating);
      map[mentor_id].count += 1;
    });

    return map;
  }, [ratings]);

  const query = search.trim().toLowerCase();

  const filteredVirtualMentors = useMemo(() => {
    if (!query) {
      return virtualMentors;
    }

    return virtualMentors.filter((mentor) => {
      return [
        mentor.name,
        mentor.profession,
        mentor.bio,
        ...mentor.expertise,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [query]);

  const filteredHumanMentors = useMemo(() => {
    if (!query) {
      return mentors;
    }

    return mentors.filter((mentor) =>
      [
        mentor.name,
        mentor.headline,
        mentor.bio,
        mentor.expertise,
        mentor.experience,
        mentor.company,
        mentor.role,
        mentor.location,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [mentors, query]);

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
        {/* BACK BUTTON */}

        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-[0.15em] text-board/60 hover:text-board"
        >
          ← Back to AglaKadam
        </Link>

        {/* PAGE HEADER */}

        <h1 className="font-display mt-6 mb-2 text-3xl sm:text-4xl">
          Browse mentors
        </h1>

        <p className="mb-8 max-w-lg text-ink/70">
          Find someone who can help you think through your next step, explore
          your options, and move forward with more clarity.
        </p>

        {/* SEARCH */}

        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by profession, skills or expertise..."
          className="input mb-12 max-w-xl"
        />

        {/* =====================================================
            VIRTUAL MENTORS
        ====================================================== */}

        {filteredVirtualMentors.length > 0 && (
          <section className="mb-20">
            <div className="mb-8">
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-board/60">
                INSTANT GUIDANCE
              </p>

              <h2 className="font-display mt-3 text-2xl sm:text-3xl">
                Find guidance for your field
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/60">
                Start a conversation with a specialized mentor and get guidance
                for your career, education, skills, or professional journey.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {filteredVirtualMentors.map((mentor) => (
                <article
                  key={mentor.id}
                  className="pin-shadow flex flex-col rounded-sm border border-ink/10 bg-white p-6"
                >
                  {/* PROFILE */}

                  <div className="mb-5 flex items-center gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-ink/10 bg-paper">
                      <img
                        src={mentor.image}
                        alt={`${mentor.name} profile`}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-display truncate text-xl">
                        {mentor.name}
                      </h3>

                      <p className="font-body truncate text-xs text-ink/50">
                        {mentor.profession}
                      </p>
                    </div>
                  </div>

                  {/* EXPERTISE */}

                  <div className="mb-4 flex flex-wrap gap-2">
                    {mentor.expertise.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-board/10 px-3 py-1 font-body text-xs text-board"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* BIO */}

                  <p className="font-body mb-6 flex-1 text-sm leading-relaxed text-ink/70">
                    {mentor.bio}
                  </p>

                  {/* CTA */}

                  <Link
                    href={`/ai-mentor/${mentor.id}`}
                    className="inline-flex w-fit items-center justify-center rounded-sm bg-amber px-5 py-2.5 font-body text-sm font-semibold text-ink transition hover:brightness-95"
                  >
                    Start a conversation →
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* =====================================================
            HUMAN MENTORS
        ====================================================== */}

        <section>
          <div className="mb-8">
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-board/60">
              HUMAN MENTORS
            </p>

            <h2 className="font-display mt-3 text-2xl sm:text-3xl">
              Learn from real experiences
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/60">
              Connect with people who have already walked a path similar to the
              one you are trying to navigate.
            </p>
          </div>

          {/* LOADING */}

          {loading && (
            <p className="font-mono text-sm text-ink/50">
              Loading mentors…
            </p>
          )}

          {/* ERROR */}

          {!loading && error && (
            <p className="text-sm text-red-700">{error}</p>
          )}

          {/* EMPTY */}

          {!loading &&
            !error &&
            filteredHumanMentors.length === 0 && (
              <div className="pin-shadow max-w-xl rounded-sm border border-ink/10 bg-white p-8">
                <p className="font-body text-ink/70">
                  No human mentors match your search right now.
                </p>
              </div>
            )}

          {/* HUMAN MENTOR GRID */}

          <div className="grid gap-6 sm:grid-cols-2">
            {!loading &&
              !error &&
              filteredHumanMentors.map((mentor) => {
                const rating = ratingMap[mentor.id];

                const average = rating
                  ? (rating.total / rating.count).toFixed(1)
                  : null;

                const initial =
                  mentor.name?.trim().charAt(0).toUpperCase() || "M";

                return (
                  <article
                    key={mentor.id}
                    className="pin-shadow flex flex-col rounded-sm border border-ink/10 bg-white p-6"
                  >
                    {/* PROFILE */}

                    <div className="mb-5 flex items-center gap-4">
                      {mentor.photo_url ? (
                        <img
                          src={mentor.photo_url}
                          alt={`${mentor.name}'s profile`}
                          className="h-16 w-16 shrink-0 rounded-full border border-ink/10 bg-paper object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-board/10 bg-board/10 font-display text-2xl text-board">
                          {initial}
                        </div>
                      )}

                      <div className="min-w-0">
                        <h2 className="font-display mb-1 truncate text-xl">
                          {mentor.name}
                        </h2>

                        {(mentor.headline ||
                          mentor.role ||
                          mentor.experience) && (
                          <p className="font-body truncate text-xs text-ink/50">
                            {mentor.headline ||
                              mentor.role ||
                              mentor.experience}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* RATING */}

                    {average && (
                      <p className="mb-3 text-xs text-ink/60">
                        <span className="mr-1 text-amber">★</span>

                        {average} ({rating.count}{" "}
                        {rating.count === 1 ? "review" : "reviews"})
                      </p>
                    )}

                    {/* BIO */}

                    <p className="font-body mb-4 flex-1 text-sm leading-relaxed text-ink/70">
                      {mentor.bio ||
                        mentor.expertise ||
                        "Experience and guidance for your next step."}
                    </p>

                    {/* EXPERTISE */}

                    {mentor.expertise && mentor.bio && (
                      <p className="font-body mb-4 text-xs text-ink/50">
                        <strong>Expertise:</strong> {mentor.expertise}
                      </p>
                    )}

                    {/* BUTTONS */}

                    <div className="mt-auto flex flex-wrap gap-3">
                      {mentor.calendly && (
                        <a
                          href={mentor.calendly}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-sm bg-amber px-5 py-2.5 font-body text-sm font-semibold text-ink transition hover:brightness-95"
                        >
                          Book a call
                        </a>
                      )}

                      {mentor.linkedin && (
                        <a
                          href={mentor.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-sm border border-ink/20 px-5 py-2.5 font-body text-sm text-ink transition hover:bg-ink/5"
                        >
                          LinkedIn
                        </a>
                      )}

                      <Link
                        href={`/review?mentor=${mentor.id}`}
                        className="inline-flex items-center justify-center rounded-sm border border-ink/20 px-5 py-2.5 font-body text-sm text-ink transition hover:bg-ink/5"
                      >
                        Review
                      </Link>
                    </div>
                  </article>
                );
              })}
          </div>
        </section>
      </div>
    </main>
  );
}
