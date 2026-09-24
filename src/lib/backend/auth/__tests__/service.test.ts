import { describe, it, expect } from "vitest";
import { AuthService, DEFAULT_SESSION_TTL_MS } from "../service";
import { hashPassword } from "../password";
import { MemoryUserStore, MemorySessionStore } from "../../repositories/memory/auth";
import type { UserRecord } from "../interfaces";

// Mutable clock starting at the real "now" so the memory stores' real-clock
// expiry check never interferes: the service's injected clock only moves forward
// from real time, so a session the service considers expired is still "live" to
// the store — the service layer must reject it on its own.
function setup() {
  const users = new MemoryUserStore();
  const sessions = new MemorySessionStore();
  let now = new Date();
  const clock = {
    now: () => now,
    advance: (ms: number) => {
      now = new Date(now.getTime() + ms);
    },
  };
  const service = new AuthService({ users, sessions, now: clock.now });
  return { users, sessions, service, clock };
}

async function seedAdmin(
  users: MemoryUserStore,
  email = "admin@boyshop.ie",
  password = "pw-1234",
): Promise<UserRecord> {
  const user: UserRecord = {
    id: "usr_test1",
    email,
    passwordHash: hashPassword(password),
    role: "admin",
    createdAt: new Date().toISOString(),
  };
  await users.create(user);
  return user;
}

describe("AuthService.authenticate", () => {
  it("issues a session token for valid credentials", async () => {
    const { users, service } = setup();
    await seedAdmin(users);
    const result = await service.authenticate("admin@boyshop.ie", "pw-1234");
    expect(result).not.toBeNull();
    expect(result?.token.startsWith("ses_")).toBe(true);
    expect(result?.user.email).toBe("admin@boyshop.ie");
    expect(result?.user.role).toBe("admin");
  });

  it("normalizes the email (trim + lowercase) before matching", async () => {
    const { users, service } = setup();
    await seedAdmin(users, "Admin@BoyShop.ie", "pw-1234");
    const result = await service.authenticate("  admin@boyshop.ie  ", "pw-1234");
    expect(result).not.toBeNull();
  });

  it("returns null for a wrong password", async () => {
    const { users, service } = setup();
    await seedAdmin(users);
    expect(await service.authenticate("admin@boyshop.ie", "wrong")).toBeNull();
  });

  it("returns null for an unknown email", async () => {
    const { service } = setup();
    expect(await service.authenticate("nobody@boyshop.ie", "pw-1234")).toBeNull();
  });

  it("stores the session under the SHA-256 hash of the token, not the token itself", async () => {
    const { users, sessions, service } = setup();
    await seedAdmin(users);
    const result = await service.authenticate("admin@boyshop.ie", "pw-1234");
    expect(result).not.toBeNull();
    const token = result!.token;
    const { createHash } = await import("node:crypto");
    const expectedId = createHash("sha256").update(token).digest("hex");
    const stored = await sessions.get(expectedId);
    expect(stored?.userId).toBe("usr_test1");
    // The raw token must never be persisted as the session id.
    expect(await sessions.get(token)).toBeNull();
  });
});

describe("AuthService.validateSession", () => {
  it("returns the user for a live token", async () => {
    const { users, service } = setup();
    await seedAdmin(users);
    const { token } = (await service.authenticate("admin@boyshop.ie", "pw-1234"))!;
    const session = await service.validateSession(token);
    expect(session?.userId).toBe("usr_test1");
    expect(session?.email).toBe("admin@boyshop.ie");
    expect(session?.role).toBe("admin");
  });

  it("returns null for an unknown token", async () => {
    const { service } = setup();
    expect(await service.validateSession("ses_0000000000000000000000000000000000000000000000000000000000000000")).toBeNull();
  });

  it("returns null for a revoked token (logout invalidation)", async () => {
    const { users, service } = setup();
    await seedAdmin(users);
    const { token } = (await service.authenticate("admin@boyshop.ie", "pw-1234"))!;
    await service.revokeSession(token);
    expect(await service.validateSession(token)).toBeNull();
  });

  it("returns null for an expired token", async () => {
    const { users, service, clock } = setup();
    await seedAdmin(users);
    const { token } = (await service.authenticate("admin@boyshop.ie", "pw-1234"))!;
    clock.advance(DEFAULT_SESSION_TTL_MS + 1);
    expect(await service.validateSession(token)).toBeNull();
  });
});

describe("AuthService.revokeSession", () => {
  it("is idempotent — revoking twice does not throw", async () => {
    const { users, service } = setup();
    await seedAdmin(users);
    const { token } = (await service.authenticate("admin@boyshop.ie", "pw-1234"))!;
    await service.revokeSession(token);
    await service.revokeSession(token);
    expect(await service.validateSession(token)).toBeNull();
  });

  it("is a no-op for an unknown token", async () => {
    const { service } = setup();
    await expect(
      service.revokeSession("ses_0000000000000000000000000000000000000000000000000000000000000000"),
    ).resolves.toBeUndefined();
  });
});

describe("DEFAULT_SESSION_TTL_MS", () => {
  it("is 24 hours", () => {
    expect(DEFAULT_SESSION_TTL_MS).toBe(24 * 60 * 60 * 1000);
  });
});