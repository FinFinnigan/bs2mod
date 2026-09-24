# CURRENT-STATE — BoyShop / BS2Mod

Last refreshed: 2026-09-24

## Active phase
Phase 02 — Inventory

## Verified repo truth (2026-09-23)
- git repository root is `C:\dev`; `BS2Mod-site/` has no `.git` of its own
- `BS2Mod-site/` is fully tracked in the `C:\dev` repository as of C01.05 (`140cf921`); only remaining untracked path is the intentionally-excluded `BOYSHOP-NEW-WORKFLOW-PACK/BoyShop-Agent-Aware-Pack.zip`
- `main` HEAD is now `9857f535` — unrelated GPP C14 webhook-ingestion regression-lock/doc-closeout commit. BoyShop's full-tree commit remains `140cf921` (C01.05: 478 files; 15 previously-untracked paths + 5 evidence docs). Shared-monorepo HEAD can advance independently; documentation must distinguish current HEAD from the BoyShop landing commit.
- Cloudflare artifacts: `.wrangler/` ignored by `C:\dev\.gitignore` (lines 26–27); `.open-next/` ignored by `BS2Mod-site/.gitignore:9` (added by C00.2); C00.10 audit verified both ignore rules via `git check-ignore`; C00.10b closed the finding — `.dev.vars` + `.dev.vars.*` now ignored by `BS2Mod-site/.gitignore` lines 33–36, `.dev.vars.example` kept trackable (verified)
- Version metadata aligned (C00.3 verified): `package.json` `0.11.1` == `package-lock.json` `0.11.1` (top-level and root entry); no `VERSION` file exists in `BS2Mod-site/`; canonical package version is `0.11.1`
- Paperwork audit (C00.4, read-only): no canonical paperwork docs existed in `BS2Mod-site/` at audit time — zero `.md` files outside the pack. The five docs (CHANGELOG, GO-LIVE, PROJECT-STATE, TEAM-3-HANDOFF, TEAM-1-HANDOFF) existed ONLY in legacy `C:\dev\BoyShop` (historical reference; user directive: create from scratch going forward)
- Evidence docs now committed in `BS2Mod-site/docs/evidence/` (from scratch; no live-mode facts, no secrets; committed at `d837b0aa` 2026-09-23): `MOLLIE-VERIFICATION.md` (C00.5), `GO-LIVE.md` (C00.6), `HANDOFF.md` (C00.7), `CHANGELOG.md` (C00.8), `PROJECT-STATE.md` (C00.9)
- Mollie verification document created (C00.5): `BS2Mod-site/docs/evidence/MOLLIE-VERIFICATION.md` (from scratch, using only C00.4 evidence). Evidence files it records: `src/lib/backend/payments/adapters/mollie.ts`, `src/lib/backend/payments/__tests__/mollie.test.ts`, `scripts/verify-e2e-payment.cjs`
- GO-LIVE document created (C00.6): `BS2Mod-site/docs/evidence/GO-LIVE.md` (from scratch, current committed state + blockers; verdict: RELEASE BLOCKED — no commit of `BS2Mod-site/` exists, phases 21–23 QUEUED, no live payment/DB/domain authorization)
- HANDOFF document created (C00.7): `BS2Mod-site/docs/evidence/HANDOFF.md` (from scratch, repo truth only — storefront + commerce backend handoff, deferred/blocked items, review notes; no secrets; release stays BLOCKED)
- CHANGELOG document created (C00.8): `BS2Mod-site/docs/evidence/CHANGELOG.md` (from scratch; records already-landed work only — storefront + backend + deployment config + phase-00 stabilization; inventing no version, canonical `0.11.1` = single `[Unreleased]` entry; legacy `0.1.0`→`0.10.2` in `C:\dev\BoyShop` cited as reference-for-shape only; release stays BLOCKED)
- PROJECT-STATE document created (C00.9): `BS2Mod-site/docs/evidence/PROJECT-STATE.md` (from scratch; canonical version + storefront/backend stacks + deployment + phase-00 status + go-live blockers + next steps; facts cross-checked against GO-LIVE/HANDOFF/CHANGELOG/MOLLIE-VERIFICATION and live git; release stays BLOCKED)
- `.omo/` contains only `run-continuation/` session-state JSON (5 files) — no agent definitions, no opencode config, no `MODALITY_WORKBOOK.md` (verification input for C00.11)
- `MODALITY_WORKBOOK.md` does not exist anywhere under `C:\dev` (glob `**/MODALITY_WORKBOOK.md` → 0 files) and nothing in the installed OMO tooling produces it — phantom reference from an earlier pack iteration
- `opencode.json` exists only as user-level live config `C:\Users\ijana\.config\opencode\opencode.json` (plugin `oh-my-openagent@latest`, `build` = `opencode/big-pickle`, MCP: github, stripe, anybridge, playwright, cloudflare × 5); absent from repo; `C:\dev\.gitignore` already excludes `opencode.json` / `opencode.jsonc` / `.omo/` ("may contain API keys - never track")
- Verification artifacts confirmed git-ignored: `node_modules` (`BS2Mod-site/.gitignore:2`), `.next/` (`BS2Mod-site/.gitignore:5`) — `git check-ignore -v` exit 0

