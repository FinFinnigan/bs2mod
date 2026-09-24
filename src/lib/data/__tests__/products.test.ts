import { describe, it, expect } from "vitest";
import {
  applyFilters,
  EMPTY_FILTERS,
  type ActiveFilters,
  type CatalogProduct,
} from "../products";

function card(price: number, overrides: Partial<CatalogProduct> = {}): CatalogProduct {
  return {
    id: `p-${price}`,
    slug: `p-${price}`,
    name: `Product ${price}`,
    categoryLabel: "HOODIES",
    categorySlug: "hoodies",
    ageBand: "9-12Y",
    price: { amount: price, currency: "EUR" },
    badges: [],
    image: { src: "x", alt: "x" },
    inStock: true,
    href: `/product/p-${price}`,
    colourHex: "Slate",
    colours: ["Slate"],
    sizes: ["9Y"],
    material: "cotton",
    fit: "Regular",
    care: "Machine wash 30°",
    description: "test",
    ...overrides,
  };
}

describe("applyFilters / price range", () => {
  const products = [card(10), card(25), card(50), card(75), card(100)];

  it("returns everything with empty filters", () => {
    expect(applyFilters(products, EMPTY_FILTERS, "featured")).toHaveLength(5);
  });

  it("filters by minPrice only", () => {
    const f: ActiveFilters = { ...EMPTY_FILTERS, minPrice: 50 };
    const out = applyFilters(products, f, "featured");
    expect(out.map((p) => p.price.amount)).toEqual([50, 75, 100]);
  });

  it("filters by maxPrice only", () => {
    const f: ActiveFilters = { ...EMPTY_FILTERS, maxPrice: 50 };
    const out = applyFilters(products, f, "featured");
    expect(out.map((p) => p.price.amount)).toEqual([10, 25, 50]);
  });

  it("filters by both bounds (band intersection)", () => {
    const f: ActiveFilters = { ...EMPTY_FILTERS, minPrice: 25, maxPrice: 75 };
    const out = applyFilters(products, f, "featured");
    expect(out.map((p) => p.price.amount)).toEqual([25, 50, 75]);
  });

  it("includes a ranged product whose band overlaps the min bound", () => {
    const ranged = card(20, { range: { min: 15, max: 60 } });
    const f: ActiveFilters = { ...EMPTY_FILTERS, minPrice: 50 };
    const out = applyFilters([ranged, card(10)], f, "featured");
    expect(out.map((p) => p.id)).toEqual([ranged.id]);
  });

  it("excludes a ranged product whose band sits entirely below the min bound", () => {
    const ranged = card(20, { range: { min: 15, max: 30 } });
    const f: ActiveFilters = { ...EMPTY_FILTERS, minPrice: 50 };
    expect(applyFilters([ranged], f, "featured")).toHaveLength(0);
  });

  it("excludes a ranged product whose band sits entirely above the max bound", () => {
    const ranged = card(80, { range: { min: 70, max: 120 } });
    const f: ActiveFilters = { ...EMPTY_FILTERS, maxPrice: 50 };
    expect(applyFilters([ranged], f, "featured")).toHaveLength(0);
  });

  it("sorts by price ascending and descending", () => {
    expect(applyFilters(products, EMPTY_FILTERS, "price-asc").map((p) => p.price.amount)).toEqual([
      10, 25, 50, 75, 100,
    ]);
    expect(applyFilters(products, EMPTY_FILTERS, "price-desc").map((p) => p.price.amount)).toEqual([
      100, 75, 50, 25, 10,
    ]);
  });
});