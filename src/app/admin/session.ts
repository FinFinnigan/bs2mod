// Server-only session helper for the admin surface (ADM-001). Reads the
// session cookie set by POST /api/auth/login and validates it against the
// AuthService, mirroring the API-route guards (authorize/getSessionUser) for
// page layouts. The pure decision half lives in gate.ts.

import { cookies } from "next/headers";
import { getApp } from "@/lib/backend/container";
import { SESSION_COOKIE } from "@/lib/backend/auth/cookie";

export interface AdminSession {
  id: string;
  email: string;
  role: string;
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await getApp().auth.validateSession(token);
  if (!session) return null;

  return { id: session.userId, email: session.email, role: session.role };
}