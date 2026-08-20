"use client";

import { FormEvent, ReactNode, useState } from "react";
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

    const { error: insertError } = await supabase
      .from("mentees")
      .insert(payload);

    setSubmitting(false);

    if (insertError) {
      setError("Something didn't save. Try again in a moment.");
      return;
    }

    router.push("/thank-you?as=mentee");
  }

  return (
    <main className="min-h-screen bg-[#FAF9F6] text-[#18181B]">
      <header className="border-b border-[#E8E5E0] bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            className="font-display text-2xl font-bold tracking-tight text-[#1E1B4B]"
          >
            Agla<span className="text-[#6D5DFC]">Kadam</span>
          </Link>

          <Link
            href="/mentor"
            className="hidden text-sm font-semibold text-[#575569] transition hover:text-[#6D5DFC] sm:block"
          >
            Want to mentor instead?
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 agla-grid opacity-30" />

        <div className="relative mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-20">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#6D5DFC] hover:text-[#5747E8]"
          >
            ← Back to home
          </Link>

          <div className="mt-8 grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div className="lg:sticky lg:top-28">
              <span className="inline-flex rounded-full bg-[#EEEAFE] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#6D5DFC]">
                Find your next conversation
              </span>

              <h1 className="mt-6 font-display text-4xl font-semibold leading-tight tracking-tight text-[#1E1B4B] sm:text-6xl">
                Tell us where things feel{" "}
                <span className="text-[#6D5DFC]">unclear.</span>
              </h1>

              <p className="mt-5 max-w-lg text-base leading-7 text-[#6B6878] sm:text-lg">
                You do not need a perfectly formed plan. Tell us where you are,
                what you have done so far, and what you are trying to figure out.
              </p>

              <div className="mt-10 space-y-5">
                {[
                  ["01", "Share your situation"],
                  ["02", "Help us understand what you need"],
                  ["03", "We will use it to find a relevant mentor"],
                ].map(([number, text]) => (
                  <div key={number} className="flex items-center gap-4">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#1E1B4B] text-xs font-bold text-white">
                      {number}
                    </div>
                    <p className="text-sm font-medium text-[#575569]">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[#E8E5E0] bg-white p-6 shadow-[0_24px_70px_-30px_rgba(45,35,100,0.22)] sm:p-10">
              <div className="mb-8">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6D5DFC]">
                  Step 1 of 1
                </p>

                <h2 className="mt-2 font-display text-3xl font-semibold text-[#1E1B4B]">
                  Start with your story
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#6B6878]">
                  The more specific you are, the easier it is to understand who
                  might be useful for you to talk to.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field label="Your name" htmlFor="name">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Priya Sharma"
                      className="agla-input"
                    />
                  </Field>

                  <Field label="Email address" htmlFor="email">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      className="agla-input"
                    />
                  </Field>
                </div>

                <Field
                  label="Which of these fits you best?"
                  htmlFor="situation"
                >
                  <select
                    id="situation"
                    name="situation"
                    required
                    defaultValue=""
                    className="agla-input"
                  >
                    <option value="" disabled>
                      Choose the situation closest to yours
                    </option>

                    {SITUATIONS.map((situation) => (
                      <option key={situation} value={situation}>
                        {situation}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Your background" htmlFor="background">
                  <textarea
                    id="background"
                    name="background"
                    required
                    rows={4}
                    placeholder="Tell us about your degree, field, work, projects, or anything else that helps explain where you are coming from."
                    className="agla-input resize-y"
                  />
                </Field>

                <Field
                  label="What are you actually stuck on?"
                  htmlFor="stuck_on"
                >
                  <textarea
                    id="stuck_on"
                    name="stuck_on"
                    required
                    rows={5}
                    placeholder="Be specific. For example: 'I am considering an MBA but I don't know if it makes sense for my marketing career.'"
                    className="agla-input resize-y"
                  />
                </Field>

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="border-t border-[#E8E5E0] pt-6">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-[#6D5DFC] px-7 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#5747E8] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {submitting ? "Sending your details…" : "Submit and continue →"}
                  </button>

                  <p className="mt-3 text-xs leading-5 text-[#85818F]">
                    This information is used to understand your situation and
                    help make a relevant mentor connection.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
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
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-sm font-semibold text-[#312E45]"
      >
        {label}
      </label>

      {children}
    </div>
  );
}