## Current execution
Phase 02 inventory reconnaissance DONE (2026-09-23, READ ONLY).
- Inventory exists at variant level (`variants.stock`) with admin service/API updates, storefront stock display, cart-time limits, checkout-time revalidation, conditional database decrements, and HTTP 409 responses for stock conflicts.
- Critical gap: the live order repository decrements stock before writing the order, items, and address without one all-or-nothing database operation. A later write failure or concurrent duplicate idempotency request can reduce stock without a complete order.
- Supporting gaps: no database constraint prevents negative variant stock; product `inStock` can disagree with variant quantities; the admin form exposes only the product-level flag, not variant quantities; live Drizzle stock/concurrency behavior has no database-backed test.
- Existing unit/API tests prove the in-memory happy path, cart limits, sold-out conflicts, checkout revalidation, stock decrement, and admin stock mutation. They do not prove production rollback or concurrent checkout safety.
- Phase 02 chunk generation DONE (2026-09-24): five tiny chunks written under `chunks/02-inventory/` (C02.01 atomic checkout stock/order writes; C02.02 DB-backed concurrency/rollback proof; C02.03 DB stock CHECK constraint; C02.04 authoritative availability rule; C02.05 admin variant-stock editing) plus `INDEX.md` recording the sequence and order rationale. No generated chunk has been implemented.

## Presentation closeout (2026-09-23)
- Completed a visual-only BoyShop storefront overhaul in `BS2Mod-site/src/app/globals.css`, `BS2Mod-site/src/app/page.tsx`, and `BS2Mod-site/src/components/home/HomeHero.tsx`.
- Preserved catalog, routing, cart, wishlist, checkout, payment, API, database, authentication, deployment, and admin implementation.
- Added catalog-backed floating landing tiles, a native Hot Items rail with accessible arrow controls, responsive mobile tile reduction, focus states, and reduced-motion/reduced-transparency handling.
- Verified with `npm test` (292/292), `npm run lint` (exit 0 with existing warnings), serial `npm run build` (14 pages), `npm run typecheck`, and Playwright browser checks for landing, carousel movement, mobile overflow, reduced motion, product navigation, cart drawer, shop rendering, and Add to bag.
- This presentation work does not advance the queued no-code Branding, Navigation, Pages, Sections, or BoyShop template phases.

## C02.01 closeout (2026-09-24)
- C02.01 DONE: `drizzle/order.ts` `create()` now runs idempotency re-check, stock pre-checks, conditional decrement, and order/item/address inserts inside one `db.transaction`; memory repo has a duplicate-key guard; checkout keeps its early idempotency return.
- Target tests added: `drizzle/__tests__/order.test.ts` (fake-tx happy path + rollback, 2 tests), `memory/__tests__/order.test.ts` (duplicate-key race, 1 test), `checkout.test.ts` concurrent same-cart test (14 tests total).
- Verification green: vitest 17/17 on touched files, typecheck 0, full suite 296/296 (30 files), `next build` success.

