import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt, SESSION_COOKIE } from "@/lib/session";

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isAdminRoute = path.startsWith("/admin") && path !== "/admin/login";

  if (!isAdminRoute) return NextResponse.next();

  const cookie = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await decrypt(cookie);

  if (!session?.userId) {
    return NextResponse.redirect(new URL("/admin/login", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
