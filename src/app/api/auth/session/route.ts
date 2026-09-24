// Session API — returns the current authenticated user, or 401 when the session
// cookie is missing, invalid, revoked or expired (fail-closed).

import { NextRequest, NextResponse } from "next/server";
import { getApp } from "@/lib/backend/container";
import { SESSION_COOKIE } from "@/lib/backend/auth/cookie";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const app = getApp();
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const session = await app.auth.validateSession(token);
    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.json({
      user: { id: session.userId, email: session.email, role: session.role },
    });
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
}