## C02.02 closeout (2026-09-24)
- C02.02 DONE: DB-backed proof suite delivered and green on an isolated real database. Two files only, per chunk limit: `drizzle/__tests__/order.test.ts` (+ one helper `__tests__/helpers/proofDb.ts`); no other test files touched.
- Proofs (mandated mock design: `vi.hoisted` `useFakeDb` flag, `importOriginal` db/client mock, `TEST_DATABASE_URL` read from env → `DATABASE_URL` in `beforeAll`, `describe.skipIf` when env absent): (A) mid-create unique-key violation rolls back stock decrement + every write; (B) duplicate idempotency-key creates serialize → one order + one decrement (DB-enforced via `orders_idempotency_key_unique`, asserted loudly in `beforeAll`); (C) last-unit race never leaves stock negative; (D) order + items + address + decrement persist atomically.
- Evidence run: `TEST_DATABASE_URL` → Neon test branch `c02-02-proof` (`br-ancient-hall-za23hv5a`); `6 passed` (2 fake-tx + 4 real proofs, 2058ms); prefix `c0202_` + random suffix, FK-safe cleanup in `afterAll`. No-env run correctly skips (4 skipped, 2 passed). `npm run typecheck` clean (exit 0).
- No defect exposed in the C02.01 transaction path → no production fix needed (smallest-fix contingency not triggered).
- Restore snapshot `pre-c02-02-main` (`snap-divine-bar-zaz5p6k7`) and test branch remain on Neon for C02.03 verification. No commits made (uncommitted by design).

## C02.03 closeout (2026-09-24)
- C02.03 DONE: real Postgres CHECK on `variants.stock` — `schema.ts` `variants` now 3-arg `pgTable` with `check("variants_stock_nonnegative", sql`${table.stock} >= 0`)`; Drizzle migration `0006_eminent_black_tom.sql` (`ALTER TABLE "variants" ADD CONSTRAINT "variants_stock_nonnegative" CHECK ("variants"."stock" >= 0)`); journal idx 6 appended, entries 0–5 untouched.
- Applied to isolated test branch `br-ancient-hall-za23hv5a` — `npm run db:migrate` "migrations applied successfully"; post-apply `pg_constraint` shows `variants_stock_nonnegative` `CHECK ((stock >= 0))`.
- DB-backed proof added (per chunk wording, Vitest rejection tests, mirroring C02.02 helpers): `drizzle/__tests__/variants-stock-constraint.test.ts` — skipIf gate on `TEST_DATABASE_URL`, `beforeAll` loudly asserts the constraint exists, prefix `c0203_` + random suffix, FK-safe cleanup; two tests: negative insert → `rejects.toThrow()`, zero insert → persists.
- Rejected-insert error evidence captured verbatim: `new row for relation "variants" violates check constraint "variants_stock_nonnegative"` (single data-modifying statement, rolled back — zero residue).
- Verification green: `npm run typecheck` exit 0; full suite with `TEST_DATABASE_URL` set 302/302 (31 files) including the 2 new DB-backed tests and the C02.02 real-Postgres proofs; no-env run skips the DB-backed tests as designed.
- Diff scope vs HEAD verified: only schema.ts variants hunk (34 lines includes the pre-existing `SettingsRow` line, not this chunk) + journal idx 6 + migration `0006_eminent_black_tom.sql` + `meta/0006_snapshot.json` + new test file. No commits (uncommitted by design).

## C02.04 closeout (2026-09-24)
- C02.04 DONE: commit `59a6bb4` "Add authoritative variant-stock availability rule (C02.04)" — 7 files changed, +269/−27.
- New `src/lib/backend/availability.ts` `isInStock()` rule: true iff at least one variant `stock > 0`; empty array → false; readers fall back to the stored boolean only when `variants.length === 0`.
- Drizzle `catalog.ts`/`cart.ts` and memory `index.ts` reads now derive `inStock`; writers sync stored `products.inStock` whenever variants are present.
- Three new test suites: backend 20 lines, drizzle 97, memory 71.
- Verification green: typecheck ✅, full suite 322/322 (35 files), `next build` ✅ 15 static pages.
- No schema changes; product-level `inStock` column retained (removal out of scope).

## Next chunk
`chunks/02-inventory/C02.05-admin-variant-stock-editing.md` — admin variant-stock editing: per-variant quantity inputs + `productFields` plumbing (depends on C02.04, now done). Run routing preflight first.

## C00.11 resolution record
- Decision approved by user 2026-09-23 (recommended options A1 + B1)
- `MODALITY_WORKBOOK.md`: no-op, out of scope — not repo-owned, not pack-owned, nothing expects it; future chunks must not report it as missing inventory
- `opencode.json`: user-level config is sole owner — never introduce a repo-level copy (repo `.gitignore` explicitly warns it may contain API keys); commit scope keeps it excluded
- This resolution fixes the C00.13 commit scope: no ownership files are added to it

## Update rule
Keep this concise. Replace stale current facts; do not use it as a long history log.
