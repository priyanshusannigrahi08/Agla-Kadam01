"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Check, CheckCircle2, FileText, ImagePlus, Loader2, ShieldCheck, Sparkles, UploadCloud } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { uploadProfilePhoto } from "@/lib/profilePhoto";

const MAX_EVIDENCE_BYTES = 8 * 1024 * 1024;
const EVIDENCE_ACCEPT = ".pdf,.jpg,.jpeg,.png,.webp";

type Assessment = {
  readiness_score: number;
  readiness_label: string;
  extracted_profile: {
    roles: string[];
    industries: string[];
    skills: string[];
    certifications: string[];
    years_experience: number | null;
    headline: string;
  };
  consistency_checks: { field: string; severity: string; finding: string }[];
  strengths: string[];
  improvements: string[];
};

function requireHttpsUrl(value: string, label: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") throw new Error(`${label} must use HTTPS.`);
  } catch (error) {
    if (error instanceof Error && error.message.endsWith("must use HTTPS.")) throw error;
    throw new Error(`Please enter a valid HTTPS ${label.toLowerCase()}.`);
  }
}

function validateEvidenceFile(file: File, label: string) {
  if (file.size > MAX_EVIDENCE_BYTES) throw new Error(`${label} must be 8 MB or smaller.`);
  if (!/^(application\/pdf|image\/(jpeg|png|webp))$/.test(file.type)) throw new Error(`${label} must be a PDF, JPG, PNG or WebP file.`);
}

