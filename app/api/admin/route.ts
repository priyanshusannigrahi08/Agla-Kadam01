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

  const [{ data: mentors, error: mentorsError }, { data: reviews, error: reviewsError }, { data: bookings, error: bookingsError }] = await Promise.all([
    admin.from("mentors").select("*").order("created_at", { ascending: false }),
    admin.from("reviews").select("*").order("created_at", { ascending: false }),
    admin.from("bookings").select("*").order("created_at", { ascending: false }),
  ]);

  if (mentorsError || reviewsError || bookingsError) {
    console.error("Admin data query error", mentorsError || reviewsError || bookingsError);
    return jsonError("Could not load admin data.", 500);
  }

  const mentorIds = ((mentors || []) as MentorIdRow[]).map((mentor) => mentor.id);
  let documents: unknown[] = [];
  let assessments: unknown[] = [];

  if (mentorIds.length > 0) {
    const [{ data: documentRows }, { data: assessmentRows }] = await Promise.all([
      admin.from("mentor_documents").select("*").in("mentor_id", mentorIds).order("created_at", { ascending: false }),
      admin.from("mentor_ai_assessments").select("*").in("mentor_id", mentorIds).order("created_at", { ascending: false }),
    ]);
    documents = (documentRows || []) as unknown[];
    assessments = (assessmentRows || []) as unknown[];
  }

  return NextResponse.json({ mentors: mentors || [], reviews: reviews || [], bookings: bookings || [], documents, assessments });
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

  const { entity, id, status, verification_status } = body;
  if (!entity || !id) return jsonError("Entity and id are required.", 400);

  if (entity === "mentor") {
    if (verification_status && ["unverified", "pending", "verified", "rejected"].includes(verification_status)) {
      const { error } = await (admin.from("mentors") as any).update({ verification_status }).eq("id", id);
      if (error) return jsonError("Could not update mentor verification.", 500);
      return NextResponse.json({ ok: true });
    }
    if (!status || !["pending", "approved", "rejected"].includes(status)) return jsonError("Invalid mentor status.", 400);
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

  return jsonError("Unknown entity.", 400);
}
