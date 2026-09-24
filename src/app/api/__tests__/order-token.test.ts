// Route-level tests for IDOR + order-token hardening (SEC-001, SEC-002).
// The container module is mocked with a fake AppContainer built from the real
// in-memory repositories and services, so the REAL route handlers run end-to-end.
// SEC-001 proof: order fetch requires the owner's session or an orders:read role;
// SEC-002 proof: the public token is opaque and guessable/derived ids 404.

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
import { hashPassword } from "@/lib/backend/auth/password";
import { CART_COOKIE } from "@/lib/backend/cart/token";
import { SESSION_COOKIE } from "@/lib/backend/auth/cookie";
import type { AppContainer } from "@/lib/backend/container";

const holder = vi.hoisted<{ app: AppContainer | null }>(() => ({ app: null }));

vi.mock("@/lib/backend/container", () => ({
  getApp: () => {
    if (!holder.app) throw new Error("test container not built");
    return holder.app;
  },
}));

import { POST as checkoutPost } from "@/app/api/checkout/route";
import { GET as orderGet } from "@/app/api/orders/[id]/route";

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

function buildApp(): AppContainer {
  const catalog = new MemoryCatalogRepository(makeCatalog());
  const cart = new MemoryCartRepository(catalog);
  const orders = new MemoryOrderRepository();
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

async function seedUser(app: AppContainer, id: string, email: string, role: string): Promise<string> {
  await app.users.create({
    id,
    email,
    passwordHash: hashPassword("pw-1234"),
    role,
    createdAt: new Date().toISOString(),
  });
  const { token } = (await app.auth.authenticate(email, "pw-1234"))!;
  return token;
}

function checkoutRequest(cartId: string, idempotencyKey: string, sessionToken?: string): NextRequest {
  const cookies = `${CART_COOKIE}=${cartId}${sessionToken ? `; ${SESSION_COOKIE}=${sessionToken}` : ""}`;
  return new NextRequest("http://localhost/api/checkout", {
    method: "POST",
    headers: { "content-type": "application/json", cookie: cookies },
    body: JSON.stringify({
      email: "parent@example.com",
      shippingAddress: {
        fullName: "Test Parent",
        line1: "1 Main St",
        city: "Dublin",
        postcode: "D01",
        country: "IE",
      },
      idempotencyKey,
    }),
  });
}

function orderRequest(token: string, sessionToken?: string): NextRequest {
  return new NextRequest(`http://localhost/api/orders/${token}`, {
    headers: sessionToken ? { cookie: `${SESSION_COOKIE}=${sessionToken}` } : {},
  });
}

async function placeOrder(cartId: string, idempotencyKey: string, sessionToken?: string): Promise<{ orderId: string; orderToken: string }> {
  const res = await checkoutPost(checkoutRequest(cartId, idempotencyKey, sessionToken));
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(body.orderId).toBeTruthy();
  expect(body.orderToken).toBeTruthy();
  return { orderId: body.orderId, orderToken: body.orderToken };
}

async function fetchOrder(token: string, sessionToken?: string): Promise<{ status: number; body: { order?: { id: string }; error?: string } }> {
  const res = await orderGet(orderRequest(token, sessionToken), { params: Promise.resolve({ id: token }) });
  return { status: res.status, body: await res.json() };
}

beforeEach(() => {
  holder.app = buildApp();
});

describe("SEC-001 — order fetch requires owner session or admin ability", () => {
  it("owner (customer A) fetches own order token → 200 with the order", async () => {
    const app = holder.app;
    if (!app) throw new Error("test container not built");
    const tokenA = await seedUser(app, "usr_a", "a@boyshop.ie", "customer");
    await app.cart.addItem("cart_a", { variantId: "v1", quantity: 1 });
    const { orderId, orderToken } = await placeOrder("cart_a", "k-a", tokenA);

    const { status, body } = await fetchOrder(orderToken, tokenA);
    expect(status).toBe(200);
    expect(body.order?.id).toBe(orderId);
  });

  it("customer B's session fetches customer A's order token → 403", async () => {
    const app = holder.app;
    if (!app) throw new Error("test container not built");
    const tokenA = await seedUser(app, "usr_a", "a@boyshop.ie", "customer");
    const tokenB = await seedUser(app, "usr_b", "b@boyshop.ie", "customer");
    await app.cart.addItem("cart_a", { variantId: "v1", quantity: 1 });
    const { orderToken } = await placeOrder("cart_a", "k-a", tokenA);

    const { status, body } = await fetchOrder(orderToken, tokenB);
    expect(status).toBe(403);
    expect(body.error).toBeTruthy();
  });

  it("fetching with NO session → 401", async () => {
    const app = holder.app;
    if (!app) throw new Error("test container not built");
    const tokenA = await seedUser(app, "usr_a", "a@boyshop.ie", "customer");
    await app.cart.addItem("cart_a", { variantId: "v1", quantity: 1 });
    const { orderToken } = await placeOrder("cart_a", "k-a", tokenA);

    const { status, body } = await fetchOrder(orderToken);
    expect(status).toBe(401);
    expect(body.error).toBeTruthy();
  });

  it("admin session fetches customer A's order → 200", async () => {
    const app = holder.app;
    if (!app) throw new Error("test container not built");
    const tokenA = await seedUser(app, "usr_a", "a@boyshop.ie", "customer");
    const adminToken = await seedUser(app, "usr_admin", "admin@boyshop.ie", "admin");
    await app.cart.addItem("cart_a", { variantId: "v1", quantity: 1 });
    const { orderId, orderToken } = await placeOrder("cart_a", "k-a", tokenA);

    const { status, body } = await fetchOrder(orderToken, adminToken);
    expect(status).toBe(200);
    expect(body.order?.id).toBe(orderId);
  });
});

describe("SEC-002 — opaque, non-client-supplied public order token", () => {
  it("publicToken is a non-empty base64url string, not derived from the idempotency key", async () => {
    const app = holder.app;
    if (!app) throw new Error("test container not built");
    await app.cart.addItem("cart_1", { variantId: "v1", quantity: 1 });
    const { orderId, orderToken } = await placeOrder("cart_1", "k-sec002");

    expect(orderToken).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(orderToken.length).toBeGreaterThanOrEqual(24);
    expect(orderToken).not.toBe("k-sec002");
    expect(orderToken).not.toContain("k-sec002");
    expect(orderId).toMatch(/^ord_[0-9a-f]{32}$/);
    expect(orderId).not.toBe("ord_k-sec002");
  });

  it("publicToken differs across two orders", async () => {
    const app = holder.app;
    if (!app) throw new Error("test container not built");
    await app.cart.addItem("cart_1", { variantId: "v1", quantity: 1 });
    await app.cart.addItem("cart_2", { variantId: "v1", quantity: 1 });
    const first = await placeOrder("cart_1", "k-1");
    const second = await placeOrder("cart_2", "k-2");

    expect(first.orderToken).not.toBe(second.orderToken);
  });

  it("sequential, derived, and internal ids → 404 on the orders route", async () => {
    const app = holder.app;
    if (!app) throw new Error("test container not built");
    await app.cart.addItem("cart_1", { variantId: "v1", quantity: 1 });
    const { orderId } = await placeOrder("cart_1", "k-guess");

    for (const guess of ["ord_1", "ord_k-guess", orderId]) {
      const { status } = await fetchOrder(guess);
      expect(status).toBe(404);
    }
  });
});

describe("guest checkout regression — token possession is the capability", () => {
  it("guest checkout returns orderToken and fetching that token → 200", async () => {
    const app = holder.app;
    if (!app) throw new Error("test container not built");
    await app.cart.addItem("cart_g", { variantId: "v1", quantity: 1 });
    const { orderId, orderToken } = await placeOrder("cart_g", "k-guest");

    const { status, body } = await fetchOrder(orderToken);
    expect(status).toBe(200);
    expect(body.order?.id).toBe(orderId);
  });
});