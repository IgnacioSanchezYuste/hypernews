import { NextRequest, NextResponse } from "next/server";
import { articleSlugExists, incrementArticleViews } from "@/lib/articles-db";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const LIMIT = 30;
const WINDOW_MS = 60_000;

/** One real per-visit hit, fired by ViewTracker from the article page. */
export async function POST(req: NextRequest) {
  const { allowed } = rateLimit(`view:${clientIp(req.headers)}`, LIMIT, WINDOW_MS);
  if (!allowed) return NextResponse.json({ ok: false }, { status: 429 });

  let slug: unknown;
  try {
    ({ slug } = await req.json());
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (typeof slug !== "string" || slug.length > 200) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!(await articleSlugExists(slug))) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  await incrementArticleViews(slug);
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
