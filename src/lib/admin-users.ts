import "server-only";
import { pool } from "./db";

export interface AdminUser {
  id: number;
  email: string;
  passwordHash: string;
  name: string;
}

export async function getAdminUserByEmail(email: string): Promise<AdminUser | undefined> {
  const { rows } = await pool.query<{ id: number; email: string; password_hash: string; name: string }>(
    "select id, email, password_hash, name from admin_users where email = $1",
    [email.toLowerCase()]
  );
  const row = rows[0];
  if (!row) return undefined;
  return { id: row.id, email: row.email, passwordHash: row.password_hash, name: row.name };
}
