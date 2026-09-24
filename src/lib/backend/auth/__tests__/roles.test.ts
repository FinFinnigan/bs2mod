// Unit tests for the pure role/ability model (src/lib/backend/auth/roles.ts).
// No next/server, no container, no database — pure functions over role strings.

import { describe, it, expect } from "vitest";
import {
  ABILITIES,
  GUEST,
  ROLES,
  abilitiesFor,
  can,
  isRole,
  roleRank,
} from "../roles";

describe("roles — role set and hierarchy", () => {
  it("defines exactly admin, staff and customer roles", () => {
    expect(ROLES).toEqual(["admin", "staff", "customer"]);
  });

  it("ranks admin above staff above customer", () => {
    expect(roleRank("admin")).toBe(0);
    expect(roleRank("staff")).toBe(1);
    expect(roleRank("customer")).toBe(2);
  });

  it("returns null rank for an unknown role", () => {
    expect(roleRank("superuser")).toBeNull();
  });

  it("isRole accepts only the three known roles", () => {
    expect(isRole("admin")).toBe(true);
    expect(isRole("staff")).toBe(true);
    expect(isRole("customer")).toBe(true);
    expect(isRole("guest")).toBe(false);
    expect(isRole("superuser")).toBe(false);
  });
});

describe("roles — ability hierarchy (admin ⊃ staff ⊃ customer)", () => {
  it("gives admin strictly more abilities than staff", () => {
    const admin = abilitiesFor("admin");
    const staff = abilitiesFor("staff");
    expect(staff.every((a) => admin.includes(a))).toBe(true);
    expect(admin.length).toBeGreaterThan(staff.length);
  });

  it("gives staff strictly more abilities than customer", () => {
    const staff = abilitiesFor("staff");
    const customer = abilitiesFor("customer");
    expect(customer.every((a) => staff.includes(a))).toBe(true);
    expect(staff.length).toBeGreaterThan(customer.length);
  });
});

describe("roles — can() semantics", () => {
  it("admin can perform admin-only mutations", () => {
    expect(can("admin", ABILITIES.adminMutate)).toBe(true);
  });

  it("staff and customer cannot perform admin-only mutations", () => {
    expect(can("staff", ABILITIES.adminMutate)).toBe(false);
    expect(can("customer", ABILITIES.adminMutate)).toBe(false);
  });

  it("guest cannot perform admin-only mutations", () => {
    expect(can(GUEST, ABILITIES.adminMutate)).toBe(false);
  });

  it("admin and staff can perform staff-level mutations", () => {
    expect(can("admin", ABILITIES.staffMutate)).toBe(true);
    expect(can("staff", ABILITIES.staffMutate)).toBe(true);
  });

  it("customer cannot perform staff-level mutations", () => {
    expect(can("customer", ABILITIES.staffMutate)).toBe(false);
  });

  it("guest can perform guest-allowed cart and checkout mutations", () => {
    expect(can(GUEST, ABILITIES.cartWrite)).toBe(true);
    expect(can(GUEST, ABILITIES.checkoutCreate)).toBe(true);
  });

  it("every known role can perform guest-allowed cart and checkout mutations", () => {
    for (const role of ROLES) {
      expect(can(role, ABILITIES.cartWrite)).toBe(true);
      expect(can(role, ABILITIES.checkoutCreate)).toBe(true);
    }
  });

  it("returns false for an unknown role", () => {
    expect(can("superuser", ABILITIES.cartWrite)).toBe(false);
    expect(can("superuser", ABILITIES.adminMutate)).toBe(false);
  });

  it("returns no abilities for an unknown role", () => {
    expect(abilitiesFor("superuser")).toEqual([]);
  });
});