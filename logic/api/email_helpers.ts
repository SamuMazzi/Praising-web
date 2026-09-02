import type { NextApiRequest } from 'next';

/**
 * Escapes the characters that would let a value break out of the surrounding
 * HTML when it is interpolated into the body of a notification email.
 */
export const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

/**
 * In-memory rate limiting. Vercel runs every route in one (or more) short-lived
 * serverless instances, so this is per-instance and resets on a cold start:
 * it is enough to stop a single client hammering an endpoint in a loop, not a
 * distributed flood. Swap for Firestore/Upstash if that ever becomes a problem.
 */
const buckets = new Map<string, RateLimitBucket>();

const cleanupExpiredBuckets = (now: number): void => {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
};

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export const checkRateLimit = (
  key: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult => {
  const now = Date.now();
  cleanupExpiredBuckets(now);

  const bucket = buckets.get(key);
  if (bucket === undefined || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  bucket.count += 1;
  if (bucket.count > maxRequests) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000)
    };
  }
  return { allowed: true, retryAfterSeconds: 0 };
};

/** Best-effort client identifier, used only as a rate limiting key. */
export const getClientIp = (req: NextApiRequest): string => {
  const forwarded = req.headers['x-forwarded-for'];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return raw?.split(',')[0].trim() ?? req.socket.remoteAddress ?? 'unknown';
};
