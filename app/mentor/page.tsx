"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

      const photo_url = photo?.size ? await uploadProfilePhoto(photo, "mentors") : null;
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

  return <main className="min-h-screen bg-paper text-ink"><div className="mx-auto max-w-xl px-6 py-16 sm:py-24"><Link href="/" className="font-mono text-xs uppercase tracking-[0.15em] text-board/60 hover:text-board">← Back to AglaKadam</Link><h1 className="font-display text-3xl sm:text-4xl mt-6 mb-2">Offer to mentor someone.</h1><p className="text-ink/70 mb-10">One call, thirty minutes, whenever suits you. We review every sign-up before matching starts.</p><form onSubmit={handleSubmit} className="space-y-6">
<Field label="Your photo" htmlFor="photo"><div className="flex items-center gap-4">{preview?<img src={preview} alt="Profile preview" className="h-16 w-16 rounded-full object-cover border border-ink/15"/>:<div className="h-16 w-16 rounded-full bg-board/10 flex items-center justify-center text-xs text-ink/50">PHOTO</div>}<input id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" required className="input" onChange={e=>{const file=e.target.files?.[0];if(file)setPreview(URL.createObjectURL(file));}}/></div></Field>
<Field label="Your name" htmlFor="name"><input id="name" name="name" required maxLength={100} className="input" placeholder="Arjun Mehta"/></Field><Field label="Email" htmlFor="email"><input id="email" name="email" type="email" required maxLength={320} className="input" placeholder="you@example.com"/></Field><Field label="LinkedIn profile" htmlFor="linkedin"><input id="linkedin" name="linkedin" type="url" required className="input" placeholder="https://linkedin.com/in/…"/></Field><Field label="What can you actually speak to?" htmlFor="expertise"><textarea id="expertise" name="expertise" required maxLength={2000} rows={3} className="input" placeholder="Specific experience helps us match you well."/></Field><Field label="Your experience (optional)" htmlFor="experience"><input id="experience" name="experience" maxLength={500} className="input" placeholder="E.g. 5 years, Senior PM at a startup"/></Field><Field label="Your career journey (optional)" htmlFor="journey"><textarea id="journey" name="journey" maxLength={2000} rows={3} className="input"/></Field><Field label="Why do you want to mentor? (optional)" htmlFor="why_mentor"><textarea id="why_mentor" name="why_mentor" maxLength={2000} rows={3} className="input"/></Field><Field label="Your booking link (Calendly or similar)" htmlFor="calendly"><input id="calendly" name="calendly" type="url" required className="input" placeholder="https://calendly.com/…"/></Field>{error&&<p className="text-sm text-red-700" role="alert">{error}</p>}<button type="submit" disabled={submitting} className="w-full sm:w-auto inline-flex items-center justify-center rounded-sm bg-amber text-ink font-semibold px-7 py-3.5 disabled:opacity-60">{submitting?"Sending…":"Submit"}</button></form></div></main>;
}
function Field({label,htmlFor,children}:{label:string;htmlFor:string;children:React.ReactNode}) {return <div><label htmlFor={htmlFor} className="block font-mono text-xs uppercase tracking-[0.1em] text-ink/60 mb-2">{label}</label>{children}</div>;}
