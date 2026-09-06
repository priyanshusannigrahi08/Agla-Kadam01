"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, FileText, Loader2, ShieldCheck, Sparkles, Trash2, UploadCloud } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const MAX_BYTES = 8 * 1024 * 1024;
const ACCEPT = ".pdf,.jpg,.jpeg,.png,.webp";
type Doc = { id: string; document_type: "resume" | "certification"; file_name: string; file_size: number; created_at: string };
type Assessment = { readiness_score: number; readiness_label: string; extracted_profile: { roles: string[]; industries: string[]; skills: string[]; certifications: string[]; years_experience: number | null; headline: string }; consistency_checks: { field: string; severity: string; finding: string }[]; strengths: string[]; improvements: string[] };

export default function MentorEvidencePage() {
  const [mentorId, setMentorId] = useState<string | null>(null);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.replace("/auth?next=/mentor/evidence"); return; }
    const { data: mentor } = await supabase.from("mentors").select("id").eq("user_id", user.id).maybeSingle();
    if (!mentor) { setLoading(false); return; }
    setMentorId(mentor.id);
    const { data: documents } = await supabase.from("mentor_documents").select("id,document_type,file_name,file_size,created_at").eq("mentor_id", mentor.id).order("created_at", { ascending: false });
    setDocs((documents || []) as Doc[]);
    const { data: latest } = await supabase.from("mentor_ai_assessments").select("readiness_score,readiness_label,extracted_profile,consistency_checks,strengths,improvements").eq("mentor_id", mentor.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (latest) setAssessment(latest as Assessment);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const hasResume = useMemo(() => docs.some((d) => d.document_type === "resume"), [docs]);

  async function upload(file: File, type: "resume" | "certification") {
    if (!mentorId) return;
    setError(""); setMessage("");
    if (file.size > MAX_BYTES) { setError("Each file must be 8 MB or smaller."); return; }
    if (!/^(application\/pdf|image\/(jpeg|png|webp))$/.test(file.type)) { setError("Use PDF, JPG, PNG or WebP files."); return; }
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in again.");
      const safe = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").slice(-120);
      const path = `${user.id}/${crypto.randomUUID()}-${safe}`;
      const { error: uploadError } = await supabase.storage.from("mentor-evidence").upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) throw new Error("The file could not be uploaded. Make sure the evidence storage SQL has been run.");
      const { error: insertError } = await supabase.from("mentor_documents").insert({ mentor_id: mentorId, user_id: user.id, document_type: type, file_name: file.name.slice(0, 240), storage_path: path, mime_type: file.type, file_size: file.size });
      if (insertError) { await supabase.storage.from("mentor-evidence").remove([path]); throw new Error("The document record could not be saved."); }
      setMessage(type === "resume" ? "Resume added." : "Certification added.");
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Upload failed."); } finally { setUploading(false); }
  }

  async function remove(doc: Doc) {
    if (!mentorId) return;
    setError(""); setMessage("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: row } = await supabase.from("mentor_documents").select("storage_path").eq("id", doc.id).eq("mentor_id", mentorId).maybeSingle();
    if (row?.storage_path) await supabase.storage.from("mentor-evidence").remove([row.storage_path]);
    const { error: deleteError } = await supabase.from("mentor_documents").delete().eq("id", doc.id).eq("mentor_id", mentorId);
    if (deleteError) setError("We couldn't remove that document."); else { setMessage("Document removed."); await load(); }
  }

  async function analyze() {
    if (!mentorId || !docs.length) return;
    setAnalyzing(true); setError(""); setMessage("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Please sign in again.");
      const response = await fetch("/api/mentor-ai/analyze", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ mentorId }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "The AI review could not be completed.");
      setAssessment(data.assessment as Assessment);
      setMessage("AI review complete. Treat the result as an advisory profile review, not a truth or identity check.");
    } catch (e) { setError(e instanceof Error ? e.message : "Analysis failed."); } finally { setAnalyzing(false); }
  }

  if (loading) return <main className="min-h-screen bg-paper px-6 py-24 text-center text-ink/60">Loading evidence workspace…</main>;
  if (!mentorId) return <main className="min-h-screen bg-paper px-6 py-24 text-center"><h1 className="font-display text-3xl">Create your mentor profile first.</h1><Link href="/mentor" className="mt-6 inline-flex rounded-sm bg-amber px-5 py-2.5 font-semibold">Go to mentor application</Link></main>;

  return <main className="min-h-screen bg-paper text-ink"><div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
    <Link href="/mentor/dashboard" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-board/60 hover:text-board"><ArrowLeft size={14}/> Mentor workspace</Link>
    <header className="mt-8 max-w-3xl"><div className="inline-flex items-center gap-2 rounded-full bg-board/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-board"><Sparkles size={13}/> AI profile intelligence</div><h1 className="mt-4 font-display text-4xl sm:text-5xl">Give your experience more context.</h1><p className="mt-4 text-base leading-7 text-ink/60">Upload a resume and relevant certifications. AglaKadam will extract skills and experience, compare them with your profile, and surface questions for human review.</p></header>

    <section className="mt-8 grid gap-4 sm:grid-cols-3"><Info icon={<ShieldCheck size={18}/>} title="Advisory" text="AI highlights evidence and questions. It does not certify identity or decide whether a claim is true."/><Info icon={<FileText size={18}/>} title="Private" text="Documents stay in a private storage bucket and are only accessible to your account and the platform's review process."/><Info icon={<CheckCircle2 size={18}/>} title="Useful" text="Extracted skills can later power matching, search and recommendations."/></section>

    <section className="mt-7 rounded-sm border border-ink/10 bg-white p-6 pin-shadow sm:p-8"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-board/60">01 / Evidence</p><h2 className="mt-2 font-display text-2xl">Resume & certifications</h2><p className="mt-2 text-sm text-ink/50">PDF, JPG, PNG or WebP · up to 8 MB per file · up to 6 files in the AI review.</p></div><label className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-sm bg-amber px-4 py-2.5 text-sm font-semibold ${uploading ? "pointer-events-none opacity-60" : ""}`}><UploadCloud size={16}/> Add certification<input type="file" accept={ACCEPT} className="sr-only" disabled={uploading} onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f, "certification"); e.currentTarget.value = ""; }}/></label></div>
      <div className="mt-6 rounded-sm border border-dashed border-ink/20 bg-paper p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">{hasResume ? "Resume uploaded" : "Add your resume"}</p><p className="mt-1 text-xs text-ink/50">A current resume gives the AI the strongest context for roles, skills and experience.</p></div><label className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-sm border border-ink/15 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-ink/5 ${uploading ? "pointer-events-none opacity-60" : ""}`}><UploadCloud size={15}/> {hasResume ? "Replace / add resume" : "Upload resume"}<input type="file" accept={ACCEPT} className="sr-only" disabled={uploading} onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f, "resume"); e.currentTarget.value = ""; }}/></label></div></div>
      {docs.length > 0 ? <div className="mt-4 space-y-2">{docs.map((doc) => <div key={doc.id} className="flex items-center justify-between gap-3 rounded-sm border border-ink/10 bg-paper px-4 py-3"><div className="flex min-w-0 items-center gap-3"><FileText size={17} className="shrink-0 text-board"/><div className="min-w-0"><p className="truncate text-sm font-medium">{doc.file_name}</p><p className="text-xs text-ink/40">{doc.document_type === "resume" ? "Resume" : "Certification"} · {(doc.file_size / 1024 / 1024).toFixed(1)} MB</p></div></div><button type="button" onClick={() => remove(doc)} className="shrink-0 rounded-sm p-2 text-ink/40 hover:bg-red-50 hover:text-red-700" aria-label={`Remove ${doc.file_name}`}><Trash2 size={15}/></button></div>)}</div> : <p className="mt-5 text-sm text-ink/45">No evidence uploaded yet.</p>}
      {error && <p className="mt-5 rounded-sm bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}{message && <p className="mt-5 rounded-sm bg-board/10 p-3 text-sm text-board" role="status">{message}</p>}
      <div className="mt-6 flex flex-col gap-3 border-t border-ink/10 pt-6 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs leading-5 text-ink/45">The AI review compares documents with information you provided. It can surface inconsistencies for an admin to review, but it cannot independently verify identity or employment.</p><button type="button" onClick={analyze} disabled={!docs.length || analyzing || uploading} className="inline-flex items-center justify-center gap-2 rounded-sm bg-board px-5 py-3 text-sm font-semibold text-chalk disabled:cursor-not-allowed disabled:opacity-50">{analyzing ? <><Loader2 size={16} className="animate-spin"/> Analyzing evidence…</> : <><Sparkles size={16}/> Analyze my profile</>}</button></div>
    </section>

    {assessment && <section className="mt-7 rounded-sm border border-ink/10 bg-white p-6 pin-shadow sm:p-8"><div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-board/60">02 / AI assessment</p><h2 className="mt-2 font-display text-2xl">{assessment.readiness_label}</h2><p className="mt-2 text-sm text-ink/50">Mentoring readiness is an advisory signal based on profile clarity and available evidence.</p></div><div className="shrink-0"><span className="font-display text-4xl">{assessment.readiness_score}</span><span className="text-sm text-ink/40"> / 100</span></div></div><div className="mt-6 h-2 rounded-full bg-ink/10"><div className="h-full rounded-full bg-board" style={{ width: `${assessment.readiness_score}%` }}/></div><div className="mt-7 grid gap-7 lg:grid-cols-2"><Panel title="Skills & experience"><div className="flex flex-wrap gap-2">{(assessment.extracted_profile.skills || []).map((skill) => <span key={skill} className="rounded-full bg-board/10 px-3 py-1.5 text-xs text-board">{skill}</span>)}</div><p className="mt-4 text-sm text-ink/60">Roles: {(assessment.extracted_profile.roles || []).join(", ") || "Not clearly extracted"}</p><p className="mt-2 text-sm text-ink/60">Industries: {(assessment.extracted_profile.industries || []).join(", ") || "Not clearly extracted"}</p></Panel><Panel title="Strengths">{assessment.strengths.length ? <ul className="space-y-2 text-sm leading-6 text-ink/60">{assessment.strengths.map((x) => <li key={x}>• {x}</li>)}</ul> : <p className="text-sm text-ink/45">No strengths extracted yet.</p>}</Panel><Panel title="Consistency questions"><div className="space-y-3">{assessment.consistency_checks.length ? assessment.consistency_checks.map((item, i) => <div key={`${item.field}-${i}`} className="rounded-sm border border-ink/10 bg-paper p-3"><p className="text-xs font-semibold">{item.field} · {item.severity}</p><p className="mt-1 text-sm leading-5 text-ink/60">{item.finding}</p></div>) : <p className="text-sm text-board">No consistency questions were surfaced.</p>}</div></Panel><Panel title="Suggested improvements">{assessment.improvements.length ? <ul className="space-y-2 text-sm leading-6 text-ink/60">{assessment.improvements.map((x) => <li key={x}>• {x}</li>)}</ul> : <p className="text-sm text-ink/45">No improvements suggested.</p>}</Panel></div></section>}
  </div></main>;
}

function Info({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) { return <div className="rounded-sm border border-ink/10 bg-white p-4"><div className="flex items-center gap-2 text-board">{icon}<span className="font-semibold text-ink">{title}</span></div><p className="mt-2 text-xs leading-5 text-ink/50">{text}</p></div>; }
function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <div className="rounded-sm border border-ink/10 bg-paper p-4"><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-board/60">{title}</p><div className="mt-3">{children}</div></div>; }
