// Checkout API — creates an order (server-authoritative totals) and begins the
// payment session through the provider-neutral PaymentService. The request carries
// only a cart token + shipping address + idempotency key — never a total.

import { NextRequest, NextResponse } from "next/server";
import { getApp } from "@/lib/backend/container";
import { CART_COOKIE } from "@/lib/backend/cart/token";
import { checkoutSchema, firstIssueMessage } from "@/lib/backend/api/validation";
import { ABILITIES } from "@/lib/backend/auth/roles";
import { authorize, authorizationResponse, getSessionUser } from "@/lib/backend/auth/authorize";
import { StockUnavailableError } from "@/lib/backend/repositories/interfaces";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const denied = authorizationResponse(await authorize(req, ABILITIES.checkoutCreate));
  if (denied) return denied;
  const app = getApp();
  const cartId = req.cookies.get(CART_COOKIE)?.value;
  if (!cartId) return NextResponse.json({ error: "No cart" }, { status: 400 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
  }

  const providerId = app.config.payment.provider;
  const user = await getSessionUser(req);

  try {
    const result = await app.checkout.checkout(cartId, {
      email: parsed.data.email,
      shippingAddress: parsed.data.shippingAddress,
      idempotencyKey: parsed.data.idempotencyKey,
      providerId,
      userId: user?.id,
    });
    return NextResponse.json({
      orderId: result.order.id,
      orderToken: result.order.publicToken,
      total: result.order.total,
      status: result.order.status,
      session: result.session,
    });
  } catch (e) {
    if (e instanceof StockUnavailableError) {
      return NextResponse.json({ error: (e as Error).message }, { status: 409 });
    }
    const msg = (e as Error).message;
    if (msg.includes("empty") || msg.includes("Cart is empty")) {
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}
