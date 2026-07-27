"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminUserByEmail } from "@/lib/admin-users";
import { createSession, deleteSession } from "@/lib/session";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export interface LoginState {
  error?: string;
}

/**
 * Compared against when the email is unknown, so a wrong address and a wrong
 * password take the same time and cannot be told apart.
 */
const DECOY_HASH = "$2b$12$1In1I7XoEmRM230SltthCunxK/SVLjw0CN59m54rylq1Zwt6w0FHS";

const MAX_ATTEMPTS_PER_IP = 8;
const MAX_ATTEMPTS_PER_ACCOUNT = 5;
const WINDOW_MS = 10 * 60 * 1000;

const GENERIC_ERROR = "Credenciales incorrectas.";

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 254);
  const password = String(formData.get("password") ?? "").slice(0, 200);

  if (!email || !password) {
    return { error: "Introduce tu email y contraseña." };
  }

  const ip = clientIp(await headers());
  const byIp = rateLimit(`login:ip:${ip}`, MAX_ATTEMPTS_PER_IP, WINDOW_MS);
  const byAccount = rateLimit(`login:user:${email}`, MAX_ATTEMPTS_PER_ACCOUNT, WINDOW_MS);
  if (!byIp.allowed || !byAccount.allowed) {
    const minutes = Math.ceil(Math.max(byIp.retryAfter, byAccount.retryAfter) / 60);
    return { error: `Demasiados intentos. Vuelve a probar en ${minutes} min.` };
  }

  const user = await getAdminUserByEmail(email);
  const valid = await bcrypt.compare(password, user?.passwordHash ?? DECOY_HASH);

  if (!user || !valid) {
    return { error: GENERIC_ERROR };
  }

  await createSession({ id: user.id, email: user.email, name: user.name });
  redirect("/admin");
}

export async function logout() {
  await deleteSession();
  redirect("/admin/login");
}
