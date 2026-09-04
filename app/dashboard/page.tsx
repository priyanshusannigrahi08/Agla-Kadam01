"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Row = Record<string, unknown>;

// Fields we never want to print out raw in the generic list below —
// either because they're internal, or shown separately (photo).
const HIDDEN_KEYS = new Set(["id", "user_id", "photo_url", "email"]);

function labelFor(key: string) {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function ProfileCard({
  title,
  row,
  statusBadge,
}: {
  title: string;
  row: Row;
  statusBadge?: { label: string; positive: boolean };
}) {
  const photoUrl = typeof row.photo_url === "string" ? row.photo_url : null;
  const name = typeof row.name === "string" ? row.name : "";
  const entries = Object.entries(row).filter(
    ([key, value]) => !HIDDEN_KEYS.has(key) && value !== null && value !== ""
  );

  return (
    <div className="bg-white rounded-sm border border-ink/10 p-6 pin-shadow">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-4">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={`${name}'s profile`}
              className="h-14 w-14 rounded-full object-cover border border-ink/10"
            />
          ) : (
            <div className="h-14 w-14 rounded-full bg-board/10 border border-board/10 flex items-center justify-center font-display text-xl text-board">
              {name?.charAt(0).toUpperCase() || "?"}
            </div>
          )}
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-board/60">
              {title}
            </p>
            {name && <h2 className="font-display text-xl">{name}</h2>}
          </div>
        </div>

        {statusBadge && (
          <span
            className={`font-mono text-[11px] uppercase tracking-[0.1em] px-3 py-1.5 rounded-full ${
              statusBadge.positive
                ? "bg-board/10 text-board"
                : "bg-amber/20 text-amber"
            }`}
          >
            {statusBadge.label}
          </span>
        )}
      </div>

      <dl className="space-y-3">
        {entries.map(([key, value]) => (
          <div key={key}>
            <dt className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink/40">
              {labelFor(key)}
            </dt>
            <dd className="font-body text-sm text-ink/80 mt-0.5">{formatValue(value)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default function DashboardPage() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [menteeRow, setMenteeRow] = useState<Row | null>(null);
  const [mentorRow, setMentorRow] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setSignedIn(false);
        setCheckingAuth(false);
        setLoading(false);
        return;
      }

      setSignedIn(true);
      setCheckingAuth(false);

      const [menteeResult, mentorResult] = await Promise.all([
        supabase.from("mentees").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("mentors").select("*").eq("user_id", user.id).maybeSingle(),
      ]);

      setMenteeRow(menteeResult.data ?? null);
      setMentorRow(mentorResult.data ?? null);
      setLoading(false);
    }

    load();
  }, []);

  if (checkingAuth || loading) {
    return (
      <main className="min-h-screen bg-paper flex items-center justify-center">
        <p className="font-mono text-sm text-ink/50">Loading…</p>
      </main>
    );
  }

  if (!signedIn) {
    return (
      <main className="min-h-screen bg-paper flex items-center justify-center px-6">
        <div className="bg-white border border-ink/10 rounded-sm p-8 pin-shadow text-center max-w-sm">
          <p className="font-body text-ink/70 mb-5">Sign in to see your submissions.</p>
          <Link
            href="/auth"
            className="inline-flex items-center justify-center rounded-sm bg-amber text-ink font-body font-semibold px-6 py-3 hover:brightness-95 transition"
          >
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  const hasNothing = !menteeRow && !mentorRow;

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
        <Link href="/" className="font-mono text-xs uppercase tracking-[0.15em] text-board/60 hover:text-board">
          ← Back to AglaKadam
        </Link>

        <h1 className="font-display text-3xl sm:text-4xl mt-6 mb-2">Your submissions</h1>
        <p className="text-ink/70 mb-10">
          Whatever you've submitted to AglaKadam, in one place.
        </p>

        {hasNothing && (
          <div className="bg-white rounded-sm border border-ink/10 p-8 pin-shadow text-center">
            <p className="font-body text-ink/70 mb-5">
              You haven't submitted anything yet.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/mentee"
                className="inline-flex items-center justify-center rounded-sm bg-amber text-ink font-body font-semibold text-sm px-5 py-2.5 hover:brightness-95 transition"
              >
                Find a mentor
              </Link>
              <Link
                href="/mentor"
                className="inline-flex items-center justify-center rounded-sm border border-ink/20 text-ink font-body text-sm px-5 py-2.5 hover:bg-ink/5 transition"
              >
                Offer to mentor
              </Link>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {menteeRow && (
            <ProfileCard
              title="Mentee profile"
              row={menteeRow}
              statusBadge={
                menteeRow.is_active === false
                  ? { label: "Inactive", positive: false }
                  : { label: "Active", positive: true }
              }
            />
          )}

          {mentorRow && (
            <ProfileCard
              title="Mentor profile"
              row={mentorRow}
              statusBadge={
                mentorRow.is_approved
                  ? { label: "Approved", positive: true }
                  : { label: "Pending review", positive: false }
              }
            />
          )}
        </div>
      </div>
    </main>
  );
}
