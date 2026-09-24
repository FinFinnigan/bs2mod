// ADM-004 — Admin order-management API (route layer). The REAL route handlers
// (GET list, GET [id], POST [id]/actions) run end-to-end against a fake
// AppContainer built from the REAL in-memory repositories and services — the
// same pattern as admin/products/__tests__/route.test.ts and
// webhooks/payment/__tests__/route.test.ts.
//
// Coverage mapped to acceptance:
//  - anonymous request → 401 "unauthorized" (gate: login)
//  - authenticated non-admin (customer) → 403 "forbidden" (gate: forbidden)
//  - DB guard (hasDatabase) is a pure env check (!!process.env.DATABASE_URL);
//    a fake URL satisfies it so the in-memory setup proceeds, and the guard's
//    own branch (503 "admin unavailable") is tested by unsetting the env var —
//    no database is ever touched because the container module is mocked.
//  - GET list → 200 { orders, total } newest-first
//  - GET list ?status=confirmed → 200 filtered
//  - GET list invalid status → 400 with firstIssueMessage
//  - GET [id] → 200 { order, transitions, payments, addresses }
//  - GET [id] unknown → 404 "Order not found: <id>"
//  - POST [id]/actions confirm on a placed order → 200 detail, status confirmed
//  - POST [id]/actions illegal transition (fulfill a placed order) → 409
//  - POST [id]/actions unknown id → 404
//  - POST [id]/actions invalid JSON / missing action / bad action value → 400

import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from "vitest";
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
import { OrderService } from "@/lib/backend/orders/service";
import { MemoryUserStore, MemorySessionStore } from "@/lib/backend/repositories/memory/auth";
import { AuthService } from "@/lib/backend/auth/service";
import { hashPassword } from "@/lib/backend/auth/password";
import type { AppContainer } from "@/lib/backend/container";
import type { UserRecord } from "@/lib/backend/auth/interfaces";
import type { OrderRow, CreateOrderInput } from "@/lib/backend/repositories/interfaces";
import type { PaymentRecord } from "@/lib/backend/payments/store";

const holder = vi.hoisted<{ app: AppContainer | null }>(() => ({ app: null }));

// SESSION_COOKIE = "boyshop.session" (src/lib/backend/auth/route-rules.ts). The
// literal is hoisted so the next/headers mock can read it without importing the
// constant (vi.mock factories run before module imports are initialized).
const cookieName = vi.hoisted(() => "boyshop.session");
const cookieHolder = vi.hoisted<{ token: string | null }>(() => ({ token: null }));

vi.mock("@/lib/backend/container", () => ({
  getApp: () => {
    if (!holder.app) throw new Error("test container not built");
    return holder.app;
  },
}));

// getAdminSession() reads the session cookie via next/headers cookies(); outside
// a real request scope that throws, so the module is mocked to a store backed by
// cookieHolder.token (set per test from a real AuthService-issued token).
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => {
      if (name === cookieName && cookieHolder.token) {
        return { name, value: cookieHolder.token };
      }
      return undefined;
    },
  }),
}));

