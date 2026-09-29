/**
 * In-memory sliding-window rate limiter.
 * Protects against bot floods, infinite retry loops, and abuse.
 */

type RateLimitRecord = {
  timestamps: number[];
};

const clientRecords = new Map<string, RateLimitRecord>();

// Cleanup stale records periodically
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  const windowMs = 60 * 1000;
  for (const [key, record] of clientRecords.entries()) {
    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);
    if (record.timestamps.length === 0) {
      clientRecords.delete(key);
    }
  }
}, 30 * 1000);

if (cleanupTimer && typeof cleanupTimer.unref === "function") {
  cleanupTimer.unref();
}

export function checkRateLimit(
  clientId: string,
  limit = 30, // 30 requests per minute
  windowMs = 60 * 1000
): { allowed: boolean; remaining: number; retryAfterSeconds?: number } {
  const now = Date.now();
  const record = clientRecords.get(clientId) || { timestamps: [] };

  // Filter timestamps within current window
  const validTimestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (validTimestamps.length >= limit) {
    const oldestTimestamp = validTimestamps[0];
    const retryAfterMs = windowMs - (now - oldestTimestamp);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
    };
  }

  validTimestamps.push(now);
  clientRecords.set(clientId, { timestamps: validTimestamps });

  return {
    allowed: true,
    remaining: limit - validTimestamps.length,
  };
}
