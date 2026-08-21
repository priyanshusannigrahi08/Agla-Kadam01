"use client";

import { FormEvent, ReactNode, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const EXPERTISE_AREAS = [
  "Technology / Software",
  "Business / Entrepreneurship",
  "Marketing / Sales",
  "Design / Creative",
  "Finance",
  "Education",
  "Healthcare",
  "Law",
  "Career Development",
  "Other",
];

export default function MentorPage() {
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
      console.error(insertError);
      setError("Something went wrong. Please try again.");
      return;
    }

    router.push("/thank-you?as=mentor");
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#FAF9F6] text-[#18181B]">
      {/* HEADER */}
      <header className="relative z-20 border-b border-[#E8E5E0] bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            className="font-display text-2xl font-bold tracking-tight text-[#1E1B4B]"
          >
            Agla<span className="text-[#6D5DFC]">Kadam</span>
          </Link>

          <Link
            href="/mentee"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-[#575569] transition hover:bg-[#F4F2FF] hover:text-[#6D5DFC]"
          >
            Looking for guidance?
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-[#E8E5E0] bg-white">
        <div className="absolute inset-0 agla-grid opacity-30" />

        <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full bg-[#EEEAFE] px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-[#6D5DFC]">
              Share what you&apos;ve learned
            </span>

            <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-[#1E1B4B] sm:text-6xl lg:text-7xl">
              Someone is standing where{" "}
              <span className="text-[#6D5DFC]">
                you once stood.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#6B6878] sm:text-xl">
              You don&apos;t need to be a professional coach. If you&apos;ve
              navigated a career, education, or life decision, your experience
              could help someone facing a similar next step.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#mentor-form"
                className="inline-flex min-h-[54px] items-center justify-center rounded-xl bg-[#6D5DFC] px-7 text-sm font-bold text-white shadow-[0_12px_30px_rgba(109,93,252,0.25)] transition hover:-translate-y-0.5 hover:bg-[#5747E8]"
              >
                Become a mentor →
              </a>

              <Link
                href="/mentee"
                className="inline-flex min-h-[54px] items-center justify-center rounded-xl border border-[#DDD9E6] bg-white px-7 text-sm font-bold text-[#312E45] transition hover:border-[#6D5DFC] hover:text-[#6D5DFC]"
              >
                I&apos;m looking for guidance
              </Link>
            </div>
          </div>

          {/* THREE STEPS */}
          <div className="mt-16 grid gap-4 sm:grid-cols-3">
            <InfoCard
              number="01"
              title="Share your experience"
              text="Tell us about your expertise, background, and the kind of guidance you can offer."
            />

            <InfoCard
              number="02"
              title="Set your availability"
              text="Let people know when you are generally available for conversations."
            />

            <InfoCard
              number="03"
              title="Help someone move forward"
              text="Share your booking link and have meaningful conversations with people."
            />
          </div>
        </div>
      </section>

      {/* FORM */}
      <section
        id="mentor-form"
        className="relative bg-[#FAF9F6]"
      >
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            {/* LEFT SIDE */}
            <div className="lg:sticky lg:top-24">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#6D5DFC]">
                Join the community
              </span>

              <h2 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-[#1E1B4B] sm:text-5xl">
                Your experience has{" "}
                <span className="text-[#6D5DFC]">
                  value.
                </span>
              </h2>

              <p className="mt-5 max-w-lg text-base leading-7 text-[#6B6878] sm:text-lg">
                The most useful advice often comes from someone who remembers
                what it felt like to be at the beginning.
              </p>

              <div className="mt-10 space-y-6">
                <Benefit
                  number="01"
                  title="Share real experience"
                  text="Talk about what worked, what didn't, and what you learned along the way."
                />

                <Benefit
                  number="02"
                  title="Make an impact"
                  text="One useful conversation can give someone clarity and confidence."
                />

                <Benefit
                  number="03"
                  title="No need for perfect answers"
                  text="You're sharing your perspective and experience, not solving someone's entire life."
                />
              </div>
            </div>

            {/* FORM CARD */}
            <div className="rounded-3xl border border-[#E8E5E0] bg-white p-6 shadow-[0_24px_70px_-30px_rgba(45,35,100,0.22)] sm:p-10">
              <div className="mb-10">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6D5DFC]">
                  Mentor profile
                </p>

                <h2 className="mt-3 font-display text-3xl font-semibold text-[#1E1B4B] sm:text-4xl">
                  Tell us about yourself
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#6B6878] sm:text-base">
                  This information helps us understand your experience and how
                  you may be able to help someone.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-7"
              >
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <Field label="Your name" htmlFor="name">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Your full name"
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
                  label="What area do you have experience in?"
                  htmlFor="expertise"
                >
                  <div className="agla-select-wrapper">
                    <select
                      id="expertise"
                      name="expertise"
                      required
                      defaultValue=""
                      className="agla-select"
                    >
                      <option value="" disabled>
                        Choose the area closest to your experience
                      </option>

                      {EXPERTISE_AREAS.map((area) => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))}
                    </select>

                    <span className="agla-select-arrow">
                      ↓
                    </span>
                  </div>
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
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {error}
                  </div>
                )}

                <div className="border-t border-[#E8E5E0] pt-7">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex min-h-[54px] items-center justify-center rounded-xl bg-[#6D5DFC] px-8 py-4 text-sm font-bold text-white shadow-[0_10px_30px_rgba(109,93,252,0.22)] transition hover:-translate-y-0.5 hover:bg-[#5747E8] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting
                      ? "Submitting your profile..."
                      : "Become a mentor →"}
                  </button>

                  <p className="mt-4 max-w-xl text-xs leading-5 text-[#85818F]">
                    Your information helps us understand your background and
                    connect you with people who may benefit from your
                    experience.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="border-t border-[#302C63] bg-[#1E1B4B]">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-5 py-14 sm:px-8 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#A99EFF]">
              Looking for guidance instead?
            </p>

            <h2 className="mt-3 font-display text-3xl font-semibold text-white sm:text-4xl">
              You don&apos;t have to figure it out alone.
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#C9C6D9] sm:text-base">
              Tell us where you are and what feels unclear. A conversation
              with someone experienced might help you see your next step.
            </p>
          </div>

          <Link
            href="/mentee"
            className="inline-flex min-h-[52px] shrink-0 items-center justify-center rounded-xl bg-white px-7 text-sm font-bold text-[#1E1B4B] transition hover:-translate-y-0.5 hover:bg-[#F3F1FF]"
          >
            Find guidance →
          </Link>
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
    <div className="w-full min-w-0">
      <label
        htmlFor={htmlFor}
        className="mb-2.5 block text-sm font-semibold text-[#312E45]"
      >
        {label}
      </label>

      {children}
    </div>
  );
}

function InfoCard({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-[#E8E5E0] bg-[#FAF9F6] p-6 transition hover:-translate-y-1 hover:bg-white hover:shadow-lg">
      <span className="text-xs font-bold tracking-[0.14em] text-[#6D5DFC]">
        {number}
      </span>

      <h3 className="mt-4 text-lg font-bold text-[#1E1B4B]">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-[#6B6878]">
        {text}
      </p>
    </div>
  );
}

function Benefit({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEEAFE] text-sm font-bold text-[#6D5DFC]">
        {number}
      </div>

      <div>
        <h3 className="font-semibold text-[#1E1B4B]">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-6 text-[#6B6878]">
          {text}
        </p>
      </div>
    </div>
  );
}