import { GET as listOrders } from "../route";
import { GET as getOrder } from "../[id]/route";
import { POST as orderAction } from "../[id]/actions/route";

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
    status: "paid",
    amount: { amount: 54.95, currency: "EUR" },
    currency: "EUR",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function buildApp(): { app: AppContainer; orders: MemoryOrderRepository } {
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

async function seedUser(app: AppContainer, overrides: Partial<UserRecord> = {}): Promise<UserRecord> {
  const user: UserRecord = {
    id: "usr_admin",
    email: "admin@boyshop.ie",
    passwordHash: hashPassword("pw-1234"),
    role: "admin",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
  await app.users.create(user);
  return user;
}

// Mint a real session token through AuthService (exercises the real
// authenticate → MemorySessionStore path) and hand it to the mocked
// next/headers cookie store.
async function mintSession(app: AppContainer, email: string, password: string): Promise<string> {
  const result = await app.auth.authenticate(email, password);
  if (!result) throw new Error(`authenticate failed for ${email}`);
  return result.token;
}

async function seedOrder(app: AppContainer, overrides: Partial<OrderRow> = {}): Promise<void> {
  const order = makeOrder(overrides);
  await app.orders.create(createInput(order), order);
}

async function seedPayment(app: AppContainer, overrides: Partial<PaymentRecord> = {}): Promise<void> {
  await app.payments.store.create(makePayment(overrides));
}

function listRequest(query = ""): NextRequest {
  return new NextRequest(`http://localhost/api/admin/orders${query}`, { method: "GET" });
}

function detailRequest(id: string): NextRequest {
  return new NextRequest(`http://localhost/api/admin/orders/${id}`, { method: "GET" });
}

function actionRequest(id: string, body: unknown): NextRequest {
  return new NextRequest(`http://localhost/api/admin/orders/${id}/actions`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeAll(() => {
  // hasDatabase() is a pure env check (!!process.env.DATABASE_URL). A fake URL
  // satisfies the guard so the REAL handlers proceed against the mocked
  // container (which never touches a database). Restored in afterAll.
  process.env.DATABASE_URL = "postgres://test:test@localhost:5432/boyshop_test";
});

afterAll(() => {
  delete process.env.DATABASE_URL;
});

afterEach(() => {
  cookieHolder.token = null;
});

describe("ADM-004 — gate: anonymous and non-admin callers are rejected", () => {
  it("anonymous GET list → 401 unauthorized", async () => {
    const { app } = buildApp();
    holder.app = app;

    const res = await listOrders(listRequest());

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "unauthorized" });
  });

  it("authenticated customer (non-admin) → 403 forbidden", async () => {
    const { app } = buildApp();
    holder.app = app;
    await seedUser(app, { id: "usr_customer", email: "customer@boyshop.ie", role: "customer" });
    cookieHolder.token = await mintSession(app, "customer@boyshop.ie", "pw-1234");

    const res = await listOrders(listRequest());

    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "forbidden" });
  });
});

describe("ADM-004 — DB guard (hasDatabase) branch", () => {
  it("returns 503 admin unavailable when DATABASE_URL is unset", async () => {
    const { app } = buildApp();
    holder.app = app;
    const saved = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    try {
      const res = await listOrders(listRequest());

      expect(res.status).toBe(503);
      expect(await res.json()).toEqual({ error: "admin unavailable" });
    } finally {
      if (saved !== undefined) process.env.DATABASE_URL = saved;
    }
  });
});

describe("ADM-004 — GET list returns the admin order read-model", () => {
  it("returns 200 with orders newest-first and a total", async () => {
    const { app } = buildApp();
    holder.app = app;
    await seedUser(app);
    cookieHolder.token = await mintSession(app, "admin@boyshop.ie", "pw-1234");
    await seedOrder(app, { id: "ord_1", createdAt: "2026-01-01T00:00:00.000Z" });
    await seedOrder(app, { id: "ord_2", createdAt: "2026-01-02T00:00:00.000Z" });
    await seedOrder(app, { id: "ord_3", createdAt: "2026-01-03T00:00:00.000Z" });

    const res = await listOrders(listRequest());

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.total).toBe(3);
    expect(body.orders.map((o: OrderRow) => o.id)).toEqual(["ord_3", "ord_2", "ord_1"]);
  });

  it("returns 200 filtered by ?status=confirmed", async () => {
    const { app } = buildApp();
    holder.app = app;
    await seedUser(app);
    cookieHolder.token = await mintSession(app, "admin@boyshop.ie", "pw-1234");
    await seedOrder(app, { id: "ord_1", status: "confirmed", createdAt: "2026-01-01T00:00:00.000Z" });
    await seedOrder(app, { id: "ord_2", status: "placed", createdAt: "2026-01-02T00:00:00.000Z" });
    await seedOrder(app, { id: "ord_3", status: "confirmed", createdAt: "2026-01-03T00:00:00.000Z" });

    const res = await listOrders(listRequest("?status=confirmed"));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.total).toBe(2);
    expect(body.orders.map((o: OrderRow) => o.id)).toEqual(["ord_3", "ord_1"]);
  });

  it("returns 400 with the firstIssueMessage for an invalid status", async () => {
    const { app } = buildApp();
    holder.app = app;
    await seedUser(app);
    cookieHolder.token = await mintSession(app, "admin@boyshop.ie", "pw-1234");

    const res = await listOrders(listRequest("?status=bogus"));

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/status/);
  });
});

