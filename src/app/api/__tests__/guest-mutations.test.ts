// Route-level regression tests for the RBAC guard on guest-allowed mutations.
// The container module is mocked with a fake AppContainer built from the real
// in-memory repositories and services, so the REAL route handlers run end-to-end.
// RBAC-002 proof: anonymous callers still pass cart:write / checkout:create and
// the response shapes are unchanged.

import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { money } from "@/lib/backend/money";
import {
  MemoryCatalogRepository,
  MemoryCartRepository,
  MemoryOrderRepository,
  type MemoryProduct,
} from "@/lib/backend/repositories/memory";
import { MemoryPaymentStore } from "@/lib/backend/repositories/memory/payment-store";
import { MemorySettingsRepository } from "@/lib/backend/repositories/memory/settings";
import { PaymentService } from "@/lib/backend/payments/service";
import { PaymentProviderRegistry } from "@/lib/backend/payments/registry";
import { MockPaymentProvider } from "@/lib/backend/payments/adapters/mock";
import { CheckoutService } from "@/lib/backend/services/checkout";
import { MemoryUserStore, MemorySessionStore } from "@/lib/backend/repositories/memory/auth";
import { AuthService } from "@/lib/backend/auth/service";
import { CART_COOKIE } from "@/lib/backend/cart/token";
import type { AppContainer } from "@/lib/backend/container";

const holder = vi.hoisted<{ app: AppContainer | null }>(() => ({ app: null }));

vi.mock("@/lib/backend/container", () => ({
  getApp: () => {
    if (!holder.app) throw new Error("test container not built");
    return holder.app;
  },
}));

import { POST as cartPost } from "@/app/api/cart/route";
import { PATCH as cartPatch, DELETE as cartDelete } from "@/app/api/cart/[variantId]/route";
import { POST as checkoutPost } from "@/app/api/checkout/route";

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
      variants: [
        { id: "v1", sku: "SLATE-9Y", size: "9Y", colour: "Slate", stock: 5 },
        { id: "v2", sku: "SLATE-10Y", size: "10Y", colour: "Slate", stock: 0 },
      ],
    },
  ];
}

function buildApp(): AppContainer {
  const catalog = new MemoryCatalogRepository(makeCatalog());
  const cart = new MemoryCartRepository(catalog);
  const orders = new MemoryOrderRepository(catalog);
  const registry = new PaymentProviderRegistry();
  registry.register(new MockPaymentProvider());
  const payments = new PaymentService({ registry, store: new MemoryPaymentStore() });
  const checkout = new CheckoutService({
    cartRepo: cart,
    orderRepo: orders,
    payments,
    shipping: { freeThreshold: 50, flatRate: 4.95 },
  });
  const users = new MemoryUserStore();
  const sessions = new MemorySessionStore();
  const auth = new AuthService({ users, sessions });
  return {
    config: {
      features: { wishlist: true, reviews: false, account: false, promotions: false, recommendations: false },
      payment: { provider: "mock", providers: ["mock"] },
      shipping: { freeThreshold: 50, flatRate: 4.95 },
    },
    catalog,
    cart,
    orders,
    payments,
    registry,
    checkout,
    users,
    sessions,
    auth,
    settings: new MemorySettingsRepository(),
  };
}

function jsonRequest(url: string, body: unknown, cookie?: string): NextRequest {
  return new NextRequest(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  holder.app = buildApp();
});

describe("guest mutations — anonymous callers pass the ability check (RBAC-002)", () => {
  it("POST /api/cart creates a cart and sets the cart cookie", async () => {
    const res = await cartPost(jsonRequest("http://localhost/api/cart", { variantId: "v1", quantity: 1 }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.cart.itemCount).toBe(1);
    expect(res.cookies.get(CART_COOKIE)?.value).toBeTruthy();
  });

  it("POST /api/cart still rejects a missing variantId with 400", async () => {
    const res = await cartPost(jsonRequest("http://localhost/api/cart", {}));
    expect(res.status).toBe(400);
  });

  it("PATCH /api/cart/[variantId] updates quantity for an anonymous cart", async () => {
    const app = holder.app;
    if (!app) throw new Error("test container not built");
    await app.cart.addItem("cart_1", { variantId: "v1", quantity: 1 });

    const req = new NextRequest("http://localhost/api/cart/v1", {
      method: "PATCH",
      headers: { "content-type": "application/json", cookie: `${CART_COOKIE}=cart_1` },
      body: JSON.stringify({ quantity: 3 }),
    });
    const res = await cartPatch(req, { params: Promise.resolve({ variantId: "v1" }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.cart.items[0].quantity).toBe(3);
  });

  it("DELETE /api/cart/[variantId] removes the line for an anonymous cart", async () => {
    const app = holder.app;
    if (!app) throw new Error("test container not built");
    await app.cart.addItem("cart_1", { variantId: "v1", quantity: 1 });

    const req = new NextRequest("http://localhost/api/cart/v1", {
      method: "DELETE",
      headers: { cookie: `${CART_COOKIE}=cart_1` },
    });
    const res = await cartDelete(req, { params: Promise.resolve({ variantId: "v1" }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.cart.itemCount).toBe(0);
  });

  it("POST /api/checkout creates an order for an anonymous cart", async () => {
    const app = holder.app;
    if (!app) throw new Error("test container not built");
    await app.cart.addItem("cart_1", { variantId: "v1", quantity: 1 });

    const res = await checkoutPost(
      jsonRequest(
        "http://localhost/api/checkout",
        {
          email: "parent@example.com",
          shippingAddress: {
            fullName: "Test Parent",
            line1: "1 Main St",
            city: "Dublin",
            postcode: "D01",
            country: "IE",
          },
          idempotencyKey: "k1",
        },
        `${CART_COOKIE}=cart_1`
      )
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.orderId).toBeTruthy();
    expect(body.status).toBe("placed");
  });

  it("POST /api/cart rejects a sold-out variant with 409", async () => {
    const res = await cartPost(jsonRequest("http://localhost/api/cart", { variantId: "v2", quantity: 1 }));
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toMatch(/sold out/);
  });

  it("PATCH /api/cart/[variantId] rejects an oversell with 409", async () => {
    const app = holder.app;
    if (!app) throw new Error("test container not built");
    await app.cart.addItem("cart_1", { variantId: "v1", quantity: 1 });

    const req = new NextRequest("http://localhost/api/cart/v1", {
      method: "PATCH",
      headers: { "content-type": "application/json", cookie: `${CART_COOKIE}=cart_1` },
      body: JSON.stringify({ quantity: 6 }),
    });
    const res = await cartPatch(req, { params: Promise.resolve({ variantId: "v1" }) });
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toMatch(/Only 5 left in stock/);
  });

  it("POST /api/checkout rejects a sold-out cart with 409", async () => {
    const app = holder.app;
    if (!app) throw new Error("test container not built");
    await app.cart.addItem("cart_1", { variantId: "v1", quantity: 1 });
    await app.catalog.updateAdminProduct("p1", { variants: [{ id: "v1", stock: 0 }] });

    const res = await checkoutPost(
      jsonRequest(
        "http://localhost/api/checkout",
        {
          email: "parent@example.com",
          shippingAddress: {
            fullName: "Test Parent",
            line1: "1 Main St",
            city: "Dublin",
            postcode: "D01",
            country: "IE",
          },
          idempotencyKey: "k-sold",
        },
        `${CART_COOKIE}=cart_1`
      )
    );
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toMatch(/sold out/);
  });
});