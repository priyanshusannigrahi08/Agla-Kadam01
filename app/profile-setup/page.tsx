"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, UserRound } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function ProfileSetupPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.replace("/auth?next=/profile-setup");
        return;
      }
      setUserId(user.id);
      setEmail(user.email || user.phone || "");
      const { data } = await supabase.from("profiles").select("id,full_name,age,phone,city,occupation,bio").eq("id", user.id).maybeSingle();
      if (data) {
        for (const [key, value] of Object.entries(data)) {
          const element = document.getElementById(key) as HTMLInputElement | HTMLTextAreaElement | null;
          if (element && value !== null && key !== "id") element.value = String(value);
        }
      }
      setLoading(false);
    }
    load();
  }, []);

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const full_name = String(form.get("full_name") || "").trim();
    const age = Number(form.get("age"));
    const phone = String(form.get("phone") || "").trim();
    const city = String(form.get("city") || "").trim();
    const occupation = String(form.get("occupation") || "").trim();
    const bio = String(form.get("bio") || "").trim();
    if (full_name.length < 2 || full_name.length > 100) { setError("Please enter your name (2–100 characters)."); setSaving(false); return; }
    if (!Number.isInteger(age) || age < 13 || age > 120) { setError("Please enter a valid age."); setSaving(false); return; }
    if (phone && !/^[+0-9()\-\s]{7,20}$/.test(phone)) { setError("Please enter a valid phone number."); setSaving(false); return; }
    if (city.length > 100 || occupation.length > 120 || bio.length > 500) { setError("One of the optional fields is too long."); setSaving(false); return; }
    const { error: saveError } = await supabase.from("profiles").upsert({ id: userId, full_name, age, phone: phone || null, city: city || null, occupation: occupation || null, bio: bio || null }, { onConflict: "id" });
    if (saveError) setError("We couldn't save your profile. If you just installed this feature, run supabase/basic_profiles.sql in Supabase first.");
    else window.location.replace("/dashboard");
    setSaving(false);
  }

  if (loading) return <main className="min-h-screen bg-paper flex items-center justify-center"><p className="font-mono text-sm text-ink/50">Loading your profile…</p></main>;

  return <main className="min-h-screen bg-paper text-ink px-4 py-8 sm:px-6 sm:py-14">
    <div className="mx-auto max-w-4xl">
      <Link href="/" className="font-mono text-xs uppercase tracking-[0.15em] text-board/60 hover:text-board">← AglaKadam</Link>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_390px] lg:items-start">
        <section>
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-board/10 text-board"><UserRound size={22}/></div>
          <p className="mt-6 font-mono text-xs uppercase tracking-[0.16em] text-board/60">YOUR BASIC PROFILE</p>
          <h1 className="mt-2 font-display text-4xl leading-tight sm:text-5xl">Before your next step, tell us a little about you.</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-ink/60">This takes about a minute. Your basic details help AglaKadam keep your account organized before you choose whether you want to find a mentor or offer mentorship.</p>
          <div className="mt-7 space-y-3 text-sm text-ink/65"><p className="flex gap-3"><CheckCircle2 size={17} className="mt-0.5 shrink-0 text-board"/> Your email stays tied to your signed-in account.</p><p className="flex gap-3"><CheckCircle2 size={17} className="mt-0.5 shrink-0 text-board"/> You can edit these details later from your account.</p><p className="flex gap-3"><CheckCircle2 size={17} className="mt-0.5 shrink-0 text-board"/> You choose your mentor/mentee path after this step.</p></div>
        </section>
        <form onSubmit={save} className="rounded-sm border border-ink/10 bg-white p-6 pin-shadow sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="full_name" label="Full name" required placeholder="Your name" />
            <Field id="age" label="Age" required type="number" min="13" max="120" placeholder="18" />
            <div className="sm:col-span-2"><Field id="email" label="Email" value={email} readOnly type="email" /></div>
            <Field id="phone" label="Phone number" type="tel" placeholder="+91 …" />
            <Field id="city" label="City" placeholder="Mumbai" />
            <div className="sm:col-span-2"><Field id="occupation" label="Current status / occupation" placeholder="Student, analyst, founder…" /></div>
            <div className="sm:col-span-2"><label htmlFor="bio" className="mb-2 block font-mono text-xs uppercase tracking-[0.1em] text-ink/60">A little about you <span className="text-ink/35">(optional)</span></label><textarea id="bio" name="bio" maxLength={500} rows={4} className="input" placeholder="What are you currently working on or figuring out?" /></div>
          </div>
          {error && <p className="mt-5 rounded-sm bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
          <button type="submit" disabled={saving} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-amber px-5 py-3 font-semibold disabled:opacity-60">{saving ? "Saving profile…" : "Save and continue"} <ArrowRight size={16}/></button>
          <p className="mt-3 text-center text-xs text-ink/40">You can choose mentor or mentee after saving.</p>
        </form>
      </div>
    </div>
  </main>;
}

function Field({ id, label, required, type = "text", placeholder, value, readOnly, min, max }: { id: string; label: string; required?: boolean; type?: string; placeholder?: string; value?: string; readOnly?: boolean; min?: string; max?: string }) {
  return <div><label htmlFor={id} className="mb-2 block font-mono text-xs uppercase tracking-[0.1em] text-ink/60">{label}{required && <span className="text-amber"> *</span>}</label><input id={id} name={id} type={type} placeholder={placeholder} defaultValue={value} readOnly={readOnly} required={required} min={min} max={max} maxLength={type === "number" ? undefined : 120} className={`input ${readOnly ? "bg-paper text-ink/55" : ""}`} /></div>;
}
