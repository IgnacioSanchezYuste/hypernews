import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Liveness probe for uptime monitors and load balancers. Reports whether the
 * app can still reach Postgres, and nothing else — an unauthenticated endpoint
 * must not leak versions, connection strings or error details.
 */
export async function GET() {
  try {
    await pool.query("select 1");
    return NextResponse.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json(
      { status: "degraded" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
