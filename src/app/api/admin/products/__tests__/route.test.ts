// ADM-002 — Admin CRUD product API (route layer). The REAL route handlers
// (GET list, POST create, GET [id], PATCH [id]) run end-to-end against a fake
// AppContainer built from the REAL in-memory repositories and services — the
// same pattern as webhooks/payment/__tests__/route.test.ts.
//
// Coverage mapped to acceptance:
//  - anonymous request → 401 "unauthorized" (gate: login)
//  - authenticated non-admin (customer) → 403 "forbidden" (gate: forbidden)
//  - DB guard (hasDatabase) is a pure env check (!!process.env.DATABASE_URL);
//    a fake URL satisfies it so the in-memory setup proceeds, and the guard's
//    own branch (503 "admin unavailable") is tested by unsetting the env var —
//    no database is ever touched because the container module is mocked.
//  - GET list → 200 { products }
//  - POST create → 201 { product } and the product is persisted in the catalog
//  - POST invalid body → 400 with firstIssueMessage
//  - GET [id] → 200 { product }
//  - GET [id] unknown → 404 "Not found"
//  - PATCH [id] → 200 { product } with the change persisted
//  - PATCH invalid body → 400 with firstIssueMessage
//  - PATCH [id] unknown → 404 "Not found"

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

import { GET as listProducts, POST as createProduct } from "../route";
import { GET as getProduct, PATCH as updateProduct } from "../[id]/route";

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

function buildApp(): { app: AppContainer; catalog: MemoryCatalogRepository } {
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
    catalog,
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

function listRequest(): NextRequest {
  return new NextRequest("http://localhost/api/admin/products", { method: "GET" });
}

function createRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/admin/products", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function itemRequest(id: string, method: "GET" | "PATCH", body?: unknown): NextRequest {
  if (body === undefined) {
    return new NextRequest(`http://localhost/api/admin/products/${id}`, { method });
  }
  return new NextRequest(`http://localhost/api/admin/products/${id}`, {
    method,
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

describe("ADM-002 — gate: anonymous and non-admin callers are rejected", () => {
  it("anonymous GET list → 401 unauthorized", async () => {
    const { app } = buildApp();
    holder.app = app;

    const res = await listProducts();

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "unauthorized" });
  });

  it("anonymous POST create → 401 unauthorized (gate runs before body parsing)", async () => {
    const { app } = buildApp();
    holder.app = app;

    const res = await createProduct(
      createRequest({ slug: "navy-cap", name: "Navy Cap", categorySlug: "accessories", ageBand: "6-8Y", price: 1500 })
    );

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "unauthorized" });
  });

  it("authenticated customer (non-admin) → 403 forbidden", async () => {
    const { app } = buildApp();
    holder.app = app;
    await seedUser(app, { id: "usr_customer", email: "customer@boyshop.ie", role: "customer" });
    cookieHolder.token = await mintSession(app, "customer@boyshop.ie", "pw-1234");

    const res = await listProducts();

    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "forbidden" });
  });
});

describe("ADM-002 — DB guard (hasDatabase) branch", () => {
  it("returns 503 admin unavailable when DATABASE_URL is unset", async () => {
    const { app } = buildApp();
    holder.app = app;
    const saved = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    try {
      const res = await listProducts();

      expect(res.status).toBe(503);
      expect(await res.json()).toEqual({ error: "admin unavailable" });
    } finally {
      if (saved !== undefined) process.env.DATABASE_URL = saved;
    }
  });
});

describe("ADM-002 — GET list returns the admin product read-model", () => {
  it("returns 200 with the seeded products", async () => {
    const { app } = buildApp();
    holder.app = app;
    await seedUser(app);
    cookieHolder.token = await mintSession(app, "admin@boyshop.ie", "pw-1234");

    const res = await listProducts();

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.products)).toBe(true);
    expect(body.products).toHaveLength(1);
    expect(body.products[0]).toMatchObject({
      id: "p1",
      slug: "slate-hoodie",
      name: "Slate Hoodie",
      categorySlug: "hoodies",
      ageBand: "9-12Y",
      price: 3400,
      currency: "EUR",
      inStock: true,
      archived: false,
      variants: [{ id: "v1", stock: 5 }],
    });
  });
});

