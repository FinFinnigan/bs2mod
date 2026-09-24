// Route protection rules shared by the Edge middleware and (potentially) other
// layers. This module is intentionally free of `@/` and node imports so it can
// run in the Edge runtime and be unit-tested directly under vitest.

export const SESSION_COOKIE = "boyshop.session";

const PUBLIC_PREFIXES = [
  "/api/auth",
  "/api/webhooks",
  "/api/cart",
  "/api/catalog",
  "/api/products",
];

const PUBLIC_EXACT = ["/api/checkout", "/api/search", "/api/filters"];

export function isProtectedPath(pathname: string): boolean {
  if (PUBLIC_EXACT.includes(pathname)) return false;
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return false;
  return pathname === "/api/orders" || pathname.startsWith("/api/orders/");
}