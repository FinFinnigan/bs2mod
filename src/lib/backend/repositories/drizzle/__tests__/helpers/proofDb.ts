// Real-Postgres proof helpers for the Drizzle repository tests. These run only
// when TEST_DATABASE_URL is set (the suite skips otherwise) and never touch the
// app's DATABASE_URL. Every fixture id carries a per-run prefix so cleanup can
// delete exactly what a proof inserted, and nothing else.

import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { like, sql } from "drizzle-orm";
import { orders, orderItems, addresses, variants, products } from "../../../../db/schema";

export const TEST_PREFIX = "c0202_";

export function testDatabaseUrl(): string | undefined {
  return process.env.TEST_DATABASE_URL;
}

export function createProofDb(url: string) {
  return drizzle(new Pool({ connectionString: url }), { schema: { orders, orderItems, addresses, variants, products } });
}

export type ProofDb = ReturnType<typeof createProofDb>;

// The whole proof suite depends on the unique index on orders.idempotency_key
// (the concurrency backstop). Fail loudly if it is missing instead of letting
// the same-key proof pass for the wrong reason.
export async function assertIdempotencyIndexExists(db: ProofDb): Promise<void> {
  const res = await db.execute(
    sql`SELECT indexdef FROM pg_indexes WHERE tablename = 'orders' AND indexdef ILIKE '%idempotency_key%' AND indexdef ILIKE '%UNIQUE%'`
  );
  const rows = res.rows as Array<{ indexdef: string }>;
  if (rows.length === 0) {
    throw new Error(
      "orders.idempotency_key has no unique index — the real-Postgres proofs cannot run safely"
    );
  }
}

// Delete every row the proofs may have inserted, FK-safe: children first.
export async function cleanupByPrefix(db: ProofDb, prefix: string): Promise<void> {
  await db.delete(orderItems).where(like(orderItems.id, `oi_${prefix}%`));
  await db.delete(addresses).where(like(addresses.id, `addr_${prefix}%`));
  await db.delete(orders).where(like(orders.id, `${prefix}%`));
  await db.delete(variants).where(like(variants.id, `${prefix}%`));
  await db.delete(products).where(like(products.id, `${prefix}%`));
}