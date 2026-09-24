import { describe, it, expect } from "vitest";
import { rowToCard, rowToAdminProduct } from "../catalog";
import { variantToProductCard } from "../cart";
import type { ProductRow, VariantRow } from "../../../db/schema";

function productRow(overrides: Partial<ProductRow> = {}): ProductRow {
  return {
    id: "p1",
    slug: "slate-hoodie",
    name: "Slate Hoodie",
    categorySlug: "hoodies",
    ageBand: "9-12Y",
    price: 3400,
    compareAtPrice: null,
    currency: "EUR",
    badges: [],
    inStock: true,
    colourHex: "#555555",
    description: "A cosy hoodie.",
    material: "Cotton",
    fit: "Regular",
    care: "Machine wash",
    origin: null,
    archived: false,
    imageUrl: null,
    createdAt: new Date("2025-01-01T00:00:00Z"),
    updatedAt: new Date("2025-01-01T00:00:00Z"),
    ...overrides,
  };
}

function variantRow(overrides: Partial<VariantRow> = {}): VariantRow {
  return {
    id: "v1",
    productId: "p1",
    sku: "SLATE-9Y",
    size: "9Y",
    colour: "Slate",
    colourHex: "#555555",
    stock: 5,
    priceOverride: null,
    ...overrides,
  };
}

describe("Drizzle availability readers — authoritative availability", () => {
  describe("rowToCard", () => {
    it("derives inStock from variant stock when variants exist (stored false, stock 5)", () => {
      const card = rowToCard(productRow({ inStock: false }), [variantRow()]);
      expect(card.inStock).toBe(true);
    });

    it("derives inStock from variant stock when variants exist (stored true, stock 0)", () => {
      const card = rowToCard(productRow(), [variantRow({ stock: 0 })]);
      expect(card.inStock).toBe(false);
    });

    it("falls back to the stored boolean when there are no variants", () => {
      expect(rowToCard(productRow(), []).inStock).toBe(true);
      expect(rowToCard(productRow({ inStock: false }), []).inStock).toBe(false);
    });
  });

  describe("rowToAdminProduct", () => {
    it("derives inStock from variant stock when variants exist (stored false, stock 5)", () => {
      const record = rowToAdminProduct(productRow({ inStock: false }), [variantRow()]);
      expect(record.inStock).toBe(true);
    });

    it("derives inStock from variant stock when variants exist (stored true, stock 0)", () => {
      const record = rowToAdminProduct(productRow(), [variantRow({ stock: 0 })]);
      expect(record.inStock).toBe(false);
    });

    it("falls back to the stored boolean when there are no variants", () => {
      expect(rowToAdminProduct(productRow(), []).inStock).toBe(true);
      expect(rowToAdminProduct(productRow({ inStock: false }), []).inStock).toBe(false);
    });
  });

  describe("variantToProductCard", () => {
    it("derives inStock from variant stock when variants exist (stored false, stock 5)", () => {
      const card = variantToProductCard(productRow({ inStock: false }), [variantRow()]);
      expect(card.inStock).toBe(true);
    });

    it("derives inStock from variant stock when variants exist (stored true, stock 0)", () => {
      const card = variantToProductCard(productRow(), [variantRow({ stock: 0 })]);
      expect(card.inStock).toBe(false);
    });

    it("falls back to the stored boolean when there are no variants", () => {
      expect(variantToProductCard(productRow(), []).inStock).toBe(true);
      expect(variantToProductCard(productRow({ inStock: false }), []).inStock).toBe(false);
    });
  });
});