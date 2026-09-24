// Drizzle order repository tests — run against a fake transaction client so the
// atomicity of create() is verified without a live database. The fake lives in
// vi.hoisted because vi.mock factories are hoisted above imports and cannot
// reference module-level values; it dispatches on drizzle's table-name symbol
// and reads WHERE conditions by walking the SQL chunk tree (columns carry their
// DB name, plain values are wrapped in Param nodes).
// === REAL POSTGRES PROOF (workflow chunk C02.02) — runs when TEST_DATABASE_URL is set, else skips ===

import { describe, expect, it, beforeEach, beforeAll, afterAll, vi } from "vitest";
import { randomUUID } from "crypto";
import { eq, like } from "drizzle-orm";
import { DrizzleOrderRepository } from "../order";
import type { CreateOrderInput, OrderRow } from "../../interfaces";
import { StockUnavailableError } from "../../interfaces";
import { money } from "../../../money";
import { orders, orderItems, addresses, variants, products } from "../../../db/schema";
import {
  TEST_PREFIX,
  testDatabaseUrl,
  createProofDb,
  assertIdempotencyIndexExists,
  cleanupByPrefix,
} from "./helpers/proofDb";
import type { ProofDb } from "./helpers/proofDb";

const { fakeDb, useFakeDb } = vi.hoisted(() => {
  const NAME = Symbol.for("drizzle:Name");

  interface FakeVariant {
    id: string;
    stock: number;
  }
  interface FakeOrderRow {
    id: string;
    idempotencyKey: string;
  }
  interface Condition {
    column: string;
    op: string;
    value: unknown;
  }

  function tableName(table: unknown): string {
    return (table as Record<symbol, string>)[NAME];
  }

  // eq/gte build SQL chunks [column, " = "/" >= ", Param(value)]; and() nests
  // them inside StringChunk("(") ... StringChunk(")") with " and " separators.
  function extractConditions(condition: unknown): Condition[] {
    const out: Condition[] = [];
    let column: string | undefined;
    let op: string | undefined;
    const walk = (chunk: unknown): void => {
      if (typeof chunk === "string") {
        const t = chunk.trim();
        if (t === "=" || t === ">=" || t === "<=" || t === ">" || t === "<" || t === "<>") {
          op = t;
        }
        return;
      }
      if (chunk === null || typeof chunk !== "object") return;
      const c = chunk as Record<string, unknown>;
      if (Array.isArray(c.queryChunks)) {
        for (const sub of c.queryChunks) walk(sub);
        return;
      }
      const table = c.table as Record<symbol, string> | undefined;
      if (typeof c.name === "string" && table && typeof table[NAME] === "string") {
        column = c.name;
        return;
      }
      if (Array.isArray(c.value)) {
        // StringChunk — value is an array of string fragments (e.g. [" = "]);
        // walk them so operator tokens are still detected.
        for (const frag of c.value) walk(frag);
        return;
      }
      if ("value" in c) {
        if (column !== undefined && op !== undefined) out.push({ column, op, value: c.value });
        column = undefined;
        op = undefined;
      }
    };
    walk(condition);
    return out;
  }

  class FakeTx {
    constructor(private readonly db: FakeDb) {}

    select() {
      return {
        from: (table: unknown) => ({
          where: (condition: unknown) => ({
            limit: (): FakeOrderRow[] | FakeVariant[] => {
              const name = tableName(table);
              const conds = extractConditions(condition);
              if (name === "orders") {
                const key = conds.find((c) => c.column === "idempotency_key" && c.op === "=")?.value;
                const row = this.db.state.orders.find((o) => o.idempotencyKey === key);
                return row ? [row] : [];
              }
              if (name === "variants") {
                const id = conds.find((c) => c.column === "id" && c.op === "=")?.value;
                const v = this.db.state.variants.get(id as string);
                return v ? [v] : [];
              }
              return [];
            },
          }),
        }),
      };
    }

    update(table: unknown) {
      return {
        set: () => ({
          where: (condition: unknown) => ({
            returning: (): Array<{ id: string }> => {
              const name = tableName(table);
              if (name === "variants") {
                const conds = extractConditions(condition);
                const id = conds.find((c) => c.column === "id" && c.op === "=")?.value as string;
                const minStock = conds.find(
                  (c) => c.column === "stock" && c.op === ">="
                )?.value as number;
                const v = this.db.state.variants.get(id);
                if (!v || v.stock < minStock) return [];
                v.stock -= minStock;
                return [{ id: v.id }];
              }
              return [];
            },
          }),
        }),
      };
    }

    insert(table: unknown) {
      return {
        values: (row: unknown): void => {
          const name = tableName(table);
          if (name === "orders") {
            this.db.state.orders.push(row as FakeOrderRow);
          } else if (name === "order_items") {
            if (this.db.failOrderItemInsert) throw new Error("forced order item insert failure");
            this.db.state.orderItems.push(row);
          } else if (name === "addresses") {
            this.db.state.addresses.push(row);
          }
        },
      };
    }
  }

  class FakeDb {
    state = {
      variants: new Map<string, FakeVariant>(),
      orders: [] as FakeOrderRow[],
      orderItems: [] as unknown[],
      addresses: [] as unknown[],
    };
    failOrderItemInsert = false;

    async transaction<T>(cb: (tx: FakeTx) => Promise<T>): Promise<T> {
      const snapshot = {
        variants: new Map([...this.state.variants].map(([k, v]) => [k, { ...v }])),
        orders: [...this.state.orders],
        orderItems: [...this.state.orderItems],
        addresses: [...this.state.addresses],
      };
      try {
        return await cb(new FakeTx(this));
      } catch (e) {
        this.state.variants = snapshot.variants;
        this.state.orders = snapshot.orders;
        this.state.orderItems = snapshot.orderItems;
        this.state.addresses = snapshot.addresses;
        throw e;
      }
    }
  }

  return { fakeDb: new FakeDb(), useFakeDb: { value: true } };
});

