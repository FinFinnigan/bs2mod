import { describe, expect, it } from "vitest";
import { MemoryCatalogRepository, MemoryOrderRepository, type MemoryProduct } from "../index";
import type { CreateOrderInput, OrderRow } from "../../interfaces";
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
  ];
}

describe("MemoryOrderRepository.create — idempotency", () => {
  it("persists exactly one order and one stock decrement when two same-key creates race", async () => {
    const catalog = new MemoryCatalogRepository(makeCatalog());
    const orders = new MemoryOrderRepository(catalog);

    const input: CreateOrderInput = {
      id: "ord-test-1",
      cartId: "cart-test-1",
      email: "buyer@example.com",
      shippingAddress: {
        fullName: "Test Buyer",
        line1: "1 Test Street",
        city: "Dublin",
        postcode: "D01 AB12",
        country: "IE",
      },
      idempotencyKey: "k-test-1",
    };
    const order: OrderRow = {
      id: "ord-test-1",
      cartId: "cart-test-1",
      email: "buyer@example.com",
      publicToken: "tok-test-1",
      status: "placed",
      subtotal: money(50, "EUR"),
      shippingAmount: money(5, "EUR"),
      total: money(55, "EUR"),
      currency: "EUR",
      items: [
        {
          variantId: "v1",
          productId: "p1",
          sku: "SLATE-9Y",
          name: "Slate Hoodie",
          size: "9Y",
          colour: "Slate",
          unitPrice: money(50, "EUR"),
          quantity: 1,
          lineTotal: money(50, "EUR"),
        },
      ],
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };

    const results = await Promise.allSettled([
      orders.create(input, order),
      orders.create(input, order),
    ]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);

    const reason = (rejected[0] as PromiseRejectedResult).reason;
    expect(reason).toBeInstanceOf(Error);
    expect((reason as Error).message).toBe("Duplicate idempotency key: k-test-1");

    expect(catalog.findVariant("v1")?.stock).toBe(4);
    expect(await orders.getByIdempotencyKey("k-test-1")).not.toBeNull();
    expect((await orders.list()).total).toBe(1);
  });
});