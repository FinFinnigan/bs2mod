import { describe, it, expect, vi } from "vitest";
import { CheckoutService } from "../checkout";
import { PaymentService } from "../../payments/service";
import { PaymentProviderRegistry } from "../../payments/registry";
import { MockPaymentProvider } from "../../payments/adapters/mock";
import { StripePaymentProvider } from "../../payments/adapters/stripe";
import { MemoryPaymentStore } from "../../repositories/memory/payment-store";
import {
  MemoryCatalogRepository,
  MemoryCartRepository,
  MemoryOrderRepository,
  type MemoryProduct,
} from "../../repositories/memory";
import { money } from "../../money";
import { StockUnavailableError } from "../../repositories/interfaces";

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
      variants: [
        { id: "v1", sku: "SLATE-9Y", size: "9Y", colour: "Slate", stock: 5 },
        { id: "v2", sku: "SLATE-10Y", size: "10Y", colour: "Slate", stock: 3 },
      ],
    },
    {
      card: {
        id: "p2",
        slug: "cloud-tee",
        name: "Cloud Tee",
        categoryLabel: "T-SHIRTS",
        price: money(18, "EUR"),
        badges: ["new"],
        image: { src: "", alt: "Cloud Tee" },
        inStock: true,
        href: "/product/cloud-tee",
        ageLabel: "3-5Y",
      },
      categorySlug: "tshirts",
      ageBand: "3-5Y",
      variants: [{ id: "v3", sku: "CLOUD-3Y", size: "3Y", colour: "White", stock: 10 }],
    },
  ];
}

function setup(
  overrides: Partial<ConstructorParameters<typeof CheckoutService>[0]> = {}
) {
  const catalog = new MemoryCatalogRepository(makeCatalog());
  const cart = new MemoryCartRepository(catalog);
  const orders = new MemoryOrderRepository(catalog);
  const registry = new PaymentProviderRegistry();
  const provider = new MockPaymentProvider();
  registry.register(provider);
  const payments = new PaymentService({ registry, store: new MemoryPaymentStore() });
  const checkout = new CheckoutService({
    cartRepo: cart,
    orderRepo: orders,
    payments,
    shipping: { freeThreshold: 50, flatRate: 4.95 },
    id: () => "ord_test",
    ...overrides,
  });
  return { catalog, cart, orders, payments, checkout, provider, registry };
}

const ADDRESS = {
  fullName: "Test Parent",
  line1: "1 Main St",
  city: "Dublin",
  postcode: "D01",
  country: "IE",
};

describe("CheckoutService — server-authoritative totals", () => {
  it("computes totals from server data, ignoring any client hint", async () => {
    const { cart, checkout } = setup();
    await cart.addItem("c1", { variantId: "v1", quantity: 2 }); // 2 × €34 = €68
    const result = await checkout.checkout("c1", {
      email: "a@b.c",
      shippingAddress: ADDRESS,
      idempotencyKey: "k1",
      providerId: "mock",
    });
    expect(result.order.subtotal.amount).toBe(68);
    // subtotal ≥ €50 → free shipping
    expect(result.order.shippingAmount.amount).toBe(0);
    expect(result.order.total.amount).toBe(68);
  });

  it("adds flat shipping when below the free threshold", async () => {
    const { cart, checkout } = setup();
    await cart.addItem("c1", { variantId: "v3", quantity: 1 }); // €18
    const result = await checkout.checkout("c1", {
      shippingAddress: ADDRESS,
      idempotencyKey: "k2",
      providerId: "mock",
    });
    expect(result.order.subtotal.amount).toBe(18);
    expect(result.order.shippingAmount.amount).toBe(4.95);
    expect(result.order.total.amount).toBe(22.95);
  });

  it("is idempotent — retrying the same key returns the same order", async () => {
    const { cart, checkout } = setup();
    await cart.addItem("c1", { variantId: "v1", quantity: 1 });
    const a = await checkout.checkout("c1", {
      shippingAddress: ADDRESS,
      idempotencyKey: "same",
      providerId: "mock",
    });
    const b = await checkout.checkout("c1", {
      shippingAddress: ADDRESS,
      idempotencyKey: "same",
      providerId: "mock",
    });
    expect(a.order.id).toBe(b.order.id);
  });

  it("retrying the same key reuses the payment — no second provider session", async () => {
    const { cart, checkout, payments, provider } = setup();
    await cart.addItem("c1", { variantId: "v1", quantity: 1 });
    const created = vi.spyOn(provider, "createSession");
    const input = { shippingAddress: ADDRESS, idempotencyKey: "same", providerId: "mock" };

    const a = await checkout.checkout("c1", input);
    const b = await checkout.checkout("c1", input);

    expect(a.order.id).toBe(b.order.id);
    expect(b.paymentId).toBe(a.paymentId);
    expect(a.paymentId).toBe("pay_ord_test"); // no pay_pay_ double prefix
    expect(b.session.kind).toBe("none"); // existing provider session reused
    expect(created).toHaveBeenCalledTimes(1); // never begin() twice for one order
    const byOrder = await payments.store.listByOrder(a.order.id);
    expect(byOrder).toHaveLength(1);
  });

  it("rejects an empty cart", async () => {
    const { checkout } = setup();
    await expect(
      checkout.checkout("nope", { shippingAddress: ADDRESS, idempotencyKey: "k3", providerId: "mock" })
    ).rejects.toThrow(/empty/i);
  });

  it("decrements variant stock when an order is placed", async () => {
    const { catalog, cart, checkout } = setup();
    await cart.addItem("c1", { variantId: "v1", quantity: 2 });
    await checkout.checkout("c1", {
      shippingAddress: ADDRESS,
      idempotencyKey: "k-stock",
      providerId: "mock",
    });
    expect(catalog.findVariant("v1")?.stock).toBe(3);
  });

  it("rejects checkout when stock dropped below the cart quantity", async () => {
    const { catalog, cart, checkout } = setup();
    await cart.addItem("c1", { variantId: "v1", quantity: 5 });
    await catalog.updateAdminProduct("p1", { variants: [{ id: "v1", stock: 2 }] });
    await expect(
      checkout.checkout("c1", { shippingAddress: ADDRESS, idempotencyKey: "k-drop", providerId: "mock" })
    ).rejects.toThrow(/Only 2 left in stock/);
  });

  it("rejects checkout for a sold-out variant", async () => {
    const { catalog, cart, checkout } = setup();
    await cart.addItem("c1", { variantId: "v1", quantity: 1 });
    await catalog.updateAdminProduct("p1", { variants: [{ id: "v1", stock: 0 }] });
    await expect(
      checkout.checkout("c1", { shippingAddress: ADDRESS, idempotencyKey: "k-sold", providerId: "mock" })
    ).rejects.toThrow(/sold out/);
  });

  it("derives the payment method from the provider's declared capabilities (stripe → card)", async () => {
    const { cart, checkout, registry } = setup();
    const stripe = new StripePaymentProvider({ secretKey: "sk_test_dummy" });
    registry.register(stripe);
    const spy = vi.spyOn(stripe, "createSession").mockResolvedValue({
      kind: "redirect",
      url: "https://checkout.stripe.test/session",
      providerRef: "cs_test_1",
      providerId: "stripe",
    });
    await cart.addItem("c1", { variantId: "v1", quantity: 1 });
    const result = await checkout.checkout("c1", {
      shippingAddress: ADDRESS,
      idempotencyKey: "k-stripe",
      providerId: "stripe",
    });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].method).toBe("card");
    expect(result.session.kind).toBe("redirect");
  });

  it("passes no method hint for a provider that declares none (mock)", async () => {
    const { cart, checkout, provider } = setup();
    const spy = vi.spyOn(provider, "createSession");
    await cart.addItem("c1", { variantId: "v1", quantity: 1 });
    await checkout.checkout("c1", {
      shippingAddress: ADDRESS,
      idempotencyKey: "k-mock",
      providerId: "mock",
    });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].method).toBeUndefined();
  });
});

