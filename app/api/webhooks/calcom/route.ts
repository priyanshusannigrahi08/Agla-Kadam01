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
  const signature = request.headers.get("x-cal-signature-256");
  if (!verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const triggerEvent = asString(record.triggerEvent);
  if (!triggerEvent) return NextResponse.json({ error: "Missing triggerEvent." }, { status: 400 });

  if (!BOOKING_EVENTS.has(triggerEvent)) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const payload = record.payload && typeof record.payload === "object"
    ? record.payload as Record<string, unknown>
    : record;

  const uid = asString(payload.uid);
  const bookingId = asBookingId(payload.bookingId);
  const startTime = asString(payload.startTime);
  const providerStatus = asString(payload.status);
  const eventType = asString(payload.type);
  const metadata = payload.metadata && typeof payload.metadata === "object"
    ? payload.metadata as Record<string, unknown>
    : {};
  const metadataBookingId = asString(metadata.aglakadam_booking_id) || asString(metadata.booking_id);
  const attendees = Array.isArray(payload.attendees) ? payload.attendees : [];
  const attendeeEmail = attendees.length && attendees[0] && typeof attendees[0] === "object"
    ? asString((attendees[0] as Record<string, unknown>).email)
    : null;
  const organizerEmail = payload.organizer && typeof payload.organizer === "object"
    ? asString((payload.organizer as Record<string, unknown>).email)
    : null;

  if (!uid && !bookingId && !metadataBookingId) {
    return NextResponse.json({ error: "Missing Cal.com booking identifier." }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  let query = admin.from("bookings").select("id,mentor_id,mentee_user_id,status");

  if (metadataBookingId) {
    query = query.eq("id", metadataBookingId);
  } else if (uid) {
    query = query.eq("calcom_booking_uid", uid);
  } else {
    query = query.eq("calcom_booking_id", bookingId as number);
  }

  const { data: directMatches, error: lookupError } = await query.limit(2);
  if (lookupError) {
    console.error("Cal.com webhook booking lookup failed.");
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }

  let booking = directMatches?.[0] ?? null;

  // Backward-compatible fallback for bookings created by the old UI before
  // Cal.com identifiers were stored. Match conservatively using the attendee,
  // mentor organizer, and exact scheduled start time.
  if (!booking && attendeeEmail && organizerEmail && startTime) {
    const { data: mentors } = await admin
      .from("mentors")
      .select("id")
      .eq("email", organizerEmail)
      .limit(2);

    if (mentors?.length === 1) {
      const { data: mentees } = await admin
        .from("mentees")
        .select("user_id")
        .eq("email", attendeeEmail)
        .not("user_id", "is", null)
        .limit(2);

      if (mentees?.length === 1 && mentees[0].user_id) {
        const { data: fallbackMatches } = await admin
          .from("bookings")
          .select("id,mentor_id,mentee_user_id,status")
          .eq("mentor_id", mentors[0].id)
          .eq("mentee_user_id", mentees[0].user_id)
          .eq("scheduled_for", startTime)
          .limit(2);
        booking = fallbackMatches?.[0] ?? null;
      }
    }
  }

  if (!booking) {
    // A webhook can legitimately arrive before the legacy/manual booking row
    // exists. Return 200 so Cal.com does not retry forever; future bookings
    // should use aglakadam_booking_id metadata for deterministic correlation.
    return NextResponse.json({ ok: true, matched: false });
  }

  const nextStatus = getEventStatus(triggerEvent, providerStatus);
  const update: Record<string, unknown> = {
    calcom_booking_uid: uid,
    calcom_booking_id: bookingId,
    calcom_event_type: eventType,
    calcom_status: providerStatus,
    calcom_last_event: triggerEvent,
    calcom_last_event_at: new Date().toISOString(),
  };

  if (startTime) update.scheduled_for = startTime;

  // Do not let a cancellation overwrite a locally completed booking.
  if (!(booking.status === "completed" && nextStatus === "cancelled")) {
    update.status = nextStatus;
  }

  const { error: updateError } = await admin.from("bookings").update(update).eq("id", booking.id);
  if (updateError) {
    console.error("Cal.com webhook booking update failed.");
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, matched: true });
}
