import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const BOOKING_EVENTS = new Set([
  "BOOKING_CREATED",
  "BOOKING_REQUESTED",
  "BOOKING_RESCHEDULED",
  "BOOKING_CANCELLED",
]);

type Booking = {
  id: string;
  mentor_id: string;
  mentee_user_id: string;
  status: string;
  calcom_booking_uid: string | null;
};

type MentorLookup = { id: string };
type MenteeLookup = { user_id: string | null };

function verifySignature(rawBody: string, signature: string | null, secret: string) {
  if (!signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const received = signature.replace(/^sha256=/i, "").trim();
  if (!/^[a-f0-9]{64}$/i.test(received)) return false;
  const expectedBuffer = Buffer.from(expected, "hex");
  const receivedBuffer = Buffer.from(received, "hex");
  return expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer);
}

function asString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asBookingId(value: unknown) {
  if (typeof value === "number" && Number.isSafeInteger(value)) return value;
  if (typeof value === "string" && /^\d+$/.test(value)) {
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) ? parsed : null;
  }
  return null;
}

function getEventStatus(triggerEvent: string, providerStatus: string | null) {
  if (triggerEvent === "BOOKING_CANCELLED") return "cancelled";
  if (triggerEvent === "BOOKING_REQUESTED") return "requested";
  if (triggerEvent === "BOOKING_CREATED") return providerStatus?.toUpperCase() === "PENDING" ? "requested" : "confirmed";
  return providerStatus?.toUpperCase() === "CANCELLED" ? "cancelled" : "confirmed";
}

export async function POST(request: Request) {
  const secret = process.env.CALCOM_WEBHOOK_SECRET;
  if (!secret) {
    console.error("CALCOM_WEBHOOK_SECRET is not configured.");
    return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });
  }

  const rawBody = await request.text();
  if (!verifySignature(rawBody, request.headers.get("x-cal-signature-256"), secret)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });

  const record = body as Record<string, unknown>;
  const triggerEvent = asString(record.triggerEvent);
  if (!triggerEvent) return NextResponse.json({ error: "Missing triggerEvent." }, { status: 400 });
  if (!BOOKING_EVENTS.has(triggerEvent)) return NextResponse.json({ ok: true, ignored: true });

  const payload = record.payload && typeof record.payload === "object" ? record.payload as Record<string, unknown> : record;
  const uid = asString(payload.uid);
  const rescheduleUid = asString(payload.rescheduleUid);
  const bookingId = asBookingId(payload.bookingId);
  const startTime = asString(payload.startTime);
  const providerStatus = asString(payload.status);
  const eventType = asString(payload.type);
  const metadata = payload.metadata && typeof payload.metadata === "object" ? payload.metadata as Record<string, unknown> : {};
  const metadataBookingId = asString(metadata.aglakadam_booking_id) || asString(metadata.booking_id);
  const attendees = Array.isArray(payload.attendees) ? payload.attendees : [];
  const attendeeEmail = attendees.length && attendees[0] && typeof attendees[0] === "object"
    ? asString((attendees[0] as Record<string, unknown>).email)
    : null;
  const organizerEmail = payload.organizer && typeof payload.organizer === "object"
    ? asString((payload.organizer as Record<string, unknown>).email)
    : null;

  if (!uid && !rescheduleUid && !bookingId && !metadataBookingId) {
    return NextResponse.json({ error: "Missing Cal.com booking identifier." }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  let booking: Booking | null = null;

  if (metadataBookingId) {
    const { data } = await admin
      .from("bookings")
      .select("id,mentor_id,mentee_user_id,status,calcom_booking_uid")
      .eq("id", metadataBookingId)
      .limit(1);
    const rows = (data ?? []) as Booking[];
    booking = rows[0] ?? null;
  }

  for (const identifier of [uid, rescheduleUid]) {
    if (booking || !identifier) continue;
    const { data } = await admin
      .from("bookings")
      .select("id,mentor_id,mentee_user_id,status,calcom_booking_uid")
      .eq("calcom_booking_uid", identifier)
      .limit(1);
    const rows = (data ?? []) as Booking[];
    booking = rows[0] ?? null;
  }

  if (!booking && bookingId) {
    const { data } = await admin
      .from("bookings")
      .select("id,mentor_id,mentee_user_id,status,calcom_booking_uid")
      .eq("calcom_booking_id", bookingId)
      .limit(1);
    const rows = (data ?? []) as Booking[];
    booking = rows[0] ?? null;
  }

  if (!booking && ["BOOKING_CREATED", "BOOKING_REQUESTED"].includes(triggerEvent) && attendeeEmail && organizerEmail) {
    const { data: mentorData } = await admin.from("mentors").select("id").eq("email", organizerEmail).limit(2);
    const { data: menteeData } = await admin.from("mentees").select("user_id").eq("email", attendeeEmail).not("user_id", "is", null).limit(2);
    const mentors = (mentorData ?? []) as MentorLookup[];
    const mentees = (menteeData ?? []) as MenteeLookup[];

    if (mentors.length === 1 && mentees.length === 1 && mentees[0].user_id) {
      const { data: fallbackData } = await admin
        .from("bookings")
        .select("id,mentor_id,mentee_user_id,status,calcom_booking_uid")
        .eq("mentor_id", mentors[0].id)
        .eq("mentee_user_id", mentees[0].user_id)
        .in("status", ["requested", "confirmed"])
        .order("created_at", { ascending: false })
        .limit(2);
      const fallbackMatches = (fallbackData ?? []) as Booking[];
      if (fallbackMatches.length === 1) booking = fallbackMatches[0];
    }
  }

  if (!booking) return NextResponse.json({ ok: true, matched: false });

  const nextStatus = getEventStatus(triggerEvent, providerStatus);
  const update: Record<string, unknown> = {
    calcom_booking_uid: uid || booking.calcom_booking_uid,
    calcom_booking_id: bookingId,
    calcom_event_type: eventType,
    calcom_status: providerStatus,
    calcom_last_event: triggerEvent,
    calcom_last_event_at: new Date().toISOString(),
  };
  if (startTime) update.scheduled_for = startTime;
  if (!(booking.status === "completed" && nextStatus === "cancelled")) update.status = nextStatus;

  const { error: updateError } = await admin.from("bookings").update(update).eq("id", booking.id);
  if (updateError) {
    console.error("Cal.com webhook booking update failed.");
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, matched: true });
}
