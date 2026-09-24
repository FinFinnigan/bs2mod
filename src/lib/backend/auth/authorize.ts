// Route guard for RBAC. Reads the session cookie, resolves the AuthUser via the
// AuthService, and checks the requested ability. Pure request→decision mapping;
// routes call authorizationResponse() to turn the decision into a NextResponse.

import { NextRequest, NextResponse } from "next/server";
import { getApp } from "@/lib/backend/container";
import { SESSION_COOKIE } from "./cookie";
import { GUEST, can, type Ability } from "./roles";
import type { AuthService, AuthUser } from "./service";

export interface AuthorizeDeps {
  auth: AuthService;
}

export type AuthorizeResult =
  | { status: "ok"; user: AuthUser | null }
  | { status: "unauthorized"; error: string }
  | { status: "forbidden"; error: string };

/**
 * Resolve the authenticated user from the session cookie, or null when the
 * request is anonymous (no cookie) or the session is invalid/expired.
 */
export async function getSessionUser(
  req: NextRequest,
  deps: AuthorizeDeps = { auth: getApp().auth }
): Promise<AuthUser | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await deps.auth.validateSession(token);
  return session ? { id: session.userId, email: session.email, role: session.role } : null;
}

/**
 * Decide whether the request may perform `ability`. Anonymous callers are
 * treated as GUEST; a missing/invalid session on a role-required ability is
 * "unauthorized" (401), a valid session with an insufficient role is
 * "forbidden" (403).
 */
export async function authorize(
  req: NextRequest,
  ability: Ability,
  deps: AuthorizeDeps = { auth: getApp().auth }
): Promise<AuthorizeResult> {
  const user = await getSessionUser(req, deps);
  const role = user?.role ?? GUEST;
  if (!can(role, ability)) {
    return user
      ? { status: "forbidden", error: "Insufficient permissions" }
      : { status: "unauthorized", error: "Authentication required" };
  }
  return { status: "ok", user };
}

/**
 * Convert an authorize() decision into a NextResponse, or null when the request
 * is allowed. Routes: `const denied = authorizationResponse(await authorize(...)); if (denied) return denied;`
 */
export function authorizationResponse(result: AuthorizeResult): NextResponse | null {
  if (result.status === "ok") return null;
  return NextResponse.json(
    { error: result.error },
    { status: result.status === "unauthorized" ? 401 : 403 }
  );
}