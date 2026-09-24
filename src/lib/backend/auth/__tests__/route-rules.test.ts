import { describe, it, expect } from "vitest";
import { isProtectedPath, SESSION_COOKIE } from "../route-rules";

describe("route-rules (Edge-safe, no @/ or node imports)", () => {
  it("exposes the session cookie name", () => {
    expect(SESSION_COOKIE).toBe("boyshop.session");
  });

  it("treats /api/orders and its children as protected", () => {
    expect(isProtectedPath("/api/orders")).toBe(true);
    expect(isProtectedPath("/api/orders/ord_1")).toBe(true);
  });

  it("treats auth routes as public", () => {
    expect(isProtectedPath("/api/auth/login")).toBe(false);
    expect(isProtectedPath("/api/auth/logout")).toBe(false);
    expect(isProtectedPath("/api/auth/session")).toBe(false);
  });

  it("treats webhooks, cart, catalog and products as public", () => {
    expect(isProtectedPath("/api/webhooks/payment")).toBe(false);
    expect(isProtectedPath("/api/cart")).toBe(false);
    expect(isProtectedPath("/api/cart/variant_1")).toBe(false);
    expect(isProtectedPath("/api/catalog")).toBe(false);
    expect(isProtectedPath("/api/catalog/products")).toBe(false);
    expect(isProtectedPath("/api/catalog/products/slug")).toBe(false);
    expect(isProtectedPath("/api/catalog/search")).toBe(false);
    expect(isProtectedPath("/api/catalog/filters")).toBe(false);
  });

  it("treats checkout, search and filters as public", () => {
    expect(isProtectedPath("/api/checkout")).toBe(false);
    expect(isProtectedPath("/api/search")).toBe(false);
    expect(isProtectedPath("/api/filters")).toBe(false);
  });

  it("treats everything else as public (fail-open)", () => {
    expect(isProtectedPath("/api/unknown")).toBe(false);
    expect(isProtectedPath("/")).toBe(false);
    expect(isProtectedPath("/products")).toBe(false);
  });
});