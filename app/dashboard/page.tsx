"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarDays, Clock3, Edit3, MessageCircle, ShieldCheck, Sparkles, UserRound, Compass } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import DashboardNextStep from "@/components/DashboardNextStep";
import ProgressSnapshot from "@/components/ProgressSnapshot";

type Row = Record<string, any>;
type Booking = Row & { mentor?: Row | null };

function statusLabel(status: string) {
  return ({ requested: "Requested", confirmed: "Confirmed", completed: "Completed", cancelled: "Cancelled" } as Record<string, string>)[status] || status;
}

function statusClass(status: string) {
  if (status === "completed") return "bg-board/10 text-board";
  if (status === "confirmed") return "bg-amber/20 text-ink";
  if (status === "cancelled") return "bg-ink/5 text-ink/45";
  return "bg-paper text-ink/60";
}

function formatDate(value?: string | null) {
  if (!value) return "Time set by mentor calendar";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Time set by mentor calendar";
  return new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }).format(date);
}

function ProfileSummary({ profile }: { profile: Row | null }) {
  const name = profile?.name || "Your profile";
  const fields = [profile?.city, profile?.current_status, profile?.bio].filter(Boolean);
  return <section className="rounded-sm border border-ink/10 bg-white p-6 pin-shadow sm:p-7"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-4"><div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-board/10 text-board"><UserRound size={24}/></div><div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-board/60">Your profile</p><h2 className="mt-1 font-display text-2xl">{name}</h2><p className="mt-1 text-sm text-ink/50">{fields.length ? fields.join(" · ") : "Add a little more about yourself"}</p></div></div><Link href="/profile-setup" className="inline-flex items-center justify-center gap-2 rounded-sm border border-ink/15 px-4 py-2.5 text-sm font-semibold"><Edit3 size={14}/> Edit profile</Link></div></section>;
}

