// Integration tests for the route guard (src/lib/backend/auth/authorize.ts).
// Uses the real AuthService over in-memory stores — no container, no database.
// RBAC-001 proof: an admin-only mutation is denied for customer/staff (403) and
// allowed for admin; missing/invalid sessions are 401, never 403.

import { describe, it, expect } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "../service";
import { hashPassword } from "../password";
import { MemoryUserStore, MemorySessionStore } from "../../repositories/memory/auth";
import { SESSION_COOKIE } from "../cookie";
import { ABILITIES } from "../roles";
import { authorize, authorizationResponse, getSessionUser } from "../authorize";
import type { UserRecord } from "../interfaces";

function setup() {
  const users = new MemoryUserStore();
  const sessions = new MemorySessionStore();
  const auth = new AuthService({ users, sessions });
  return { users, sessions, auth };
}

async function seedUser(users: MemoryUserStore, id: string, email: string, role: string): Promise<UserRecord> {
  const user: UserRecord = {
    id,
    email,
    passwordHash: hashPassword("pw-1234"),
    role,
    createdAt: new Date().toISOString(),
  };
  await users.create(user);
  return user;
}

function requestWithSession(token: string): NextRequest {
  return new NextRequest("http://localhost/api/test", {
    headers: { cookie: `${SESSION_COOKIE}=${token}` },
  });
}

function anonymousRequest(): NextRequest {
  return new NextRequest("http://localhost/api/test");
}

// A mutation handler that applies the guard before mutating a memory store —
// the RBAC-001 proof: admin-only mutation denied for customer/staff, allowed for admin.
async function adminOnlyMutation(req: NextRequest, auth: AuthService, store: { mutated: boolean }) {
  const result = await authorize(req, ABILITIES.adminMutate, { auth });
  const denied = authorizationResponse(result);
  if (denied) return denied;
  store.mutated = true;
  return NextResponse.json({ ok: true });
}

describe("authorize — RBAC-001: admin-only mutation", () => {
  it("returns 403 for a customer session and performs no side effect", async () => {
    const { users, auth } = setup();
    await seedUser(users, "usr_c", "customer@boyshop.ie", "customer");
    const { token } = (await auth.authenticate("customer@boyshop.ie", "pw-1234"))!;
    const store = { mutated: false };
    const res = await adminOnlyMutation(requestWithSession(token), auth, store);
    expect(res.status).toBe(403);
    expect(store.mutated).toBe(false);
  });

  it("returns 403 for a staff session and performs no side effect", async () => {
    const { users, auth } = setup();
    await seedUser(users, "usr_s", "staff@boyshop.ie", "staff");
    const { token } = (await auth.authenticate("staff@boyshop.ie", "pw-1234"))!;
    const store = { mutated: false };
    const res = await adminOnlyMutation(requestWithSession(token), auth, store);
    expect(res.status).toBe(403);
    expect(store.mutated).toBe(false);
  });

  it("succeeds for an admin session and performs the mutation", async () => {
    const { users, auth } = setup();
    await seedUser(users, "usr_a", "admin@boyshop.ie", "admin");
    const { token } = (await auth.authenticate("admin@boyshop.ie", "pw-1234"))!;
    const store = { mutated: false };
    const res = await adminOnlyMutation(requestWithSession(token), auth, store);
    expect(res.status).toBe(200);
    expect(store.mutated).toBe(true);
  });

  it("returns 401 (not 403) when there is no session", async () => {
    const { auth } = setup();
    const store = { mutated: false };
    const res = await adminOnlyMutation(anonymousRequest(), auth, store);
    expect(res.status).toBe(401);
    expect(store.mutated).toBe(false);
  });

  it("returns 401 for an invalid session token", async () => {
    const { auth } = setup();
    const store = { mutated: false };
    const res = await adminOnlyMutation(requestWithSession("ses_bogus"), auth, store);
    expect(res.status).toBe(401);
    expect(store.mutated).toBe(false);
  });
});

describe("authorize — staff-required ability", () => {
  it("allows staff and admin, denies customer", async () => {
    const { users, auth } = setup();
    await seedUser(users, "usr_s", "staff@boyshop.ie", "staff");
    await seedUser(users, "usr_a", "admin@boyshop.ie", "admin");
    await seedUser(users, "usr_c", "customer@boyshop.ie", "customer");
    const staffToken = (await auth.authenticate("staff@boyshop.ie", "pw-1234"))!.token;
    const adminToken = (await auth.authenticate("admin@boyshop.ie", "pw-1234"))!.token;
    const customerToken = (await auth.authenticate("customer@boyshop.ie", "pw-1234"))!.token;

    expect((await authorize(requestWithSession(staffToken), ABILITIES.staffMutate, { auth })).status).toBe("ok");
    expect((await authorize(requestWithSession(adminToken), ABILITIES.staffMutate, { auth })).status).toBe("ok");
    expect((await authorize(requestWithSession(customerToken), ABILITIES.staffMutate, { auth })).status).toBe("forbidden");
  });
});

describe("authorize — guest-allowed abilities (cart/checkout)", () => {
  it("lets an anonymous caller through cart:write and checkout:create with user null", async () => {
    const { auth } = setup();
    expect(await authorize(anonymousRequest(), ABILITIES.cartWrite, { auth })).toEqual({ status: "ok", user: null });
    expect(await authorize(anonymousRequest(), ABILITIES.checkoutCreate, { auth })).toEqual({ status: "ok", user: null });
  });

  it("returns the AuthUser for an authenticated caller", async () => {
    const { users, auth } = setup();
    await seedUser(users, "usr_c", "customer@boyshop.ie", "customer");
    const { token } = (await auth.authenticate("customer@boyshop.ie", "pw-1234"))!;
    const result = await authorize(requestWithSession(token), ABILITIES.cartWrite, { auth });
    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.user?.email).toBe("customer@boyshop.ie");
      expect(result.user?.role).toBe("customer");
    }
  });
});

describe("getSessionUser", () => {
  it("returns the user for a valid session and null otherwise", async () => {
    const { users, auth } = setup();
    await seedUser(users, "usr_a", "admin@boyshop.ie", "admin");
    const { token } = (await auth.authenticate("admin@boyshop.ie", "pw-1234"))!;
    expect((await getSessionUser(requestWithSession(token), { auth }))?.role).toBe("admin");
    expect(await getSessionUser(anonymousRequest(), { auth })).toBeNull();
    expect(await getSessionUser(requestWithSession("ses_bogus"), { auth })).toBeNull();
  });
});