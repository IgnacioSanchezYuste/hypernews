import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { runDailyNewsUpdate } from "@/lib/auto-articles";
import { ARTICLES_TAG } from "@/lib/articles-cache";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const ITEMS_PER_CATEGORY = 10;

/** Compares digests so the check cannot be attacked one byte at a time. */
function secretMatches(provided: string, expected: string): boolean {
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

/**
 * Only the platform scheduler may trigger a run. The secret travels in the
 * Authorization header and never in the query string, which would end up in
 * access logs and browser history.
 */
function isAuthorized(req: NextRequest): boolean {
  const expected = env.cronSecret;
  if (!expected) return false;

  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return false;

  return secretMatches(token, expected);
}

/** A run takes tens of seconds; overlapping runs would duplicate work and hammer publishers. */
let inFlight: Promise<unknown> | null = null;

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (inFlight) {
    return NextResponse.json({ ok: false, reason: "Ya hay una actualización en curso" }, { status: 409 });
  }

  const run = runDailyNewsUpdate(ITEMS_PER_CATEGORY);
  inFlight = run;
  try {
    const results = await run;
    const inserted = results.reduce((sum, r) => sum + r.inserted.length, 0);
    // "max": readers keep getting an instant cached page while the new
    // catalogue is fetched in the background.
    if (inserted > 0) revalidateTag(ARTICLES_TAG, "max");
    return NextResponse.json({ ok: true, inserted, results });
  } finally {
    inFlight = null;
  }
}
