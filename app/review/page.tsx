"use client";

import { Suspense, useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex gap-2" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          onClick={() => onChange(n)}
          className={`text-3xl leading-none transition ${
            n <= value ? "text-amber" : "text-ink/20"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function LeaveReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mentorId = searchParams.get("mentor") ?? "";
  const mentorName = searchParams.get("name") ?? "this mentor";

  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!mentorId) {
      setError("Missing mentor — go back to the directory and try again.");
      return;
    }
    if (rating === 0) {
      setError("Pick a star rating before submitting.");
      return;
    }

    setSubmitting(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw new Error(userError.message);
      if (!user) throw new Error("Please sign in before leaving a review.");

      const form = new FormData(e.currentTarget);

      const { error: insertError } = await supabase.from("reviews").insert({
        mentor_id: mentorId,
        reviewer_user_id: user.id,
        reviewer_name: (form.get("reviewer_name") as string) || "Anonymous",
        rating,
        comment: (form.get("comment") as string) || null,
      });

      if (insertError) {
        if (insertError.code === "23505") {
          throw new Error("You've already reviewed this mentor.");
        }
        throw new Error(insertError.message);
      }

      router.push("/mentors");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something didn't save. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-xl px-6 py-16 sm:py-24">
        <Link
          href="/mentors"
          className="font-mono text-xs uppercase tracking-[0.15em] text-board/60 hover:text-board"
        >
          ← Back to mentors
        </Link>

        <h1 className="font-display text-3xl sm:text-4xl mt-6 mb-2">
          How was your call with {mentorName}?
        </h1>
        <p className="text-ink/70 mb-10">
          Your review helps the next person decide who to book.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block font-mono text-xs uppercase tracking-[0.1em] text-ink/60">
              Rating
            </label>
            <StarPicker value={rating} onChange={setRating} />
          </div>

          <div>
            <label
              htmlFor="reviewer_name"
              className="mb-2 block font-mono text-xs uppercase tracking-[0.1em] text-ink/60"
            >
              Your name
            </label>
            <input
              id="reviewer_name"
              name="reviewer_name"
              type="text"
              required
              className="input"
              placeholder="Priya Sharma"
            />
          </div>

          <div>
            <label
              htmlFor="comment"
              className="mb-2 block font-mono text-xs uppercase tracking-[0.1em] text-ink/60"
            >
              What was useful about the call? (optional)
            </label>
            <textarea
              id="comment"
              name="comment"
              rows={4}
              className="input"
              placeholder="Specifics help future mentees more than 'great call!'"
            />
          </div>

          {error && (
            <div
              className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              role="alert"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-sm bg-amber text-ink font-body font-semibold px-7 py-3.5 hover:brightness-95 transition disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit review"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function LeaveReviewPage() {
  return (
    <Suspense fallback={null}>
      <LeaveReviewContent />
    </Suspense>
  );
}
