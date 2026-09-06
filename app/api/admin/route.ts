import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

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

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

type AdminUpdate = Record<string, string>;
type MentorIdRow = { id: string };

export async function GET(request: NextRequest) {
  const user = await getAdminUser(request);
  if (!user) return jsonError("Admin access required.", 403);

  let admin: ReturnType<typeof getSupabaseAdmin>;
  try {
    admin = getSupabaseAdmin();
  } catch (error) {
    console.error("Admin Supabase configuration error", error);
    return jsonError("Admin server configuration is incomplete. Check the Supabase server key in Vercel.", 500);
  }

  const { data: mentors, error: mentorsError } = await admin
    .from("mentors")
    .select("id,name,email,headline,role,company,location,status,verification_status,created_at")
    .order("created_at", { ascending: false });
  if (mentorsError) {
    console.error("Admin mentors query error", mentorsError);
    return jsonError("Admin database error while loading mentors. Make sure the latest Supabase migrations have been run.", 500);
  }

  const { data: reviews, error: reviewsError } = await admin
    .from("reviews")
    .select("id,mentor_id,reviewer_name,rating,comment,status,created_at")
    .order("created_at", { ascending: false });
  if (reviewsError) {
    console.error("Admin reviews query error", reviewsError);
    return jsonError("Admin database error while loading reviews. Run the current Supabase migrations.", 500);
  }

  const { data: bookings, error: bookingsError } = await admin
    .from("bookings")
    .select("id,mentor_id,mentee_user_id,scheduled_for,duration_minutes,status,booking_url,created_at")
    .order("created_at", { ascending: false });
  if (bookingsError) {
    console.error("Admin bookings query error", bookingsError);
    return jsonError("Admin database error while loading bookings. Run the current Supabase migrations.", 500);
  }

  const mentorIds = ((mentors || []) as MentorIdRow[]).map((mentor) => mentor.id);
  let documents: unknown[] = [];
  let assessments: unknown[] = [];
  if (mentorIds.length > 0) {
    const [{ data: documentRows, error: documentsError }, { data: assessmentRows, error: assessmentsError }] = await Promise.all([
      admin.from("mentor_documents").select("id,mentor_id,document_type,file_name,mime_type,file_size,created_at").in("mentor_id", mentorIds).order("created_at", { ascending: false }),
      admin.from("mentor_ai_assessments").select("id,mentor_id,document_ids,extracted_profile,consistency_checks,readiness_score,readiness_label,strengths,improvements,status,model,created_at").in("mentor_id", mentorIds).order("created_at", { ascending: false }),
    ]);
    if (documentsError) {
      console.error("Admin mentor evidence query error", documentsError);
      return jsonError("Admin database error while loading mentor documents. Run the current mentor AI evidence migration.", 500);
    }
    if (assessmentsError) {
      console.error("Admin mentor AI assessment query error", assessmentsError);
      return jsonError("Admin database error while loading mentor AI assessments. Run the current mentor AI evidence migration.", 500);
    }
    documents = (documentRows || []) as unknown[];
    assessments = (assessmentRows || []) as unknown[];
  }

  return NextResponse.json({ mentors: mentors || [], reviews: reviews || [], bookings: bookings || [], documents, assessments });
}

export async function PATCH(request: NextRequest) {
  const user = await getAdminUser(request);
  if (!user) return jsonError("Admin access required.", 403);

  let admin: ReturnType<typeof getSupabaseAdmin>;
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

  const { entity, id, status, verification_status } = body;
  if (!entity || !id) return jsonError("Entity and id are required.", 400);

  if (entity === "mentor") {
    if (verification_status && ["unverified", "pending", "verified", "rejected"].includes(verification_status)) {
      const { error } = await admin.from("mentors").update({ verification_status }).eq("id", id);
      if (error) return jsonError("Could not update mentor verification.", 500);
      return NextResponse.json({ ok: true });
    }
    if (!status || !["pending", "approved", "rejected"].includes(status)) return jsonError("Invalid mentor status.", 400);
    const { error } = await admin.from("mentors").update({ status }).eq("id", id);
    if (error) return jsonError("Could not update mentor status.", 500);
    return NextResponse.json({ ok: true });
  }

  if (entity === "review") {
    if (!status || !["pending", "published", "rejected"].includes(status)) return jsonError("Invalid review status.", 400);
    const { error } = await admin.from("reviews").update({ status }).eq("id", id);
    if (error) return jsonError("Could not update review status.", 500);
    return NextResponse.json({ ok: true });
  }

  if (entity === "booking") {
    if (!status || !["requested", "confirmed", "completed", "cancelled"].includes(status)) return jsonError("Invalid booking status.", 400);
    const { error } = await admin.from("bookings").update({ status }).eq("id", id);
    if (error) return jsonError("Could not update booking status.", 500);
    return NextResponse.json({ ok: true });
  }

  return jsonError("Unknown entity.", 400);
}
