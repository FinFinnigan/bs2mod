// S10 — OrderService.reconcileOrder advances an order when its payment settles.
// S11 — GET /api/orders/[id] reconciles before serving when a non-mock provider
// is configured (MOL-004). The container module is mocked with a fake
// AppContainer built from the real in-memory repositories and services, so the
// REAL route handler runs end-to-end (same pattern as order-token.test.ts).

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
import { OrderService } from "../service";
import type { AppContainer } from "@/lib/backend/container";
import type { OrderRow, CreateOrderInput } from "@/lib/backend/repositories/interfaces";
import type { PaymentRecord } from "@/lib/backend/payments/store";
import type { PaymentStatus } from "@/lib/backend/payments/types";

const holder = vi.hoisted<{ app: AppContainer | null }>(() => ({ app: null }));

vi.mock("@/lib/backend/container", () => ({
  getApp: () => {
    if (!holder.app) throw new Error("test container not built");
    return holder.app;
  },
}));

import { GET as orderGet } from "@/app/api/orders/[id]/route";

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
    providerRef: "mock_ref_1",
    status: "created",
    amount: { amount: 54.95, currency: "EUR" },
    currency: "EUR",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function buildPayments(getStatusResult?: PaymentStatus): { payments: PaymentService; store: MemoryPaymentStore } {
  const registry = new PaymentProviderRegistry();
  registry.register(new MockPaymentProvider({ getStatusResult }));
  const store = new MemoryPaymentStore();
  return { payments: new PaymentService({ registry, store }), store };
}

describe("OrderService.reconcileOrder (S10)", () => {
  it("reconciles a paid payment and advances the order to confirmed", async () => {
    const repo = new MemoryOrderRepository();
    const order = makeOrder();
    await repo.create(createInput(order), order);
    const { payments, store } = buildPayments();
    await store.create(makePayment());
    const service = new OrderService({ orderRepo: repo, payments });

    const result = await service.reconcileOrder(order);

    expect(result).toBe("confirmed");
    const stored = await repo.get(order.id);
    expect(stored?.status).toBe("confirmed");
    expect(repo.transitions).toHaveLength(1);
    expect(repo.transitions[0]).toMatchObject({ fromState: "placed", toState: "confirmed" });
    expect(store.transitions).toHaveLength(1);
    expect(store.transitions[0]).toMatchObject({ paymentId: "pay_1", fromState: "created", toState: "paid" });
    const payment = await store.get("pay_1");
    expect(payment?.status).toBe("paid");
  });

  it("skips payments without a provider reference", async () => {
    const repo = new MemoryOrderRepository();
    const order = makeOrder();
    await repo.create(createInput(order), order);
    const { payments, store } = buildPayments();
    await store.create(makePayment({ providerRef: null }));
    const service = new OrderService({ orderRepo: repo, payments });

    const result = await service.reconcileOrder(order);

    expect(result).toBeNull();
    const stored = await repo.get(order.id);
    expect(stored?.status).toBe("placed");
    expect(repo.transitions).toHaveLength(0);
    expect(store.transitions).toHaveLength(0);
  });

  it("never throws on a terminal order — reconcile is a no-op", async () => {
    const repo = new MemoryOrderRepository();
    const order = makeOrder({ status: "cancelled" });
    await repo.create(createInput(order), order);
    const { payments, store } = buildPayments();
    await store.create(makePayment());
    const service = new OrderService({ orderRepo: repo, payments });

    const result = await service.reconcileOrder(order);

    expect(result).toBeNull();
    expect(repo.transitions).toHaveLength(0);
    expect(store.transitions).toHaveLength(0);
    const payment = await store.get("pay_1");
    expect(payment?.status).toBe("created");
  });

  it("leaves a confirmed order untouched", async () => {
    const repo = new MemoryOrderRepository();
    const order = makeOrder({ status: "confirmed" });
    await repo.create(createInput(order), order);
    const { payments, store } = buildPayments();
    await store.create(makePayment());
    const service = new OrderService({ orderRepo: repo, payments });

    const result = await service.reconcileOrder(order);

    expect(result).toBeNull();
    const stored = await repo.get(order.id);
    expect(stored?.status).toBe("confirmed");
    expect(repo.transitions).toHaveLength(0);
  });

  it("does not advance the order for an action_required payment", async () => {
    const repo = new MemoryOrderRepository();
    const order = makeOrder();
    await repo.create(createInput(order), order);
    const { payments, store } = buildPayments("action_required");
    await store.create(makePayment({ status: "action_required" }));
    const service = new OrderService({ orderRepo: repo, payments });

    const result = await service.reconcileOrder(order);

    expect(result).toBeNull();
    const stored = await repo.get(order.id);
    expect(stored?.status).toBe("placed");
    expect(repo.transitions).toHaveLength(0);
    expect(store.transitions).toHaveLength(0);
  });

  it("is a no-op when no payments service is wired", async () => {
    const repo = new MemoryOrderRepository();
    const order = makeOrder();
    await repo.create(createInput(order), order);
    const service = new OrderService({ orderRepo: repo });

    const result = await service.reconcileOrder(order);

    expect(result).toBeNull();
    const stored = await repo.get(order.id);
    expect(stored?.status).toBe("placed");
    expect(repo.transitions).toHaveLength(0);
  });
});

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

