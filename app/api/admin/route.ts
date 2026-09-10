import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

type AdminUpdate = Record<string, string>;
type MentorIdRow = { id: string };

type AdminClient = ReturnType<typeof getSupabaseAdmin>;

function adminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

async function getAdminUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7).trim();
  if (!token) return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const client = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user?.email) return null;

  return adminEmails().includes(data.user.email.toLowerCase()) ? data.user : null;
}

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: NextRequest) {
  const adminUser = await getAdminUser(request);
  if (!adminUser) return jsonError("Unauthorized.", 401);

  let admin: AdminClient;
  try {
    admin = getSupabaseAdmin();
  } catch (error) {
    console.error("Admin Supabase configuration error", error);
    return jsonError("Admin server configuration is incomplete. Check the Supabase server key in Vercel.", 500);
  }

  const [
    { data: mentors, error: mentorsError },
    { data: reviews, error: reviewsError },
    { data: bookings, error: bookingsError },
    { data: mentees, error: menteesError },
    { count: careerGoalsCount, error: careerGoalsError },
    { count: aiConversationsCount, error: aiConversationsError },
    { count: conversationActionsCount, error: conversationActionsError },
  ] = await Promise.all([
    admin.from("mentors").select("*").order("created_at", { ascending: false }),
    admin.from("reviews").select("*").order("created_at", { ascending: false }),
    admin.from("bookings").select("*").order("created_at", { ascending: false }),
    admin.from("mentees").select("*").order("created_at", { ascending: false }),
    admin.from("career_goals").select("*", { count: "exact", head: true }),
    admin.from("ai_conversations").select("*", { count: "exact", head: true }),
    admin.from("conversation_actions").select("*", { count: "exact", head: true }),
  ]);

  if (mentorsError || reviewsError || bookingsError || menteesError) {
    console.error("Admin data query error", mentorsError || reviewsError || bookingsError || menteesError);
    return jsonError("Could not load admin data.", 500);
  }

  if (careerGoalsError || aiConversationsError || conversationActionsError) {
    console.error("Admin other-data count query error", careerGoalsError || aiConversationsError || conversationActionsError);
    return jsonError("Could not load other data counts.", 500);
  }

  const mentorIds = ((mentors || []) as MentorIdRow[]).map((mentor) => mentor.id);
  let mentorDocuments: unknown[] = [];
  let mentorAssessments: unknown[] = [];

  if (mentorIds.length > 0) {
    const [{ data: documentRows, error: documentsError }, { data: assessmentRows, error: assessmentsError }] = await Promise.all([
      admin.from("mentor_documents").select("*").in("mentor_id", mentorIds).order("created_at", { ascending: false }),
      admin.from("mentor_ai_assessments").select("*").in("mentor_id", mentorIds).order("created_at", { ascending: false }),
    ]);

    if (documentsError || assessmentsError) {
      console.error("Admin mentor evidence query error", documentsError || assessmentsError);
      return jsonError("Could not load mentor evidence data.", 500);
    }

    mentorDocuments = (documentRows || []) as unknown[];
    mentorAssessments = (assessmentRows || []) as unknown[];
  }

  return NextResponse.json({
    mentors: mentors || [],
    reviews: reviews || [],
    bookings: bookings || [],
    mentees: mentees || [],
    mentorDocuments,
    mentorAssessments,
    otherCounts: {
      career_goals: careerGoalsCount || 0,
      ai_conversations: aiConversationsCount || 0,
      conversation_actions: conversationActionsCount || 0,
    },
    admin: { email: adminUser.email },
  });
}

export async function PATCH(request: NextRequest) {
  const adminUser = await getAdminUser(request);
  if (!adminUser) return jsonError("Unauthorized.", 401);

  let admin: AdminClient;
  try {
    admin = getSupabaseAdmin();
  } catch (error) {
    console.error("Admin Supabase configuration error", error);
    return jsonError("Admin server configuration is incomplete. Check the Supabase server key in Vercel.", 500);
  }

  let body: AdminUpdate;
  try {
    body = (await request.json()) as AdminUpdate;
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  const entity = body.entity || body.resource;
  const { id, status, verification_status } = body;
  if (!entity || !id) return jsonError("Entity and id are required.", 400);

  if (entity === "mentor") {
    if (verification_status && ["unverified", "pending", "verified", "rejected"].includes(verification_status)) {
      const { error } = await (admin.from("mentors") as any).update({ verification_status }).eq("id", id);
      if (error) return jsonError("Could not update mentor verification.", 500);
      return NextResponse.json({ ok: true });
    }
    if (!status || !["pending", "approved", "paused"].includes(status)) return jsonError("Invalid mentor status.", 400);
    const { error } = await (admin.from("mentors") as any).update({ status }).eq("id", id);
    if (error) return jsonError("Could not update mentor status.", 500);
    return NextResponse.json({ ok: true });
  }

  if (entity === "review") {
    if (!status || !["pending", "published", "rejected"].includes(status)) return jsonError("Invalid review status.", 400);
    const { error } = await (admin.from("reviews") as any).update({ status }).eq("id", id);
    if (error) return jsonError("Could not update review status.", 500);
    return NextResponse.json({ ok: true });
  }

  if (entity === "booking") {
    if (!status || !["requested", "confirmed", "completed", "cancelled"].includes(status)) return jsonError("Invalid booking status.", 400);
    const { error } = await (admin.from("bookings") as any).update({ status }).eq("id", id);
    if (error) return jsonError("Could not update booking status.", 500);
    return NextResponse.json({ ok: true });
  }

  if (entity === "mentee") {
    if (!status || !["unmatched", "matched", "called"].includes(status)) return jsonError("Invalid mentee status.", 400);
    const { error } = await (admin.from("mentees") as any).update({ status }).eq("id", id);
    if (error) return jsonError("Could not update mentee status.", 500);
    return NextResponse.json({ ok: true });
  }

  return jsonError("Unknown entity.", 400);
}
