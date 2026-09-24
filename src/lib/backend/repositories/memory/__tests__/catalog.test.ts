import { describe, it, expect } from "vitest";
import { MemoryCatalogRepository, type MemoryProduct } from "../index";
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
        badges: ["new"],
        image: { src: "", alt: "" },
        inStock: true,
        href: "/product/slate-hoodie",
      },
      categorySlug: "hoodies",
      ageBand: "9-12Y",
      fit: "Regular",
      description: "A cosy hoodie.",
      variants: [
        { id: "v1", sku: "SLATE-9Y", size: "9Y", colour: "Slate", colourHex: "#555555", stock: 5 },
        { id: "v2", sku: "SLATE-10Y", size: "10Y", colour: "Slate", colourHex: "#555555", stock: 3 },
        { id: "v3", sku: "SLATE-9Y-NAVY", size: "9Y", colour: "Navy", colourHex: "#000080", stock: 1 },
      ],
    },
    {
      card: {
        id: "p2",
        slug: "cream-tee",
        name: "Cream Tee",
        categoryLabel: "TSHIRTS",
        price: money(18, "EUR"),
        compareAtPrice: money(24, "EUR"),
        badges: [],
        image: { src: "", alt: "" },
        inStock: true,
        href: "/product/cream-tee",
      },
      categorySlug: "tshirts",
      ageBand: "3-5Y",
      variants: [
        { id: "v4", sku: "CREAM-3Y", size: "3Y", colour: "Cream", stock: 4 },
      ],
    },
  ];
}

describe("MemoryCatalogRepository — storefront read-model", () => {
  it("derives distinct colours and sizes from variants", async () => {
    const repo = new MemoryCatalogRepository(makeCatalog());
    const [hoodie] = await repo.listCatalogProducts({ category: "hoodies" });
    expect(hoodie.colours).toEqual(["Slate", "Navy"]);
    expect(hoodie.sizes).toEqual(["9Y", "10Y"]);
    expect(hoodie.colourHex).toBe("#555555");
    expect(hoodie.fit).toBe("Regular");
    expect(hoodie.description).toBe("A cosy hoodie.");
  });

  it("filters by category, age band and sale state", async () => {
    const repo = new MemoryCatalogRepository(makeCatalog());
    expect((await repo.listCatalogProducts({ category: "tshirts" })).map((p) => p.slug)).toEqual([
      "cream-tee",
    ]);
    expect((await repo.listCatalogProducts({ ageBand: "9-12Y" })).map((p) => p.slug)).toEqual([
      "slate-hoodie",
    ]);
    expect((await repo.listCatalogProducts({ filters: { onSale: true } })).map((p) => p.slug)).toEqual([
      "cream-tee",
    ]);
    expect((await repo.listCatalogProducts({ filters: { isNew: true } })).map((p) => p.slug)).toEqual([
      "slate-hoodie",
    ]);
  });

  it("sorts by price", async () => {
    const repo = new MemoryCatalogRepository(makeCatalog());
    const asc = await repo.listCatalogProducts({ sort: "price-asc" });
    expect(asc.map((p) => p.slug)).toEqual(["cream-tee", "slate-hoodie"]);
    const desc = await repo.listCatalogProducts({ sort: "price-desc" });
    expect(desc.map((p) => p.slug)).toEqual(["slate-hoodie", "cream-tee"]);
  });

  it("keeps listProducts and listCatalogProducts consistent", async () => {
    const repo = new MemoryCatalogRepository(makeCatalog());
    const cards = await repo.listProducts({ sort: "price-asc" });
    const products = await repo.listCatalogProducts({ sort: "price-asc" });
    expect(products.map((p) => p.slug)).toEqual(cards.map((c) => c.slug));
  });

  it("hides archived products from every storefront read", async () => {
    const repo = new MemoryCatalogRepository([
      ...makeCatalog(),
      {
        card: {
          id: "p3",
          slug: "navy-cap",
          name: "Navy Cap",
          categoryLabel: "ACCESSORIES",
          price: money(15, "EUR"),
          badges: [],
          image: { src: "", alt: "" },
          inStock: true,
          href: "/product/navy-cap",
        },
        categorySlug: "accessories",
        ageBand: "6-8Y",
        archived: true,
        variants: [],
      },
    ]);
    expect((await repo.listProducts({})).map((p) => p.slug)).toEqual(["slate-hoodie", "cream-tee"]);
    expect((await repo.listCatalogProducts({})).map((p) => p.slug)).toEqual(["slate-hoodie", "cream-tee"]);
    expect(await repo.getProduct("navy-cap")).toBeUndefined();
    expect((await repo.search("navy")).products.map((p) => p.slug)).toEqual([]);
    const filters = await repo.buildFilters({});
    expect(filters.find((f) => f.key === "type")?.options.map((o) => o.value)).toEqual(["hoodies", "tshirts"]);
  });
});
