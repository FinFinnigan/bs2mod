// Login API — validates credentials and issues a session cookie. Errors are
// deliberately generic ("invalid credentials") so the endpoint cannot be used to
// enumerate accounts.

import { NextRequest, NextResponse } from "next/server";
import { getApp } from "@/lib/backend/container";
import { loginSchema, firstIssueMessage } from "@/lib/backend/api/validation";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/backend/auth/cookie";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const app = getApp();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
  }

  try {
    const result = await app.auth.authenticate(parsed.data.email, parsed.data.password);
    if (!result) {
      return NextResponse.json({ error: "invalid credentials" }, { status: 401 });
    }
    const res = NextResponse.json({ user: result.user });
    res.cookies.set(SESSION_COOKIE, result.token, sessionCookieOptions);
    return res;
  } catch {
    return NextResponse.json({ error: "internal error" }, { status: 503 });
  }
}