vi.mock("../../../db/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../../db/client")>();
  return {
    ...actual,
    getDb: () => (useFakeDb.value ? fakeDb : actual.getDb()),
    hasDatabase: () => true,
  };
});

describe("DrizzleOrderRepository.create", () => {
  beforeEach(() => {
    useFakeDb.value = true;
    fakeDb.state.variants.clear();
    fakeDb.state.orders.length = 0;
    fakeDb.state.orderItems.length = 0;
    fakeDb.state.addresses.length = 0;
    fakeDb.failOrderItemInsert = false;
    fakeDb.state.variants.set("v1", { id: "v1", stock: 5 });
  });

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

  it("persists order, items, and address and decrements stock in one transaction", async () => {
    const repo = new DrizzleOrderRepository();
    await repo.create(input, order);

    expect(fakeDb.state.variants.get("v1")?.stock).toBe(4);
    expect(fakeDb.state.orders).toHaveLength(1);
    expect(fakeDb.state.orderItems).toHaveLength(1);
    expect(fakeDb.state.addresses).toHaveLength(1);
  });

  it("rolls back stock and all writes when an order item insert fails", async () => {
    fakeDb.failOrderItemInsert = true;
    const repo = new DrizzleOrderRepository();

    await expect(repo.create(input, order)).rejects.toThrow("forced order item insert failure");

    expect(fakeDb.state.variants.get("v1")?.stock).toBe(5);
    expect(fakeDb.state.orders).toHaveLength(0);
    expect(fakeDb.state.orderItems).toHaveLength(0);
    expect(fakeDb.state.addresses).toHaveLength(0);
  });
});

const originalDbUrl = process.env.DATABASE_URL;
const realUrl = testDatabaseUrl();
const realSuiteName = realUrl
  ? "DrizzleOrderRepository.create — real Postgres proof"
  : "DrizzleOrderRepository.create — real Postgres proof (skipped: TEST_DATABASE_URL not set)";

