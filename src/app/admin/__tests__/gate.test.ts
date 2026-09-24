import { describe, expect, it } from "vitest";
import { adminGateDecision } from "../gate";
import { GUEST } from "@/lib/backend/auth/roles";

// ADM-001 smoke-path tests for the admin surface gate. The pure decision
// function is exercised directly so the authorization matrix is verified
// without any HTTP or container machinery.
describe("adminGateDecision — ADM-001 admin surface gate", () => {
  it("sends anonymous visitors to the login page", () => {
    expect(adminGateDecision(null)).toBe("login");
    expect(adminGateDecision(undefined)).toBe("login");
  });

  it("allows the admin role through", () => {
    expect(adminGateDecision("admin")).toBe("allow");
  });

  it("forbids staff", () => {
    expect(adminGateDecision("staff")).toBe("forbidden");
  });

  it("forbids customers", () => {
    expect(adminGateDecision("customer")).toBe("forbidden");
  });

  it("fails closed for the guest pseudo-role", () => {
    expect(adminGateDecision(GUEST)).toBe("forbidden");
  });

  it("fails closed for unknown roles", () => {
    expect(adminGateDecision("superuser")).toBe("forbidden");
  });
});