export default function MentorSignup() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [certificationFiles, setCertificationFiles] = useState<File[]>([]);
  const [assessment, setAssessment] = useState<Assessment | null>(null);

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

  function handleResumeChange(file: File | undefined) {
    if (!file) return;
    try {
      validateEvidenceFile(file, "Your resume");
      setResumeFile(file);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "That resume could not be used.");
    }
  }

  function handleCertificationChange(files: FileList | null) {
    if (!files?.length) return;
    try {
      const next = Array.from(files);
      if (next.length > 6) throw new Error("You can add up to 6 evidence files in total.");
      next.forEach((file) => validateEvidenceFile(file, "Each certification"));
      setCertificationFiles(next);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Those certification files could not be used.");
    }
  }

  async function uploadEvidence(file: File, type: "resume" | "certification", userId: string, mentorId: string) {
    const safe = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").slice(-120);
    const path = `${userId}/${crypto.randomUUID()}-${safe}`;
    const { error: uploadError } = await supabase.storage.from("mentor-evidence").upload(path, file, { contentType: file.type, upsert: false });
    if (uploadError) throw new Error("The evidence file could not be uploaded. Make sure the mentor evidence SQL has been run.");

    const { error: insertError } = await supabase.from("mentor_documents").insert({
      mentor_id: mentorId,
      user_id: userId,
      document_type: type,
      file_name: file.name.slice(0, 240),
      storage_path: path,
      mime_type: file.type,
      file_size: file.size,
    });

    if (insertError) {
      await supabase.storage.from("mentor-evidence").remove([path]);
      throw new Error("The evidence record could not be saved.");
    }
  }

  async function analyzeProfile(mentorId: string, accessToken: string) {
    const response = await fetch("/api/mentor-ai/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ mentorId }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || "The AI profile review could not be completed.");
    return data.assessment as Assessment;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage("");
    setAssessment(null);

    try {
      if (!resumeFile) throw new Error("Please add your resume so the AI can analyze your experience.");
      if (certificationFiles.length > 6) throw new Error("You can add up to 6 evidence files in total.");

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
        window.location.replace("/auth?next=/mentor");
        return;
      }

      const photo_url = await uploadProfilePhoto(photo, "mentors");
      const { data: mentor, error: insertError } = await supabase.from("mentors").insert({
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
      }).select("id").single();

      if (insertError || !mentor) {
        if (insertError?.code === "23505") throw new Error("A mentor profile already exists for this account.");
        throw new Error("We couldn't save your mentor profile. Please check the form and try again.");
      }

      setMessage("Profile saved. Uploading your evidence and preparing the AI review…");
      await uploadEvidence(resumeFile, "resume", user.id, mentor.id);
      for (const file of certificationFiles) await uploadEvidence(file, "certification", user.id, mentor.id);

      setMessage("Evidence uploaded. AI is reviewing your profile…");
      const session = await supabase.auth.getSession();
      if (!session.data.session?.access_token) throw new Error("Your profile was saved, but we couldn't start the AI review. Please sign in again.");

      const result = await analyzeProfile(mentor.id, session.data.session.access_token);
      setAssessment(result);
      setMessage("AI profile review complete. Your documents stay private and the AI result is advisory.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something didn't save. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (assessment) {
    return (
      <main className="min-h-screen bg-paper text-ink">
        <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-12 lg:py-16">
          <header className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-board/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-board"><CheckCircle2 size={13} /> Application ready</div>
            <h1 className="font-display text-4xl leading-[1.05] sm:text-5xl">Your profile has been reviewed.</h1>
            <p className="mt-5 text-base leading-7 text-ink/60 sm:text-lg">Your resume and certifications gave the AI more context about the experience you can offer. This is an advisory profile review, not an identity or truth check.</p>
          </header>

          <section className="mt-8 rounded-sm border border-ink/10 bg-white p-6 shadow-[0_20px_60px_-45px_rgba(23,34,28,0.7)] sm:p-8">
            <div className="flex items-start justify-between gap-5">
              <div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-board/60">AI profile intelligence</p><h2 className="mt-2 font-display text-2xl">{assessment.readiness_label}</h2><p className="mt-2 text-sm text-ink/50">Profile readiness based on the information you provided and available evidence.</p></div>
              <div className="shrink-0"><span className="font-display text-4xl">{assessment.readiness_score}</span><span className="text-sm text-ink/40"> / 100</span></div>
            </div>
            <div className="mt-5 h-2 rounded-full bg-ink/10"><div className="h-full rounded-full bg-board" style={{ width: `${assessment.readiness_score}%` }} /></div>
            <div className="mt-7 grid gap-6 sm:grid-cols-2">
              <ResultPanel title="Skills">{assessment.extracted_profile.skills.length ? <div className="flex flex-wrap gap-2">{assessment.extracted_profile.skills.map((skill) => <span key={skill} className="rounded-full bg-board/10 px-3 py-1.5 text-xs text-board">{skill}</span>)}</div> : <p className="text-sm text-ink/45">No clear skills were extracted.</p>}</ResultPanel>
              <ResultPanel title="Roles & industries"><p className="text-sm leading-6 text-ink/60"><strong className="text-ink/75">Roles:</strong> {assessment.extracted_profile.roles.join(", ") || "Not clearly extracted"}</p><p className="mt-2 text-sm leading-6 text-ink/60"><strong className="text-ink/75">Industries:</strong> {assessment.extracted_profile.industries.join(", ") || "Not clearly extracted"}</p></ResultPanel>
              <ResultPanel title="Strengths">{assessment.strengths.length ? <ul className="space-y-2 text-sm leading-6 text-ink/60">{assessment.strengths.map((item) => <li key={item}>• {item}</li>)}</ul> : <p className="text-sm text-ink/45">No strengths extracted yet.</p>}</ResultPanel>
              <ResultPanel title="Consistency questions">{assessment.consistency_checks.length ? <div className="space-y-3">{assessment.consistency_checks.map((item, index) => <div key={`${item.field}-${index}`} className="rounded-sm border border-ink/10 bg-paper p-3"><p className="text-xs font-semibold">{item.field} · {item.severity}</p><p className="mt-1 text-sm leading-5 text-ink/60">{item.finding}</p></div>)}</div> : <p className="text-sm text-board">No consistency questions were surfaced.</p>}</ResultPanel>
            </div>
            <div className="mt-7 border-t border-ink/10 pt-6"><div className="flex flex-col gap-3 sm:flex-row"><Link href="/mentor/dashboard" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm bg-board px-5 py-3 text-sm font-semibold text-chalk">Open mentor dashboard <ArrowRight size={15} /></Link><Link href="/mentor/evidence" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border border-ink/15 px-5 py-3 text-sm font-semibold">Manage evidence</Link></div></div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-12 lg:py-16">
        <Link href="/" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-board/60 transition hover:text-board"><span aria-hidden="true">←</span> Back to AglaKadam</Link>

        <header className="mt-8 max-w-2xl sm:mt-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-board/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-board"><span className="h-1.5 w-1.5 rounded-full bg-board" /> Mentor application</div>
          <h1 className="font-display text-4xl leading-[1.05] sm:text-5xl">Offer to mentor someone.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-ink/65 sm:text-lg">Share what you know. We’ll review your profile, then connect you with people who could genuinely benefit from your experience.</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-3"><TrustItem icon={<Check size={15} />} text="One 30-minute call" /><TrustItem icon={<ShieldCheck size={15} />} text="Profile reviewed first" /><TrustItem icon={<ArrowRight size={15} />} text="You choose your availability" /></div>
        </header>

        <form onSubmit={handleSubmit} className="mt-10 overflow-hidden rounded-sm border border-ink/10 bg-white shadow-[0_20px_60px_-45px_rgba(23,34,28,0.7)] sm:mt-12">
          <div className="border-b border-ink/10 bg-board/[0.025] px-6 py-5 sm:px-8"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-board/60">01 / About you</p><h2 className="mt-1 font-display text-2xl">Help people know who they’re talking to.</h2></div>
          <div className="space-y-8 px-6 py-7 sm:px-8 sm:py-9">
            <Field label="Profile photo" htmlFor="photo" hint="A clear, recent photo works best. JPG, PNG or WebP · up to 5 MB."><label htmlFor="photo" className="group flex cursor-pointer items-center gap-4 rounded-sm border border-dashed border-ink/20 bg-paper p-4 transition hover:border-board/40 hover:bg-board/[0.025]">{preview ? <img src={preview} alt="Profile preview" className="h-20 w-20 shrink-0 rounded-full border border-ink/10 object-cover" /> : <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-board/10 text-board"><ImagePlus size={23} /></span>}<span className="min-w-0"><span className="block text-sm font-semibold">{preview ? "Change photo" : "Choose a profile photo"}</span><span className="mt-1 block text-xs leading-5 text-ink/50">This will appear on your mentor profile.</span></span><input id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" required className="sr-only" onChange={(e) => handlePhotoChange(e.target.files?.[0])} /></label></Field>
            <div className="grid gap-7 sm:grid-cols-2"><Field label="Your name" htmlFor="name" required><input id="name" name="name" required maxLength={100} className="form-input" placeholder="Arjun Mehta" autoComplete="name" /></Field><Field label="Email" htmlFor="email" required hint="Used only to contact you about your application and calls."><input id="email" name="email" type="email" required maxLength={320} className="form-input" placeholder="you@example.com" autoComplete="email" /></Field></div>
            <Field label="LinkedIn profile" htmlFor="linkedin" required hint="Helps us review your professional background."><div className="relative"><span aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-sm bg-board text-[11px] font-bold text-paper">in</span><input id="linkedin" name="linkedin" type="url" required className="form-input pl-11" placeholder="https://linkedin.com/in/your-name" autoComplete="url" /></div></Field>
          </div>

          <div className="border-y border-ink/10 bg-board/[0.025] px-6 py-5 sm:px-8"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-board/60">02 / Your experience</p><h2 className="mt-1 font-display text-2xl">Tell us what you can actually help with.</h2></div>
          <div className="space-y-8 px-6 py-7 sm:px-8 sm:py-9">
            <Field label="What can you actually speak to?" htmlFor="expertise" required hint="Be specific — this helps us make better matches."><textarea id="expertise" name="expertise" required maxLength={2000} rows={5} className="form-input resize-y" placeholder="For example: breaking into product management, moving from consulting to a startup, preparing for analytics interviews, or navigating your first year as a manager." /><p className="mt-2 text-xs text-ink/40">Think in terms of situations, decisions, skills or transitions you’ve personally experienced.</p></Field>
            <Field label="Your experience" htmlFor="experience" optional hint="A quick snapshot is enough."><input id="experience" name="experience" maxLength={500} className="form-input" placeholder="E.g. 7 years · Senior PM · B2B SaaS · Mumbai" /></Field>
            <Field label="Your career journey" htmlFor="journey" optional hint="What turns or lessons might be useful to someone following a similar path?"><textarea id="journey" name="journey" maxLength={2000} rows={5} className="form-input resize-y" placeholder="A few lines about where you started, the turns you made, and what you learned along the way." /></Field>
          </div>

          <div className="border-y border-ink/10 bg-board/[0.025] px-6 py-5 sm:px-8"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-board/60">03 / Evidence for your profile</p><h2 className="mt-1 font-display text-2xl">Let the AI understand your experience.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-ink/50">Your documents stay private. The AI uses them to extract useful skills, roles, industries and certifications, then compares that evidence with the profile you wrote.</p></div>
          <div className="space-y-7 px-6 py-7 sm:px-8 sm:py-9">
            <Field label="Resume" htmlFor="resume" required hint="PDF, JPG, PNG or WebP · up to 8 MB. A current resume gives the AI the strongest context."><label htmlFor="resume" className="flex cursor-pointer items-center gap-4 rounded-sm border border-dashed border-ink/20 bg-paper p-4 transition hover:border-board/40 hover:bg-board/[0.025]"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-board/10 text-board"><FileText size={21} /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{resumeFile ? resumeFile.name : "Choose your resume"}</span><span className="mt-1 block text-xs leading-5 text-ink/45">Required for the AI profile review.</span></span><span className="inline-flex shrink-0 items-center gap-2 rounded-sm border border-ink/15 bg-white px-3 py-2 text-xs font-semibold"><UploadCloud size={14} /> {resumeFile ? "Change" : "Upload"}</span><input id="resume" name="resume" type="file" accept={EVIDENCE_ACCEPT} required className="sr-only" onChange={(e) => { handleResumeChange(e.target.files?.[0]); e.currentTarget.value = ""; }} /></label></Field>
            <Field label="Certifications" htmlFor="certifications" optional hint="Add relevant certifications you want the AI to consider. You can select multiple files · up to 8 MB each."><label htmlFor="certifications" className="flex cursor-pointer items-center gap-4 rounded-sm border border-dashed border-ink/20 bg-paper p-4 transition hover:border-board/40 hover:bg-board/[0.025]"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-amber/20 text-ink"><FileText size={21} /></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{certificationFiles.length ? `${certificationFiles.length} certification${certificationFiles.length === 1 ? "" : "s"} selected` : "Add certifications"}</span><span className="mt-1 block text-xs leading-5 text-ink/45">Optional, but useful for relevant skills and qualifications.</span></span><span className="inline-flex shrink-0 items-center gap-2 rounded-sm border border-ink/15 bg-white px-3 py-2 text-xs font-semibold"><UploadCloud size={14} /> Choose files</span><input id="certifications" name="certifications" type="file" accept={EVIDENCE_ACCEPT} multiple className="sr-only" disabled={submitting} onChange={(e) => { handleCertificationChange(e.target.files); e.currentTarget.value = ""; }} /></label>{certificationFiles.length > 0 && <div className="space-y-2">{certificationFiles.map((file) => <div key={`${file.name}-${file.size}`} className="flex items-center gap-3 rounded-sm border border-ink/10 bg-white px-3 py-2.5 text-xs"><FileText size={15} className="shrink-0 text-board" /><span className="min-w-0 flex-1 truncate">{file.name}</span><span className="shrink-0 text-ink/40">{(file.size / 1024 / 1024).toFixed(1)} MB</span></div>)}</div>}</Field>
            <div className="rounded-sm border border-board/15 bg-board/[0.035] p-4"><div className="flex items-start gap-3"><ShieldCheck size={17} className="mt-0.5 shrink-0 text-board" /><p className="text-xs leading-5 text-ink/55"><strong className="text-ink/75">Private evidence:</strong> uploaded files are kept in a private storage bucket. They are not displayed on your public mentor profile or marketplace. Only safe, AI-derived discovery fields can be used for matching.</p></div></div>
          </div>

          <div className="border-y border-ink/10 bg-board/[0.025] px-6 py-5 sm:px-8"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-board/60">04 / The conversation</p><h2 className="mt-1 font-display text-2xl">What makes you want to give your time?</h2></div>
          <div className="space-y-8 px-6 py-7 sm:px-8 sm:py-9"><Field label="Why do you want to mentor?" htmlFor="why_mentor" optional hint="There’s no perfect answer. We just want to understand your motivation."><textarea id="why_mentor" name="why_mentor" maxLength={2000} rows={4} className="form-input resize-y" placeholder="Maybe someone helped you at a turning point. Maybe you enjoy helping people think through messy decisions." /></Field><Field label="Your booking link" htmlFor="calendly" required hint="Calendly or a similar scheduling link. HTTPS links only."><input id="calendly" name="calendly" type="url" required className="form-input" placeholder="https://calendly.com/your-name/30min" autoComplete="url" /></Field></div>

          <div className="border-t border-ink/10 bg-paper px-6 py-6 sm:px-8 sm:py-7">
            {error && <div className="mb-5 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700" role="alert">{error}</div>}
            {message && <div className="mb-5 rounded-sm border border-board/15 bg-board/[0.035] px-4 py-3 text-sm leading-6 text-board" role="status">{message}</div>}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><p className="max-w-md text-xs leading-5 text-ink/45">Submit once. AglaKadam will save your profile, securely upload your evidence, and run the AI profile review before showing you the result.</p><button type="submit" disabled={submitting} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-sm bg-amber px-7 py-3.5 font-semibold text-ink shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60">{submitting ? <><Loader2 size={16} className="animate-spin" /> Reviewing…</> : <>Submit & review profile <Sparkles size={16} /></>}</button></div>
          </div>
        </form>
        <p className="mt-6 text-center text-xs leading-5 text-ink/40">Questions? <Link href="/" className="text-board hover:underline">Go back to AglaKadam</Link>.</p>
      </div>
    </main>
  );
}

function Field({ label, htmlFor, children, required, optional, hint }: { label: string; htmlFor: string; children: ReactNode; required?: boolean; optional?: boolean; hint?: string }) {
  return <div><label htmlFor={htmlFor} className="flex items-baseline justify-between gap-4"><span className="font-mono text-xs uppercase tracking-[0.11em] text-ink/65">{label}</span>{required ? <span className="text-[11px] text-board">Required</span> : optional ? <span className="text-[11px] text-ink/35">Optional</span> : null}</label>{hint && <p className="mt-1.5 text-xs leading-5 text-ink/45">{hint}</p>}<div className="mt-2.5">{children}</div></div>;
}

function TrustItem({ icon, text }: { icon: ReactNode; text: string }) {
  return <div className="flex items-center gap-2 rounded-sm border border-ink/10 bg-white px-3 py-2.5 text-xs text-ink/60"><span className="text-board">{icon}</span>{text}</div>;
}

function ResultPanel({ title, children }: { title: string; children: ReactNode }) {
  return <div className="rounded-sm border border-ink/10 bg-paper p-4"><p className="font-mono text-[10px] uppercase tracking-[0.12em] text-board/60">{title}</p><div className="mt-3">{children}</div></div>;
}
