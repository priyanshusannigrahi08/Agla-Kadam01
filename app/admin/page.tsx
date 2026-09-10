"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ArrowLeft, CheckCircle2, ExternalLink, FileCheck2, FileText, ShieldCheck, Sparkles, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Mentor = { id: string; name: string; email: string; headline: string | null; role: string | null; company: string | null; location: string | null; status: "pending" | "approved" | "paused"; verification_status: string; created_at: string };
type Review = { id: string; mentor_id: string; reviewer_name: string; rating: number; comment: string | null; status: "pending" | "published" | "rejected"; created_at: string };
type Booking = { id: string; mentor_id: string; mentee_user_id: string; scheduled_for: string | null; duration_minutes: number; status: "requested" | "confirmed" | "cancelled" | "completed"; created_at: string };
type Mentee = { id: string; created_at: string; name: string; email: string; situation: string | null; background: string | null; stuck_on: string | null; matched_mentor_id: string | null; status: "unmatched" | "matched" | "called" };
type MentorDocument = { id: string; mentor_id: string; document_type: "resume" | "certification"; file_name: string; mime_type: string; file_size: number; created_at: string };
type Assessment = { id: string; mentor_id: string; document_ids: string[]; extracted_profile: { roles?: string[]; industries?: string[]; skills?: string[]; certifications?: string[]; years_experience?: number | null; headline?: string }; consistency_checks: { field: string; severity: string; finding: string }[]; readiness_score: number; readiness_label: string; strengths: string[]; improvements: string[]; status: "completed" | "needs_review" | "failed"; model: string | null; created_at: string };
type OtherCounts = { career_goals: number; ai_conversations: number; conversation_actions: number };
type AdminData = { mentors: Mentor[]; reviews: Review[]; bookings: Booking[]; mentees: Mentee[]; mentorDocuments: MentorDocument[]; mentorAssessments: Assessment[]; otherCounts: OtherCounts; admin: { email: string } };
type Tab = "overview" | "mentors" | "reviews" | "bookings" | "mentees" | "other";
type SortOrder = "newest" | "oldest";

const date = (value: string | null) => value ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Time not set";
const pill = "rounded-full bg-board/10 px-2.5 py-1 text-xs font-medium text-board";

function matchesSearch(values: unknown[], query: string) {
  if (!query.trim()) return true;
  const needle = query.trim().toLowerCase();
  return values.some((value) => String(value ?? "").toLowerCase().includes(needle));
}

function sortByCreatedAt<T extends { created_at: string }>(rows: T[], order: SortOrder) {
  return [...rows].sort((a, b) => {
    const difference = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    return order === "newest" ? -difference : difference;
  });
}

