// S12 — a webhook payment event that applies cleanly advances the owning order
// through OrderService.handlePaymentEvent (paid → confirmed), closing
// SEC-004/PAY-001/ORD-003.
// S13 — an unmatched payment is reported as handled: "unmatched" with no throw
// and the order untouched.
// S14 — malformed/invalid bodies keep the route's existing behavior exactly.
// S15 — form-encoded bodies (classic Mollie webhooks) reach the adapter.
// The container module is mocked with a fake AppContainer built from the real
// in-memory repositories and services, so the REAL route handler runs end-to-end
// (same pattern as order-token.test.ts / reconcile.test.ts).

import { describe, it, expect, vi } from "vitest";
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
import { OrderService } from "@/lib/backend/orders/service";
import type { AppContainer } from "@/lib/backend/container";
import type { OrderRow, CreateOrderInput } from "@/lib/backend/repositories/interfaces";
import type { PaymentRecord } from "@/lib/backend/payments/store";
import type { PaymentEvent } from "@/lib/backend/payments/types";

// The route hands the adapter the raw request text; the stock MockPaymentProvider
// expects an already-parsed object. This test-only subclass parses the text first
// so the REAL route handler can run end-to-end against the mock (the adapters are
// owned by another lane and must not be edited here).
class TextWebhookMockProvider extends MockPaymentProvider {
  async handleWebhook(raw: unknown, signature?: unknown): Promise<PaymentEvent | null> {
    // Accept both JSON objects and form-encoded "id=..." bodies (classic
    // Mollie webhooks) so the REAL route handler can run end-to-end.
    let parsed: unknown = raw;
    if (typeof raw === "string") {
      const formMatch = /(?:^|&)id=([^&]+)/.exec(raw);
      parsed = formMatch ? { id: decodeURIComponent(formMatch[1]) } : JSON.parse(raw);
    }
    return super.handleWebhook(parsed);
  }
}

const holder = vi.hoisted<{ app: AppContainer | null }>(() => ({ app: null }));

vi.mock("@/lib/backend/container", () => ({
  getApp: () => {
    if (!holder.app) throw new Error("test container not built");
    return holder.app;
  },
}));

import { POST as webhookPost } from "../route";