function buildApp(provider: string, getStatusResult?: PaymentStatus): { app: AppContainer; orders: MemoryOrderRepository } {
  const catalog = new MemoryCatalogRepository(makeCatalog());
  const cart = new MemoryCartRepository(catalog);
  const orders = new MemoryOrderRepository();
  const registry = new PaymentProviderRegistry();
  registry.register(new MockPaymentProvider({ getStatusResult }));
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
        payment: { provider, providers: [provider] },
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
      ordersService,
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

async function fetchOrder(token: string): Promise<{ status: number; body: { order?: { id: string; status?: string }; error?: string } }> {
  const res = await orderGet(new NextRequest(`http://localhost/api/orders/${token}`), {
    params: Promise.resolve({ id: token }),
  });
  return { status: res.status, body: await res.json() };
}

describe("GET /api/orders/[id] reconciliation (S11)", () => {
  it("reconciles before serving when a non-mock provider is configured", async () => {
    const { app, orders } = buildApp("stripe");
    holder.app = app;
    await seedOrder(app);
    await seedPayment(app);

    const { status, body } = await fetchOrder("tok_1");

    expect(status).toBe(200);
    expect(body.order?.status).toBe("confirmed");
    expect(orders.transitions).toHaveLength(1);
  });

  it("skips reconciliation when the mock provider is configured", async () => {
    const { app, orders } = buildApp("mock");
    holder.app = app;
    await seedOrder(app);
    await seedPayment(app);

    const { status, body } = await fetchOrder("tok_1");

    expect(status).toBe(200);
    expect(body.order?.status).toBe("placed");
    expect(orders.transitions).toHaveLength(0);
  });

  it("skips reconciliation for a terminal order", async () => {
    const { app, orders } = buildApp("stripe");
    holder.app = app;
    await seedOrder(app, { status: "cancelled" });
    await seedPayment(app);

    const { status, body } = await fetchOrder("tok_1");

    expect(status).toBe(200);
    expect(body.order?.status).toBe("cancelled");
    expect(orders.transitions).toHaveLength(0);
  });

  it("leaves the order placed when the payment has no provider reference", async () => {
    const { app, orders } = buildApp("stripe");
    holder.app = app;
    await seedOrder(app);
    await seedPayment(app, { providerRef: null });

    const { status, body } = await fetchOrder("tok_1");

    expect(status).toBe(200);
    expect(body.order?.status).toBe("placed");
    expect(orders.transitions).toHaveLength(0);
  });
});