// Logout API — revokes the session server-side and clears the cookie. Always
// returns 200 so a stale or invalid session cookie still logs out cleanly.

import { NextRequest, NextResponse } from "next/server";
import { getApp } from "@/lib/backend/container";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/backend/auth/cookie";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const app = getApp();
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (token) {
    try {
      await app.auth.revokeSession(token);
    } catch {
      // Best-effort: a failed revoke must not block logout — the cookie is
      // cleared regardless and the next request fails validation.
    }
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions, maxAge: 0 });
  return res;
}