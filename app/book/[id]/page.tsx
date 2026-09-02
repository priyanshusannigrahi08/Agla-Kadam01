"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CalendarDays, CheckCircle2, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Mentor = { id: string; name: string; headline?: string; calendly?: string; calendly_url?: string };

export default function BookMentorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    supabase.from("mentors_public").select("id,name,headline,calendly,calendly_url").eq("id", id).single().then(({ data, error }) => {
      if (error) setError("We couldn't load this mentor.");
      setMentor(data as Mentor | null);
      setLoading(false);
    });
  }, [id]);

  async function confirmBooking() {
    setSaving(true);
    setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); router.push(`/auth?next=/book/${id}`); return; }
    const bookingUrl = mentor?.calendly || mentor?.calendly_url || null;
    const { error: insertError } = await supabase.from("bookings").insert({
      mentee_user_id: user.id,
      mentor_id: id,
      duration_minutes: 30,
      status: "requested",
      booking_url: bookingUrl,
    });
    if (insertError) setError(insertError.message);
    else setDone(true);
    setSaving(false);
  }

  if (loading) return <main className="min-h-screen bg-paper px-6 py-24 text-center text-ink/60">Loading booking page…</main>;
  if (!mentor) return <main className="min-h-screen bg-paper px-6 py-24 text-center"><h1 className="font-display text-3xl">Mentor unavailable</h1><Link href="/mentors" className="mt-6 inline-flex rounded-sm bg-amber px-5 py-2.5 font-semibold">Browse mentors</Link></main>;

  const bookingUrl = mentor.calendly || mentor.calendly_url;

  return <main className="min-h-screen bg-paper text-ink"><div className="mx-auto max-w-xl px-6 py-16 sm:py-24"><Link href={`/mentors/${id}`} className="font-mono text-xs uppercase tracking-[0.15em] text-board/60 hover:text-board">← Back to profile</Link><section className="mt-8 rounded-sm border border-ink/10 bg-white p-7 pin-shadow sm:p-10">{done ? <div className="text-center"><CheckCircle2 size={44} className="mx-auto text-board" /><p className="mt-5 font-mono text-xs uppercase tracking-[0.15em] text-board/60">BOOKING RECORDED</p><h1 className="mt-3 font-display text-3xl">You’re all set.</h1><p className="mt-3 text-sm leading-relaxed text-ink/65">Your dashboard has a record that you reported booking this mentor. Keep the calendar confirmation from the mentor’s booking service too.</p><Link href="/dashboard" className="mt-7 inline-flex rounded-sm bg-amber px-6 py-3 font-semibold">Open dashboard</Link></div> : <><p className="font-mono text-xs uppercase tracking-[0.15em] text-board/60">30-MINUTE CALL</p><h1 className="mt-3 font-display text-3xl sm:text-4xl">Book a call with {mentor.name}.</h1><p className="mt-3 text-ink/65">{mentor.headline || "A focused conversation about your next step."}</p><div className="mt-8 rounded-sm border border-ink/10 bg-paper p-5"><div className="flex gap-3"><CalendarDays className="mt-0.5 shrink-0 text-board" size={20}/><div><p className="font-semibold">Choose a time</p><p className="mt-1 text-sm text-ink/60">The mentor’s booking calendar is hosted externally. Open it, choose a slot, then return here to record the booking in your AglaKadam dashboard.</p></div></div>{bookingUrl ? <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-sm border border-ink/20 px-5 py-2.5 text-sm font-semibold hover:bg-white">Open booking calendar <ExternalLink size={15}/></a> : <p className="mt-5 text-sm text-red-700">This mentor hasn’t added a booking link yet.</p>}</div>{error && <p className="mt-5 text-sm text-red-700" role="alert">{error}</p>}<button disabled={!bookingUrl || saving} onClick={confirmBooking} className="mt-6 w-full rounded-sm bg-amber px-6 py-3.5 font-semibold disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Saving…" : "I booked a slot — record it"}</button><p className="mt-4 text-center text-xs text-ink/45">AglaKadam does not claim to verify the external calendar booking. The mentor’s booking service is the source of truth for the actual appointment.</p></>}</section></div></main>;
}