function BookingCard({ booking, onReview }: { booking: Booking; onReview?: () => void }) {
  const mentor = booking.mentor;
  const name = mentor?.name || "Your mentor";
  const photo = mentor?.photo_url;
  const initial = name.trim().charAt(0).toUpperCase() || "M";
  const isCompleted = booking.status === "completed";
  const isCancelled = booking.status === "cancelled";
  const bookingUrl = typeof booking.booking_url === "string" && booking.booking_url.startsWith("https://") ? booking.booking_url : null;
  return <article className="rounded-sm border border-ink/10 bg-white p-6 pin-shadow"><div className="flex items-start gap-4">{photo ? <img src={photo} alt="" className="h-14 w-14 rounded-full border border-ink/10 object-cover"/> : <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-board/10 font-display text-xl text-board">{initial}</div>}<div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-display text-xl">{name}</h3>{mentor?.verification_status === "verified" && <span className="inline-flex items-center gap-1 rounded-full bg-board/10 px-2 py-1 font-mono text-[9px] uppercase tracking-wide text-board"><ShieldCheck size={11}/> Verified</span>}</div><p className="mt-1 text-sm text-ink/55">{mentor?.headline || "Mentoring conversation"}</p></div><span className={`shrink-0 rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide ${statusClass(booking.status)}`}>{statusLabel(booking.status)}</span></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-sm bg-paper p-4"><p className="font-mono text-[10px] uppercase tracking-wide text-board/60">When</p><p className="mt-2 flex items-center gap-2 text-sm font-semibold"><CalendarDays size={15} className="text-board"/>{formatDate(booking.scheduled_for)}</p></div><div className="rounded-sm bg-paper p-4"><p className="font-mono text-[10px] uppercase tracking-wide text-board/60">Format</p><p className="mt-2 flex items-center gap-2 text-sm font-semibold"><Clock3 size={15} className="text-board"/>{booking.duration_minutes || 30}-minute conversation</p></div></div>{!isCancelled && !isCompleted && <div className="mt-5 rounded-sm border border-board/10 bg-board/[0.035] p-5"><div className="flex gap-3"><Sparkles size={18} className="mt-0.5 shrink-0 text-board"/><div><p className="font-semibold">Make the conversation count</p><p className="mt-1 text-sm leading-6 text-ink/60">Bring one decision, one question, and a little context. You don&apos;t need to have everything figured out.</p><Link href="/find-mentor" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-board">Get help framing your question <ArrowRight size={13}/></Link></div></div></div>}<div className="mt-5 flex flex-col gap-2 sm:flex-row"><Link href={mentor?.id ? `/mentors/${mentor.id}` : "/mentors"} className="inline-flex flex-1 items-center justify-center rounded-sm border border-ink/15 px-4 py-2.5 text-sm font-semibold">View mentor</Link>{bookingUrl && !isCompleted && !isCancelled && <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex flex-1 items-center justify-center gap-2 rounded-sm bg-amber px-4 py-2.5 text-sm font-semibold">Open booking <ArrowRight size={14}/></a>}{isCompleted && onReview && <button type="button" onClick={onReview} className="inline-flex flex-1 items-center justify-center gap-2 rounded-sm bg-amber px-4 py-2.5 text-sm font-semibold"><MessageCircle size={14}/> Leave feedback</button>}</div></article>;
}

export default function DashboardPage() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Row | null>(null);
  const [mentee, setMentee] = useState<Row | null>(null);
  const [mentor, setMentor] = useState<Row | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [recommendations, setRecommendations] = useState<Row[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        setCheckingAuth(false);
        setLoading(false);
        return;
      }
      setUser(currentUser);
      setCheckingAuth(false);

      const [profileResult, menteeResult, mentorResult, bookingResult] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", currentUser.id).maybeSingle(),
        supabase.from("mentees").select("*").eq("user_id", currentUser.id).maybeSingle(),
        supabase.from("mentors").select("*").eq("user_id", currentUser.id).maybeSingle(),
        supabase.from("bookings").select("*").eq("mentee_user_id", currentUser.id).order("created_at", { ascending: false }),
      ]);

      setProfile(profileResult.data ?? null);
      setMentee(menteeResult.data ?? null);
      setMentor(mentorResult.data ?? null);

      if (bookingResult.error) {
        console.error(bookingResult.error);
        setError("We couldn't load your conversations right now. Please refresh.");
      } else {
        const raw = (bookingResult.data || []) as Booking[];
        const mentorIds = Array.from(new Set(raw.map((item) => item.mentor_id).filter(Boolean)));
        if (mentorIds.length) {
          const { data: mentorRows } = await supabase.from("mentors_public").select("id,name,headline,photo_url,verification_status").in("id", mentorIds);
          const byId = new Map((mentorRows || []).map((row: Row) => [row.id, row]));
          setBookings(raw.map((item) => ({ ...item, mentor: byId.get(item.mentor_id) || null })));
        } else {
          setBookings(raw);
        }
      }

      const context = [menteeResult.data?.stage, menteeResult.data?.area, menteeResult.data?.challenge, menteeResult.data?.situation, menteeResult.data?.background, menteeResult.data?.stuck_on].filter(Boolean).join(" ");
      if (context) {
        const { data: mentorRows } = await supabase.from("mentors_public").select("id,name,headline,journey,expertise,role,company,photo_url,verification_status").limit(50);
        const recentIds = new Set((bookingResult.data || []).map((booking: any) => booking.mentor_id));
        const tokenize = (value: string) => new Set(value.toLowerCase().replace(/[^a-z0-9+#.]+/g, " ").split(/\s+/).filter((word: string) => word.length >= 3));
        const contextTokens = tokenize(context);
        const ranked = (mentorRows || []).filter((mentorRow: Row) => !recentIds.has(mentorRow.id)).map((mentorRow: Row) => {
          const mentorTokens = tokenize([mentorRow.journey, mentorRow.headline, mentorRow.expertise, mentorRow.role, mentorRow.company].filter(Boolean).join(" "));
          let score = 0;
          contextTokens.forEach((token) => { if (mentorTokens.has(token)) score += 1; });
          if (mentorRow.verification_status === "verified") score += 0.25;
          return { ...mentorRow, _score: score };
        }).sort((a, b) => b._score - a._score).slice(0, 3);
        setRecommendations(ranked);
      }

      setLoading(false);
    }

    load();
  }, []);

  const active = useMemo(() => bookings.filter((item) => ["requested", "confirmed"].includes(item.status)), [bookings]);
  const completed = useMemo(() => bookings.filter((item) => item.status === "completed"), [bookings]);
  const hasRole = Boolean(mentee || mentor);

  if (checkingAuth || loading) return <main className="flex min-h-screen items-center justify-center bg-paper"><p className="font-mono text-sm text-ink/50">Loading your next step…</p></main>;
  if (!user) return <main className="flex min-h-screen items-center justify-center bg-paper px-6"><div className="max-w-sm rounded-sm border border-ink/10 bg-white p-8 text-center pin-shadow"><p className="text-ink/70">Sign in to view your dashboard.</p><Link href="/auth?next=/dashboard" className="mt-5 inline-flex rounded-sm bg-amber px-6 py-3 font-semibold">Sign in</Link></div></main>;

  return <main className="min-h-screen bg-paper text-ink">
    <header className="border-b border-ink/10 bg-white"><div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14"><Link href="/" className="font-mono text-xs uppercase tracking-[0.15em] text-board/60">← AglaKadam</Link><div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-board/60">Your space</p><h1 className="mt-2 font-display text-4xl sm:text-5xl">Welcome{profile?.name ? `, ${String(profile.name).split(" ")[0]}` : " back"}.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-ink/60 sm:text-base">Keep your profile, mentoring path and conversations in one place.</p></div><div className="flex flex-wrap gap-2"><Link href="/mentors" className="inline-flex items-center gap-2 rounded-sm border border-ink/15 px-4 py-2.5 text-sm font-semibold">Find a mentor <ArrowRight size={14}/></Link><Link href="/recommendations" className="inline-flex items-center gap-2 rounded-sm border border-board/15 bg-board/[0.035] px-4 py-2.5 text-sm font-semibold text-board">For you</Link></div></div></div></header>
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12"><div className="space-y-7">
      <ProfileSummary profile={profile}/><DashboardNextStep/><ProgressSnapshot/>
      {!hasRole && <section className="rounded-sm border border-board/15 bg-board/[0.035] p-7"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-board/60">One more step</p><h2 className="mt-2 font-display text-2xl">Choose how AglaKadam can help.</h2><p className="mt-2 text-sm text-ink/60">Tell us whether you're looking for guidance, offering your experience, or both.</p><Link href="/onboarding" className="mt-5 inline-flex items-center gap-2 rounded-sm bg-amber px-5 py-3 text-sm font-semibold">Choose your path <ArrowRight size={15}/></Link></section>}
      {recommendations.length > 0 && <section className="rounded-sm border border-board/15 bg-board/[0.035] p-6 sm:p-7"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-board/60">Picked for you</p><h2 className="mt-2 font-display text-2xl">Mentors worth a look.</h2><p className="mt-2 text-sm text-ink/55">Based on your saved situation and public mentor profiles.</p></div><Link href="/recommendations" className="text-sm font-semibold text-board">See all <ArrowRight size={13} className="inline"/></Link></div><div className="mt-5 grid gap-3 md:grid-cols-3">{recommendations.map((mentorRow) => <Link key={mentorRow.id} href={`/mentors/${mentorRow.id}`} className="rounded-sm border border-ink/10 bg-white p-4 hover:border-board/25"><div className="flex items-center gap-3">{mentorRow.photo_url ? <img src={mentorRow.photo_url} alt="" className="h-10 w-10 rounded-full object-cover"/> : <div className="flex h-10 w-10 items-center justify-center rounded-full bg-board/10 font-display text-board">{String(mentorRow.name || "M").charAt(0)}</div>}<div className="min-w-0"><p className="truncate font-semibold">{mentorRow.name}</p><p className="truncate text-xs text-ink/45">{mentorRow.headline || mentorRow.role || "Mentor"}</p></div></div><p className="mt-4 line-clamp-3 text-xs leading-5 text-ink/55">{mentorRow.journey || mentorRow.expertise || "Relevant perspective for your next step."}</p></Link>)}</div></section>}
      {error && <div className="rounded-sm border border-red-200 bg-white p-4 text-sm text-red-700">{error}</div>}
      <section><div className="mb-5 flex items-end justify-between border-b border-ink/10 pb-4"><div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-board/60">Your conversations</p><h2 className="mt-2 font-display text-2xl sm:text-3xl">Next conversation</h2></div>{active.length > 0 && <span className="rounded-full bg-board/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide text-board">{active.length} active</span>}</div>{active.length ? <div className="space-y-5">{active.map((booking) => <BookingCard key={booking.id} booking={booking}/>)}</div> : <div className="rounded-sm border border-dashed border-ink/15 bg-white p-8"><p className="font-display text-xl">No upcoming conversation yet.</p><p className="mt-2 max-w-xl text-sm leading-6 text-ink/55">Find someone who has navigated a similar problem, or start with an AI mentor if you need help figuring out what to ask.</p><div className="mt-5 flex flex-wrap gap-2"><Link href="/find-mentor" className="inline-flex items-center gap-2 rounded-sm bg-amber px-5 py-2.5 text-sm font-semibold">Help me find one <ArrowRight size={14}/></Link><Link href="/mentors" className="inline-flex items-center px-5 py-2.5 text-sm font-semibold">Browse mentors</Link></div></div>}</section>
      {completed.length > 0 && <section><div className="mb-5 border-b border-ink/10 pb-4"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-board/60">Your history</p><h2 className="mt-2 font-display text-2xl">Completed conversations</h2></div><div className="space-y-5">{completed.map((booking) => <BookingCard key={booking.id} booking={booking} onReview={() => { window.location.href = `/review?booking=${encodeURIComponent(booking.id)}`; }}/>)}</div></section>}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[["AI mentor", "/ai-history"], ["Similar journeys", "/similar-journey"], ["Conversation guide", "/mentor-resources"], ["Career memory", "/career-memory"]].map(([label, href]) => <Link key={href} href={href} className="rounded-sm border border-ink/10 bg-white p-5 pin-shadow hover:border-board/25"><p className="font-mono text-[10px] uppercase tracking-wide text-board/60">{label}</p><p className="mt-2 font-display text-lg">Explore</p><p className="mt-2 text-xs leading-5 text-ink/50">Open this part of your AglaKadam space.</p></Link>)}</section>
      <section className="rounded-sm border border-ink/10 bg-board p-6 text-chalk sm:p-7"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-chalk/55">Keep moving</p><h2 className="mt-2 font-display text-2xl">The next useful step is usually smaller than you think.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-chalk/65">Use your goal, your last conversation, or your saved direction to decide what to try next.</p></div><Link href="/next-step" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-sm bg-amber px-5 py-3 text-sm font-semibold text-ink">Today&apos;s next step <Compass size={15}/></Link></div></section>
    </div></div>
  </main>;
}