describe.skipIf(!realUrl)(realSuiteName, () => {
  const testUrl = realUrl ?? "";
  let db: ProofDb;
  let repo: DrizzleOrderRepository;
  let prefix: string;

  beforeAll(async () => {
    process.env.DATABASE_URL = testUrl;
    useFakeDb.value = false;
    db = createProofDb(testUrl);
    await assertIdempotencyIndexExists(db);
    repo = new DrizzleOrderRepository();
    prefix = `${TEST_PREFIX}${randomUUID().slice(0, 8)}`;
  });

  afterAll(async () => {
    await cleanupByPrefix(db, prefix);
    useFakeDb.value = true;
    if (originalDbUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = originalDbUrl;
  });

  function makeInput(key: string, orderId: string): CreateOrderInput {
    return {
      id: orderId,
      cartId: `${prefix}cart`,
      email: "proof@example.com",
      shippingAddress: {
        fullName: "Proof Buyer",
        line1: "1 Proof Street",
        city: "Dublin",
        postcode: "D01 PROOF",
        country: "IE",
      },
      idempotencyKey: key,
    };
  }

  function makeOrderRow(
    orderId: string,
    variantId: string,
    productId: string,
    qty: number
  ): OrderRow {
    return {
      id: orderId,
      cartId: `${prefix}cart`,
      email: "proof@example.com",
      publicToken: `${prefix}tok-${orderId}`,
      status: "placed",
      subtotal: money(50 * qty, "EUR"),
      shippingAmount: money(5, "EUR"),
      total: money(50 * qty + 5, "EUR"),
      currency: "EUR",
      items: [
        {
          variantId,
          productId,
          sku: `${prefix}SKU`,
          name: "Proof Hoodie",
          size: "9Y",
          colour: "Slate",
          unitPrice: money(50, "EUR"),
          quantity: qty,
          lineTotal: money(50 * qty, "EUR"),
        },
      ],
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
  }

  async function insertProductAndVariant(
    suffix: string,
    stock: number
  ): Promise<{ variantId: string; productId: string }> {
    const productId = `${prefix}product-${suffix}`;
    const variantId = `${prefix}v-${suffix}`;
    await db.insert(products).values({
      id: productId,
      slug: `${prefix}slug-${suffix}`,
      name: "Proof Hoodie",
      categorySlug: "hoodies",
      ageBand: "9-12Y",
      price: 5000,
      currency: "EUR",
    });
    await db.insert(variants).values({
      id: variantId,
      productId,
      sku: `${prefix}SKU-${suffix}`,
      stock,
    });
    return { variantId, productId };
  }

  it("A: rolls back the stock decrement and every write when an order item insert hits a unique-key violation", async () => {
    const key = `${prefix}k-a`;
    const proofOrderId = `${prefix}o-a`;
    const decoyOrderId = `${prefix}o-decoy`;
    const { variantId, productId } = await insertProductAndVariant("a", 3);

    await db.insert(orders).values({
      id: decoyOrderId,
      publicToken: `${prefix}tok-decoy`,
      idempotencyKey: `${prefix}k-decoy`,
      status: "placed",
      subtotal: 0,
      total: 0,
      currency: "EUR",
      shippingAmount: 0,
    });
    await db.insert(orderItems).values({
      id: `oi_${proofOrderId}_${variantId}`,
      orderId: decoyOrderId,
      variantId,
      productId,
      sku: `${prefix}SKU-a`,
      name: "Decoy",
      unitPrice: 0,
      quantity: 1,
      lineTotal: 0,
    });

    await expect(
      repo.create(makeInput(key, proofOrderId), makeOrderRow(proofOrderId, variantId, productId, 1))
    ).rejects.toThrow();

    const [variant] = await db.select().from(variants).where(eq(variants.id, variantId)).limit(1);
    expect(variant?.stock).toBe(3);
    const byKey = await db.select().from(orders).where(eq(orders.idempotencyKey, key)).limit(1);
    expect(byKey).toHaveLength(0);
    const addr = await db.select().from(addresses).where(eq(addresses.orderId, proofOrderId));
    expect(addr).toHaveLength(0);
  });

  it("B: persists exactly one order for concurrent same-key creates and decrements stock once", async () => {
    const key = `${prefix}k-b`;
    const orderIdA = `${prefix}o-b1`;
    const orderIdB = `${prefix}o-b2`;
    const { variantId, productId } = await insertProductAndVariant("b", 2);

    const results = await Promise.allSettled([
      repo.create(makeInput(key, orderIdA), makeOrderRow(orderIdA, variantId, productId, 1)),
      repo.create(makeInput(key, orderIdB), makeOrderRow(orderIdB, variantId, productId, 1)),
    ]);
    expect(results).toHaveLength(2);

    const [variant] = await db.select().from(variants).where(eq(variants.id, variantId)).limit(1);
    expect(variant?.stock).toBe(1);
    const rows = await db.select().from(orders).where(eq(orders.idempotencyKey, key));
    expect(rows).toHaveLength(1);
  });

  it("C: lets only one of two concurrent buyers take the last unit of stock", async () => {
    const orderIdA = `${prefix}o-c1`;
    const orderIdB = `${prefix}o-c2`;
    const { variantId, productId } = await insertProductAndVariant("c", 1);

    const results = await Promise.allSettled([
      repo.create(makeInput(`${prefix}k-c1`, orderIdA), makeOrderRow(orderIdA, variantId, productId, 1)),
      repo.create(makeInput(`${prefix}k-c2`, orderIdB), makeOrderRow(orderIdB, variantId, productId, 1)),
    ]);

    const [variant] = await db.select().from(variants).where(eq(variants.id, variantId)).limit(1);
    expect(variant?.stock).toBe(0);
    const rows = await db.select().from(orders).where(like(orders.id, `${prefix}o-c%`));
    expect(rows).toHaveLength(1);

    const rejected = results.filter((r): r is PromiseRejectedResult => r.status === "rejected");
    expect(rejected).toHaveLength(1);
    expect(rejected[0]?.reason).toBeInstanceOf(StockUnavailableError);
  });

  it("D: persists the order, its items, and the shipping address and decrements stock in one transaction", async () => {
    const key = `${prefix}k-d`;
    const orderId = `${prefix}o-d`;
    const { variantId, productId } = await insertProductAndVariant("d", 4);

    await repo.create(makeInput(key, orderId), makeOrderRow(orderId, variantId, productId, 2));

    const [orderRow] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    expect(orderRow?.idempotencyKey).toBe(key);
    expect(orderRow?.status).toBe("placed");

    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    expect(items).toHaveLength(1);
    expect(items[0]?.variantId).toBe(variantId);
    expect(items[0]?.quantity).toBe(2);

    const addr = await db.select().from(addresses).where(eq(addresses.orderId, orderId));
    expect(addr).toHaveLength(1);
    expect(addr[0]?.kind).toBe("shipping");

    const [variant] = await db.select().from(variants).where(eq(variants.id, variantId)).limit(1);
    expect(variant?.stock).toBe(2);
  });
});