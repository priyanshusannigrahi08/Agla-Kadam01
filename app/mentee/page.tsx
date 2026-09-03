"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Heart, Target, UserRound, ShieldCheck, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { uploadProfilePhoto } from "@/lib/profilePhoto";

const SITUATIONS = [
  "Left college, figuring out next steps",
  "Final-year student, unsure what's next",
  "Working, want to switch careers",
  "Something else",
];

export default function MenteeSignup() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const form = new FormData(e.currentTarget);
      const photo = form.get("photo") as File;
      const name = ((form.get("name") as string) || "").trim();
      const email = ((form.get("email") as string) || "").trim();
      const situationValue = ((form.get("situation") as string) || "").trim();
      const backgroundValue = ((form.get("background") as string) || "").trim();
      const stuckOnValue = ((form.get("stuck_on") as string) || "").trim();

      if (name.length < 1 || name.length > 100) throw new Error("Please enter a name between 1 and 100 characters.");
      if (email.length > 320) throw new Error("Please enter a valid email address.");
      if (!SITUATIONS.includes(situationValue)) throw new Error("Please choose a valid situation.");
      if (!backgroundValue || backgroundValue.length > 2000) throw new Error("Please describe your background in 1–2000 characters.");
      if (!stuckOnValue || stuckOnValue.length > 2000) throw new Error("Please describe what you're stuck on in 1–2000 characters.");

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw new Error("We couldn't verify your sign-in. Please sign in again.");
      if (!user) throw new Error("You are not signed in. Please sign in again before submitting.");

      let photo_url: string | null = null;
      if (photo && photo.size > 0) photo_url = await uploadProfilePhoto(photo, "mentees");

      const { error: insertError } = await supabase.from("mentees").insert({
        user_id: user.id,
        name,
        email,
        situation: situationValue,
        background: backgroundValue,
        stuck_on: stuckOnValue,
        stage: situationValue,
        area: backgroundValue,
        challenge: stuckOnValue,
        photo_url,
      });

      if (insertError) {
        if (insertError.code === "23505") throw new Error("A mentee profile already exists for this account.");
        throw new Error("We couldn't save your mentee profile. Please check the form and try again.");
      }

      router.push("/thank-you?as=mentee");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something didn't save. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14 lg:py-16">
        <Link href="/" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-board/60 transition-colors hover:text-board">
          <span aria-hidden="true">←</span> Back to AglaKadam
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start lg:gap-12">
          <div>
            <div className="max-w-3xl">
              <p className="mb-3 font-mono text-xs uppercase tracking-[0.16em] text-board/55">Find a mentor</p>
              <h1 className="font-display text-4xl leading-[1.05] sm:text-5xl lg:text-[3.4rem]">Find the right mentor for you.</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-ink/65 sm:text-lg">
                Tell us a little about yourself and what you&apos;re looking for. We&apos;ll use it to help you find a useful conversation — not just another profile to scroll past.
              </p>
            </div>

            <div className="mt-9 hidden items-start sm:flex">
              <Step number="1" title="About you" caption="Who are you?" active />
              <StepConnector />
              <Step number="2" title="Your situation" caption="Where are you now?" />
              <StepConnector />
              <Step number="3" title="Your goal" caption="What do you need?" />
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5 sm:mt-10">
              <SectionCard icon={<UserRound size={19} />} eyebrow="01" title="About you" description="A little context helps a mentor understand where you&apos;re coming from.">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Your name" htmlFor="name" required>
                    <input id="name" name="name" type="text" required maxLength={100} className="input" placeholder="e.g. Priya Sharma" />
                  </Field>
                  <Field label="Email address" htmlFor="email" required>
                    <input id="email" name="email" type="email" required maxLength={320} className="input" placeholder="you@example.com" />
                  </Field>
                </div>

                <div className="mt-5">
                  <Field label="Profile photo" htmlFor="photo" hint="Used to help your mentor put a face to the conversation.">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-ink/10 bg-board/8 text-xs text-ink/45">
                        {preview ? <img src={preview} alt="Profile preview" className="h-full w-full object-cover" /> : <span>PHOTO</span>}
                      </div>
                      <label htmlFor="photo" className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-sm border border-ink/15 bg-white px-4 text-sm font-medium transition hover:border-board/35 hover:bg-board/[0.03]">
                        Choose a photo
                        <input id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" required className="sr-only" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (preview) URL.revokeObjectURL(preview);
                          setPreview(URL.createObjectURL(file));
                        }} />
                      </label>
                      <span className="text-xs text-ink/45">JPG, PNG or WebP · max 5MB</span>
                    </div>
                  </Field>
                </div>
              </SectionCard>

              <SectionCard icon={<Target size={19} />} eyebrow="02" title="Your situation" description="Choose the chapter that feels closest to where you are right now.">
                <Field label="Which of these fits you best?" htmlFor="situation" required>
                  <select id="situation" name="situation" required className="input" defaultValue="">
                    <option value="" disabled>Choose one</option>
                    {SITUATIONS.map((situation) => <option key={situation} value={situation}>{situation}</option>)}
                  </select>
                </Field>

                <div className="mt-5">
                  <Field label="Your background" htmlFor="background" required hint="Degree, field, work experience, or anything else that gives useful context.">
                    <textarea id="background" name="background" required maxLength={2000} rows={4} className="input resize-y" placeholder="e.g. I'm finishing a commerce degree and have been exploring analytics. I've done a couple of small projects but I'm not sure what to focus on next." />
                  </Field>
                </div>
              </SectionCard>

              <SectionCard icon={<Heart size={19} />} eyebrow="03" title="What do you need help with?" description="This is the most important part. Be specific — it helps us find a much better match.">
                <Field label="What are you actually stuck on?" htmlFor="stuck_on" required hint="Tell us the decision, challenge, or question you want to talk through.">
                  <textarea id="stuck_on" name="stuck_on" required maxLength={2000} rows={6} className="input resize-y" placeholder="e.g. I'm deciding between building analytics skills or preparing for a finance career. I want someone who's been through a similar decision to help me think it through." />
                </Field>

                <div className="mt-5 rounded-md border border-board/10 bg-board/[0.035] p-4">
                  <div className="flex gap-3">
                    <Sparkles size={17} className="mt-0.5 shrink-0 text-board/70" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-semibold">A better match starts with a specific problem.</p>
                      <p className="mt-1 text-xs leading-5 text-ink/55">You don&apos;t need to have everything figured out. Just tell us what you&apos;re trying to decide, learn, or change.</p>
                    </div>
                  </div>
                </div>
              </SectionCard>

              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
                  <strong className="mb-1 block">Unable to save your profile</strong>
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-4 border-t border-ink/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-md text-xs leading-5 text-ink/50">
                  By submitting, you&apos;re asking AglaKadam to use this information to help with mentor matching. We&apos;ll never pretend a match is better than it is.
                </p>
                <button type="submit" disabled={submitting} className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-sm bg-amber px-7 py-3.5 font-semibold text-ink shadow-[0_8px_20px_-14px_rgba(23,34,28,0.45)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-14px_rgba(23,34,28,0.55)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:w-auto">
                  {submitting ? "Submitting…" : "Find my mentor"}
                  {!submitting && <ArrowRight size={18} aria-hidden="true" />}
                </button>
              </div>
            </form>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-8">
            <InfoCard icon={<ShieldCheck size={21} />} title="Safe. Reviewed. Personal." tone="amber">
              Your profile is used for mentor matching. We review mentor sign-ups before they appear on AglaKadam.
            </InfoCard>

            <div className="rounded-md border border-ink/10 bg-white p-5 sm:p-6">
              <h2 className="font-display text-xl">How it works</h2>
              <div className="mt-5 space-y-5">
                <HowItWorks icon={<Target size={17} />} title="We understand your situation">You tell us where you are and what you&apos;re trying to figure out.</HowItWorks>
                <HowItWorks icon={<Heart size={17} />} title="You find a useful match">Use the mentor marketplace to find someone whose experience fits your problem.</HowItWorks>
                <HowItWorks icon={<Check size={17} />} title="Have a 1:1 conversation">One focused call. Thirty minutes. That&apos;s the whole idea.</HowItWorks>
              </div>
            </div>

            <div className="rounded-md border border-board/10 bg-board/[0.035] p-5 sm:p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-board/60">Tips for a better match</p>
              <ul className="mt-4 space-y-3 text-sm leading-5 text-ink/65">
                {[
                  "Be specific about what you're deciding",
                  "Share your current context, not your whole life story",
                  "Mention what you want to learn or change",
                  "It's okay if you don't know the answer yet",
                ].map((tip) => (
                  <li key={tip} className="flex gap-2.5">
                    <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-board/10 text-board"><Check size={10} strokeWidth={3} /></span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Step({ number, title, caption, active = false }: { number: string; title: string; caption: string; active?: boolean }) {
  return (
    <div className="min-w-0 text-center">
      <div className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold ${active ? "border-board bg-board text-paper" : "border-ink/20 bg-paper text-ink/55"}`}>{number}</div>
      <p className="mt-2 text-sm font-semibold">{title}</p>
      <p className="mt-0.5 text-xs text-ink/45">{caption}</p>
    </div>
  );
}

function StepConnector() {
  return <div className="mx-3 mt-4 h-px flex-1 bg-ink/15" aria-hidden="true" />;
}

function SectionCard({ icon, eyebrow, title, description, children }: { icon: ReactNode; eyebrow: string; title: string; description: string; children: ReactNode }) {
  return (
    <section className="rounded-md border border-ink/10 bg-white p-5 shadow-[0_10px_30px_-26px_rgba(23,34,28,0.7)] sm:p-7">
      <div className="flex gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-board/8 text-board">{icon}</div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-board/45">{eyebrow}</p>
          <h2 className="mt-0.5 font-display text-2xl">{title}</h2>
          <p className="mt-1 text-sm leading-5 text-ink/55">{description}</p>
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Field({ label, htmlFor, children, required = false, hint }: { label: string; htmlFor: string; children: ReactNode; required?: boolean; hint?: string }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="font-mono text-xs uppercase tracking-[0.1em] text-ink/60">
          {label} {required && <span className="text-amber" aria-hidden="true">*</span>}
        </label>
        {required ? <span className="text-[11px] text-ink/35">Required</span> : <span className="text-[11px] text-ink/35">Optional</span>}
      </div>
      {children}
      {hint && <p className="mt-1.5 text-xs leading-5 text-ink/45">{hint}</p>}
    </div>
  );
}

function InfoCard({ icon, title, children, tone = "default" }: { icon: ReactNode; title: string; children: ReactNode; tone?: "default" | "amber" }) {
  return (
    <div className={`rounded-md border p-5 sm:p-6 ${tone === "amber" ? "border-amber/15 bg-amber/[0.06]" : "border-ink/10 bg-white"}`}>
      <div className="flex gap-3">
        <div className="mt-0.5 text-board">{icon}</div>
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="mt-1.5 text-sm leading-6 text-ink/55">{children}</p>
        </div>
      </div>
    </div>
  );
}

function HowItWorks({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-board/8 text-board">{icon}</div>
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-ink/55">{children}</p>
      </div>
    </div>
  );
}
