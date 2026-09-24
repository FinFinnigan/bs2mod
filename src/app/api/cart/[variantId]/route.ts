import { NextRequest, NextResponse } from "next/server";
import { getApp } from "@/lib/backend/container";
import { CART_COOKIE, cartCookieOptions } from "@/lib/backend/cart/token";
import { ABILITIES } from "@/lib/backend/auth/roles";
import { authorize, authorizationResponse } from "@/lib/backend/auth/authorize";
import { StockUnavailableError } from "@/lib/backend/repositories/interfaces";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ variantId: string }> }) {
  const denied = authorizationResponse(await authorize(req, ABILITIES.cartWrite));
  if (denied) return denied;
  const { variantId } = await params;
  const app = getApp();
  const token = req.cookies.get(CART_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "No cart" }, { status: 400 });
  const body = (await req.json()) as { quantity?: number };
  try {
    const cart = await app.cart.setQty(token, variantId, body.quantity ?? 0);
    return NextResponse.json({ cart });
  } catch (e) {
    const status = e instanceof StockUnavailableError ? 409 : 503;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ variantId: string }> }) {
  const denied = authorizationResponse(await authorize(req, ABILITIES.cartWrite));
  if (denied) return denied;
  const { variantId } = await params;
  const app = getApp();
  const token = req.cookies.get(CART_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "No cart" }, { status: 400 });
  try {
    const cart = await app.cart.removeItem(token, variantId);
    return NextResponse.json({ cart });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 503 });
  }
}
