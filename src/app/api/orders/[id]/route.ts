// Order API — lookup by opaque public token (used by the confirmation page).
// Read-only. The path segment is the publicToken, never the internal order id:
// old-style guessable ids (ord_<idempotencyKey>, sequential) resolve to nothing.
// Owner-scoped: an order with a userId requires the owner's session or an
// orders:read role (admin/staff); guest orders are gated by token possession.

import { NextRequest, NextResponse } from "next/server";
import { getApp } from "@/lib/backend/container";
import { getSessionUser } from "@/lib/backend/auth/authorize";
import { ABILITIES, can } from "@/lib/backend/auth/roles";
import { isTerminal } from "@/lib/backend/orders/state-machine";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: token } = await params;
  const app = getApp();
  try {
    const order = await app.orders.getByPublicToken(token);
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (order.userId) {
      const user = await getSessionUser(req);
      if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
      if (user.id !== order.userId && !can(user.role, ABILITIES.orderRead)) {
        return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
      }
    }

    // Reconcile pending payments against the provider before serving so a paid
    // payment advances the order (MOL-004). Gated to non-mock providers and
    // non-terminal orders; a no-op otherwise.
    if (app.config.payment.provider !== "mock" && app.ordersService && !isTerminal(order.status)) {
      await app.ordersService.reconcileOrder(order);
      const fresh = await app.orders.getByPublicToken(token);
      if (fresh) return NextResponse.json({ order: fresh });
    }

    return NextResponse.json({ order });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 503 });
  }
}