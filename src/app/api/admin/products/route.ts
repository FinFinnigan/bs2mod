import { NextRequest, NextResponse } from "next/server";
import { hasDatabase } from "@/lib/backend/db/client";
import { getApp } from "@/lib/backend/container";
import { getAdminSession } from "@/app/admin/session";
import { adminGateDecision } from "@/app/admin/gate";
import { AdminProductsService } from "@/lib/backend/services/admin-products";
import { adminProductSchema, firstIssueMessage } from "@/lib/backend/api/validation";

export const dynamic = "force-dynamic";

function adminService(): AdminProductsService | null {
  if (!hasDatabase()) return null;
  return new AdminProductsService({ catalog: getApp().catalog });
}

export async function GET() {
  try {
    const service = adminService();
    if (!service) return NextResponse.json({ error: "admin unavailable" }, { status: 503 });

    const session = await getAdminSession();
    const decision = adminGateDecision(session?.role);
    if (decision === "login") return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    if (decision === "forbidden") return NextResponse.json({ error: "forbidden" }, { status: 403 });

    const products = await service.list();
    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ error: "internal error" }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const service = adminService();
    if (!service) return NextResponse.json({ error: "admin unavailable" }, { status: 503 });

    const session = await getAdminSession();
    const decision = adminGateDecision(session?.role);
    if (decision === "login") return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    if (decision === "forbidden") return NextResponse.json({ error: "forbidden" }, { status: 403 });

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = adminProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
    }

    const product = await service.create(parsed.data);
    return NextResponse.json({ product }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "internal error" }, { status: 503 });
  }
}