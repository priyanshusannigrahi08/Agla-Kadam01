import { NextRequest } from "next/server";

type Limit = { count: number; resetAt: number };

const limits = new Map<string, Limit>();

function positiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

/** Server-only Gemini model selection. Do not expose this as NEXT_PUBLIC_. */
export function geminiModel() {
  return process.env.GEMINI_MODEL?.trim() || "gemini-3.6-flash";
}

/**
 * Lightweight, per-instance abuse protection for low-traffic deployments.
 * Vercel instances do not share this Map, so it is intentionally not presented
 * as a distributed rate limiter.
 */
export function isAiRateLimited(request: NextRequest, scope: string, fallbackLimit: number) {
  const windowMs = positiveInteger(process.env.AI_RATE_LIMIT_WINDOW_MS, 60_000);
  const max = positiveInteger(process.env.AI_RATE_LIMIT_MAX, fallbackLimit);
  const client = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const key = `${scope}:${client}`;
  const now = Date.now();
  const current = limits.get(key);

  if (!current || current.resetAt <= now) {
    limits.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (current.count >= max) return true;
  current.count += 1;
  return false;
}