describe("CheckoutService — returnUrl absolutization (Mollie requires absolute redirect URLs)", () => {
  it("keeps the relative returnUrl when publicUrl is not set", async () => {
    const { cart, checkout, provider } = setup();
    const spy = vi.spyOn(provider, "createSession");
    await cart.addItem("c1", { variantId: "v1", quantity: 1 });
    await checkout.checkout("c1", {
      shippingAddress: ADDRESS,
      idempotencyKey: "k-rel",
      providerId: "mock",
    });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].returnUrl).toBe("/checkout/confirmation");
  });

  it("uses an absolute returnUrl when publicUrl is set", async () => {
    const { cart, checkout, provider } = setup({
      publicUrl: "https://boyshop-test.i-janajoe.workers.dev",
    });
    const spy = vi.spyOn(provider, "createSession");
    await cart.addItem("c1", { variantId: "v1", quantity: 1 });
    await checkout.checkout("c1", {
      shippingAddress: ADDRESS,
      idempotencyKey: "k-abs",
      providerId: "mock",
    });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].returnUrl).toBe(
      "https://boyshop-test.i-janajoe.workers.dev/checkout/confirmation"
    );
  });

  it("collapses a trailing slash in publicUrl to a single slash", async () => {
    const { cart, checkout, provider } = setup({
      publicUrl: "https://boyshop-test.i-janajoe.workers.dev/",
    });
    const spy = vi.spyOn(provider, "createSession");
    await cart.addItem("c1", { variantId: "v1", quantity: 1 });
    await checkout.checkout("c1", {
      shippingAddress: ADDRESS,
      idempotencyKey: "k-slash",
      providerId: "mock",
    });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].returnUrl).toBe(
      "https://boyshop-test.i-janajoe.workers.dev/checkout/confirmation"
    );
  });
});

describe("CheckoutService — concurrent checkouts on the same cart", () => {
  it("persists one order and rejects the second with StockUnavailableError", async () => {
    const { catalog, cart, checkout } = setup();
    catalog.updateAdminProduct("p1", { variants: [{ id: "v1", stock: 1 }] });
    await cart.addItem("c1", { variantId: "v1", quantity: 1 });

    const results = await Promise.allSettled([
      checkout.checkout("c1", {
        email: "a@b.c",
        shippingAddress: ADDRESS,
        idempotencyKey: "k-last-a",
        providerId: "mock",
      }),
      checkout.checkout("c1", {
        email: "a@b.c",
        shippingAddress: ADDRESS,
        idempotencyKey: "k-last-b",
        providerId: "mock",
      }),
    ]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);

    const reason = (rejected[0] as PromiseRejectedResult).reason;
    expect(reason).toBeInstanceOf(StockUnavailableError);
    expect(catalog.findVariant("v1")?.stock).toBe(0);
  });
});