describe("ADM-002 — POST create persists a product", () => {
  it("returns 201 with the created product and persists it in the catalog", async () => {
    const { app, catalog } = buildApp();
    holder.app = app;
    await seedUser(app);
    cookieHolder.token = await mintSession(app, "admin@boyshop.ie", "pw-1234");

    const res = await createProduct(
      createRequest({
        slug: "navy-cap",
        name: "Navy Cap",
        categorySlug: "accessories",
        ageBand: "6-8Y",
        price: 1500,
        currency: "EUR",
        badges: ["new"],
        inStock: true,
      })
    );

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.product).toMatchObject({
      slug: "navy-cap",
      name: "Navy Cap",
      categorySlug: "accessories",
      ageBand: "6-8Y",
      price: 1500,
      currency: "EUR",
      badges: ["new"],
      inStock: true,
      archived: false,
    });
    expect(body.product.id).toMatch(/^prd_/);

    // The product is actually retrievable through the catalog repository.
    const stored = await catalog.getAdminProduct(body.product.id);
    expect(stored).not.toBeNull();
    expect(stored?.name).toBe("Navy Cap");
    expect(stored?.price).toBe(1500);
  });

  it("returns 400 with the firstIssueMessage for an invalid body", async () => {
    const { app } = buildApp();
    holder.app = app;
    await seedUser(app);
    cookieHolder.token = await mintSession(app, "admin@boyshop.ie", "pw-1234");

    const res = await createProduct(
      createRequest({ slug: "navy-cap", categorySlug: "accessories", ageBand: "6-8Y", price: 1500 })
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/name/);
  });
});

describe("ADM-002 — GET [id] returns one product", () => {
  it("returns 200 with the product", async () => {
    const { app } = buildApp();
    holder.app = app;
    await seedUser(app);
    cookieHolder.token = await mintSession(app, "admin@boyshop.ie", "pw-1234");

    const res = await getProduct(itemRequest("p1", "GET"), { params: Promise.resolve({ id: "p1" }) });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.product).toMatchObject({ id: "p1", slug: "slate-hoodie", name: "Slate Hoodie" });
  });

  it("returns 404 for an unknown id", async () => {
    const { app } = buildApp();
    holder.app = app;
    await seedUser(app);
    cookieHolder.token = await mintSession(app, "admin@boyshop.ie", "pw-1234");

    const res = await getProduct(itemRequest("nope", "GET"), { params: Promise.resolve({ id: "nope" }) });

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Not found" });
  });
});

describe("ADM-002 — PATCH [id] updates a product", () => {
  it("returns 200 with the updated product and persists the change", async () => {
    const { app, catalog } = buildApp();
    holder.app = app;
    await seedUser(app);
    cookieHolder.token = await mintSession(app, "admin@boyshop.ie", "pw-1234");

    const res = await updateProduct(itemRequest("p1", "PATCH", { name: "Slate Hoodie Pro", price: 3900 }), {
      params: Promise.resolve({ id: "p1" }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.product).toMatchObject({ id: "p1", name: "Slate Hoodie Pro", price: 3900 });

    // The change is actually persisted in the catalog repository.
    const stored = await catalog.getAdminProduct("p1");
    expect(stored?.name).toBe("Slate Hoodie Pro");
    expect(stored?.price).toBe(3900);
  });

  it("returns 200 and persists variant stock changes", async () => {
    const { app, catalog } = buildApp();
    holder.app = app;
    await seedUser(app);
    cookieHolder.token = await mintSession(app, "admin@boyshop.ie", "pw-1234");

    const res = await updateProduct(itemRequest("p1", "PATCH", { variants: [{ id: "v1", stock: 8 }] }), {
      params: Promise.resolve({ id: "p1" }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.product.variants).toEqual([{ id: "v1", stock: 8 }]);

    const stored = await catalog.getAdminProduct("p1");
    expect(stored?.variants).toEqual([{ id: "v1", stock: 8 }]);
  });

  it("returns 400 with the firstIssueMessage for an invalid patch", async () => {
    const { app } = buildApp();
    holder.app = app;
    await seedUser(app);
    cookieHolder.token = await mintSession(app, "admin@boyshop.ie", "pw-1234");

    const res = await updateProduct(itemRequest("p1", "PATCH", { price: "not-a-number" }), {
      params: Promise.resolve({ id: "p1" }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/price/);
  });

  it("returns 404 for an unknown id", async () => {
    const { app } = buildApp();
    holder.app = app;
    await seedUser(app);
    cookieHolder.token = await mintSession(app, "admin@boyshop.ie", "pw-1234");

    const res = await updateProduct(itemRequest("nope", "PATCH", { name: "X" }), {
      params: Promise.resolve({ id: "nope" }),
    });

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Not found" });
  });
});