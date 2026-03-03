/**
 * In-memory sliding window rate limiter.
 * Limits to 20 requests per minute per IP.
 *
 * Note: This is in-process only. For multi-instance production deployments,
 * replace the Map with a Redis-backed store (e.g. @upstash/ratelimit).
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 20;

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

export function checkRateLimit(request: Request): { allowed: boolean; retryAfterMs: number } {
  const ip = getClientIp(request);
  const now = Date.now();

  const entry = store.get(ip) ?? { timestamps: [] };

  // Prune timestamps outside the current window
  entry.timestamps = entry.timestamps.filter((t) => now - t < WINDOW_MS);

  if (entry.timestamps.length >= MAX_REQUESTS) {
    const oldest = entry.timestamps[0];
    const retryAfterMs = WINDOW_MS - (now - oldest);
    store.set(ip, entry);
    return { allowed: false, retryAfterMs };
  }

  entry.timestamps.push(now);
  store.set(ip, entry);
  return { allowed: true, retryAfterMs: 0 };
}
