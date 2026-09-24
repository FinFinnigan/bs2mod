// Guest cart token — an opaque, httpOnly cookie identifies a persistent anonymous
// cart. No account is required; a future account feature can later link the same
// cart id to a customer without changing this boundary.

import { randomUUID } from "crypto";

export const CART_COOKIE = "boyshop.cart";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function newCartToken(): string {
  return `cart_${randomUUID().replace(/-/g, "")}`;
}

export const cartCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE,
  secure: process.env.NODE_ENV === "production",
};
