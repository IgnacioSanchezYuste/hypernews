import { NextResponse } from "next/server";
import { searchHits, MAX_QUERY_LENGTH } from "@/lib/search";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const LIMIT = 60;
const WINDOW_MS = 60_000;

/** Instant multi-entity search across articles, categories and authors. */
export async function GET(req: Request) {
  const { allowed, retryAfter } = rateLimit(`search:${clientIp(req.headers)}`, LIMIT, WINDOW_MS);
  if (!allowed) {
    return NextResponse.json(
      { results: [] },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  const q = (new URL(req.url).searchParams.get("q") ?? "").slice(0, MAX_QUERY_LENGTH).trim();
  if (q.length < 2) return NextResponse.json({ results: [] });

  const results = await searchHits(q, 12);

  return NextResponse.json(
    { results },
    { headers: { "Cache-Control": "private, max-age=30", "X-Robots-Tag": "noindex" } }
  );
}
