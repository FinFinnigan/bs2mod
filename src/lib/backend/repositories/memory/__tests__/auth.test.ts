import { describe, it, expect } from "vitest";
import { MemoryUserStore, MemorySessionStore } from "../auth";
import { hashPassword } from "../../../auth/password";

describe("MemoryUserStore", () => {
  it("creates and retrieves a user by normalized email", async () => {
    const store = new MemoryUserStore();
    await store.create({
      id: "usr_1",
      email: "Admin@BoyShop.ie",
      passwordHash: hashPassword("pw"),
      role: "admin",
      createdAt: new Date().toISOString(),
    });
    const user = await store.getByEmail("  admin@boyshop.ie ");
    expect(user?.id).toBe("usr_1");
    expect(user?.role).toBe("admin");
  });

  it("returns null for an unknown email", async () => {
    const store = new MemoryUserStore();
    expect(await store.getByEmail("nobody@boyshop.ie")).toBeNull();
  });
});

describe("MemorySessionStore", () => {
  it("creates and retrieves a live session", async () => {
    const store = new MemorySessionStore();
    await store.create({
      id: "h1",
      userId: "usr_1",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
      revokedAt: null,
    });
    expect((await store.get("h1"))?.userId).toBe("usr_1");
  });

  it("returns null for an unknown session id", async () => {
    const store = new MemorySessionStore();
    expect(await store.get("missing")).toBeNull();
  });

  it("returns null for an expired session", async () => {
    const store = new MemorySessionStore();
    await store.create({
      id: "h2",
      userId: "usr_1",
      createdAt: new Date(Date.now() - 120_000).toISOString(),
      expiresAt: new Date(Date.now() - 60_000).toISOString(),
      revokedAt: null,
    });
    expect(await store.get("h2")).toBeNull();
  });

  it("returns null for a revoked session (logout invalidation)", async () => {
    const store = new MemorySessionStore();
    await store.create({
      id: "h3",
      userId: "usr_1",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
      revokedAt: null,
    });
    await store.revoke("h3");
    expect(await store.get("h3")).toBeNull();
  });

  it("revoking an unknown session is a no-op", async () => {
    const store = new MemorySessionStore();
    await expect(store.revoke("missing")).resolves.toBeUndefined();
  });
});