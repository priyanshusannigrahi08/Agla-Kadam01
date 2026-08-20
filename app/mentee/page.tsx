"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

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

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get("name") as string,
      email: form.get("email") as string,
      situation: form.get("situation") as string,
      background: form.get("background") as string,
      stuck_on: form.get("stuck_on") as string,
    };

    const { error: insertError } = await supabase.from("mentees").insert(payload);

    setSubmitting(false);

    if (insertError) {
      setError("Something didn't save. Try again in a moment.");
      return;
    }

    router.push("/thank-you?as=mentee");
  }

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-xl px-6 py-16 sm:py-24">
        <Link href="/" className="font-mono text-xs uppercase tracking-[0.15em] text-board/60 hover:text-board">
          ← Back to AglaKadam
        </Link>

        <h1 className="font-display text-3xl sm:text-4xl mt-6 mb-2">
          Tell us where you’re stuck.
        </h1>
        <p className="text-ink/70 mb-10">
          Five minutes. We&rsquo;ll match you with a mentor and email you their name.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
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

          <Field label="Which of these fits you best?" htmlFor="situation">
            <select id="situation" name="situation" required className="input" defaultValue="">
              <option value="" disabled>
                Choose one
              </option>
              {SITUATIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Your background" htmlFor="background">
            <textarea
              id="background"
              name="background"
              required
              rows={3}
              className="input"
              placeholder="Degree/field, what you've studied or worked on so far"
            />
          </Field>

          <Field label="What are you actually stuck on?" htmlFor="stuck_on">
            <textarea
              id="stuck_on"
              name="stuck_on"
              required
              rows={4}
              className="input"
              placeholder="Be specific — this is what we match on. E.g. 'I don't know if an MBA is worth it for a marketing career' beats 'I need career advice.'"
            />
          </Field>

          {error && <p className="text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-sm bg-amber text-ink font-body font-semibold px-7 py-3.5 hover:brightness-95 transition disabled:opacity-60"
          >
            {submitting ? "Sending…" : "Submit and get matched"}
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
      <label htmlFor={htmlFor} className="block font-mono text-xs uppercase tracking-[0.1em] text-ink/60 mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}
