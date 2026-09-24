// Drizzle variants stock-constraint proof (workflow chunk C02.03) — runs when
// TEST_DATABASE_URL is set, else skips. Mirrors the C02.02 real-Postgres proof
// layout in order.test.ts (helpers/proofDb.ts): same skipIf gate, same
// per-run prefixed fixtures, same FK-safe cleanup. The precondition asserts
// the CHECK constraint exists on the test database, so the rejection below
// cannot pass for the wrong reason — a removed constraint would let the
// negative-stock insert succeed and fail the test.

import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { randomUUID } from "crypto";
import { eq, sql } from "drizzle-orm";
import { variants, products } from "../../../db/schema";
import { testDatabaseUrl, createProofDb, cleanupByPrefix } from "./helpers/proofDb";
import type { ProofDb } from "./helpers/proofDb";

const STOCK_CHECK_NAME = "variants_stock_nonnegative";
const PREFIX = "c0203_";

// Fail loudly if the CHECK constraint is missing instead of letting the
// negative-stock rejection prove nothing.
async function assertStockConstraintExists(db: ProofDb): Promise<void> {
  const res = await db.execute(
    sql`SELECT conname FROM pg_constraint WHERE conrelid = 'variants'::regclass AND conname = ${STOCK_CHECK_NAME}`
  );
  const rows = res.rows as Array<{ conname: string }>;
  if (rows.length === 0) {
    throw new Error(
      `variants has no '${STOCK_CHECK_NAME}' CHECK constraint — the real-Postgres proofs cannot run safely`
    );
  }
}

const realUrl = testDatabaseUrl();
const suiteName = realUrl
  ? "variants stock CHECK constraint — real Postgres proof"
  : "variants stock CHECK constraint — real Postgres proof (skipped: TEST_DATABASE_URL not set)";

describe.skipIf(!realUrl)(suiteName, () => {
  const testUrl = realUrl ?? "";
  let db: ProofDb;
  let prefix: string;

  beforeAll(async () => {
    db = createProofDb(testUrl);
    await assertStockConstraintExists(db);
    prefix = `${PREFIX}${randomUUID().slice(0, 8)}`;
  });

  afterAll(async () => {
    await cleanupByPrefix(db, prefix);
  });

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

  it("rejects a negative-stock insert (variants_stock_nonnegative)", async () => {
    await expect(insertProductAndVariant("neg", -1)).rejects.toThrow();
  });

  it("accepts stock = 0", async () => {
    const { variantId } = await insertProductAndVariant("zero", 0);

    const [row] = await db.select().from(variants).where(eq(variants.id, variantId)).limit(1);
    expect(row?.stock).toBe(0);
  });
});