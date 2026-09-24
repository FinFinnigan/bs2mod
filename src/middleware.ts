// Edge middleware — presence gate for protected API routes. It only checks that
// the session cookie is present; the route handlers validate the token itself
// (fail-closed). Imports ONLY route-rules so the Edge bundle stays tiny.

import { NextRequest, NextResponse } from "next/server";
import { isProtectedPath, SESSION_COOKIE } from "@/lib/backend/auth/route-rules";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!isProtectedPath(pathname)) return NextResponse.next();
  if (!req.cookies.get(SESSION_COOKIE)?.value) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};