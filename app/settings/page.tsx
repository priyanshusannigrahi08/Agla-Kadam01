"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Save, UserRound } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Role = "mentee" | "mentor" | "both";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("mentee");
  const [form, setForm] = useState({ full_name: "", age: "", phone: "", city: "", occupation: "", bio: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.replace("/auth?next=/settings"); return; }
      setUserId(user.id);
      setEmail(user.email || user.phone || "");
      const { data } = await supabase.from("profiles").select("full_name,age,phone,city,occupation,bio,preferred_role").eq("id", user.id).maybeSingle();
      if (data) {
        setForm({ full_name: String(data.full_name || ""), age: data.age ? String(data.age) : "", phone: String(data.phone || ""), city: String(data.city || ""), occupation: String(data.occupation || ""), bio: String(data.bio || "") });
        if (data.preferred_role === "mentor" || data.preferred_role === "mentee" || data.preferred_role === "both") setRole(data.preferred_role);
      }
      setLoading(false);
    }
    load();
  }, []);

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
    setMessage(""); setError("");
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!userId) return;
    setSaving(true); setMessage(""); setError("");
    const full_name = form.full_name.trim(), age = Number(form.age), phone = form.phone.trim(), city = form.city.trim(), occupation = form.occupation.trim(), bio = form.bio.trim();
    if (full_name.length < 2 || full_name.length > 100) { setError("Please enter your name (2–100 characters)."); setSaving(false); return; }
    if (!Number.isInteger(age) || age < 13 || age > 120) { setError("Please enter a valid age."); setSaving(false); return; }
    if (phone && !/^[+0-9()\-\s]{7,20}$/.test(phone)) { setError("Please enter a valid phone number."); setSaving(false); return; }
    if (city.length > 100 || occupation.length > 120 || bio.length > 500) { setError("One of the fields is too long."); setSaving(false); return; }
    const { error: saveError } = await supabase.from("profiles").upsert({ id: userId, full_name, age, phone: phone || null, city: city || null, occupation: occupation || null, bio: bio || null, preferred_role: role }, { onConflict: "id" });
    if (saveError) setError("We couldn't save your changes. Please try again.");
    else { await supabase.auth.updateUser({ data: { role } }); setMessage("Your profile and path have been updated."); }
    setSaving(false);
  }

  if (loading) return <main className="min-h-screen bg-paper flex items-center justify-center"><p className="font-mono text-sm text-ink/50">Loading settings…</p></main>;

  return <main className="min-h-screen bg-paper text-ink px-4 py-8 sm:px-6 sm:py-14">
    <div className="mx-auto max-w-4xl">
      <Link href="/dashboard" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-board/60 hover:text-board"><ArrowLeft size={14}/> Dashboard</Link>
      <div className="mt-8 max-w-2xl"><div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-board/10 text-board"><UserRound size={22}/></div><p className="mt-6 font-mono text-xs uppercase tracking-[0.16em] text-board/60">ACCOUNT SETTINGS</p><h1 className="mt-2 font-display text-4xl sm:text-5xl">Keep your profile up to date.</h1><p className="mt-4 text-base leading-7 text-ink/60">Your basic profile helps keep your AglaKadam account organized. Only share details you are comfortable providing.</p></div>
      <form onSubmit={save} className="mt-8 max-w-3xl rounded-sm border border-ink/10 bg-white p-6 pin-shadow sm:p-8">
        <div className="mb-7 flex items-start gap-3 rounded-sm bg-board/5 p-4 text-sm text-ink/65"><CheckCircle2 size={18} className="mt-0.5 shrink-0 text-board"/><p>Your sign-in email is managed by your account and cannot be changed here.</p></div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name" value={form.full_name} onChange={(v) => update("full_name", v)} required />
          <Field label="Age" type="number" value={form.age} onChange={(v) => update("age", v)} required min="13" max="120" />
          <Field label="Email" value={email} readOnly />
          <Field label="Phone number" type="tel" value={form.phone} onChange={(v) => update("phone", v)} placeholder="+91 …" />
          <Field label="City" value={form.city} onChange={(v) => update("city", v)} placeholder="Mumbai" />
          <Field label="Current status / occupation" value={form.occupation} onChange={(v) => update("occupation", v)} placeholder="Student, analyst, founder…" />
          <div className="sm:col-span-2"><label className="mb-3 block font-mono text-xs uppercase tracking-[0.1em] text-ink/60">How do you want to use AglaKadam?</label><div className="grid gap-3 sm:grid-cols-3">{([ ["mentee","Find a mentor","I need guidance"], ["mentor","Become a mentor","I want to help"], ["both","Both","Learn and give back"] ] as const).map(([value,title,description]) => <button key={value} type="button" onClick={() => { setRole(value); setMessage(""); }} className={`rounded-sm border p-4 text-left transition ${role === value ? "border-board bg-board/5 ring-1 ring-board/20" : "border-ink/10 hover:border-ink/25"}`}><p className="font-semibold">{title}</p><p className="mt-1 text-xs text-ink/50">{description}</p></button>)}</div><p className="mt-2 text-xs text-ink/40">You can change this later. Choosing “Both” keeps both directions open.</p></div>
          <div className="sm:col-span-2"><label className="mb-2 block font-mono text-xs uppercase tracking-[0.1em] text-ink/60">A little about you <span className="text-ink/35">(optional)</span></label><textarea value={form.bio} onChange={(e) => update("bio", e.target.value)} maxLength={500} rows={5} className="input" placeholder="What are you currently working on or figuring out?"/><p className="mt-1 text-right text-xs text-ink/35">{form.bio.length}/500</p></div>
        </div>
        {error && <p className="mt-5 rounded-sm bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}{message && <p className="mt-5 rounded-sm bg-board/10 p-3 text-sm text-board" role="status">{message}</p>}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Link href="/dashboard" className="inline-flex items-center justify-center rounded-sm border border-ink/15 px-5 py-3 text-sm hover:bg-ink/5">Cancel</Link><button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-sm bg-amber px-5 py-3 font-semibold disabled:opacity-60"><Save size={16}/>{saving ? "Saving…" : "Save changes"}</button></div>
      </form>
    </div>
  </main>;
}

function Field({ label, value, onChange, required, type = "text", placeholder, readOnly, min, max }: { label: string; value: string; onChange?: (value: string) => void; required?: boolean; type?: string; placeholder?: string; readOnly?: boolean; min?: string; max?: string }) {
  return <div><label className="mb-2 block font-mono text-xs uppercase tracking-[0.1em] text-ink/60">{label}{required && <span className="text-amber"> *</span>}</label><input value={value} onChange={(e) => onChange?.(e.target.value)} type={type} placeholder={placeholder} readOnly={readOnly} required={required} min={min} max={max} maxLength={type === "number" ? undefined : 120} className={`input ${readOnly ? "bg-paper text-ink/55" : ""}`}/></div>;
}
