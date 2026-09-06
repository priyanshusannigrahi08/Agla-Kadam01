import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

type MentorIdRow = { id: string };
type AssessmentRow = { mentor_id: string; extracted_profile: unknown; status: string; created_at: string };
type DocumentRow = { mentor_id: string; id: string };

function strings(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean).slice(0, 30)
    : [];
}

export async function GET() {
  try {
    const admin = getSupabaseAdmin();
    const { data: mentors, error: mentorsError } = await admin
      .from("mentors")
      .select("id")
      .eq("status", "approved");

    if (mentorsError) {
      console.error("Public mentor intelligence mentor query error", mentorsError);
      return NextResponse.json({ intelligence: [] });
    }

    const ids = ((mentors || []) as MentorIdRow[]).map((mentor) => mentor.id);
    if (ids.length === 0) return NextResponse.json({ intelligence: [] });

    const [{ data: assessments, error: assessmentsError }, { data: documents, error: documentsError }] = await Promise.all([
      admin
        .from("mentor_ai_assessments")
        .select("mentor_id,extracted_profile,status,created_at")
        .in("mentor_id", ids)
        .eq("status", "completed")
        .order("created_at", { ascending: false }),
      admin
        .from("mentor_documents")
        .select("mentor_id,id")
        .in("mentor_id", ids),
    ]);

    if (assessmentsError || documentsError) {
      console.error("Public mentor intelligence query error", assessmentsError || documentsError);
      return NextResponse.json({ intelligence: [] });
    }

    const latest = new Map<string, AssessmentRow>();
    for (const assessment of (assessments || []) as AssessmentRow[]) {
      if (!latest.has(assessment.mentor_id)) latest.set(assessment.mentor_id, assessment);
    }

    const evidenceCounts = new Map<string, number>();
    for (const document of (documents || []) as DocumentRow[]) {
      evidenceCounts.set(document.mentor_id, (evidenceCounts.get(document.mentor_id) || 0) + 1);
    }

    const intelligence = Array.from(latest.entries()).map(([mentorId, assessment]) => {
      const extracted = assessment.extracted_profile && typeof assessment.extracted_profile === "object"
        ? assessment.extracted_profile as Record<string, unknown>
        : {};
      return {
        mentorId,
        skills: strings(extracted.skills),
        roles: strings(extracted.roles),
        industries: strings(extracted.industries),
        certifications: strings(extracted.certifications),
        aiProfileAvailable: true,
        evidenceCount: evidenceCounts.get(mentorId) || 0,
      };
    });

    return NextResponse.json(
      { intelligence },
      { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300" } }
    );
  } catch (error) {
    console.error("Public mentor intelligence error", error);
    return NextResponse.json({ intelligence: [] });
  }
}
