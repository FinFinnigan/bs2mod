// Catalog API — serves the frozen §11 shapes over the network via the Catalog
// repository. Read-only. Replaces the mock data layer for the live path.

import { NextRequest, NextResponse } from "next/server";
import { getApp } from "@/lib/backend/container";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const app = getApp();
  const sp = req.nextUrl.searchParams;
  const q = {
    category: sp.get("category") ?? undefined,
    ageBand: sp.get("ageBand") ?? undefined,
    collection: sp.get("collection") ?? undefined,
    sort: sp.get("sort") ?? undefined,
  };
  try {
    const products = await app.catalog.listProducts(q);
    return NextResponse.json({ products });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 503 });
  }
}
