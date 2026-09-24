import { NextResponse } from "next/server";
export const runtime = "nodejs";

type PublicIntelligenceRow = { mentor_id: string; ai_skills: string[] | null; ai_roles: string[] | null; ai_industries: string[] | null; ai_certifications: string[] | null; ai_profile_available: boolean | null };

export async function GET() {
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) return NextResponse.json({ intelligence: [] });
    const client = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await client
      .from("mentors_public")
      .select("id,ai_skills,ai_roles,ai_industries,ai_certifications,ai_profile_available");

    if (error) {
      console.error("Public mentor intelligence query error", { message: error.message });
      return NextResponse.json({ intelligence: [] });
    }
    const intelligence = ((data || []) as Array<Omit<PublicIntelligenceRow, "mentor_id"> & { id: string }>).map((mentor) => ({ mentorId: mentor.id, skills: mentor.ai_skills || [], roles: mentor.ai_roles || [], industries: mentor.ai_industries || [], certifications: mentor.ai_certifications || [], aiProfileAvailable: Boolean(mentor.ai_profile_available) }));

    return NextResponse.json(
      { intelligence },
      { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300" } }
    );
  } catch (error) {
    console.error("Public mentor intelligence error", error);
    return NextResponse.json({ intelligence: [] });
  }
}
