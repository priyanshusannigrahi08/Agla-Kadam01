"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function MentorSignup() {
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
      linkedin_url: form.get("linkedin_url") as string,
      expertise: form.get("expertise") as string,
      availability: form.get("availability") as string,
      calendly_url: form.get("calendly_url") as string,
    };

    const { error: insertError } = await supabase.from("mentors").insert(payload);

    setSubmitting(false);

    if (insertError) {
      setError("Something didn't save. Try again in a moment.");
      return;
    }

    router.push("/thank-you?as=mentor");
  }

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-xl px-6 py-16 sm:py-24">
        <Link href="/" className="font-mono text-xs uppercase tracking-[0.15em] text-board/60 hover:text-board">
          ← Back to AglaKadam
        </Link>

        <h1 className="font-display text-3xl sm:text-4xl mt-6 mb-2">
          Offer to mentor someone.
        </h1>
        <p className="text-ink/70 mb-10">
          One call, thirty minutes, whenever suits you. We review every sign-up
          before matching starts.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Field label="Your name" htmlFor="name">
            <input id="name" name="name" type="text" required className="input" placeholder="Arjun Mehta" />
          </Field>

          <Field label="Email" htmlFor="email">
            <input id="email" name="email" type="email" required className="input" placeholder="you@example.com" />
          </Field>

          <Field label="LinkedIn profile" htmlFor="linkedin_url">
            <input
              id="linkedin_url"
              name="linkedin_url"
              type="url"
              required
              className="input"
              placeholder="https://linkedin.com/in/…"
            />
          </Field>

          <Field label="What can you actually speak to?" htmlFor="expertise">
            <textarea
              id="expertise"
              name="expertise"
              required
              rows={3}
              className="input"
              placeholder="E.g. 'Switched from mechanical engineering to product management in 2 years' — specifics help us match you well."
            />
          </Field>

          <Field label="Rough availability" htmlFor="availability">
            <input
              id="availability"
              name="availability"
              type="text"
              required
              className="input"
              placeholder="E.g. weekday evenings IST"
            />
          </Field>

          <Field label="Your booking link (Calendly or similar)" htmlFor="calendly_url">
            <input
              id="calendly_url"
              name="calendly_url"
              type="url"
              required
              className="input"
              placeholder="https://calendly.com/…"
            />
          </Field>

          {error && <p className="text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-sm bg-amber text-ink font-body font-semibold px-7 py-3.5 hover:brightness-95 transition disabled:opacity-60"
          >
            {submitting ? "Sending…" : "Submit"}
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
