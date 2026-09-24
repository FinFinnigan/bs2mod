// C02.05 — admin variant-stock editing (server-action layer). The REAL
// updateProduct action runs against a fake AppContainer built from the REAL
// in-memory catalog repository — the same pattern as
// src/app/api/admin/products/__tests__/route.test.ts. The gate, session,
// database guard, revalidatePath and redirect are mocked so the action's
// validation → service → repository path is exercised end-to-end.
//
// Coverage mapped to acceptance:
//  - a variant-stock edit flows through updateProduct → validated payload →
//    repository update (stock persisted, inStock derived true)
//  - invalid variant stock (negative) is rejected by the schema: redirect with
//    an error= query and the repository is left unchanged

import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryCatalogRepository, type MemoryProduct } from "@/lib/backend/repositories/memory";
import { money } from "@/lib/backend/money";

const holder = vi.hoisted<{ catalog: MemoryCatalogRepository | null }>(() => ({ catalog: null }));
// Real Next.js redirect() throws NEXT_REDIRECT; the mock mirrors that so the
// action never continues past a redirect (a no-op would fall through into
// service.update with an undefined payload after a failed parse).
const redirectMock = vi.hoisted(() =>
  vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT: ${url}`);
  })
);

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/lib/backend/db/client", () => ({
  hasDatabase: () => true,
}));

vi.mock("@/lib/backend/container", () => ({
  getApp: () => {
    if (!holder.catalog) throw new Error("test container not built");
    return { catalog: holder.catalog };
  },
}));

// actions.ts imports these as ../../gate and ../../session; from this test file
// the same modules resolve as ../../../gate and ../../../session.
vi.mock("../../../gate", () => ({
  adminGateDecision: () => "allow",
}));

vi.mock("../../../session", () => ({
  getAdminSession: async () => ({ role: "admin" }),
}));

import { updateProduct } from "../actions";

function makeCatalog(): MemoryProduct[] {
  return [
    {
      card: {
        id: "p1",
        slug: "slate-hoodie",
        name: "Slate Hoodie",
        categoryLabel: "HOODIES",
        price: money(34, "EUR"),
        badges: [],
        image: { src: "/img/slate-hoodie.jpg", alt: "Slate Hoodie" },
        inStock: true,
        href: "/product/slate-hoodie",
      },
      categorySlug: "hoodies",
      ageBand: "9-12Y",
      variants: [{ id: "v1", sku: "SLATE-9Y", size: "9Y", colour: "Slate", stock: 5 }],
    },
  ];
}

beforeEach(() => {
  redirectMock.mockClear();
});

describe("updateProduct — variant stock editing", () => {
  it("persists a variant-stock edit and derives inStock from the updated stock", async () => {
    const catalog = new MemoryCatalogRepository(makeCatalog());
    holder.catalog = catalog;
    const fd = new FormData();
    fd.set("id", "p1");
    fd.set("variantStock-v1", "8");

    await expect(updateProduct(fd)).rejects.toThrow("NEXT_REDIRECT");

    const stored = await catalog.getAdminProduct("p1");
    expect(stored?.variants).toEqual([{ id: "v1", stock: 8 }]);
    expect(stored?.inStock).toBe(true);
  });

  it("rejects negative variant stock and leaves the repository unchanged", async () => {
    const catalog = new MemoryCatalogRepository(makeCatalog());
    holder.catalog = catalog;
    const fd = new FormData();
    fd.set("id", "p1");
    fd.set("variantStock-v1", "-3");

    await expect(updateProduct(fd)).rejects.toThrow("NEXT_REDIRECT");

    expect(redirectMock).toHaveBeenCalledWith(expect.stringContaining("error="));
    const stored = await catalog.getAdminProduct("p1");
    expect(stored?.variants).toEqual([{ id: "v1", stock: 5 }]);
  });

  it("does not write a stale inStock when all variant stock inputs are cleared", async () => {
    const catalog = new MemoryCatalogRepository(makeCatalog());
    holder.catalog = catalog;
    const fd = new FormData();
    fd.set("id", "p1");
    fd.set("variantStock-v1", "");
    fd.set("inStockDerived", "1");

    await expect(updateProduct(fd)).rejects.toThrow("NEXT_REDIRECT");

    const stored = await catalog.getAdminProduct("p1");
    expect(stored?.variants).toEqual([{ id: "v1", stock: 5 }]);
    expect(stored?.inStock).toBe(true);
  });
});