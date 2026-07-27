import { Pool } from "pg";
import { env } from "./env";

declare global {
  var __hnPool: Pool | undefined;
}

/**
 * Serverless instances each keep their own pool, so a high ceiling here
 * multiplies into far more Postgres connections than the server allows. Keep it
 * small and raise PGPOOL_MAX only on a long-lived server.
 */
const MAX_CLIENTS = Number(process.env.PGPOOL_MAX ?? 5);

/** Managed Postgres always speaks TLS; a local socket does not. */
function sslConfig(connectionString: string) {
  try {
    const { hostname } = new URL(connectionString);
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".local")) return undefined;
  } catch {
    return undefined;
  }
  // Set PGSSL_NO_VERIFY=1 only for providers that serve a self-signed certificate.
  return { rejectUnauthorized: process.env.PGSSL_NO_VERIFY !== "1" };
}

function createPool(): Pool {
  if (!global.__hnPool) {
    const connectionString = env.databaseUrl;
    const pool = new Pool({
      connectionString,
      ssl: sslConfig(connectionString),
      max: Number.isFinite(MAX_CLIENTS) && MAX_CLIENTS > 0 ? MAX_CLIENTS : 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
      // A single slow query must never pin a connection for the whole request.
      statement_timeout: 15_000,
      query_timeout: 15_000,
      application_name: "hypernews",
    });

    // An idle client dropped by the server emits 'error'; without a listener
    // that would take the whole process down.
    pool.on("error", (err) => {
      console.error("[db] error en cliente inactivo:", err.message);
    });

    global.__hnPool = pool;
  }
  return global.__hnPool;
}

/** Lazily constructed so scripts that load env vars after import still connect correctly. */
export const pool = new Proxy({} as Pool, {
  get(_target, prop, receiver) {
    return Reflect.get(createPool(), prop, receiver);
  },
});
