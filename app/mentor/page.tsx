"use client";

import { FormEvent, useState } from "react";
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

const EXPERIENCE_LEVELS = [
  "Student / Just starting",
  "1–3 years",
  "3–5 years",
  "5–10 years",
  "10+ years",
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

    const name = form.get("name") as string;
    const email = form.get("email") as string;
    const linkedin = form.get("linkedin") as string;
    const calendly = form.get("calendly") as string;
    const expertise = form.get("expertise") as string;
    const experience = form.get("experience") as string;
    const journey = form.get("journey") as string;
    const whyMentor = form.get("why_mentor") as string;

    const { error: insertError } = await supabase.from("mentors").insert({
      name,
      email,
      linkedin,
      calendly,
      expertise,
      availability: experience,
      background: `${journey}

Why I want to mentor:
${whyMentor}`,
    });

    setSubmitting(false);

    if (insertError) {
      console.error(insertError);

      setError(
        "Something went wrong while submitting your profile. Please try again."
      );

      return;
    }

    router.push("/thank-you?as=mentor");
  }

  return (
    <main className="min-h-screen bg-[#FAF9F6] text-[#29263D]">
      {/* HEADER */}

      <header className="border-b border-[#E8E5E0] bg-white">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-6 lg:px-8">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-[#211E4B]"
          >
            Agla
            <span className="text-[#6657E8]">Kadam</span>
          </Link>

          <Link
            href="/mentee"
            className="rounded-lg px-4 py-2 text-sm font-medium text-[#615D70] transition hover:bg-[#F1EFFF] hover:text-[#6657E8]"
          >
            Looking for guidance?
          </Link>
        </div>
      </header>

      {/* HERO */}

      <section className="border-b border-[#E8E5E0] bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8 lg:py-24">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#6657E8]">
            Become a mentor
          </p>

          <h1 className="mt-5 max-w-4xl font-serif text-5xl font-semibold leading-[1.08] text-[#211E4B] sm:text-6xl lg:text-7xl">
            Your experience could be
            <span className="text-[#6657E8]">
              {" "}
              someone&apos;s next step.
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-[#6D6878] sm:text-xl">
            You don&apos;t have to be a professional coach to help someone.
            Sometimes the most valuable guidance comes from someone who has
            already walked a similar path.
          </p>

          <a
            href="#mentor-form"
            className="mt-9 inline-flex items-center rounded-xl bg-[#6657E8] px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-[#6657E8]/20 transition hover:-translate-y-0.5 hover:bg-[#5546D8]"
          >
            Share your experience →
          </a>
        </div>
      </section>

      {/* MAIN FORM SECTION */}

      <section id="mentor-form" className="bg-[#FAF9F6]">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8 lg:py-24">
          <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">
            {/* LEFT SIDE */}

            <div className="lg:sticky lg:top-24 lg:h-fit">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#6657E8]">
                Why mentor?
              </p>

              <h2 className="mt-5 font-serif text-4xl font-semibold leading-tight text-[#211E4B] sm:text-5xl">
                Someone out there is where you once were.
              </h2>

              <p className="mt-6 text-base leading-7 text-[#6D6878] sm:text-lg">
                Your journey has lessons that someone else may need right now.
                You don&apos;t need perfect answers. You just need your
                experience.
              </p>

              <div className="mt-10 space-y-7">
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ECE9FF] font-bold text-[#6657E8]">
                    01
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#211E4B]">
                      Share what you learned
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-[#777180]">
                      Share your experiences, mistakes, achievements, and
                      lessons from your journey.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ECE9FF] font-bold text-[#6657E8]">
                    02
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#211E4B]">
                      Help someone find clarity
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-[#777180]">
                      A conversation with the right person can make a confusing
                      decision feel much clearer.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ECE9FF] font-bold text-[#6657E8]">
                    03
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#211E4B]">
                      Make an impact
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-[#777180]">
                      Your story could give someone the confidence to take
                      their next step.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* FORM CARD */}

            <div className="rounded-3xl border border-[#E6E2DC] bg-white p-7 shadow-[0_25px_70px_-35px_rgba(30,25,70,0.3)] sm:p-10">
              <div className="mb-10">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#6657E8]">
                  Mentor profile
                </p>

                <h2 className="mt-4 font-serif text-4xl font-semibold text-[#211E4B]">
                  Tell us about yourself
                </h2>

                <p className="mt-4 max-w-xl text-base leading-7 text-[#777180]">
                  This helps us understand your experience and the kinds of
                  people you may be able to guide.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-7">
                {/* NAME + EMAIL */}

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="w-full">
                    <label
                      htmlFor="name"
                      className="mb-3 block text-base font-semibold text-[#363248]"
                    >
                      Your name
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Your full name"
                      className="h-[58px] w-full rounded-2xl border border-[#DCD7D2] bg-white px-5 text-base text-[#29263D] outline-none transition placeholder:text-[#A09AA7] focus:border-[#6657E8] focus:ring-4 focus:ring-[#6657E8]/10"
                    />
                  </div>

                  <div className="w-full">
                    <label
                      htmlFor="email"
                      className="mb-3 block text-base font-semibold text-[#363248]"
                    >
                      Email address
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      className="h-[58px] w-full rounded-2xl border border-[#DCD7D2] bg-white px-5 text-base text-[#29263D] outline-none transition placeholder:text-[#A09AA7] focus:border-[#6657E8] focus:ring-4 focus:ring-[#6657E8]/10"
                    />
                  </div>
                </div>

                {/* LINKEDIN + CALENDLY */}

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="w-full">
                    <label
                      htmlFor="linkedin"
                      className="mb-3 block text-base font-semibold text-[#363248]"
                    >
                      LinkedIn profile
                    </label>

                    <input
                      id="linkedin"
                      name="linkedin"
                      type="url"
                      required
                      placeholder="https://linkedin.com/in/your-profile"
                      className="h-[58px] w-full rounded-2xl border border-[#DCD7D2] bg-white px-5 text-base text-[#29263D] outline-none transition placeholder:text-[#A09AA7] focus:border-[#6657E8] focus:ring-4 focus:ring-[#6657E8]/10"
                    />

                    <p className="mt-2 text-sm leading-5 text-[#8A8491]">
                      Helps mentees learn more about your background.
                    </p>
                  </div>

                  <div className="w-full">
                    <label
                      htmlFor="calendly"
                      className="mb-3 block text-base font-semibold text-[#363248]"
                    >
                      Calendly booking link
                    </label>

                    <input
                      id="calendly"
                      name="calendly"
                      type="url"
                      placeholder="https://calendly.com/your-name"
                      className="h-[58px] w-full rounded-2xl border border-[#DCD7D2] bg-white px-5 text-base text-[#29263D] outline-none transition placeholder:text-[#A09AA7] focus:border-[#6657E8] focus:ring-4 focus:ring-[#6657E8]/10"
                    />

                    <p className="mt-2 text-sm leading-5 text-[#8A8491]">
                      Optional. Mentees can use this link to book a session.
                    </p>
                  </div>
                </div>

                {/* EXPERTISE */}

                <div className="w-full">
                  <label
                    htmlFor="expertise"
                    className="mb-3 block text-base font-semibold text-[#363248]"
                  >
                    What area do you have experience in?
                  </label>

                  <div className="relative w-full">
                    <select
                      id="expertise"
                      name="expertise"
                      required
                      defaultValue=""
                      className="h-[58px] w-full appearance-none rounded-2xl border border-[#DCD7D2] bg-white px-5 pr-14 text-base text-[#29263D] outline-none transition focus:border-[#6657E8] focus:ring-4 focus:ring-[#6657E8]/10"
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

                    <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-xl text-[#6657E8]">
                      ↓
                    </span>
                  </div>
                </div>

                {/* EXPERIENCE */}

                <div className="w-full">
                  <label
                    htmlFor="experience"
                    className="mb-3 block text-base font-semibold text-[#363248]"
                  >
                    How much professional experience do you have?
                  </label>

                  <div className="relative w-full">
                    <select
                      id="experience"
                      name="experience"
                      required
                      defaultValue=""
                      className="h-[58px] w-full appearance-none rounded-2xl border border-[#DCD7D2] bg-white px-5 pr-14 text-base text-[#29263D] outline-none transition focus:border-[#6657E8] focus:ring-4 focus:ring-[#6657E8]/10"
                    >
                      <option value="" disabled>
                        Select your experience level
                      </option>

                      {EXPERIENCE_LEVELS.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>

                    <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-xl text-[#6657E8]">
                      ↓
                    </span>
                  </div>
                </div>

                {/* JOURNEY */}

                <div className="w-full">
                  <label
                    htmlFor="journey"
                    className="mb-3 block text-base font-semibold text-[#363248]"
                  >
                    Tell us about your journey
                  </label>

                  <textarea
                    id="journey"
                    name="journey"
                    required
                    rows={6}
                    placeholder="Tell us about your education, career, work, projects, achievements, career changes, or experiences that have shaped your journey."
                    className="block min-h-[160px] w-full resize-y rounded-2xl border border-[#DCD7D2] bg-white px-5 py-4 text-base leading-7 text-[#29263D] outline-none transition placeholder:text-[#A09AA7] focus:border-[#6657E8] focus:ring-4 focus:ring-[#6657E8]/10"
                  />
                </div>

                {/* WHY MENTOR */}

                <div className="w-full">
                  <label
                    htmlFor="why_mentor"
                    className="mb-3 block text-base font-semibold text-[#363248]"
                  >
                    Why would you like to mentor someone?
                  </label>

                  <textarea
                    id="why_mentor"
                    name="why_mentor"
                    required
                    rows={5}
                    placeholder="What would you like to share? What kind of people or situations do you think you could help with?"
                    className="block min-h-[150px] w-full resize-y rounded-2xl border border-[#DCD7D2] bg-white px-5 py-4 text-base leading-7 text-[#29263D] outline-none transition placeholder:text-[#A09AA7] focus:border-[#6657E8] focus:ring-4 focus:ring-[#6657E8]/10"
                  />
                </div>

                {/* ERROR */}

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {/* SUBMIT */}

                <div className="border-t border-[#E8E5E0] pt-7">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex min-h-[56px] items-center justify-center rounded-xl bg-[#6657E8] px-8 text-base font-semibold text-white shadow-lg shadow-[#6657E8]/20 transition hover:-translate-y-0.5 hover:bg-[#5546D8] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting
                      ? "Submitting..."
                      : "Submit your mentor profile →"}
                  </button>

                  <p className="mt-4 text-sm leading-6 text-[#8A8491]">
                    Your information helps us understand your experience and
                    connect you with people who may benefit from your guidance.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}

      <section className="bg-[#211E4B]">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-6 py-16 lg:flex-row lg:items-center lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#AAA2FF]">
              Looking for guidance?
            </p>

            <h2 className="mt-4 font-serif text-4xl font-semibold text-white">
              You don&apos;t have to figure it out alone.
            </h2>

            <p className="mt-4 max-w-2xl text-base leading-7 text-[#C7C3D7]">
              Tell us what you&apos;re navigating, and we&apos;ll help connect
              you with someone whose experience might help.
            </p>
          </div>

          <Link
            href="/mentee"
            className="shrink-0 rounded-xl bg-white px-7 py-4 font-semibold text-[#211E4B] transition hover:-translate-y-0.5 hover:bg-[#F1EFFF]"
          >
            Find guidance →
          </Link>
        </div>
      </section>
    </main>
  );
}
