// Cart API — persistent server-side cart keyed by an httpOnly cookie token.
// GET returns the current cart (creating a token if absent); POST/PATCH/DELETE
// mutate it. Totals are computed server-side; the browser never sends totals.

import { NextRequest, NextResponse } from "next/server";
import { getApp } from "@/lib/backend/container";
import { CART_COOKIE, cartCookieOptions, newCartToken } from "@/lib/backend/cart/token";
import { ABILITIES } from "@/lib/backend/auth/roles";
import { authorize, authorizationResponse } from "@/lib/backend/auth/authorize";
import { StockUnavailableError } from "@/lib/backend/repositories/interfaces";

export const dynamic = "force-dynamic";

function readToken(req: NextRequest): string {
  return req.cookies.get(CART_COOKIE)?.value ?? "";
}

function withToken(res: NextResponse, token: string): NextResponse {
  res.cookies.set(CART_COOKIE, token, cartCookieOptions);
  return res;
}

export async function GET(req: NextRequest) {
  const app = getApp();
  let token = readToken(req);
  if (!token) {
    token = newCartToken();
    const res = NextResponse.json({ cart: emptyCart() });
    return withToken(res, token);
  }
  try {
    const cart = await app.cart.getCart(token);
    if (!cart) return withToken(NextResponse.json({ cart: emptyCart() }), token);
    return NextResponse.json({ cart });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  const denied = authorizationResponse(await authorize(req, ABILITIES.cartWrite));
  if (denied) return denied;
  const app = getApp();
  let token = readToken(req);
  if (!token) token = newCartToken();
  const body = (await req.json()) as { variantId?: string; quantity?: number };
  if (!body.variantId) return NextResponse.json({ error: "variantId required" }, { status: 400 });
  try {
    const cart = await app.cart.addItem(token, { variantId: body.variantId, quantity: body.quantity ?? 1 });
    return withToken(NextResponse.json({ cart }), token);
  } catch (e) {
    const status = e instanceof StockUnavailableError ? 409 : 503;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}

function emptyCart() {
  return { items: [], itemCount: 0, subtotal: 0, discounts: [], total: 0, freeShippingThreshold: 50, amountToFreeShipping: 50 };
}
