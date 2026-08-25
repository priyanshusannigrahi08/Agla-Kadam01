"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Mentor = {
  id: string;
  name: string;
  email?: string;
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMentors() {
      try {
        setLoading(true);
        setError("");

        /*
          This expects your mentors table to contain fields similar to:

          id
          name
          email
          headline
          bio
          expertise
          experience
          company
          role
          location
          linkedin
          calendly
          photo_url
        */

        const { data: mentorData, error: mentorError } = await supabase
          .from("mentors")
          .select("*")
          .order("created_at", { ascending: false });

        if (mentorError) {
          console.error("Mentor fetch error:", mentorError);
          throw mentorError;
        }

        const { data: ratingData, error: ratingError } = await supabase
          .from("mentor_ratings")
          .select("mentor_id, rating");

        if (ratingError) {
          console.error("Rating fetch error:", ratingError);
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

  const mentorRatings = useMemo(() => {
    const result: Record<
      string,
      {
        average: number;
        count: number;
      }
    > = {};

    ratings.forEach((item) => {
      if (!result[item.mentor_id]) {
        result[item.mentor_id] = {
          average: 0,
          count: 0,
        };
      }

      result[item.mentor_id].average += Number(item.rating);
      result[item.mentor_id].count += 1;
    });

    Object.keys(result).forEach((mentorId) => {
      result[mentorId].average =
        result[mentorId].average / result[mentorId].count;
    });

    return result;
  }, [ratings]);

  const filteredMentors = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return mentors;
    }

    return mentors.filter((mentor) => {
      const searchableText = [
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
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [mentors, search]);

  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#18181b]">
      {/* HERO */}

      <section className="border-b border-[#e8e5e0]">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-[#71717a] transition hover:text-[#6d5dfc]"
          >
            ← Back to AglaKadam
          </Link>

          <div className="mt-10 max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#6d5dfc]">
              FIND YOUR GUIDE
            </p>

            <h1 className="mt-4 font-display text-5xl leading-tight text-[#1e1b4b] md:text-7xl">
              Find someone who&apos;s been where you&apos;re going.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#71717a]">
              Explore mentors who have real experience and are willing to share
              what they&apos;ve learned.
            </p>
          </div>

          {/* SEARCH */}

          <div className="mt-10 max-w-2xl">
            <label
              htmlFor="mentor-search"
              className="mb-3 block text-xs font-medium uppercase tracking-[0.18em] text-[#71717a]"
            >
              Search mentors
            </label>

            <input
              id="mentor-search"
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Try career, design, engineering, marketing..."
              className="agla-input"
            />
          </div>
        </div>
      </section>

      {/* DIRECTORY */}

      <section className="mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
        {loading && (
          <div className="py-20 text-center">
            <p className="text-lg text-[#71717a]">
              Finding mentors for you...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-5 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && filteredMentors.length === 0 && (
          <div className="rounded-2xl border border-[#e8e5e0] bg-white px-8 py-16 text-center">
            <h2 className="font-display text-3xl text-[#1e1b4b]">
              No mentors found.
            </h2>

            <p className="mx-auto mt-4 max-w-md text-[#71717a]">
              Try searching for a different skill, career, industry or area of
              experience.
            </p>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-6 text-sm font-medium text-[#6d5dfc] hover:text-[#5747e8]"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {!loading && !error && filteredMentors.length > 0 && (
          <>
            <div className="mb-8 flex items-center justify-between gap-4">
              <p className="text-sm text-[#71717a]">
                {filteredMentors.length}{" "}
                {filteredMentors.length === 1 ? "mentor" : "mentors"} found
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredMentors.map((mentor) => {
                const ratingInfo = mentorRatings[mentor.id];

                const averageRating = ratingInfo
                  ? ratingInfo.average.toFixed(1)
                  : null;

                const reviewCount = ratingInfo?.count || 0;

                const reviewLink = `/review?mentor=${mentor.id}`;

                return (
                  <article
                    key={mentor.id}
                    className="flex min-h-[520px] flex-col rounded-2xl border border-[#e8e5e0] bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-[#1e1b4b]/5"
                  >
                    {/* MENTOR HEADER */}

                    <div className="flex items-start gap-4">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-[#eeeafe]">
                        {mentor.photo_url ? (
                          <Image
                            src={mentor.photo_url}
                            alt={mentor.name || "Mentor"}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center font-display text-2xl text-[#6d5dfc]">
                            {mentor.name?.charAt(0)?.toUpperCase() || "M"}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <h2 className="font-display text-2xl leading-tight text-[#1e1b4b]">
                          {mentor.name || "Mentor"}
                        </h2>

                        {mentor.headline && (
                          <p className="mt-1 text-sm leading-6 text-[#71717a]">
                            {mentor.headline}
                          </p>
                        )}

                        {!mentor.headline && mentor.role && (
                          <p className="mt-1 text-sm leading-6 text-[#71717a]">
                            {mentor.role}
                            {mentor.company ? ` · ${mentor.company}` : ""}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* RATING */}

                    <div className="mt-5 flex items-center gap-2">
                      <span className="text-[#6d5dfc]">★</span>

                      {averageRating ? (
                        <>
                          <span className="text-sm font-semibold text-[#18181b]">
                            {averageRating}
                          </span>

                          <span className="text-sm text-[#71717a]">
                            ({reviewCount}{" "}
                            {reviewCount === 1 ? "review" : "reviews"})
                          </span>
                        </>
                      ) : (
                        <span className="text-sm text-[#71717a]">
                          No reviews yet
                        </span>
                      )}
                    </div>

                    {/* DETAILS */}

                    <div className="mt-6 flex flex-1 flex-col">
                      {mentor.bio && (
                        <p className="line-clamp-5 text-sm leading-7 text-[#71717a]">
                          {mentor.bio}
                        </p>
                      )}

                      {!mentor.bio && (
                        <p className="text-sm leading-7 text-[#71717a]">
                          This mentor is building their profile and sharing
                          their experience with the AglaKadam community.
                        </p>
                      )}

                      <div className="mt-6 space-y-3">
                        {mentor.expertise && (
                          <div>
                            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#71717a]">
                              Expertise
                            </p>

                            <p className="mt-1 text-sm text-[#18181b]">
                              {mentor.expertise}
                            </p>
                          </div>
                        )}

                        {mentor.experience && (
                          <div>
                            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#71717a]">
                              Experience
                            </p>

                            <p className="mt-1 text-sm text-[#18181b]">
                              {mentor.experience}
                            </p>
                          </div>
                        )}

                        {mentor.location && (
                          <div>
                            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#71717a]">
                              Location
                            </p>

                            <p className="mt-1 text-sm text-[#18181b]">
                              {mentor.location}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ACTIONS */}

                    <div className="mt-8 flex flex-wrap gap-3">
                      {mentor.calendly && (
                        <a
                          href={mentor.calendly}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-sm bg-[#6d5dfc] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5747e8]"
                        >
                          Book a call
                        </a>
                      )}

                      {mentor.linkedin && (
                        <a
                          href={mentor.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-sm border border-[#e8e5e0] px-5 py-2.5 text-sm font-medium text-[#18181b] transition hover:border-[#6d5dfc] hover:text-[#6d5dfc]"
                        >
                          LinkedIn
                        </a>
                      )}

                      <Link
                        href={reviewLink}
                        className="inline-flex items-center justify-center rounded-sm border border-[#e8e5e0] px-5 py-2.5 text-sm font-medium text-[#18181b] transition hover:border-[#6d5dfc] hover:text-[#6d5dfc]"
                      >
                        Leave a review
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* CTA */}

      <section className="border-t border-[#e8e5e0] bg-[#1e1b4b]">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20">
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#c7c1ff]">
              SHARE YOUR EXPERIENCE
            </p>

            <h2 className="mt-4 font-display text-4xl leading-tight text-white md:text-6xl">
              Your experience could be someone&apos;s next breakthrough.
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-blue-100/80">
              You don&apos;t need to have every answer. Sometimes sharing what
              you&apos;ve learned can help someone else take their next step.
            </p>

            <Link
              href="/mentor"
              className="mt-8 inline-flex items-center justify-center rounded-sm bg-[#6d5dfc] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#5747e8]"
            >
              Become a mentor →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
