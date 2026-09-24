import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/backend/catalog-facade";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  try {
    const result = await searchProducts(q);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 503 });
  }
}
