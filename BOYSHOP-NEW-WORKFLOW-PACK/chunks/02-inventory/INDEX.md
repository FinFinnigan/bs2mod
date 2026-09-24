# Phase 02 generated sequence

1. C02.00 recon (00-RECON.md) — inventory/stock evidence picture, READ ONLY — **DONE (2026-09-23)**
2. 01-GENERATE-CHUNKS.md — generate tiny chunks from recon evidence — **DONE (2026-09-24)**
3. Generated chunks, one by one via `NEXT.md`:
   1. C02.01 `C02.01-atomic-checkout-stock-order-writes.md` — make the stock decrement + order/items/address persistence one all-or-nothing DB operation; idempotency race-safe; unit-level target tests — **QUEUED (first)**
   2. C02.02 `C02.02-database-concurrency-rollback-proof.md` — DB-backed tests proving rollback and concurrent duplicate-key safety against a real isolated database (depends on C02.01) — **QUEUED**
   3. C02.03 `C02.03-database-stock-constraints.md` — non-negative `variants.stock` CHECK + migration `0006_*`; test-DB only, live application CEO-gated per C01.08 — **QUEUED (independent)**
   4. C02.04 `C02.04-authoritative-availability-rule.md` — variant quantities = single truth; derived `inStock` across card/admin/cart reads and synced on writes — **QUEUED (before C02.05)**
   5. C02.05 `C02.05-admin-variant-stock-editing.md` — per-variant quantity inputs in the admin edit form + `productFields` plumbing (depends on C02.04) — **QUEUED**
4. C02.99 phase-02 acceptance (99-ACCEPTANCE.md) — **QUEUED (after C02.01–C02.05)**

Ordering rationale: the highest-severity money-path defect (stock can be decremented without a complete order) lands first and its proof second; the DB constraint is independent and its production application remains a separate CEO gate; the authoritative availability rule precedes the admin UI that edits the source-of-truth quantities. C02.01→C02.02 and C02.04→C02.05 are strict dependencies — do not reorder those pairs without evidence.

This is not a blind queue. Every closeout may skip/split/insert/reorder future chunks when repository evidence warrants it.
Every chunk launch reruns agent-aware routing.