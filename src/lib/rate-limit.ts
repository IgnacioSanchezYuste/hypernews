import "server-only";

/**
 * Fixed-window counter kept in process memory.
 *
 * It is deliberately dependency-free: it throttles credential stuffing and
 * scraping on every instance that serves a request, with no extra
 * infrastructure. Behind several instances the effective limit is multiplied by
 * the instance count, so treat it as a first line of defence and pair it with
 * the platform's own edge protection for anything larger.
 */

interface Window {
  count: number;
  resetAt: number;
}

declare global {
  var __hnRateLimit: Map<string, Window> | undefined;
}

const buckets: Map<string, Window> = (global.__hnRateLimit ??= new Map());

/** Drop expired windows so a burst of unique keys cannot grow the map forever. */
function sweep(now: number) {
  if (buckets.size < 5_000) return;
  for (const [key, window] of buckets) {
    if (window.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** Seconds until the window resets — suitable for a Retry-After header. */
  retryAfter: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfter: 0 };
  }

  current.count++;
  const retryAfter = Math.ceil((current.resetAt - now) / 1000);
  return {
    allowed: current.count <= limit,
    remaining: Math.max(0, limit - current.count),
    retryAfter,
  };
}

/** Best-effort client address; the platform's proxy headers come first. */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
