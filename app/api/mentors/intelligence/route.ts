import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

type MentorIdRow = { id: string };
type AssessmentRow = { mentor_id: string; extracted_profile: unknown; status: string; created_at: string };

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

    const { data: assessments, error: assessmentsError } = await admin
      .from("mentor_ai_assessments")
      .select("mentor_id,extracted_profile,status,created_at")
      .in("mentor_id", ids)
      .eq("status", "completed")
      .order("created_at", { ascending: false });

    if (assessmentsError) {
      console.error("Public mentor intelligence query error", assessmentsError);
      return NextResponse.json({ intelligence: [] });
    }

    const latest = new Map<string, AssessmentRow>();
    for (const assessment of (assessments || []) as AssessmentRow[]) {
      if (!latest.has(assessment.mentor_id)) latest.set(assessment.mentor_id, assessment);
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