export default function AdminPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [mentorSearch, setMentorSearch] = useState("");
  const [mentorStatus, setMentorStatus] = useState("all");
  const [mentorSort, setMentorSort] = useState<SortOrder>("newest");
  const [reviewSearch, setReviewSearch] = useState("");
  const [reviewStatus, setReviewStatus] = useState("all");
  const [reviewSort, setReviewSort] = useState<SortOrder>("newest");
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingStatus, setBookingStatus] = useState("all");
  const [bookingSort, setBookingSort] = useState<SortOrder>("newest");
  const [menteeSearch, setMenteeSearch] = useState("");
  const [menteeStatus, setMenteeStatus] = useState("all");
  const [menteeSort, setMenteeSort] = useState<SortOrder>("newest");

  async function load() {
    setLoading(true); setError(null);
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) { window.location.replace("/auth?next=/admin"); return; }
    const response = await fetch("/api/admin", { headers: { Authorization: `Bearer ${token}` } });
    if (response.status === 403) { setError("This account is not an admin."); setLoading(false); return; }
    if (!response.ok) { const body = await response.json().catch(() => null); setError(body?.error || "Couldn't load the admin workspace."); setLoading(false); return; }
    setData(await response.json()); setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function update(resource: "mentor" | "review" | "booking" | "mentee", id: string, status: string, verification_status?: string) {
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
  const unmatchedMentees = data?.mentees.filter((m) => m.status === "unmatched") || [];
  const activeBookings = data?.bookings.filter((b) => ["requested", "confirmed"].includes(b.status)) || [];
  const matchedMentees = data?.mentees.filter((m) => ["matched", "called"].includes(m.status)).length || 0;
  const assessmentsByMentor = useMemo(() => {
    const map: Record<string, Assessment> = {};
    for (const assessment of data?.mentorAssessments || []) if (!map[assessment.mentor_id]) map[assessment.mentor_id] = assessment;
    return map;
  }, [data]);
  const documentsByMentor = useMemo(() => {
    const map: Record<string, MentorDocument[]> = {};
    for (const document of data?.mentorDocuments || []) (map[document.mentor_id] ||= []).push(document);
    return map;
  }, [data]);
  const needsAiReview = data?.mentors.filter((mentor) => mentor.status === "pending" && assessmentsByMentor[mentor.id]?.status === "needs_review").length || 0;

  const filteredMentors = useMemo(() => sortByCreatedAt((data?.mentors || []).filter((m) => (mentorStatus === "all" || m.status === mentorStatus) && matchesSearch([m.name, m.email, m.headline, m.role, m.company, m.location], mentorSearch)), mentorSort), [data, mentorSearch, mentorSort, mentorStatus]);
  const filteredReviews = useMemo(() => sortByCreatedAt((data?.reviews || []).filter((r) => (reviewStatus === "all" || r.status === reviewStatus) && matchesSearch([r.reviewer_name, r.comment, mentorNames[r.mentor_id], r.rating], reviewSearch)), reviewSort), [data, mentorNames, reviewSearch, reviewSort, reviewStatus]);
  const filteredBookings = useMemo(() => sortByCreatedAt((data?.bookings || []).filter((b) => (bookingStatus === "all" || b.status === bookingStatus) && matchesSearch([mentorNames[b.mentor_id], b.mentee_user_id, b.scheduled_for, b.duration_minutes], bookingSearch)), bookingSort), [data, mentorNames, bookingSearch, bookingSort, bookingStatus]);
  const filteredMentees = useMemo(() => sortByCreatedAt((data?.mentees || []).filter((m) => (menteeStatus === "all" || m.status === menteeStatus) && matchesSearch([m.name, m.email, m.situation, m.background, m.stuck_on, mentorNames[m.matched_mentor_id || ""]], menteeSearch)), menteeSort), [data, mentorNames, menteeSearch, menteeSort, menteeStatus]);

  if (loading) return <main className="min-h-screen bg-paper px-6 py-24 text-center text-ink/60">Loading admin workspace…</main>;
  if (!data) return <main className="min-h-screen bg-paper px-6 py-24"><div className="mx-auto max-w-xl text-center"><h1 className="font-display text-3xl">Admin access denied</h1><p className="mt-3 text-sm text-ink/55">{error || "This account isn't authorized to manage AglaKadam."}</p><Link href="/" className="mt-6 inline-flex rounded-sm bg-amber px-5 py-2.5 font-semibold">Back home</Link></div></main>;

  return <main className="min-h-screen bg-paper text-ink"><div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
    <div className="flex flex-wrap items-center justify-between gap-4"><Link href="/dashboard" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-board/60 hover:text-board"><ArrowLeft size={14}/> Dashboard</Link><span className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink/40">Admin · {data.admin.email}</span></div>
    <header className="mt-7 border-b border-ink/10 pb-7"><p className="font-mono text-xs uppercase tracking-[0.15em] text-board/60">OPERATIONS</p><h1 className="mt-2 font-display text-4xl sm:text-5xl">Keep the marketplace healthy.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-ink/55">Review mentor applications with profile evidence and AI-assisted context, then moderate feedback and keep conversation statuses accurate.</p></header>

    <nav className="mt-6 flex flex-wrap gap-2">{([["overview","Overview"],["mentors","Mentors"],["reviews","Reviews"],["bookings","Bookings"],["mentees","Mentees"],["other","Other data"]] as const).map(([value,label]) => <button key={value} onClick={() => setTab(value)} className={`rounded-sm px-4 py-2.5 text-sm font-semibold ${tab === value ? "bg-board text-chalk" : "border border-ink/15 hover:bg-white"}`}>{label}{value === "mentors" && pendingMentors.length > 0 ? ` · ${pendingMentors.length}` : value === "reviews" && pendingReviews.length > 0 ? ` · ${pendingReviews.length}` : value === "mentees" && unmatchedMentees.length > 0 ? ` · ${unmatchedMentees.length}` : ""}</button>)}</nav>
    {error && <p className="mt-5 rounded-sm bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}

    {tab === "overview" && <><section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Stat label="Mentors" value={data.mentors.length}/><Stat label="Mentees" value={data.mentees.length}/><Stat label="Pending mentors" value={pendingMentors.length}/><Stat label="Unmatched mentees" value={unmatchedMentees.length}/></section><section className="mt-4 grid gap-4 sm:grid-cols-2"><Stat label="AI reviews needing attention" value={needsAiReview}/><Stat label="Active bookings" value={activeBookings.length}/></section><section className="mt-7 grid gap-7 lg:grid-cols-2"><Panel title="Needs attention" eyebrow="QUEUE">{pendingMentors.length === 0 && pendingReviews.length === 0 && unmatchedMentees.length === 0 ? <Empty text="Nothing is waiting for moderation."/> : <div className="space-y-3">{pendingMentors.slice(0,3).map((m) => <QueueRow key={m.id} title={m.name} detail={m.headline || "Mentor application"} action="Review mentor" onClick={() => setTab("mentors")}/>) }{pendingReviews.slice(0,3).map((r) => <QueueRow key={r.id} title={`${r.rating}/5 · ${r.reviewer_name}`} detail={`Review for ${mentorNames[r.mentor_id] || "mentor"}`} action="Review feedback" onClick={() => setTab("reviews")}/>)}{unmatchedMentees.slice(0,3).map((m) => <QueueRow key={m.id} title={m.name} detail={m.situation || m.stuck_on || "Mentee awaiting a match"} action="View mentee" onClick={() => setTab("mentees")}/>)}</div>}</Panel><Panel title="Marketplace health" eyebrow="AT A GLANCE"><div className="space-y-4 text-sm"><Health label="Approved mentors" value={data.mentors.filter((m) => m.status === "approved").length}/><Health label="Verified mentors" value={data.mentors.filter((m) => m.verification_status === "verified").length}/><Health label="Mentor evidence submitted" value={data.mentors.filter((m) => (documentsByMentor[m.id] || []).length > 0).length}/><Health label="AI assessments completed" value={data.mentorAssessments.filter((a) => a.status === "completed").length}/><Health label="Published reviews" value={data.reviews.filter((r) => r.status === "published").length}/><Health label="Mentees matched" value={matchedMentees} detail={`of ${data.mentees.length}`}/></div></Panel></section></>}

    {tab === "mentors" && <Panel title="Mentor applications" eyebrow="MENTORS"><Filters search={mentorSearch} setSearch={setMentorSearch} placeholder="Search mentors…" status={mentorStatus} setStatus={setMentorStatus} statuses={["pending","approved","paused"]} sort={mentorSort} setSort={setMentorSort}/><p className="mb-4 text-xs text-ink/40">Showing {filteredMentors.length} of {data.mentors.length} mentors</p><div className="space-y-4">{filteredMentors.length === 0 ? <Empty text="No mentors match these filters."/> : filteredMentors.map((m) => <MentorReviewCard key={m.id} mentor={m} documents={documentsByMentor[m.id] || []} assessment={assessmentsByMentor[m.id]} busy={busy === `mentor:${m.id}`} onUpdate={update}/>)}</div></Panel>}

    {tab === "reviews" && <Panel title="Review moderation" eyebrow="REVIEWS"><Filters search={reviewSearch} setSearch={setReviewSearch} placeholder="Search reviews…" status={reviewStatus} setStatus={setReviewStatus} statuses={["pending","published","rejected"]} sort={reviewSort} setSort={setReviewSort}/><p className="mb-4 text-xs text-ink/40">Showing {filteredReviews.length} of {data.reviews.length} reviews</p><div className="space-y-3">{filteredReviews.length === 0 ? <Empty text="No reviews match these filters."/> : filteredReviews.map((r) => <article key={r.id} className="rounded-sm border border-ink/10 bg-paper p-5"><div className="flex flex-col gap-4 lg:flex-row lg:justify-between"><div className="max-w-3xl"><div className="flex flex-wrap items-center gap-2"><span className="font-semibold">{r.rating}/5 · {r.reviewer_name}</span><span className={pill}>{r.status}</span></div><p className="mt-1 text-xs text-ink/40">For {mentorNames[r.mentor_id] || "mentor"} · {date(r.created_at)}</p>{r.comment && <p className="mt-3 text-sm leading-6 text-ink/70">“{r.comment}”</p>}</div><div className="flex flex-wrap gap-2">{r.status !== "published" && <button disabled={busy === `review:${r.id}`} onClick={() => update("review",r.id,"published")} className="inline-flex items-center gap-1.5 rounded-sm bg-amber px-3 py-2 text-xs font-semibold"><CheckCircle2 size={13}/> Publish</button>}{r.status !== "rejected" && <button disabled={busy === `review:${r.id}`} onClick={() => update("review",r.id,"rejected")} className="inline-flex items-center gap-1.5 border border-red-200 px-3 py-2 text-xs font-semibold text-red-700"><XCircle size={13}/> Reject</button>}</div></div></article>)}</div></Panel>}

    {tab === "bookings" && <Panel title="Booking monitor" eyebrow="BOOKINGS"><Filters search={bookingSearch} setSearch={setBookingSearch} placeholder="Search bookings…" status={bookingStatus} setStatus={setBookingStatus} statuses={["requested","confirmed","completed","cancelled"]} sort={bookingSort} setSort={setBookingSort}/><p className="mb-4 text-xs text-ink/40">Showing {filteredBookings.length} of {data.bookings.length} bookings</p><div className="space-y-3">{filteredBookings.length === 0 ? <Empty text="No bookings match these filters."/> : filteredBookings.map((b) => <article key={b.id} className="rounded-sm border border-ink/10 bg-paper p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><div className="flex flex-wrap items-center gap-2"><span className="font-semibold">{mentorNames[b.mentor_id] || "Mentor"}</span><span className={pill}>{b.status}</span></div><p className="mt-2 text-xs text-ink/50">{b.scheduled_for ? date(b.scheduled_for) : "Time not set"} · {b.duration_minutes} minutes</p><p className="mt-1 text-[11px] text-ink/35">Mentee account: {b.mentee_user_id}</p></div><div className="flex flex-wrap gap-2">{b.status === "requested" && <button disabled={busy === `booking:${b.id}`} onClick={() => update("booking",b.id,"confirmed")} className="rounded-sm bg-amber px-3 py-2 text-xs font-semibold">Confirm</button>}{b.status === "confirmed" && <button disabled={busy === `booking:${b.id}`} onClick={() => update("booking",b.id,"completed")} className="rounded-sm bg-amber px-3 py-2 text-xs font-semibold">Mark completed</button>}{["requested","confirmed"].includes(b.status) && <button disabled={busy === `booking:${b.id}`} onClick={() => update("booking",b.id,"cancelled")} className="border border-red-200 px-3 py-2 text-xs font-semibold text-red-700">Cancel</button>}</div></div></article>)}</div></Panel>}

    {tab === "mentees" && <Panel title="Mentee workspace" eyebrow="MENTEES"><Filters search={menteeSearch} setSearch={setMenteeSearch} placeholder="Search mentees…" status={menteeStatus} setStatus={setMenteeStatus} statuses={["unmatched","matched","called"]} sort={menteeSort} setSort={setMenteeSort}/><p className="mb-4 text-xs text-ink/40">Showing {filteredMentees.length} of {data.mentees.length} mentees</p><div className="space-y-3">{filteredMentees.length === 0 ? <Empty text="No mentees match these filters."/> : filteredMentees.map((m) => <article key={m.id} className="rounded-sm border border-ink/10 bg-paper p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div className="max-w-3xl"><div className="flex flex-wrap items-center gap-2"><span className="font-semibold">{m.name}</span><span className={pill}>{m.status}</span></div><p className="mt-1 text-xs text-ink/40">{m.email} · joined {date(m.created_at)}</p>{m.situation && <p className="mt-3 text-sm leading-6 text-ink/70">{m.situation}</p>}{m.stuck_on && <p className="mt-2 text-xs leading-5 text-ink/50">Stuck on: {m.stuck_on}</p>}{m.matched_mentor_id && <p className="mt-1 text-xs text-ink/40">Matched mentor: {mentorNames[m.matched_mentor_id] || m.matched_mentor_id}</p>}</div><div className="flex flex-wrap gap-2">{m.status !== "unmatched" && <button disabled={busy === `mentee:${m.id}`} onClick={() => update("mentee",m.id,"unmatched")} className="border border-ink/15 px-3 py-2 text-xs font-semibold">Unmatched</button>}{m.status !== "matched" && <button disabled={busy === `mentee:${m.id}`} onClick={() => update("mentee",m.id,"matched")} className="rounded-sm bg-amber px-3 py-2 text-xs font-semibold">Matched</button>}{m.status !== "called" && <button disabled={busy === `mentee:${m.id}`} onClick={() => update("mentee",m.id,"called")} className="border border-ink/15 px-3 py-2 text-xs font-semibold">Called</button>}</div></div></article>)}</div></Panel>}

    {tab === "other" && <Panel title="Other data" eyebrow="READ ONLY"><p className="max-w-2xl text-sm leading-6 text-ink/60">Full records for these tables are viewable in the Supabase dashboard Table Editor.</p><div className="mt-5 space-y-3">{([ ["career_goals", data.otherCounts.career_goals], ["ai_conversations", data.otherCounts.ai_conversations], ["conversation_actions", data.otherCounts.conversation_actions] ] as [string, number][]).map(([name,count]) => <div key={name} className="flex items-center justify-between rounded-sm border border-ink/10 bg-paper p-4"><span className="font-mono text-xs text-ink/65">{name}</span><strong className="font-display text-2xl">{count}</strong></div>)}</div></Panel>}
  </div></main>;
}

function Filters({ search, setSearch, placeholder, status, setStatus, statuses, sort, setSort }: { search: string; setSearch: (value: string) => void; placeholder: string; status: string; setStatus: (value: string) => void; statuses: string[]; sort: SortOrder; setSort: (value: SortOrder) => void }) {
  return <div className="mb-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_160px]"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={placeholder} className="w-full rounded-sm border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-board focus:ring-2 focus:ring-board/15"/><select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-sm border border-ink/15 bg-white px-3 py-2.5 text-sm"><option value="all">All statuses</option>{statuses.map((value) => <option key={value} value={value}>{value.charAt(0).toUpperCase() + value.slice(1)}</option>)}</select><select value={sort} onChange={(event) => setSort(event.target.value as SortOrder)} className="rounded-sm border border-ink/15 bg-white px-3 py-2.5 text-sm"><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></div>;
}

function MentorReviewCard({ mentor, documents, assessment, busy, onUpdate }: { mentor: Mentor; documents: MentorDocument[]; assessment?: Assessment; busy: boolean; onUpdate: (resource: "mentor" | "review" | "booking" | "mentee", id: string, status: string, verification_status?: string) => void }) {
  const profile = assessment?.extracted_profile;
  const checks = assessment?.consistency_checks || [];
  const seriousChecks = checks.filter((item) => item.severity.toLowerCase() === "high");
  return <article className="rounded-sm border border-ink/10 bg-paper p-5 sm:p-6"><div className="flex flex-col gap-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{mentor.name}</h3><span className={pill}>{mentor.status}</span>{mentor.verification_status === "verified" && <span className="inline-flex items-center gap-1 text-xs text-board"><ShieldCheck size={13}/> identity verified</span>}</div><p className="mt-1 text-sm text-ink/60">{mentor.headline || mentor.role || "Mentor"}{mentor.company ? ` · ${mentor.company}` : ""}{mentor.location ? ` · ${mentor.location}` : ""}</p><p className="mt-2 text-xs text-ink/40">{mentor.email} · joined {date(mentor.created_at)}</p></div><div className="flex flex-wrap gap-2">{mentor.status !== "approved" && <button disabled={busy} onClick={() => onUpdate("mentor",mentor.id,"approved")} className="inline-flex items-center gap-1.5 rounded-sm bg-amber px-3 py-2 text-xs font-semibold"><CheckCircle2 size={13}/> Approve</button>}{mentor.status !== "paused" && <button disabled={busy} onClick={() => onUpdate("mentor",mentor.id,"paused")} className="inline-flex items-center gap-1.5 border border-ink/15 px-3 py-2 text-xs font-semibold"><XCircle size={13}/> Hold / pause</button>}{mentor.status === "approved" && <Link href={`/mentors/${mentor.id}`} target="_blank" className="inline-flex items-center gap-1.5 border border-ink/15 px-3 py-2 text-xs font-semibold"><ExternalLink size={13}/> Profile</Link>}</div></div><div className="grid gap-3 sm:grid-cols-3"><EvidenceStat icon={<FileText size={15}/>} label="Evidence" value={documents.length ? `${documents.length} file${documents.length === 1 ? "" : "s"}` : "Not submitted"}/><EvidenceStat icon={<Sparkles size={15}/>} label="AI review" value={assessment ? `${assessment.readiness_score}/100 · ${assessment.status}` : "Not run"}/><EvidenceStat icon={<FileCheck2 size={15}/>} label="Readiness" value={assessment?.readiness_label || "Awaiting analysis"}/></div>{documents.length > 0 && <div className="flex flex-wrap gap-2">{documents.map((document) => <span key={document.id} className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-white px-3 py-1.5 text-xs text-ink/60"><FileText size={13}/> {document.document_type === "resume" ? "Resume" : "Certification"}: {document.file_name}</span>)}</div>}{assessment && <div className="grid gap-4 lg:grid-cols-2"><div className="rounded-sm border border-ink/10 bg-white p-4"><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-board/60">EXTRACTED PROFILE</p>{profile?.headline && <p className="mt-2 text-sm font-medium">{profile.headline}</p>}<div className="mt-3 flex flex-wrap gap-2">{(profile?.skills || []).slice(0,12).map((skill) => <span key={skill} className="rounded-full bg-board/10 px-2.5 py-1 text-xs text-board">{skill}</span>)}</div><p className="mt-3 text-xs leading-5 text-ink/50">Roles: {(profile?.roles || []).join(", ") || "Not clearly extracted"}</p><p className="mt-1 text-xs leading-5 text-ink/50">Industries: {(profile?.industries || []).join(", ") || "Not clearly extracted"}</p><p className="mt-1 text-xs leading-5 text-ink/50">Certifications: {(profile?.certifications || []).join(", ") || "Not clearly extracted"}</p></div><div className="rounded-sm border border-ink/10 bg-white p-4"><div className="flex items-center justify-between gap-3"><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-board/60">CONSISTENCY QUESTIONS</p><span className="text-xs text-ink/40">{checks.length} surfaced</span></div>{checks.length ? <div className="mt-3 space-y-2">{checks.slice(0,4).map((check, index) => <div key={`${check.field}-${index}`} className="rounded-sm bg-paper p-3"><p className="text-xs font-semibold">{check.field} · {check.severity}</p><p className="mt-1 text-xs leading-5 text-ink/55">{check.finding}</p></div>)}</div> : <p className="mt-3 text-sm text-board">No consistency questions surfaced.</p>}{seriousChecks.length > 0 && <p className="mt-3 text-xs font-medium text-ink/60">Human review is recommended before relying on these claims.</p>}</div></div>}{/* AI review remains advisory; identity verification is separate. */}<div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-4"><p className="max-w-2xl text-xs leading-5 text-ink/45">AI evidence review is advisory. It does not establish identity, fraud, employment, or the truth of a claim. Identity verification remains a separate admin decision.</p><Link href="/mentor/evidence" className="text-xs font-semibold text-board">Evidence workflow →</Link></div></div></article>;
}

function Stat({ label, value }: { label: string; value: number }) { return <div className="rounded-sm border border-ink/10 bg-white p-5 pin-shadow"><p className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink/45">{label}</p><p className="mt-2 font-display text-3xl">{value}</p></div>; }
function Panel({ title, eyebrow, children }: { title: string; eyebrow: string; children: ReactNode }) { return <section className="mt-7 rounded-sm border border-ink/10 bg-white p-6 pin-shadow sm:p-7"><p className="font-mono text-xs uppercase tracking-[0.15em] text-board/60">{eyebrow}</p><h2 className="mt-2 font-display text-2xl">{title}</h2><div className="mt-6">{children}</div></section>; }
function Empty({ text }: { text: string }) { return <div className="rounded-sm border border-dashed border-ink/15 bg-paper p-8 text-center text-sm text-ink/55">{text}</div>; }
function QueueRow({ title, detail, action, onClick }: { title: string; detail: string; action: string; onClick: () => void }) { return <div className="flex items-center justify-between gap-4 rounded-sm border border-ink/10 bg-paper p-4"><div><p className="text-sm font-semibold">{title}</p><p className="mt-1 text-xs text-ink/50">{detail}</p></div><button onClick={onClick} className="text-xs font-semibold text-board">{action} →</button></div>; }
function Health({ label, value, detail }: { label: string; value: number; detail?: string }) { return <div className="flex items-center justify-between border-b border-ink/10 pb-3"><span className="text-ink/60">{label}{detail ? ` (${detail})` : ""}</span><strong>{value}</strong></div>; }
function EvidenceStat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) { return <div className="rounded-sm border border-ink/10 bg-white p-3"><div className="flex items-center gap-2 text-board"><span>{icon}</span><span className="font-mono text-[10px] uppercase tracking-[0.13em] text-ink/45">{label}</span></div><p className="mt-2 text-sm font-semibold">{value}</p></div>; }
