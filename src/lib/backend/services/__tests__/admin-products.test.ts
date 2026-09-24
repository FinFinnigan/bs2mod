import { describe, it, expect } from "vitest";
import { AdminProductsService } from "../admin-products";
import { MemoryCatalogRepository, type MemoryProduct } from "../../repositories/memory";
import { money } from "../../money";

function makeCatalog(): MemoryProduct[] {
  return [
    {
      card: {
        id: "p1",
        slug: "slate-hoodie",
        name: "Slate Hoodie",
        categoryLabel: "HOODIES",
        price: money(34, "EUR"),
        compareAtPrice: money(49, "EUR"),
        badges: ["sale"],
        image: { src: "", alt: "Slate Hoodie" },
        inStock: true,
        href: "/product/slate-hoodie",
        ageLabel: "9-12Y",
      },
      categorySlug: "hoodies",
      ageBand: "9-12Y",
      fit: "Regular",
      variants: [{ id: "v1", sku: "SLATE-9Y", size: "9Y", colour: "Slate", stock: 5 }],
    },
    {
      card: {
        id: "p2",
        slug: "cream-tee",
        name: "Cream Tee",
        categoryLabel: "TSHIRTS",
        price: money(18, "EUR"),
        badges: [],
        image: { src: "", alt: "Cream Tee" },
        inStock: true,
        href: "/product/cream-tee",
        ageLabel: "3-5Y",
      },
      categorySlug: "tshirts",
      ageBand: "3-5Y",
      archived: true,
      variants: [{ id: "v2", sku: "CREAM-3Y", size: "3Y", colour: "Cream", stock: 4 }],
    },
  ];
}

function setup() {
  const catalog = new MemoryCatalogRepository(makeCatalog());
  const service = new AdminProductsService({ catalog, id: () => "prd_new" });
  return { catalog, service };
}

describe("AdminProductsService — admin product CRUD", () => {
  it("lists all products including archived ones", async () => {
    const { service } = setup();
    const all = await service.list();
    expect(all.map((p) => p.id)).toEqual(["p1", "p2"]);
    expect(all.find((p) => p.id === "p2")?.archived).toBe(true);
  });

  it("gets a product by id, including archived ones", async () => {
    const { service } = setup();
    const p = await service.get("p2");
    expect(p?.slug).toBe("cream-tee");
    expect(p?.archived).toBe(true);
  });

  it("returns null for an unknown id", async () => {
    const { service } = setup();
    expect(await service.get("nope")).toBeNull();
  });

  it("creates a product with a server-generated id", async () => {
    const { service } = setup();
    const created = await service.create({
      slug: "navy-cap",
      name: "Navy Cap",
      categorySlug: "accessories",
      ageBand: "6-8Y",
      price: 1500,
      currency: "EUR",
      badges: ["new"],
      inStock: true,
    });
    expect(created.id).toBe("prd_new");
    expect(created.slug).toBe("navy-cap");
    expect(created.price).toBe(1500);
    expect(created.archived).toBe(false);
    const listed = await service.list();
    expect(listed.map((p) => p.id)).toContain("prd_new");
  });

  it("updates fields and refreshes updatedAt", async () => {
    const { service } = setup();
    const before = await service.get("p1");
    const updated = await service.update("p1", { name: "Slate Hoodie Pro", price: 3900 });
    expect(updated?.name).toBe("Slate Hoodie Pro");
    expect(updated?.price).toBe(3900);
    expect((updated?.updatedAt ?? "") >= (before?.updatedAt ?? "")).toBe(true);
  });

  it("lists variant stock with each product", async () => {
    const { service } = setup();
    const all = await service.list();
    expect(all.find((p) => p.id === "p1")?.variants).toEqual([{ id: "v1", stock: 5 }]);
  });

  it("updates variant stock through the product patch", async () => {
    const { service, catalog } = setup();
    const updated = await service.update("p1", { variants: [{ id: "v1", stock: 9 }] });
    expect(updated?.variants).toEqual([{ id: "v1", stock: 9 }]);
    expect(catalog.findVariant("v1")?.stock).toBe(9);
  });

  it("ignores unknown variant ids when updating stock", async () => {
    const { service, catalog } = setup();
    const updated = await service.update("p1", { variants: [{ id: "nope", stock: 1 }] });
    expect(updated?.variants).toEqual([{ id: "v1", stock: 5 }]);
    expect(catalog.findVariant("v1")?.stock).toBe(5);
  });

  it("clears a nullable field when the patch sends null", async () => {
    const { service } = setup();
    const updated = await service.update("p1", { compareAtPrice: null });
    expect(updated?.compareAtPrice).toBeNull();
  });

  it("archives a product — hidden from storefront reads, still in admin list", async () => {
    const { service, catalog } = setup();
    const archived = await service.archive("p1");
    expect(archived?.archived).toBe(true);
    expect((await catalog.listProducts({})).map((p) => p.slug)).toEqual([]);
    expect(await catalog.getProduct("slate-hoodie")).toBeUndefined();
    expect((await service.list()).map((p) => p.id)).toContain("p1");
  });

  it("returns null when updating an unknown id", async () => {
    const { service } = setup();
    expect(await service.update("nope", { name: "X" })).toBeNull();
  });
});