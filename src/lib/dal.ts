import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decrypt, SESSION_COOKIE } from "./session";

export const verifySession = cache(async () => {
  const cookie = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await decrypt(cookie);

  if (!session?.userId) {
    redirect("/admin/login");
  }

  return session;
});

export const getOptionalSession = cache(async () => {
  const cookie = (await cookies()).get(SESSION_COOKIE)?.value;
  return decrypt(cookie);
});