describe("ADM-004 — GET [id] returns the order detail", () => {
  it("returns 200 with order, transitions, payments and addresses", async () => {
    const { app } = buildApp();
    holder.app = app;
    await seedUser(app);
    cookieHolder.token = await mintSession(app, "admin@boyshop.ie", "pw-1234");
    await seedOrder(app, { status: "confirmed" });
    await seedPayment(app);
    await app.orders.appendTransition({
      id: "tr_1",
      orderId: "ord_1",
      fromState: "placed",
      toState: "confirmed",
      idempotencyKey: "k",
      occurredAt: "2026-01-02T00:00:00.000Z",
    });

    const res = await getOrder(detailRequest("ord_1"), { params: Promise.resolve({ id: "ord_1" }) });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.order.status).toBe("confirmed");
    expect(body.transitions).toHaveLength(1);
    expect(body.transitions[0]).toMatchObject({ fromState: "placed", toState: "confirmed" });
    expect(body.payments).toHaveLength(1);
    expect(body.payments[0].id).toBe("pay_1");
    expect(body.addresses).toHaveLength(1);
    expect(body.addresses[0]).toMatchObject({ kind: "shipping", fullName: "Test Parent" });
  });

  it("returns 404 for an unknown id", async () => {
    const { app } = buildApp();
    holder.app = app;
    await seedUser(app);
    cookieHolder.token = await mintSession(app, "admin@boyshop.ie", "pw-1234");

    const res = await getOrder(detailRequest("nope"), { params: Promise.resolve({ id: "nope" }) });

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Order not found: nope" });
  });
});

describe("ADM-004 — POST [id]/actions drives the state machine", () => {
  it("confirm on a placed order → 200 detail with status confirmed", async () => {
    const { app } = buildApp();
    holder.app = app;
    await seedUser(app);
    cookieHolder.token = await mintSession(app, "admin@boyshop.ie", "pw-1234");
    await seedOrder(app);

    const res = await orderAction(actionRequest("ord_1", { action: "confirm" }), {
      params: Promise.resolve({ id: "ord_1" }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.order.status).toBe("confirmed");
    expect(body.transitions).toHaveLength(1);
    expect(body.transitions[0]).toMatchObject({ fromState: "placed", toState: "confirmed" });
    const stored = await app.orders.get("ord_1");
    expect(stored?.status).toBe("confirmed");
  });

  it("fulfill on a placed order → 409 illegal transition", async () => {
    const { app } = buildApp();
    holder.app = app;
    await seedUser(app);
    cookieHolder.token = await mintSession(app, "admin@boyshop.ie", "pw-1234");
    await seedOrder(app);

    const res = await orderAction(actionRequest("ord_1", { action: "fulfill" }), {
      params: Promise.resolve({ id: "ord_1" }),
    });

    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toMatch(/Illegal transition: placed -> fulfilled/);
  });

  it("returns 404 for an unknown id", async () => {
    const { app } = buildApp();
    holder.app = app;
    await seedUser(app);
    cookieHolder.token = await mintSession(app, "admin@boyshop.ie", "pw-1234");

    const res = await orderAction(actionRequest("nope", { action: "confirm" }), {
      params: Promise.resolve({ id: "nope" }),
    });

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Order not found: nope" });
  });

  it("returns 400 for an invalid JSON body", async () => {
    const { app } = buildApp();
    holder.app = app;
    await seedUser(app);
    cookieHolder.token = await mintSession(app, "admin@boyshop.ie", "pw-1234");
    await seedOrder(app);

    const res = await orderAction(
      new NextRequest("http://localhost/api/admin/orders/ord_1/actions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "not json",
      }),
      { params: Promise.resolve({ id: "ord_1" }) }
    );

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid JSON body" });
  });

  it("returns 400 with the firstIssueMessage for a missing action", async () => {
    const { app } = buildApp();
    holder.app = app;
    await seedUser(app);
    cookieHolder.token = await mintSession(app, "admin@boyshop.ie", "pw-1234");
    await seedOrder(app);

    const res = await orderAction(actionRequest("ord_1", {}), {
      params: Promise.resolve({ id: "ord_1" }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/action/);
  });

  it("returns 400 with the firstIssueMessage for an invalid action value", async () => {
    const { app } = buildApp();
    holder.app = app;
    await seedUser(app);
    cookieHolder.token = await mintSession(app, "admin@boyshop.ie", "pw-1234");
    await seedOrder(app);

    const res = await orderAction(actionRequest("ord_1", { action: "ship" }), {
      params: Promise.resolve({ id: "ord_1" }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/action/);
  });
});