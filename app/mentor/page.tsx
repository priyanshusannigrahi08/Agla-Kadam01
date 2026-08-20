"use client";

import { FormEvent, ReactNode, useState } from "react";
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

    const { error: insertError } = await supabase
      .from("mentors")
      .insert(payload);

    setSubmitting(false);

    if (insertError) {
      setError("Something didn't save. Try again in a moment.");
      return;
    }

    router.push("/thank-you?as=mentor");
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
            href="/mentee"
            className="hidden text-sm font-semibold text-[#575569] transition hover:text-[#6D5DFC] sm:block"
          >
            Looking for a mentor?
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-[#EEEAFE] blur-3xl opacity-70" />

        <div className="relative mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-20">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#6D5DFC] hover:text-[#5747E8]"
          >
            ← Back to home
          </Link>

          <div className="mt-8 grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div className="lg:sticky lg:top-28">
              <span className="inline-flex rounded-full bg-[#1E1B4B] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white">
                Share what you know
              </span>

              <h1 className="mt-6 font-display text-4xl font-semibold leading-tight tracking-tight text-[#1E1B4B] sm:text-6xl">
                Someone may need the experience you already{" "}
                <span className="text-[#6D5DFC]">have.</span>
              </h1>

              <p className="mt-5 max-w-lg text-base leading-7 text-[#6B6878] sm:text-lg">
                You do not need to be a professional coach. If you have
                navigated a meaningful career or education transition, your
                experience may help someone facing a similar decision.
              </p>

              <div className="mt-10 rounded-2xl border border-[#E8E5E0] bg-white/70 p-6">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6D5DFC]">
                  The idea is simple
                </p>

                <div className="mt-5 space-y-5">
                  {[
                    "Tell us what you have actually experienced.",
                    "Share when you are generally available.",
                    "Add a booking link for conversations.",
                  ].map((text, index) => (
                    <div key={text} className="flex gap-4">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#EEEAFE] text-xs font-bold text-[#6D5DFC]">
                        {index + 1}
                      </span>

                      <p className="text-sm leading-6 text-[#575569]">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[#E8E5E0] bg-white p-6 shadow-[0_24px_70px_-30px_rgba(45,35,100,0.22)] sm:p-10">
              <div className="mb-8">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6D5DFC]">
                  Mentor application
                </p>

                <h2 className="mt-2 font-display text-3xl font-semibold text-[#1E1B4B]">
                  Tell us what you can speak to.
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#6B6878]">
                  Specific experiences make it easier to connect you with
                  someone who can genuinely benefit from a conversation with
                  you.
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
                      placeholder="Arjun Mehta"
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
                  label="LinkedIn profile"
                  htmlFor="linkedin_url"
                >
                  <input
                    id="linkedin_url"
                    name="linkedin_url"
                    type="url"
                    required
                    placeholder="https://linkedin.com/in/your-profile"
                    className="agla-input"
                  />
                </Field>

                <Field
                  label="What can you actually speak to?"
                  htmlFor="expertise"
                >
                  <textarea
                    id="expertise"
                    name="expertise"
                    required
                    rows={5}
                    placeholder="For example: 'I switched from mechanical engineering to product management in two years.' Specific experiences help us understand who you could help."
                    className="agla-input resize-y"
                  />
                </Field>

                <Field
                  label="Rough availability"
                  htmlFor="availability"
                >
                  <input
                    id="availability"
                    name="availability"
                    type="text"
                    required
                    placeholder="For example: Weekday evenings, IST"
                    className="agla-input"
                  />
                </Field>

                <Field
                  label="Your booking link"
                  htmlFor="calendly_url"
                >
                  <input
                    id="calendly_url"
                    name="calendly_url"
                    type="url"
                    required
                    placeholder="https://calendly.com/your-link"
                    className="agla-input"
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
                    {submitting ? "Sending application…" : "Submit mentor application →"}
                  </button>

                  <p className="mt-3 text-xs leading-5 text-[#85818F]">
                    Applications are reviewed before mentors are made available
                    for matching.
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
