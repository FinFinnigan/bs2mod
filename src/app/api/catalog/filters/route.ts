import { NextRequest, NextResponse } from "next/server";
import { getApp } from "@/lib/backend/container";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const app = getApp();
  try {
    const filters = await app.catalog.buildFilters({});
    return NextResponse.json({ filters });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 503 });
  }
}
