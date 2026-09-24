// Verify E2E payment webhook result: fetch order + payment + transitions for
// the order created via the deployed API E2E flow.
const { neon } = require("@neondatabase/serverless");

async function main() {
  const { readFileSync, existsSync } = require("node:fs");
  const { resolve } = require("node:path");
  const envPath = resolve(process.cwd(), ".env.local");
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, "utf8").split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
    }
  }
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL missing");
  const sql = neon(url);
  const orderId =
    process.env.ORDER_ID ?? process.argv[2] ?? "ord_56058dfa7b8cd442f0fe6f3e27023e3b";
  const [order] = await sql`SELECT id, status, total, currency, created_at, updated_at FROM orders WHERE id = ${orderId}`;
  const payments = await sql`SELECT id, order_id, provider_id, provider_ref, status, amount, currency, idempotency_key, created_at, updated_at FROM payments WHERE order_id = ${orderId} ORDER BY created_at`;
  const transitions = await sql`SELECT id, payment_id, from_state, to_state, provider_ref, idempotency_key, occurred_at FROM payment_transitions WHERE payment_id IN (SELECT id FROM payments WHERE order_id = ${orderId}) ORDER BY occurred_at`;
  const ot = await sql`SELECT id, order_id, from_state, to_state, idempotency_key, occurred_at FROM order_transitions WHERE order_id = ${orderId} ORDER BY occurred_at`;
  console.log(JSON.stringify({ order, payments, transitions, orderTransitions: ot }, null, 2));
}

main().catch((e) => {
  console.error(String(e && e.stack ? e.stack : e));
  process.exit(1);
});