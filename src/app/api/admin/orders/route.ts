import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hasDatabase } from "@/lib/backend/db/client";
import { getApp } from "@/lib/backend/container";
import { getAdminSession } from "@/app/admin/session";
import { adminGateDecision } from "@/app/admin/gate";
import { AdminOrdersService } from "@/lib/backend/services/admin-orders";
import { firstIssueMessage } from "@/lib/backend/api/validation";

export const dynamic = "force-dynamic";

const listQuerySchema = z.object({
  status: z
    .enum(["draft", "placed", "confirmed", "fulfilled", "cancelled", "failed", "refunded"])
    .optional(),
  limit: z.coerce.number().int().nonnegative().max(250).optional(),
  offset: z.coerce.number().int().nonnegative().optional(),
});

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

export async function GET(req: NextRequest) {
  try {
    const service = adminService();
    if (!service) return NextResponse.json({ error: "admin unavailable" }, { status: 503 });

    const session = await getAdminSession();
    const decision = adminGateDecision(session?.role);
    if (decision === "login") return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    if (decision === "forbidden") return NextResponse.json({ error: "forbidden" }, { status: 403 });

    const url = new URL(req.url);
    const statusParam = url.searchParams.get("status");
    const limitParam = url.searchParams.get("limit");
    const offsetParam = url.searchParams.get("offset");
    const parsed = listQuerySchema.safeParse({
      status: statusParam && statusParam.length > 0 ? statusParam : undefined,
      limit: limitParam && limitParam.length > 0 ? limitParam : undefined,
      offset: offsetParam && offsetParam.length > 0 ? offsetParam : undefined,
    });
    if (!parsed.success) {
      return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
    }

    const { rows, total } = await service.list({
      status: parsed.data.status,
      limit: parsed.data.limit ?? 50,
      offset: parsed.data.offset ?? 0,
    });
    return NextResponse.json({ orders: rows, total });
  } catch {
    return NextResponse.json({ error: "internal error" }, { status: 503 });
  }
}