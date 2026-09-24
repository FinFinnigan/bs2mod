import { describe, it, expect } from "vitest";
import { MemoryCatalogRepository, type MemoryProduct } from "../index";
import { money } from "../../../money";

function makeProduct(overrides: Partial<MemoryProduct> = {}): MemoryProduct {
  return {
    card: {
      id: "p1",
      slug: "slate-hoodie",
      name: "Slate Hoodie",
      categoryLabel: "HOODIES",
      price: money(34, "EUR"),
      badges: [],
      image: { src: "", alt: "" },
      inStock: true,
      href: "/product/slate-hoodie",
    },
    categorySlug: "hoodies",
    ageBand: "9-12Y",
    variants: [
      { id: "v1", sku: "SLATE-9Y", size: "9Y", colour: "Slate", colourHex: "#555555", stock: 5 },
    ],
    ...overrides,
  };
}

describe("MemoryCatalogRepository — authoritative availability", () => {
  it("derives inStock from variant stock when variants exist (stored false, stock 5)", async () => {
    const repo = new MemoryCatalogRepository([
      makeProduct({ card: { ...makeProduct().card, inStock: false } }),
    ]);
    const [product] = await repo.listAdminProducts();
    expect(product.inStock).toBe(true);
  });

  it("derives inStock from variant stock when variants exist (stored true, stock 0)", async () => {
    const repo = new MemoryCatalogRepository([
      makeProduct({
        variants: [{ id: "v1", sku: "SLATE-9Y", size: "9Y", colour: "Slate", colourHex: "#555555", stock: 0 }],
      }),
    ]);
    const product = await repo.getAdminProduct("p1");
    expect(product?.inStock).toBe(false);
  });

  it("falls back to the stored boolean when there are no variants", async () => {
    const repoTrue = new MemoryCatalogRepository([makeProduct({ variants: [] })]);
    const repoFalse = new MemoryCatalogRepository([
      makeProduct({ variants: [], card: { ...makeProduct().card, inStock: false } }),
    ]);
    expect((await repoTrue.getAdminProduct("p1"))?.inStock).toBe(true);
    expect((await repoFalse.getAdminProduct("p1"))?.inStock).toBe(false);
  });

  it("syncs stored inStock when updateAdminProduct changes variant stock", async () => {
    const repo = new MemoryCatalogRepository([makeProduct()]);
    await repo.updateAdminProduct("p1", { variants: [{ id: "v1", stock: 0 }] });
    expect((await repo.getAdminProduct("p1"))?.inStock).toBe(false);
    await repo.updateAdminProduct("p1", { variants: [{ id: "v1", stock: 5 }] });
    expect((await repo.getAdminProduct("p1"))?.inStock).toBe(true);
  });

  it("derived stock wins over an explicit inStock in the same update", async () => {
    const repo = new MemoryCatalogRepository([makeProduct()]);
    await repo.updateAdminProduct("p1", {
      inStock: true,
      variants: [{ id: "v1", stock: 0 }],
    });
    expect((await repo.getAdminProduct("p1"))?.inStock).toBe(false);
  });
});