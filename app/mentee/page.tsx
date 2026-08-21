"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const SITUATIONS = [
  "Student exploring career options",
  "Recent graduate",
  "Early in my career",
  "Considering a career change",
  "Starting or growing a business",
  "Learning a new skill",
  "Facing a specific professional challenge",
  "Not sure what direction to take",
  "Other",
];

export default function MenteePage() {
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
    const stage = form.get("stage") as string;
    const area = form.get("area") as string;
    const challenge = form.get("challenge") as string;
    const additionalInfo = form.get("additional_info") as string;

    const { error: insertError } = await supabase.from("mentees").insert({
      name,
      email,
      stage,
      area,
      challenge,
      additional_info: additionalInfo || null,
    });

    setSubmitting(false);

    if (insertError) {
      console.error(insertError);

      setError(
        "Something went wrong while submitting your request. Please try again."
      );

      return;
    }

    router.push("/thank-you?as=mentee");
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
            Agla<span className="text-[#6657E8]">Kadam</span>
          </Link>

          <Link
            href="/mentor"
            className="rounded-lg px-4 py-2 text-sm font-medium text-[#615D70] transition hover:bg-[#F1EFFF] hover:text-[#6657E8]"
          >
            Become a mentor
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="border-b border-[#E8E5E0] bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8 lg:py-24">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#6657E8]">
            Step 1 of 1
          </p>

          <h1 className="mt-5 max-w-4xl font-serif text-5xl font-semibold leading-[1.08] text-[#211E4B] sm:text-6xl lg:text-7xl">
            Start with your story.
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-[#6D6878] sm:text-xl">
            The more specific you are, the easier it is to understand who might
            be useful for you to talk to.
          </p>
        </div>
      </section>

      {/* FORM */}
      <section className="bg-[#FAF9F6]">
        <div className="mx-auto max-w-5xl px-6 py-16 lg:px-8 lg:py-24">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-[#E6E2DC] bg-white p-7 shadow-[0_25px_70px_-35px_rgba(30,25,70,0.3)] sm:p-10 lg:p-12"
          >
            {/* NAME + EMAIL */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormInput
                id="name"
                name="name"
                label="Your name"
                type="text"
                placeholder="Your full name"
                required
              />

              <FormInput
                id="email"
                name="email"
                label="Email address"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>

            {/* SITUATION */}
            <div className="mt-8 w-full">
              <label
                htmlFor="stage"
                className="mb-3 block text-base font-semibold text-[#363248]"
              >
                Which of these fits you best?
              </label>

              <div className="relative w-full">
                <select
                  id="stage"
                  name="stage"
                  required
                  defaultValue=""
                  className="h-[58px] w-full appearance-none rounded-2xl border border-[#DCD7D2] bg-white px-5 pr-14 text-base text-[#29263D] outline-none transition focus:border-[#6657E8] focus:ring-4 focus:ring-[#6657E8]/10"
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

                <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-xl text-[#6657E8]">
                  ↓
                </span>
              </div>
            </div>

            {/* AREA */}
            <div className="mt-8 w-full">
              <label
                htmlFor="area"
                className="mb-3 block text-base font-semibold text-[#363248]"
              >
                What area would you like guidance in?
              </label>

              <input
                id="area"
                name="area"
                type="text"
                required
                placeholder="For example: career, business, technology, marketing, education..."
                className="h-[58px] w-full rounded-2xl border border-[#DCD7D2] bg-white px-5 text-base text-[#29263D] outline-none transition placeholder:text-[#A09AA7] focus:border-[#6657E8] focus:ring-4 focus:ring-[#6657E8]/10"
              />
            </div>

            {/* BACKGROUND */}
            <div className="mt-8 w-full">
              <label
                htmlFor="additional_info"
                className="mb-3 block text-base font-semibold text-[#363248]"
              >
                Your background
              </label>

              <textarea
                id="additional_info"
                name="additional_info"
                rows={6}
                placeholder="Tell us about your degree, field, work, projects, career so far, or anything else that helps explain where you are coming from."
                className="block min-h-[170px] w-full resize-y rounded-2xl border border-[#DCD7D2] bg-white px-5 py-4 text-base leading-7 text-[#29263D] outline-none transition placeholder:text-[#A09AA7] focus:border-[#6657E8] focus:ring-4 focus:ring-[#6657E8]/10"
              />
            </div>

            {/* CHALLENGE */}
            <div className="mt-8 w-full">
              <label
                htmlFor="challenge"
                className="mb-3 block text-base font-semibold text-[#363248]"
              >
                What are you actually stuck on?
              </label>

              <textarea
                id="challenge"
                name="challenge"
                required
                rows={6}
                placeholder="Be specific. For example: 'I am considering an MBA but I don't know if it makes sense for my marketing career.'"
                className="block min-h-[170px] w-full resize-y rounded-2xl border border-[#DCD7D2] bg-white px-5 py-4 text-base leading-7 text-[#29263D] outline-none transition placeholder:text-[#A09AA7] focus:border-[#6657E8] focus:ring-4 focus:ring-[#6657E8]/10"
              />
            </div>

            {/* ERROR */}
            {error && (
              <div className="mt-8 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* SUBMIT */}
            <div className="mt-10 border-t border-[#E8E5E0] pt-8">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex min-h-[58px] items-center justify-center rounded-xl bg-[#6657E8] px-8 text-base font-semibold text-white shadow-lg shadow-[#6657E8]/20 transition hover:-translate-y-0.5 hover:bg-[#5546D8] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Submitting..."
                  : "Submit and continue →"}
              </button>

              <p className="mt-5 max-w-2xl text-sm leading-6 text-[#8A8491]">
                This information is used to understand your situation and help
                make a relevant mentor connection.
              </p>
            </div>
          </form>
        </div>
      </section>

      {/* BOTTOM SECTION */}
      <section className="bg-[#211E4B]">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-2 lg:px-8 lg:py-20">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#AAA2FF]">
              How it works
            </p>

            <h2 className="mt-5 font-serif text-4xl font-semibold text-white">
              You don't need to have everything figured out.
            </h2>

            <p className="mt-5 text-base leading-7 text-[#C7C3D7]">
              Start by explaining where you are and what you're struggling
              with. The goal is simply to find someone whose experience may
              help you see your next step more clearly.
            </p>
          </div>

          <div className="space-y-5">
            <Step
              number="01"
              title="Share your situation"
              text="Tell us where you are and what you need help with."
            />

            <Step
              number="02"
              title="Find relevant experience"
              text="We look for mentors whose journeys may relate to yours."
            />

            <Step
              number="03"
              title="Start a conversation"
              text="Connect and learn from someone who has already been there."
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function FormInput({
  id,
  name,
  label,
  type,
  placeholder,
  required = false,
}: {
  id: string;
  name: string;
  label: string;
  type: string;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <div className="w-full">
      <label
        htmlFor={id}
        className="mb-3 block text-base font-semibold text-[#363248]"
      >
        {label}
      </label>

      <input
        id={id}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="h-[58px] w-full rounded-2xl border border-[#DCD7D2] bg-white px-5 text-base text-[#29263D] outline-none transition placeholder:text-[#A09AA7] focus:border-[#6657E8] focus:ring-4 focus:ring-[#6657E8]/10"
      />
    </div>
  );
}

function Step({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-5 rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#6657E8] text-sm font-bold text-white">
        {number}
      </div>

      <div>
        <h3 className="font-semibold text-white">{title}</h3>

        <p className="mt-1 text-sm leading-6 text-[#C7C3D7]">{text}</p>
      </div>
    </div>
  );
}
