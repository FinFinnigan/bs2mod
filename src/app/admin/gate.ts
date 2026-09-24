// Admin surface gate — pure RBAC decision for the (protected) admin group
// (ADM-001). Deliberately free of next/server, container and database imports
// so it is unit-testable in isolation (see __tests__/gate.test.ts) and fails
// closed for every unknown input.

import { ABILITIES, GUEST, can } from "@/lib/backend/auth/roles";

export type AdminGateDecision = "allow" | "login" | "forbidden";

// Only the admin role may mutate admin data (ABILITIES.adminMutate in
// roles.ts grants it to ["admin"]). Staff and customers are authenticated but
// forbidden; anonymous visitors must sign in first.
export function adminGateDecision(
  role: string | null | undefined,
): AdminGateDecision {
  if (role == null) return "login";
  if (role === GUEST) return "forbidden";
  return can(role, ABILITIES.adminMutate) ? "allow" : "forbidden";
}