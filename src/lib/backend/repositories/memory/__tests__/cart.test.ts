import { describe, it, expect } from "vitest";
import {
  MemoryCatalogRepository,
  MemoryCartRepository,
  type MemoryProduct,
} from "../index";
import { money } from "../../../money";

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
        image: { src: "", alt: "" },
        inStock: true,
        href: "/product/slate-hoodie",
      },
      categorySlug: "hoodies",
      ageBand: "9-12Y",
      variants: [
        { id: "v1", sku: "SLATE-9Y", size: "9Y", colour: "Slate", stock: 5, price: money(40, "EUR") },
        { id: "v2", sku: "SLATE-10Y", size: "10Y", colour: "Slate", stock: 3 },
        { id: "v3", sku: "SLATE-11Y", size: "11Y", colour: "Slate", stock: 150 },
        { id: "v4", sku: "SLATE-12Y", size: "12Y", colour: "Slate", stock: 0 },
      ],
    },
  ];
}

describe("MemoryCartRepository — server-side totals", () => {
  it("uses the variant price override when present", async () => {
    const catalog = new MemoryCatalogRepository(makeCatalog());
    const cart = new MemoryCartRepository(catalog);
    await cart.addItem("c1", { variantId: "v1", quantity: 2 }); // €40 × 2
    const state = await cart.getCart("c1");
    expect(state?.subtotal).toBe(80);
    expect(state?.itemCount).toBe(2);
  });

  it("falls back to product price when the variant has no override", async () => {
    const catalog = new MemoryCatalogRepository(makeCatalog());
    const cart = new MemoryCartRepository(catalog);
    await cart.addItem("c1", { variantId: "v2", quantity: 1 }); // €34
    const state = await cart.getCart("c1");
    expect(state?.subtotal).toBe(34);
  });

  it("merges quantities and removes at zero", async () => {
    const catalog = new MemoryCatalogRepository(makeCatalog());
    const cart = new MemoryCartRepository(catalog);
    await cart.addItem("c1", { variantId: "v1", quantity: 1 });
    await cart.addItem("c1", { variantId: "v1", quantity: 2 });
    let state = await cart.getCart("c1");
    expect(state?.items[0].quantity).toBe(3);

    await cart.setQty("c1", "v1", 0);
    state = await cart.getCart("c1");
    expect(state?.itemCount).toBe(0);
  });

  it("returns null for an unknown cart", async () => {
    const catalog = new MemoryCatalogRepository(makeCatalog());
    const cart = new MemoryCartRepository(catalog);
    expect(await cart.getCart("missing")).toBeNull();
  });

  it("clamps quantity to a max of 99", async () => {
    const catalog = new MemoryCatalogRepository(makeCatalog());
    const cart = new MemoryCartRepository(catalog);
    await cart.addItem("c1", { variantId: "v3", quantity: 100 });
    await cart.addItem("c1", { variantId: "v3", quantity: 50 }); // merge: 150 → 99
    const state = await cart.getCart("c1");
    expect(state?.items[0].quantity).toBe(99);
  });

  it("rejects adding a sold-out variant", async () => {
    const catalog = new MemoryCatalogRepository(makeCatalog());
    const cart = new MemoryCartRepository(catalog);
    await expect(cart.addItem("c1", { variantId: "v4", quantity: 1 })).rejects.toThrow(/sold out/);
  });

  it("rejects adding more than the available stock", async () => {
    const catalog = new MemoryCatalogRepository(makeCatalog());
    const cart = new MemoryCartRepository(catalog);
    await expect(cart.addItem("c1", { variantId: "v1", quantity: 6 })).rejects.toThrow(/Only 5 left in stock/);
  });

  it("rejects merging past the available stock", async () => {
    const catalog = new MemoryCatalogRepository(makeCatalog());
    const cart = new MemoryCartRepository(catalog);
    await cart.addItem("c1", { variantId: "v1", quantity: 4 });
    await expect(cart.addItem("c1", { variantId: "v1", quantity: 2 })).rejects.toThrow(/Only 5 left in stock/);
  });

  it("rejects setting a quantity above the available stock", async () => {
    const catalog = new MemoryCatalogRepository(makeCatalog());
    const cart = new MemoryCartRepository(catalog);
    await expect(cart.setQty("c1", "v1", 6)).rejects.toThrow(/Only 5 left in stock/);
  });

  it("rejects setting a quantity on a sold-out variant", async () => {
    const catalog = new MemoryCatalogRepository(makeCatalog());
    const cart = new MemoryCartRepository(catalog);
    await expect(cart.setQty("c1", "v4", 1)).rejects.toThrow(/sold out/);
  });

  it("normalizes non-finite and non-integer quantities", async () => {
    const catalog = new MemoryCatalogRepository(makeCatalog());
    const cart = new MemoryCartRepository(catalog);
    await cart.addItem("c1", { variantId: "v1", quantity: NaN });
    let state = await cart.getCart("c1");
    expect(state?.items[0].quantity).toBe(1);

    await cart.setQty("c1", "v1", 2.7);
    state = await cart.getCart("c1");
    expect(state?.items[0].quantity).toBe(2);

    await cart.setQty("c1", "v1", NaN);
    state = await cart.getCart("c1");
    expect(state?.itemCount).toBe(0);
  });
});
