import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { supabase } from "@/lib/supabaseClient";

export const runtime = "nodejs";

const MAX_FILES = 6;
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);

type DocumentRow = { id: string; mentor_id: string; user_id: string; document_type: string; file_name: string; storage_path: string; mime_type: string; file_size: number };

function extractJson(text: string) {
  const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
  try { return JSON.parse(cleaned); } catch { return null; }
}

function normalizeAssessment(value: any, model: string) {
  const score = Math.max(0, Math.min(100, Math.round(Number(value?.readiness_score) || 0)));
  const label = score >= 80 ? "Strong readiness" : score >= 60 ? "Good foundation" : "Needs more evidence";
  const arr = (v: unknown, max = 5) => Array.isArray(v) ? v.filter((x) => typeof x === "string").map((x) => x.trim()).filter(Boolean).slice(0, max) : [];
  return {
    extracted_profile: {
      headline: typeof value?.extracted_profile?.headline === "string" ? value.extracted_profile.headline.slice(0, 240) : "",
      roles: arr(value?.extracted_profile?.roles, 8),
      industries: arr(value?.extracted_profile?.industries, 8),
      skills: arr(value?.extracted_profile?.skills, 15),
      certifications: arr(value?.extracted_profile?.certifications, 10),
      years_experience: Number.isFinite(Number(value?.extracted_profile?.years_experience)) ? Math.max(0, Math.min(60, Number(value.extracted_profile.years_experience))) : null,
    },
    consistency_checks: Array.isArray(value?.consistency_checks) ? value.consistency_checks.slice(0, 10).map((item: any) => ({ field: String(item?.field || "General").slice(0, 100), severity: ["low", "medium", "high"].includes(item?.severity) ? item.severity : "low", finding: String(item?.finding || "").slice(0, 500) })).filter((x: any) => x.finding) : [],
    readiness_score: score,
    readiness_label: label,
    strengths: arr(value?.strengths),
    improvements: arr(value?.improvements),
    status: "completed",
    model,
  };
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: "Your session is no longer valid." }, { status: 401 });

    const body = await request.json();
    const mentorId = String(body?.mentorId || "");
    if (!mentorId) return NextResponse.json({ error: "Mentor profile is required." }, { status: 400 });

    const admin = getSupabaseAdmin() as any;
    const { data: mentor, error: mentorError } = await admin.from("mentors").select("id,user_id,name,expertise,experience,journey,why_mentor,linkedin").eq("id", mentorId).maybeSingle();
    if (mentorError || !mentor || mentor.user_id !== user.id) return NextResponse.json({ error: "Mentor profile not found." }, { status: 404 });

    const { data: docs, error: docsError } = await admin.from("mentor_documents").select("id,mentor_id,user_id,document_type,file_name,storage_path,mime_type,file_size").eq("mentor_id", mentorId).eq("user_id", user.id).order("created_at", { ascending: true }).limit(MAX_FILES);
    if (docsError) return NextResponse.json({ error: "Could not load mentor evidence." }, { status: 500 });
    const documents = (docs || []) as DocumentRow[];
    if (!documents.length) return NextResponse.json({ error: "Upload a resume or certification before analysis." }, { status: 400 });
    if (documents.some((doc) => doc.file_size > MAX_FILE_BYTES || !ALLOWED_TYPES.has(doc.mime_type))) return NextResponse.json({ error: "One of the uploaded files is unsupported or too large." }, { status: 400 });
    if (!process.env.GEMINI_API_KEY) return NextResponse.json({ error: "AI service is not configured." }, { status: 500 });

    const fileParts: any[] = [];
    for (const doc of documents) {
      const { data, error } = await admin.storage.from("mentor-evidence").download(doc.storage_path);
      if (error || !data) continue;
      const bytes = new Uint8Array(await data.arrayBuffer());
      fileParts.push({ inline_data: { mime_type: doc.mime_type, data: Buffer.from(bytes).toString("base64") } });
    }
    if (!fileParts.length) return NextResponse.json({ error: "The uploaded evidence could not be read." }, { status: 400 });

    const model = "gemini-flash-latest";
    const prompt = `You are the evidence-review assistant for AglaKadam. Review the attached mentor documents alongside the mentor's self-reported profile. Do not decide whether a person is truthful or fraudulent. Instead, identify evidence-supported facts, missing evidence, and consistency questions that an admin should review. Never infer sensitive traits. Do not treat a resume or certificate as proof of identity. Return ONLY valid JSON with this shape: {"extracted_profile":{"headline":"","roles":[],"industries":[],"skills":[],"certifications":[],"years_experience":null},"consistency_checks":[{"field":"","severity":"low|medium|high","finding":""}],"readiness_score":0,"strengths":[],"improvements":[]}. Score mentoring readiness, not personal worth: consider clarity of experience, evidence of relevant expertise, coherent career story, useful skills/certifications, and how well the profile explains what the mentor can help with. The score is advisory for admin review. Resume/profile: ${JSON.stringify({ name: mentor.name, expertise: mentor.expertise, experience: mentor.experience, journey: mentor.journey, why_mentor: mentor.why_mentor, linkedin: mentor.linkedin })}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY.trim())}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ system_instruction: { parts: [{ text: "Be conservative, factual and privacy-aware. Distinguish documented facts from claims. Do not make hiring, identity, legal or fraud determinations." }] }, contents: [{ role: "user", parts: [{ text: prompt }, ...fileParts] }] }) });
    const data = await response.json();
    if (!response.ok) { console.error("Gemini mentor analysis error", data); return NextResponse.json({ error: "The AI review could not be completed right now." }, { status: 502 }); }
    const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || "").join("") || "";
    const parsed = extractJson(text);
    if (!parsed) return NextResponse.json({ error: "The AI returned an unreadable assessment. Please try again." }, { status: 502 });
    const assessment = normalizeAssessment(parsed, model);
    const { data: saved, error: saveError } = await admin.from("mentor_ai_assessments").insert({ mentor_id: mentorId, document_ids: documents.map((d) => d.id), ...assessment }).select("id,mentor_id,document_ids,extracted_profile,consistency_checks,readiness_score,readiness_label,strengths,improvements,status,model,created_at").single();
    if (saveError) { console.error("Assessment save error", saveError); return NextResponse.json({ error: "The assessment was generated but could not be saved." }, { status: 500 }); }
    return NextResponse.json({ assessment: saved });
  } catch (error) {
    console.error("Mentor AI analysis route error", error);
    return NextResponse.json({ error: "Something went wrong during the AI review." }, { status: 500 });
  }
}
