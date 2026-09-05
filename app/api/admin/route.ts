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

  return NextResponse.json({
    admin: { email: user.email },
    mentors: mentors || [],
    reviews: reviews || [],
    bookings: bookings || [],
  });
}

export async function PATCH(request: NextRequest) {
  const user = await getAdminUser(request);
  if (!user) return jsonError("Admin access required.", 403);

  let body: { resource?: unknown; id?: unknown; status?: unknown; verification_status?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  const resource = body.resource;
  const id = typeof body.id === "string" ? body.id : "";
  const status = typeof body.status === "string" ? body.status : "";
  if (!id) return jsonError("A record id is required.", 400);

  const admin = getSupabaseAdmin();

  if (resource === "mentor") {
    if (!["pending", "approved", "paused"].includes(status)) return jsonError("Invalid mentor status.", 400);
    const verification = typeof body.verification_status === "string" ? body.verification_status : undefined;
    if (verification !== undefined && !["pending", "verified", "unverified"].includes(verification)) return jsonError("Invalid verification status.", 400);
    const update: AdminUpdate = { status };
    if (verification !== undefined) update.verification_status = verification;
    const { error } = await admin.from("mentors").update(update as never).eq("id", id);
    if (error) return jsonError("Couldn't update mentor.", 500);
    return NextResponse.json({ ok: true });
  }

  if (resource === "review") {
    if (!["pending", "published", "rejected"].includes(status)) return jsonError("Invalid review status.", 400);
    const { error } = await admin.from("reviews").update({ status } as never).eq("id", id);
    if (error) return jsonError("Couldn't update review.", 500);
    return NextResponse.json({ ok: true });
  }

  if (resource === "booking") {
    if (!["requested", "confirmed", "cancelled", "completed"].includes(status)) return jsonError("Invalid booking status.", 400);
    const { error } = await admin.from("bookings").update({ status } as never).eq("id", id);
    if (error) return jsonError("Couldn't update booking.", 500);
    return NextResponse.json({ ok: true });
  }

  return jsonError("Unknown admin resource.", 400);
}
