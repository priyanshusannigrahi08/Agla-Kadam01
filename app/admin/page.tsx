"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ArrowLeft, CheckCircle2, ExternalLink, ShieldCheck, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Mentor = { id: string; name: string; email: string; headline: string | null; role: string | null; company: string | null; location: string | null; status: "pending" | "approved" | "paused"; verification_status: string; created_at: string };
type Review = { id: string; mentor_id: string; reviewer_name: string; rating: number; comment: string | null; status: "pending" | "published" | "rejected"; created_at: string };
type Booking = { id: string; mentor_id: string; mentee_user_id: string; scheduled_for: string | null; duration_minutes: number; status: "requested" | "confirmed" | "cancelled" | "completed"; created_at: string };
type AdminData = { mentors: Mentor[]; reviews: Review[]; bookings: Booking[]; admin: { email: string } };

const date = (value: string | null) => value ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Time not set";
const pill = "rounded-full bg-board/10 px-2.5 py-1 text-xs font-medium text-board";

export default function AdminPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"overview" | "mentors" | "reviews" | "bookings">("overview");

  async function load() {
    setLoading(true); setError(null);
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) { window.location.replace("/auth?next=/admin"); return; }
    const response = await fetch("/api/admin", { headers: { Authorization: `Bearer ${token}` } });
    if (response.status === 403) { setError("This account is not an admin."); setLoading(false); return; }
    if (!response.ok) { setError("Couldn't load the admin workspace."); setLoading(false); return; }
    setData(await response.json()); setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function update(resource: "mentor" | "review" | "booking", id: string, status: string, verification_status?: string) {
    setBusy(`${resource}:${id}`); setError(null);
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) { setError("Your session has expired. Please sign in again."); setBusy(null); return; }
    const response = await fetch("/api/admin", { method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ resource, id, status, verification_status }) });
    if (!response.ok) { const body = await response.json().catch(() => null); setError(body?.error || "Couldn't update that record."); setBusy(null); return; }
    await load(); setBusy(null);
  }

  const mentorNames = useMemo(() => Object.fromEntries((data?.mentors || []).map((m) => [m.id, m.name])), [data]);
  const pendingMentors = data?.mentors.filter((m) => m.status === "pending") || [];
  const pendingReviews = data?.reviews.filter((r) => r.status === "pending") || [];
  const activeBookings = data?.bookings.filter((b) => ["requested", "confirmed"].includes(b.status)) || [];

  if (loading) return <main className="min-h-screen bg-paper px-6 py-24 text-center text-ink/60">Loading admin workspace…</main>;
  if (!data) return <main className="min-h-screen bg-paper px-6 py-24"><div className="mx-auto max-w-xl text-center"><h1 className="font-display text-3xl">Admin access denied</h1><p className="mt-3 text-sm text-ink/55">{error || "This account isn't authorized to manage AglaKadam."}</p><Link href="/" className="mt-6 inline-flex rounded-sm bg-amber px-5 py-2.5 font-semibold">Back home</Link></div></main>;

  return <main className="min-h-screen bg-paper text-ink"><div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
    <div className="flex flex-wrap items-center justify-between gap-4"><Link href="/dashboard" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-board/60 hover:text-board"><ArrowLeft size={14}/> Dashboard</Link><span className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink/40">Admin · {data.admin.email}</span></div>
    <header className="mt-7 border-b border-ink/10 pb-7"><p className="font-mono text-xs uppercase tracking-[0.15em] text-board/60">OPERATIONS</p><h1 className="mt-2 font-display text-4xl sm:text-5xl">Keep the marketplace healthy.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-ink/55">Approve mentors, moderate feedback, and keep conversation statuses accurate. This workspace is private to authorized admin accounts.</p></header>

    <nav className="mt-6 flex flex-wrap gap-2">{([["overview","Overview"],["mentors","Mentors"],["reviews","Reviews"],["bookings","Bookings"]] as const).map(([value,label]) => <button key={value} onClick={() => setTab(value)} className={`rounded-sm px-4 py-2.5 text-sm font-semibold ${tab === value ? "bg-board text-chalk" : "border border-ink/15 hover:bg-white"}`}>{label}{value === "mentors" && pendingMentors.length > 0 ? ` · ${pendingMentors.length}` : value === "reviews" && pendingReviews.length > 0 ? ` · ${pendingReviews.length}` : ""}</button>)}</nav>
    {error && <p className="mt-5 rounded-sm bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}

    {tab === "overview" && <><section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Stat label="Mentors" value={data.mentors.length}/><Stat label="Pending mentors" value={pendingMentors.length}/><Stat label="Pending reviews" value={pendingReviews.length}/><Stat label="Active bookings" value={activeBookings.length}/></section><section className="mt-7 grid gap-7 lg:grid-cols-2"><Panel title="Needs attention" eyebrow="QUEUE">{pendingMentors.length === 0 && pendingReviews.length === 0 ? <Empty text="Nothing is waiting for moderation."/> : <div className="space-y-3">{pendingMentors.slice(0,3).map((m) => <QueueRow key={m.id} title={m.name} detail={m.headline || "Mentor application"} action="Review mentor" onClick={() => setTab("mentors")}/>) }{pendingReviews.slice(0,3).map((r) => <QueueRow key={r.id} title={`${r.rating}/5 · ${r.reviewer_name}`} detail={`Review for ${mentorNames[r.mentor_id] || "mentor"}`} action="Review feedback" onClick={() => setTab("reviews")}/>)}</div>}</Panel><Panel title="Marketplace health" eyebrow="AT A GLANCE"><div className="space-y-4 text-sm"><Health label="Approved mentors" value={data.mentors.filter((m) => m.status === "approved").length}/><Health label="Verified mentors" value={data.mentors.filter((m) => m.verification_status === "verified").length}/><Health label="Published reviews" value={data.reviews.filter((r) => r.status === "published").length}/><Health label="Completed calls" value={data.bookings.filter((b) => b.status === "completed").length}/></div></Panel></section></>}

    {tab === "mentors" && <Panel title="Mentor applications" eyebrow="MENTORS"><div className="space-y-3">{data.mentors.length === 0 ? <Empty text="No mentor profiles yet."/> : data.mentors.map((m) => <article key={m.id} className="rounded-sm border border-ink/10 bg-paper p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{m.name}</h3><span className={pill}>{m.status}</span>{m.verification_status === "verified" && <span className="inline-flex items-center gap-1 text-xs text-board"><ShieldCheck size={13}/> verified</span>}</div><p className="mt-1 text-sm text-ink/60">{m.headline || m.role || "Mentor"}{m.company ? ` · ${m.company}` : ""}{m.location ? ` · ${m.location}` : ""}</p><p className="mt-2 text-xs text-ink/40">{m.email} · joined {date(m.created_at)}</p></div><div className="flex flex-wrap gap-2">{m.status !== "approved" && <button disabled={busy === `mentor:${m.id}`} onClick={() => update("mentor",m.id,"approved")} className="inline-flex items-center gap-1.5 rounded-sm bg-amber px-3 py-2 text-xs font-semibold"><CheckCircle2 size={13}/> Approve</button>}{m.status !== "paused" && <button disabled={busy === `mentor:${m.id}`} onClick={() => update("mentor",m.id,"paused")} className="inline-flex items-center gap-1.5 border border-ink/15 px-3 py-2 text-xs font-semibold"><XCircle size={13}/> Pause</button>}{m.status === "approved" && m.verification_status !== "verified" && <button disabled={busy === `mentor:${m.id}`} onClick={() => update("mentor",m.id,"approved","verified")} className="inline-flex items-center gap-1.5 border border-board/25 px-3 py-2 text-xs font-semibold text-board"><ShieldCheck size={13}/> Verify</button>}{m.status === "approved" && <Link href={`/mentors/${m.id}`} target="_blank" className="inline-flex items-center gap-1.5 border border-ink/15 px-3 py-2 text-xs font-semibold"><ExternalLink size={13}/> Profile</Link>}</div></div></article>)}</div></Panel>}

    {tab === "reviews" && <Panel title="Review moderation" eyebrow="REVIEWS"><div className="space-y-3">{data.reviews.length === 0 ? <Empty text="No reviews yet."/> : data.reviews.map((r) => <article key={r.id} className="rounded-sm border border-ink/10 bg-paper p-5"><div className="flex flex-col gap-4 lg:flex-row lg:justify-between"><div className="max-w-3xl"><div className="flex flex-wrap items-center gap-2"><span className="font-semibold">{r.rating}/5 · {r.reviewer_name}</span><span className={pill}>{r.status}</span></div><p className="mt-1 text-xs text-ink/40">For {mentorNames[r.mentor_id] || "mentor"} · {date(r.created_at)}</p>{r.comment && <p className="mt-3 text-sm leading-6 text-ink/70">“{r.comment}”</p>}</div><div className="flex flex-wrap gap-2">{r.status !== "published" && <button disabled={busy === `review:${r.id}`} onClick={() => update("review",r.id,"published")} className="inline-flex items-center gap-1.5 rounded-sm bg-amber px-3 py-2 text-xs font-semibold"><CheckCircle2 size={13}/> Publish</button>}{r.status !== "rejected" && <button disabled={busy === `review:${r.id}`} onClick={() => update("review",r.id,"rejected")} className="inline-flex items-center gap-1.5 border border-red-200 px-3 py-2 text-xs font-semibold text-red-700"><XCircle size={13}/> Reject</button>}</div></div></article>)}</div></Panel>}

    {tab === "bookings" && <Panel title="Booking monitor" eyebrow="BOOKINGS"><div className="space-y-3">{data.bookings.length === 0 ? <Empty text="No bookings yet."/> : data.bookings.map((b) => <article key={b.id} className="rounded-sm border border-ink/10 bg-paper p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><div className="flex flex-wrap items-center gap-2"><span className="font-semibold">{mentorNames[b.mentor_id] || "Mentor"}</span><span className={pill}>{b.status}</span></div><p className="mt-2 text-xs text-ink/50">{b.scheduled_for ? date(b.scheduled_for) : "Time not set"} · {b.duration_minutes} minutes</p><p className="mt-1 text-[11px] text-ink/35">Mentee account: {b.mentee_user_id}</p></div><div className="flex flex-wrap gap-2">{b.status === "requested" && <button disabled={busy === `booking:${b.id}`} onClick={() => update("booking",b.id,"confirmed")} className="rounded-sm bg-amber px-3 py-2 text-xs font-semibold">Confirm</button>}{b.status === "confirmed" && <button disabled={busy === `booking:${b.id}`} onClick={() => update("booking",b.id,"completed")} className="rounded-sm bg-amber px-3 py-2 text-xs font-semibold">Mark completed</button>}{["requested","confirmed"].includes(b.status) && <button disabled={busy === `booking:${b.id}`} onClick={() => update("booking",b.id,"cancelled")} className="border border-red-200 px-3 py-2 text-xs font-semibold text-red-700">Cancel</button>}</div></div></article>)}</div></Panel>}
  </div></main>;
}

function Stat({ label, value }: { label: string; value: number }) { return <div className="rounded-sm border border-ink/10 bg-white p-5 pin-shadow"><p className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink/45">{label}</p><p className="mt-2 font-display text-3xl">{value}</p></div>; }
function Panel({ title, eyebrow, children }: { title: string; eyebrow: string; children: ReactNode }) { return <section className="mt-7 rounded-sm border border-ink/10 bg-white p-6 pin-shadow sm:p-7"><p className="font-mono text-xs uppercase tracking-[0.15em] text-board/60">{eyebrow}</p><h2 className="mt-2 font-display text-2xl">{title}</h2><div className="mt-6">{children}</div></section>; }
function Empty({ text }: { text: string }) { return <div className="rounded-sm border border-dashed border-ink/15 bg-paper p-8 text-center text-sm text-ink/55">{text}</div>; }
function QueueRow({ title, detail, action, onClick }: { title: string; detail: string; action: string; onClick: () => void }) { return <div className="flex items-center justify-between gap-4 rounded-sm border border-ink/10 bg-paper p-4"><div><p className="text-sm font-semibold">{title}</p><p className="mt-1 text-xs text-ink/50">{detail}</p></div><button onClick={onClick} className="text-xs font-semibold text-board">{action} →</button></div>; }
function Health({ label, value }: { label: string; value: number }) { return <div className="flex items-center justify-between border-b border-ink/10 pb-3"><span className="text-ink/60">{label}</span><strong>{value}</strong></div>; }