function makeOrder(overrides: Partial<OrderRow> = {}): OrderRow {
  return {
    id: "ord_1",
    cartId: "cart_1",
    email: "parent@example.com",
    publicToken: "tok_1",
    status: "placed",
    subtotal: { amount: 50, currency: "EUR" },
    shippingAmount: { amount: 4.95, currency: "EUR" },
    total: { amount: 54.95, currency: "EUR" },
    currency: "EUR",
    items: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function createInput(order: OrderRow): CreateOrderInput {
  return {
    id: order.id,
    cartId: order.cartId ?? "cart_1",
    shippingAddress: {
      fullName: "Test Parent",
      line1: "1 Main St",
      city: "Dublin",
      postcode: "D01",
      country: "IE",
    },
    idempotencyKey: `key_${order.id}`,
  };
}

function makePayment(overrides: Partial<PaymentRecord> = {}): PaymentRecord {
  return {
    id: "pay_1",
    orderId: "ord_1",
    providerId: "mock",
    providerRef: "mock_ref_ord_1",
    status: "created",
    amount: { amount: 54.95, currency: "EUR" },
    currency: "EUR",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

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

function buildApp(): { app: AppContainer; orders: MemoryOrderRepository } {
  const catalog = new MemoryCatalogRepository(makeCatalog());
  const cart = new MemoryCartRepository(catalog);
  const orders = new MemoryOrderRepository();
  const registry = new PaymentProviderRegistry();
  registry.register(new TextWebhookMockProvider());
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
  const ordersService = new OrderService({ orderRepo: orders, payments });
  return {
    app: {
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
      ordersService,
      users,
      sessions,
      auth,
      settings: new MemorySettingsRepository(),
    },
    orders,
  };
}

async function seedOrder(app: AppContainer, overrides: Partial<OrderRow> = {}): Promise<void> {
  const order = makeOrder(overrides);
  await app.orders.create(createInput(order), order);
}

async function seedPayment(app: AppContainer, overrides: Partial<PaymentRecord> = {}): Promise<void> {
  await app.payments.store.create(makePayment(overrides));
}

function webhookRequest(body: unknown, signature = "test-sig"): NextRequest {
  return new NextRequest("http://localhost/api/webhooks/payment", {
    method: "POST",
    headers: { "content-type": "application/json", "x-webhook-signature": signature },
    body: JSON.stringify(body),
  });
}

describe("S12 — a cleanly-applied webhook advances the owning order", () => {
  it("a paid webhook transitions the order placed → confirmed", async () => {
    const { app, orders } = buildApp();
    holder.app = app;
    await seedOrder(app);
    await seedPayment(app);

    const res = await webhookPost(webhookRequest({ type: "ord_1" }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ received: true, handled: "applied" });

    const stored = await app.orders.get("ord_1");
    expect(stored?.status).toBe("confirmed");
    expect(orders.transitions).toHaveLength(1);
    expect(orders.transitions[0]).toMatchObject({ fromState: "placed", toState: "confirmed" });
    const payment = await app.payments.store.get("pay_1");
    expect(payment?.status).toBe("paid");
  });

  it("replaying the same webhook is a no-op (double-delivery safe)", async () => {
    const { app, orders } = buildApp();
    holder.app = app;
    await seedOrder(app);
    await seedPayment(app);

    await webhookPost(webhookRequest({ type: "ord_1" }));
    const res = await webhookPost(webhookRequest({ type: "ord_1" }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ received: true, handled: "applied" });

    const stored = await app.orders.get("ord_1");
    expect(stored?.status).toBe("confirmed");
    expect(orders.transitions).toHaveLength(1);
  });
});

describe("S13 — an unmatched payment leaves the order untouched", () => {
  it("a webhook with no matching payment → handled: unmatched, no throw", async () => {
    const { app, orders } = buildApp();
    holder.app = app;
    await seedOrder(app);

    const res = await webhookPost(webhookRequest({ type: "no_such_payment" }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ received: true, handled: "unmatched" });

    const stored = await app.orders.get("ord_1");
    expect(stored?.status).toBe("placed");
    expect(orders.transitions).toHaveLength(0);
  });
});

describe("S14 — malformed/invalid bodies keep the existing behavior", () => {
  it("invalid JSON → 400 Invalid JSON body", async () => {
    const { app } = buildApp();
    holder.app = app;

    const res = await webhookPost(
      new NextRequest("http://localhost/api/webhooks/payment", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "not json",
      })
    );

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid JSON body" });
  });

  it("non-object JSON → 400 with a validation message", async () => {
    const { app } = buildApp();
    holder.app = app;

    const res = await webhookPost(
      new NextRequest("http://localhost/api/webhooks/payment", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify([1, 2, 3]),
      })
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  it("an object the adapter ignores → handled: ignored", async () => {
    const { app } = buildApp();
    holder.app = app;

    const res = await webhookPost(webhookRequest({}));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ received: true, handled: "ignored" });
  });
});

describe("S15 — form-encoded bodies (classic Mollie webhooks) reach the adapter", () => {
  it("a form-encoded id= body is not 400'd and is passed to the adapter", async () => {
    const { app } = buildApp();
    holder.app = app;

    const res = await webhookPost(
      new NextRequest("http://localhost/api/webhooks/payment", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: "id=ord_1",
      })
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ received: true, handled: "ignored" });
  });
});

describe("S16 — a provider webhook-verification failure is sanitized (no crash, no retry loop)", () => {
  it("adapter throws during handleWebhook → sanitized 500 JSON, order untouched", async () => {
    // The adapter owning verification may fail (e.g. the payment no longer
    // exists at the provider → provider API 404). That must surface as a
    // sanitized 500 response, NOT an unhandled exception that escapes with an
    // empty body (which would make the provider retry forever).
    class ThrowingWebhookProvider extends TextWebhookMockProvider {
      override async handleWebhook(): Promise<PaymentEvent | null> {
        throw new Error("Mollie request failed: 404 Not Found");
      }
    }
    const { app, orders } = buildApp();
    holder.app = app;
    await seedOrder(app);
    await seedPayment(app);

    // Swap the registered provider for the throwing subclass (the registry
    // holds the TextWebhookMockProvider from buildApp; re-register to override).
    const throwing = new ThrowingWebhookProvider();
    app.registry.register(throwing);

    const res = await webhookPost(webhookRequest({ type: "ord_1" }));

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({
      received: false,
      error: "provider_webhook_failed",
      handled: "error",
    });

    const stored = await app.orders.get("ord_1");
    expect(stored?.status).toBe("placed");
    expect(orders.transitions).toHaveLength(0);
  });
});
