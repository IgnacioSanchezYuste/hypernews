import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { env } from "./env";

export const SESSION_COOKIE = "hn_admin_session";

const ISSUER = "hypernews";
const AUDIENCE = "hypernews-admin";
const MAX_AGE_SECONDS = 8 * 60 * 60;

/** Resolved on first use so a missing SESSION_SECRET throws instead of signing with an empty key. */
function key(): Uint8Array {
  return new TextEncoder().encode(env.sessionSecret);
}

export interface SessionPayload {
  userId: number;
  email: string;
  name: string;
  [key: string]: unknown;
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(key());
}

export async function decrypt(session: string | undefined = ""): Promise<SessionPayload | undefined> {
  if (!session) return undefined;
  try {
    const { payload } = await jwtVerify(session, key(), {
      algorithms: ["HS256"],
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    if (typeof payload.userId !== "number") return undefined;
    return payload as unknown as SessionPayload;
  } catch {
    return undefined;
  }
}

export async function createSession(user: { id: number; email: string; name: string }) {
  const session = await encrypt({ userId: user.id, email: user.email, name: user.name });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, session, {
    httpOnly: true,
    secure: env.isProduction,
    maxAge: MAX_AGE_SECONDS,
    // "strict" would drop the cookie when an admin follows a link back into the
    // panel from elsewhere; "lax" still blocks cross-site POSTs.
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
