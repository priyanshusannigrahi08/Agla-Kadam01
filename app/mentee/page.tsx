"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { uploadProfilePhoto } from "@/lib/profilePhoto";

const SITUATIONS = [
  "Left college, figuring out next steps",
  "Final-year student, unsure what’s next",
  "Working, want to switch careers",
  "Something else",
];

export default function MenteeSignup() {
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSubmitting(true);
    setError(null);

    try {
      const form = new FormData(e.currentTarget);

      const photo = form.get("photo") as File;

      // Check signed-in user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(userError.message);
      }

      if (!user) {
        throw new Error(
          "You are not signed in. Please sign in again before submitting."
        );
      }

      // Upload profile photo
      let photo_url: string | null = null;

      if (photo && photo.size > 0) {
        photo_url = await uploadProfilePhoto(photo, "mentees");
      }

      // Save mentee profile
      const { data, error: insertError } = await supabase
        .from("mentees")
        .insert({
          user_id: user.id,
          name: form.get("name") as string,
          email: form.get("email") as string,
          situation: form.get("situation") as string,
          background: form.get("background") as string,
          stuck_on: form.get("stuck_on") as string,
          photo_url: photo_url,
        })
        .select();

      if (insertError) {
        console.error("SUPABASE INSERT ERROR:", insertError);

        throw new Error(insertError.message);
      }

      console.log("MENTEE SAVED SUCCESSFULLY:", data);

      router.push("/thank-you?as=mentee");
    } catch (err: unknown) {
      console.error("MENTEE SUBMISSION ERROR:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something didn't save. Try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-xl px-6 py-16 sm:py-24">
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-[0.15em] text-board/60 hover:text-board"
        >
          ← Back to AglaKadam
        </Link>

        <h1 className="font-display mt-6 mb-2 text-3xl sm:text-4xl">
          Tell us where you’re stuck.
        </h1>

        <p className="mb-10 text-ink/70">
          Five minutes. We’ll match you with a mentor and email you their
          name.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PHOTO */}

          <Field label="Your photo" htmlFor="photo">
            <div className="flex items-center gap-4">
              {preview ? (
                <img
                  src={preview}
                  alt="Profile preview"
                  className="h-16 w-16 rounded-full border border-ink/15 object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-board/10 text-xs text-ink/50">
                  PHOTO
                </div>
              )}

              <input
                id="photo"
                name="photo"
                type="file"
                accept="image/*"
                required
                className="input"
                onChange={(e) => {
                  const file = e.target.files?.[0];

                  if (file) {
                    setPreview(URL.createObjectURL(file));
                  }
                }}
              />
            </div>
          </Field>

          {/* NAME */}

          <Field label="Your name" htmlFor="name">
            <input
              id="name"
              name="name"
              type="text"
              required
              className="input"
              placeholder="Priya Sharma"
            />
          </Field>

          {/* EMAIL */}

          <Field label="Email" htmlFor="email">
            <input
              id="email"
              name="email"
              type="email"
              required
              className="input"
              placeholder="you@example.com"
            />
          </Field>

          {/* SITUATION */}

          <Field
            label="Which of these fits you best?"
            htmlFor="situation"
          >
            <select
              id="situation"
              name="situation"
              required
              className="input"
              defaultValue=""
            >
              <option value="" disabled>
                Choose one
              </option>

              {SITUATIONS.map((situation) => (
                <option key={situation} value={situation}>
                  {situation}
                </option>
              ))}
            </select>
          </Field>

          {/* BACKGROUND */}

          <Field label="Your background" htmlFor="background">
            <textarea
              id="background"
              name="background"
              required
              rows={3}
              className="input"
              placeholder="Degree, field, what you've studied or worked on so far"
            />
          </Field>

          {/* WHAT THEY ARE STUCK ON */}

          <Field
            label="What are you actually stuck on?"
            htmlFor="stuck_on"
          >
            <textarea
              id="stuck_on"
              name="stuck_on"
              required
              rows={4}
              className="input"
              placeholder="Be specific — this is what we match on."
            />
          </Field>

          {/* ERROR */}

          {error && (
            <div
              className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              role="alert"
            >
              <strong className="block mb-1">
                Unable to save your profile
              </strong>

              {error}
            </div>
          )}

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center rounded-sm bg-amber px-7 py-3.5 font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {submitting ? "Submitting…" : "Submit and get matched"}
          </button>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 block font-mono text-xs uppercase tracking-[0.1em] text-ink/60"
      >
        {label}
      </label>

      {children}
    </div>
  );
}
