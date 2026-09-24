import { NextRequest, NextResponse } from "next/server";
import { hasDatabase } from "@/lib/backend/db/client";
import { getApp } from "@/lib/backend/container";
import { getAdminSession } from "@/app/admin/session";
import { adminGateDecision } from "@/app/admin/gate";
import {
  AdminOrdersService,
  AdminOrderNotFoundError,
} from "@/lib/backend/services/admin-orders";
import { InvalidOrderTransitionError } from "@/lib/backend/orders/types";
import { adminOrderActionSchema, firstIssueMessage } from "@/lib/backend/api/validation";

export const dynamic = "force-dynamic";

function adminService(): AdminOrdersService | null {
  if (!hasDatabase()) return null;
  const app = getApp();
  if (!app.ordersService) return null;
  return new AdminOrdersService({
    orderRepo: app.orders,
    ordersService: app.ordersService,
    payments: app.payments,
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const service = adminService();
    if (!service) return NextResponse.json({ error: "admin unavailable" }, { status: 503 });

    const session = await getAdminSession();
    const decision = adminGateDecision(session?.role);
    if (decision === "login") return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    if (decision === "forbidden") return NextResponse.json({ error: "forbidden" }, { status: 403 });

    const { id } = await params;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = adminOrderActionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
    }

    const result = await service[parsed.data.action](id);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof InvalidOrderTransitionError) {
      return NextResponse.json(
        { error: `Illegal transition: ${err.from} -> ${err.to}` },
        { status: 409 }
      );
    }
    if (err instanceof AdminOrderNotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    return NextResponse.json({ error: "internal error" }, { status: 503 });
  }
}