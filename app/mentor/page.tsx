"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, ImagePlus, Linkedin, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { uploadProfilePhoto } from "@/lib/profilePhoto";

function requireHttpsUrl(value: string, label: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") throw new Error(`${label} must use HTTPS.`);
  } catch (error) {
    if (error instanceof Error && error.message.endsWith("must use HTTPS.")) throw error;
    throw new Error(`Please enter a valid HTTPS ${label.toLowerCase()}.`);
  }
}

export default function MentorSignup() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function handlePhotoChange(file: File | undefined) {
    if (!file) return;
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    setError(null);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const form = new FormData(e.currentTarget);
      const photo = form.get("photo") as File;
      const name = ((form.get("name") as string) || "").trim();
      const email = ((form.get("email") as string) || "").trim();
      const linkedin = ((form.get("linkedin") as string) || "").trim();
      const expertise = ((form.get("expertise") as string) || "").trim();
      const experience = ((form.get("experience") as string) || "").trim();
      const journey = ((form.get("journey") as string) || "").trim();
      const whyMentor = ((form.get("why_mentor") as string) || "").trim();
      const calendly = ((form.get("calendly") as string) || "").trim();

      if (!photo?.size) throw new Error("Please add a profile photo.");
      if (name.length < 1 || name.length > 100) throw new Error("Please enter a name between 1 and 100 characters.");
      if (email.length > 320) throw new Error("Please enter a valid email address.");
      if (!expertise || expertise.length > 2000) throw new Error("Please describe your expertise in 1–2000 characters.");
      if (experience.length > 500) throw new Error("Your experience description is too long.");
      if (journey.length > 2000) throw new Error("Your career journey is too long.");
      if (whyMentor.length > 2000) throw new Error("Your mentoring motivation is too long.");
      requireHttpsUrl(linkedin, "LinkedIn profile");
      requireHttpsUrl(calendly, "booking link");

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw new Error("We couldn't verify your sign-in. Please sign in again.");
      if (!user) {
        router.push("/auth?next=/mentor");
        return;
      }

      const photo_url = await uploadProfilePhoto(photo, "mentors");
      const { error: insertError } = await supabase.from("mentors").insert({
        user_id: user.id,
        name,
        email,
        linkedin,
        expertise,
        experience,
        journey,
        why_mentor: whyMentor,
        calendly,
        photo_url,
      });

      if (insertError) {
        if (insertError.code === "23505") throw new Error("A mentor profile already exists for this account.");
        throw new Error("We couldn't save your mentor profile. Please check the form and try again.");
      }

      router.push("/thank-you?as=mentor");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something didn't save. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-12 lg:py-16">
        <Link href="/" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-board/60 transition hover:text-board">
          <span aria-hidden="true">←</span> Back to AglaKadam
        </Link>

        <header className="mt-8 max-w-2xl sm:mt-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-board/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-board">
            <span className="h-1.5 w-1.5 rounded-full bg-board" /> Mentor application
          </div>
          <h1 className="font-display text-4xl leading-[1.05] sm:text-5xl">Offer to mentor someone.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-ink/65 sm:text-lg">
            Share what you know. We’ll review your profile, then connect you with people who could genuinely benefit from your experience.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <TrustItem icon={<Check size={15} />} text="One 30-minute call" />
            <TrustItem icon={<ShieldCheck size={15} />} text="Profile reviewed first" />
            <TrustItem icon={<ArrowRight size={15} />} text="You choose your availability" />
          </div>
        </header>

        <form onSubmit={handleSubmit} className="mt-10 overflow-hidden rounded-sm border border-ink/10 bg-white shadow-[0_20px_60px_-45px_rgba(23,34,28,0.7)] sm:mt-12">
          <div className="border-b border-ink/10 bg-board/[0.025] px-6 py-5 sm:px-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-board/60">01 / About you</p>
            <h2 className="mt-1 font-display text-2xl">Help people know who they’re talking to.</h2>
          </div>

          <div className="space-y-8 px-6 py-7 sm:px-8 sm:py-9">
            <Field label="Profile photo" htmlFor="photo" hint="A clear, recent photo works best. JPG, PNG or WebP · up to 5 MB.">
              <label htmlFor="photo" className="group flex cursor-pointer items-center gap-4 rounded-sm border border-dashed border-ink/20 bg-paper p-4 transition hover:border-board/40 hover:bg-board/[0.025]">
                {preview ? (
                  <img src={preview} alt="Profile preview" className="h-20 w-20 shrink-0 rounded-full border border-ink/10 object-cover" />
                ) : (
                  <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-board/10 text-board">
                    <ImagePlus size={23} />
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{preview ? "Change photo" : "Choose a profile photo"}</span>
                  <span className="mt-1 block text-xs leading-5 text-ink/50">This will appear on your mentor profile.</span>
                </span>
                <input id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" required className="sr-only" onChange={(e) => handlePhotoChange(e.target.files?.[0])} />
              </label>
            </Field>

            <div className="grid gap-7 sm:grid-cols-2">
              <Field label="Your name" htmlFor="name" required>
                <input id="name" name="name" required maxLength={100} className="form-input" placeholder="Arjun Mehta" autoComplete="name" />
              </Field>
              <Field label="Email" htmlFor="email" required hint="Used only to contact you about your application and calls.">
                <input id="email" name="email" type="email" required maxLength={320} className="form-input" placeholder="you@example.com" autoComplete="email" />
              </Field>
            </div>

            <Field label="LinkedIn profile" htmlFor="linkedin" required hint="Helps us review your professional background.">
              <div className="relative">
                <Linkedin size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/30" />
                <input id="linkedin" name="linkedin" type="url" required className="form-input pl-11" placeholder="https://linkedin.com/in/your-name" autoComplete="url" />
              </div>
            </Field>
          </div>

          <div className="border-y border-ink/10 bg-board/[0.025] px-6 py-5 sm:px-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-board/60">02 / Your experience</p>
            <h2 className="mt-1 font-display text-2xl">Tell us what you can actually help with.</h2>
          </div>

          <div className="space-y-8 px-6 py-7 sm:px-8 sm:py-9">
            <Field label="What can you actually speak to?" htmlFor="expertise" required hint="Be specific — this helps us make better matches.">
              <textarea id="expertise" name="expertise" required maxLength={2000} rows={5} className="form-input resize-y" placeholder="For example: breaking into product management, moving from consulting to a startup, preparing for analytics interviews, or navigating your first year as a manager." />
              <p className="mt-2 text-xs text-ink/40">Think in terms of situations, decisions, skills or transitions you’ve personally experienced.</p>
            </Field>

            <Field label="Your experience" htmlFor="experience" optional hint="A quick snapshot is enough.">
              <input id="experience" name="experience" maxLength={500} className="form-input" placeholder="E.g. 7 years · Senior PM · B2B SaaS · Mumbai" />
            </Field>

            <Field label="Your career journey" htmlFor="journey" optional hint="What turns or lessons might be useful to someone following a similar path?">
              <textarea id="journey" name="journey" maxLength={2000} rows={5} className="form-input resize-y" placeholder="A few lines about where you started, the turns you made, and what you learned along the way." />
            </Field>
          </div>

          <div className="border-y border-ink/10 bg-board/[0.025] px-6 py-5 sm:px-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-board/60">03 / The conversation</p>
            <h2 className="mt-1 font-display text-2xl">What makes you want to give your time?</h2>
          </div>

          <div className="space-y-8 px-6 py-7 sm:px-8 sm:py-9">
            <Field label="Why do you want to mentor?" htmlFor="why_mentor" optional hint="There’s no perfect answer. We just want to understand your motivation.">
              <textarea id="why_mentor" name="why_mentor" maxLength={2000} rows={4} className="form-input resize-y" placeholder="Maybe someone helped you at a turning point. Maybe you enjoy helping people think through messy decisions." />
            </Field>

            <Field label="Your booking link" htmlFor="calendly" required hint="Calendly or a similar scheduling link. HTTPS links only.">
              <input id="calendly" name="calendly" type="url" required className="form-input" placeholder="https://calendly.com/your-name/30min" autoComplete="url" />
            </Field>
          </div>

          <div className="border-t border-ink/10 bg-paper px-6 py-6 sm:px-8 sm:py-7">
            {error && (
              <div className="mb-5 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700" role="alert">
                {error}
              </div>
            )}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-md text-xs leading-5 text-ink/45">By submitting, you’re applying to become a mentor. Your profile will be reviewed before it is used for matching.</p>
              <button type="submit" disabled={submitting} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-sm bg-amber px-7 py-3.5 font-semibold text-ink shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60">
                {submitting ? "Submitting…" : "Submit application"}
                {!submitting && <ArrowRight size={16} />}
              </button>
            </div>
          </div>
        </form>

        <p className="mt-6 text-center text-xs leading-5 text-ink/40">Questions? <Link href="/" className="text-board hover:underline">Go back to AglaKadam</Link>.</p>
      </div>
    </main>
  );
}

function Field({ label, htmlFor, children, required, optional, hint }: { label: string; htmlFor: string; children: ReactNode; required?: boolean; optional?: boolean; hint?: string }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="flex items-baseline justify-between gap-4">
        <span className="font-mono text-xs uppercase tracking-[0.11em] text-ink/65">{label}</span>
        {required ? <span className="text-[11px] text-board">Required</span> : optional ? <span className="text-[11px] text-ink/35">Optional</span> : null}
      </label>
      {hint && <p className="mt-1.5 text-xs leading-5 text-ink/45">{hint}</p>}
      <div className="mt-2.5">{children}</div>
    </div>
  );
}

function TrustItem({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-sm border border-ink/10 bg-white px-3 py-2.5 text-xs text-ink/60">
      <span className="text-board">{icon}</span>
      {text}
    </div>
  );
}
