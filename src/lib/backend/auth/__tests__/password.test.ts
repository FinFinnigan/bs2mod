import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "../password";

describe("hashPassword / verifyPassword (scrypt, node:crypto only)", () => {
  it("hashes a password into a self-describing scrypt-format string", () => {
    const hash = hashPassword("correct horse battery staple");
    expect(hash.startsWith("scrypt$")).toBe(true);
    // scrypt$<N>$<r>$<p>$<saltB64>$<hashB64>
    expect(hash.split("$")).toHaveLength(6);
  });

  it("verifies the correct password", () => {
    const hash = hashPassword("s3cret!");
    expect(verifyPassword("s3cret!", hash)).toBe(true);
  });

  it("rejects a wrong password", () => {
    const hash = hashPassword("right-password");
    expect(verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("uses a unique salt per hash — same password hashes differently", () => {
    const a = hashPassword("same-password");
    const b = hashPassword("same-password");
    expect(a).not.toBe(b);
  });

  it("returns false for a malformed stored hash", () => {
    expect(verifyPassword("x", "not-a-hash")).toBe(false);
    expect(verifyPassword("x", "scrypt$1$2$3$4")).toBe(false);
    expect(verifyPassword("x", "")).toBe(false);
  });
});