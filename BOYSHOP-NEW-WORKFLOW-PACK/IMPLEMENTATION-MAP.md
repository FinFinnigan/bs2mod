# IMPLEMENTATION-MAP — BoyShop / BS2Mod

Statuses: `QUEUED`, `ACTIVE`, `BLOCKED`, `READY-FOR-ACCEPTANCE`, `DONE`, `SKIPPED-AS-ALREADY-SATISFIED`.

| Phase | Workstream | Status | Folder | Exit intent |
|---:|---|---|---|---|
| 00 | Repo stabilization | DONE | `repo-stabilization` | Make repository truth, metadata, docs, evidence and Git scope trustworthy. |
| 01 | Existing release blockers | DONE | `existing-release-blockers` | Reconcile and close the authoritative current release blockers in dependency order. |
| 02 | Inventory | ACTIVE | `inventory` | Close the stock/inventory acceptance requirement safely. |
| 03 | Builder reconnaissance | QUEUED | `builder-reconnaissance` | Map the actual repo before no-code builder implementation. |
| 04 | Builder foundation | QUEUED | `builder-foundation` | Create shared site configuration, persistence and template foundations. |
| 05 | Branding | QUEUED | `branding` | Make supported branding/theme controls no-code. |
| 06 | Navigation | QUEUED | `navigation` | Make supported navigation structures no-code. |
| 07 | Pages | QUEUED | `pages` | Create managed pages, routing and metadata within the builder model. |
| 08 | Sections | QUEUED | `sections` | Create reusable registered section modules with safe schemas. |
| 09 | BoyShop template | QUEUED | `boyshop-template` | Preserve and reproduce the approved BoyShop design as template #1. |
| 10 | Catalog | QUEUED | `catalog` | Make supported catalog presentation modular/configurable. |
| 11 | Cart | QUEUED | `cart` | Make supported cart presentation modular while protecting commerce logic. |
| 12 | Checkout | QUEUED | `checkout` | Extend safe no-code configuration through checkout/confirmation. |
| 13 | Setup wizard | QUEUED | `setup-wizard` | Build the Superadmin setup wizard on the shared configuration model. |
| 14 | Draft / preview / publish | QUEUED | `draft-preview-publish` | Provide safe draft editing, preview and intentional publishing. |
| 15 | Superadmin | QUEUED | `superadmin` | Unify website and commerce controls into a coherent non-technical admin. |
| 16 | Providers | QUEUED | `providers` | Verify/implement provider-neutral boundaries required by the product. |
| 17 | Deployment wizard | QUEUED | `deployment-wizard` | Guide safe environment/domain/provider/deployment setup. |
| 18 | Security | QUEUED | `security` | Harden builder, admin and commerce surfaces. |
| 19 | QA | QUEUED | `qa` | Verify visitor/customer/admin/Superadmin flows and regressions. |
| 20 | No-code acceptance | QUEUED | `no-code-acceptance` | Prove supported landing-to-checkout setup requires no source-code edits. |
| 21 | Release audit | QUEUED | `release-audit` | Run the authoritative broad release audit when justified. |
| 22 | Production | QUEUED | `production` | Prepare production systems under approval gates. |
| 23 | Go-live | QUEUED | `go-live` | Perform authorized release and production smoke tests. |
| 24 | Post-launch | QUEUED | `post-launch` | Validate live operations and capture follow-up work. |

Presentation-only closeout (2026-09-23): the existing storefront received the requested liquid-glass visual overhaul and manual browser verification. This is intentionally out-of-band from the queued no-code Branding, Navigation, Pages, Sections, and BoyShop template phases; those phase statuses remain unchanged.

## Phase 00 chunk progress

`repo-stabilization`: C00.1–C00.10b DONE — repo truth verified (C00.1), `.gitignore` lines added (C00.2), version aligned at `0.11.1` (C00.3), paperwork/evidence audit (C00.4), evidence docs created from scratch: `MOLLIE-VERIFICATION.md` (C00.5), `GO-LIVE.md` (C00.6), `HANDOFF.md` (C00.7), `CHANGELOG.md` (C00.8), `PROJECT-STATE.md` (C00.9), Cloudflare evidence audit (C00.10, READ ONLY — deploy config clean and Git-suitable; `.wrangler/` + `.open-next/` verified git-ignored; found `.dev.vars` unguarded), `.dev.vars` + `.dev.vars.*` added to `BS2Mod-site/.gitignore` lines 33–36 with `.dev.vars.example` kept trackable (C00.10b — verified via `git check-ignore` and temp-file probe). C00.11 DONE (READ ONLY + user decision, approved 2026-09-23: `MODALITY_WORKBOOK.md` no-op/out of scope — exists nowhere, nothing produces it; `opencode.json` user-level config is sole owner — repo has none, `.gitignore` already excludes it). C00.12 DONE (READ ONLY, 2026-09-23, no commit — pre-commit verification: scope/evidence/secrets/visuals inspected; all 5 evidence docs verified consistent; no secrets in scope). Release stays BLOCKED; C00.13 is the CEO-approved commit gate.

Re-evaluated after C00.12: pre-commit verification is clean — C00.13 intended scope = `docs/evidence/*` only on explicit staged paths; the sole binary in the untracked surface (`BOYSHOP-NEW-WORKFLOW-PACK/BoyShop-Agent-Aware-Pack.zip`) stays excluded by explicit-path staging; no storefront image assets exist; `.dev.vars.example` is rule-trackable but the file is absent from the tree (noted, no action). Next = C00.13 `approved-docs-evidence-commit` — CEO approval required, never `git add -A`, inspect staged diff, commit, regression verify.

Re-evaluated after C00.13 (2026-09-23): C00.13 DONE — CEO-approved commit `d837b0aa` ("BS2Mod: docs/evidence C00.1-C00.12 closeout") committed exactly the five evidence docs (629 insertions) via explicit-path staging only; no secrets; staged diff inspected before commit. Regression verification green: `typecheck` pass, `lint` clean (exit 0, 2 pre-existing warnings), 292/292 Vitest tests (28 files), `next build` success (14 static pages). Verification artifacts `node_modules` + `.next/` confirmed git-ignored. Phase 00 seeded sequence complete → next = `chunks/00-repo-stabilization/99-ACCEPTANCE.md` (phase-00 acceptance gate, READ ONLY; then activate Phase 01 via its `00-RECON.md`).

C00.99 DONE (2026-09-23, READ ONLY — Phase 00 acceptance gate). All six evidence checks pass: (1) `main` HEAD `d837b0aa` lists exactly the five evidence docs under `BS2Mod-site/docs/evidence/` (629 insertions, 0 deletions, no other files); (2) docs agree with repo truth (`0.11.1`, PRE-LAUNCH — RELEASE BLOCKED, no live-mode facts); (3) `package.json` == `package-lock.json` == `0.11.1`, no `VERSION` file; (4) git-scope trust — `.dev.vars`/`.env`/`.wrangler`/`.open-next`/`.next`/`node_modules` git-ignored (`git check-ignore` exit 0; `.open-next` matched by `BS2Mod-site/.gitignore:9` trailing-slash rule, absent from tree until first build), `.dev.vars.example` stays trackable, committed diff has no secrets; (5) regression green (typecheck/lint/test 292/292/build 14 pages); (6) no ownership files in scope. Phase 00 marked DONE; Phase 01 (`existing-release-blockers`) activated.

## Phase 01 chunk progress

`existing-release-blockers`: C01.00 recon DONE (2026-09-23, READ ONLY). Blocker queue reconciled vs live tree — CLOSED: canonical five evidence docs (committed `d837b0aa`); PARTIALLY CLOSED: repo commit (evidence docs only; 15 untracked paths: `src/`, `package.json`/lock, configs, pack); OPEN + CEO-gated: full-tree commit, phases 21/22/23 (QUEUED), live payment provider, production domain/hosting, live DB migration, `MOLLIE_ALLOW_LIVE`. Secrets scan of committed diff clean; no env files with secrets in tree; regression green (typecheck 0 / lint 0 / 292 tests / build 0). Doc drift recorded for generation: GO-LIVE/HANDOFF/PROJECT-STATE stale on HEAD `d7ee42bf` + "no commit exists"; PROJECT-STATE next-step stale (C00.11 done); MOLLIE-VERIFICATION false `.env.local` claim.

C01.01 DONE (2026-09-23): stale HEAD / "no commit of `BS2Mod-site/` exists" claims corrected in GO-LIVE, HANDOFF, PROJECT-STATE, CHANGELOG (4 files only; evidence commit `d837b0aa` + 15 untracked paths + live-HEAD re-read now recorded; all still `RELEASE BLOCKED`; edits left unstaged for C01.05). Next = C01.02 `false-env-local-claim`.

C01.02 DONE (2026-09-23): false `.env.local` presence claim corrected in MOLLIE-VERIFICATION (1 file; both line-122 conditional-load and line-134 open-gap bullet now say no such file exists in the tree; tree facts re-verified: `.env`/`.env.local` absent, `.env.example` present, gitignored).

C01.03 DONE (2026-09-23): stale C00.11 next-step removed from PROJECT-STATE §8 (§8-only edit; now lists dependency-ordered actual next steps; §7 gates untouched). All pure doc-drift chunks C01.01–C01.03 complete.

C01.04 DONE (2026-09-23, READ ONLY): pre-commit verification for full-tree commit — verdict **GO**. Scope = 15 untracked paths + 5 modified evidence docs (20 total); exclusions verified (`git check-ignore` — env/dev.vars/node_modules/.next/.open-next/tsbuildinfo/next-env all ignored; zip NOT ignored → exclude explicitly); secrets clean (only `.env.example` placeholders + public fixtures); version 0.11.1 aligned; regression green (typecheck 0 after build regenerated `.next/types`, lint 0/2 known warnings, 292/292 tests, build success). Shop push (`f57ecc7`) does NOT satisfy this concern (different repository). Next = C01.05 `approved-full-tree-commit` (CEO-gated).

C01.05 DONE (2026-09-23): CEO-approved full-tree commit landed — `140cf921` "BS2Mod: full-tree commit — storefront + backend + configs + workflow pack (0.11.1)", 478 files / 57048 insertions / 58 deletions on `C:\dev` `main`. Explicit-path staging only (never `git add -A`); `BoyShop-Agent-Aware-Pack.zip` excluded via pathspec (remains only untracked path under `BS2Mod-site/`, intentional). Staged-diff secret scan clean (test fixtures only). Post-commit regression green (typecheck 0 after build regenerated `.next/types`, lint 0/2 known warnings, 292/292 tests, build success 14 pages). No tag, no push (out of scope). `BS2Mod-site/` now fully tracked in the monorepo. Remaining phase-01 chunks C01.06–C01.09 are all CEO DECISION chunks (live payment provider → production domain/hosting → live DB migration → `MOLLIE_ALLOW_LIVE`). Next = C01.06 `decision-live-payment-provider`.

C01.06 DONE (2026-09-23): DECISION — CEO chose **option 1, authorize Mollie live**. Recorded in `DECISION-GATES.md` (Resolved decisions), `docs/evidence/GO-LIVE.md` (§2/§3/§18/§19/§20 payment lines), `docs/evidence/MOLLIE-VERIFICATION.md` (scope note). Still open after this decision: production secret provisioning (never in repo), separate `MOLLIE_ALLOW_LIVE=true` gate (C01.09), live E2E payment test. Stripe not chosen (unverified adapter). No code/env/key changes (DECISION chunk). Decision-record doc edits left unstaged (commit needs separate CEO approval). Known drift logged in CURRENT-STATE: GO-LIVE/HANDOFF/PROJECT-STATE/CHANGELOG still carry pre-C01.05 full-tree-commit wording — schedule a doc-sync chunk before phase-01 acceptance. Next = C01.07 `decision-production-domain-hosting`.

C01.07 DONE (2026-09-23): DECISION — CEO chose **option 3, staging on workers.dev first**. Grounded in live Cloudflare account inspection (MCP): 6 zones (clixshop.eu/.nl, jijslaagtvandaag.nl, slimslagen.nl, surinyami.nl, taxisaid.nl) — none is a BoyShop domain; none bound to the BoyShop worker; 2 workers live on custom domains belong to other projects; no Pages projects; account subdomain `i-janajoe`; `boyshop-test` worker deployed via wrangler (8 deployments, latest 2026-09-22). Recorded in `DECISION-GATES.md`, `docs/evidence/GO-LIVE.md` (§3 hosting, §9 domain, §18/§19/§20), `docs/evidence/PROJECT-STATE.md` (blocker row). Host = Cloudflare Workers; staging hostname = `boyshop-test.i-janajoe.workers.dev`; final brand production domain deferred to a later CEO decision. Netlify not chosen. No deploy/DNS/TLS action taken (out of scope honored). Edits unstaged. Next = C01.08 `decision-live-db-migration`.

C01.08 DONE (2026-09-23): DECISION — read-only Neon inspection disproved the seeded assumption that no schema had been applied. Project `boyshop` (`weathered-truth-98011402`) has only branch `main` (`br-soft-smoke-zar070gn`), database `neondb`, all 14 BoyShop tables, and six Drizzle migration records; no restore snapshot or test branch exists. CEO chose revised **option 1: designate existing `boyshop/main` as the production candidate**. No migration or Neon mutation occurred. Mandatory prerequisites for any future migration: restore snapshot, separate test branch, source/database schema verification, branch test, and separate explicit approval. Recorded in DECISION-GATES + GO-LIVE + PROJECT-STATE; edits unstaged. Next = C01.09 `decision-mollie-allow-live`.

C01.09 DONE (2026-09-23): DECISION — read-only Cloudflare inspection found `MOLLIE_API_KEY` + `MOLLIE_WEBHOOK_SECRET` secret bindings on `boyshop-test`, but values/prefixes remain hidden; `MOLLIE_ALLOW_LIVE` is absent. CEO chose **option 1: conditional production-only authorization**. Because `boyshop-test` is staging (C01.07), the flag must remain absent there. It may be applied only to a separate production environment after operator confirmation of a hidden `live_*` key and with a controlled live E2E test ready. No Worker/source/env/payment change occurred. Recorded in DECISION-GATES + GO-LIVE + MOLLIE-VERIFICATION; edits unstaged. Next = C01.10 evidence sync.

C01.10 DONE (2026-09-23): synchronized all five canonical evidence docs to C01.05–C01.09 and live Cloudflare/Neon truth. Removed stale active claims (untracked tree/C01.05 pending/nothing deployed/no database schema/unresolved decisions); preserved every open release blocker. Generated C01.99 acceptance. Documentation only; `git diff --check` passed; no infrastructure/source/secret/staging/commit action. Next = C01.99 phase-01 acceptance.

C01.99 DONE (2026-09-23, READ ONLY): verdict **PASS — COMMIT GATE REMAINS**. All eight checks passed. Full tree confirmed at `140cf921`; canonical evidence agrees; Cloudflare recheck confirms staging URL/provider/secret names and absent live flag; Neon recheck confirms only `boyshop/main`, application tables, and zero snapshots; no false release claim; changes remain documentation/control only; secret-pattern scan clean; C01.05 regression baseline remains applicable. Generated C01.11 final CEO-gated explicit-path documentation commit chunk. Phase 01 remains ACTIVE until that commit gate completes.

C01.11 DONE (2026-09-23): CEO-approved documentation gate completed in five atomic explicit-path commits covering exactly the 13 allowed evidence/control records. The zip and unrelated shared-monorepo changes remained excluded; no tag or push. Phase 01 marked DONE; Phase 02 inventory reconnaissance activated at `phases/02-inventory/00-RECON.md`.

## Phase 02 chunk progress

`inventory`: 00-RECON DONE (2026-09-23, READ ONLY). Existing path: `variants.stock` persistence; admin service/API mutations with non-negative integer validation; PDP stock indicator; cart add/update guards; checkout revalidation and conditional stock decrement; stock conflicts map to HTTP 409. Existing memory/API tests cover ordinary limits, sold-out behavior, decrement, and admin mutation. Required work discovered: make stock decrement plus order/item/address creation all-or-nothing under write failures and concurrent idempotency requests; add database-backed race/rollback tests; enforce non-negative stock in Postgres; reconcile product-level `inStock` with variant stock truth; expose variant quantities in the admin UI. Next = `phases/02-inventory/01-GENERATE-CHUNKS.md`.

`inventory`: 01-GENERATE-CHUNKS DONE (2026-09-24). Generated five tiny chunks under `chunks/02-inventory/` covering exactly the recon gaps (`INDEX.md` records the sequence + order rationale): C02.01 `atomic-checkout-stock-order-writes` — stock decrement + order/items/address persistence as one all-or-nothing DB operation, idempotency race-safe, unit-level target tests — QUEUED (first); C02.02 `database-concurrency-rollback-proof` — DB-backed rollback + concurrent duplicate-key proof on an isolated real database (depends on C02.01) — QUEUED; C02.03 `database-stock-constraints` — non-negative `variants.stock` CHECK + migration `0006_*`; test-DB only, live application CEO-gated per C01.08 — QUEUED (independent); C02.04 `authoritative-availability-rule` — variant quantities = single truth, derived `inStock` synced across card/admin/cart reads and on writes (before C02.05) — QUEUED; C02.05 `admin-variant-stock-editing` — per-variant quantity inputs + `productFields` plumbing (depends on C02.04) — QUEUED. No generated chunk implemented. Next = `chunks/02-inventory/C02.01-atomic-checkout-stock-order-writes.md` via `NEXT.md`.

`inventory`: C02.01 DONE (2026-09-24). `drizzle/order.ts` `create()` made one all-or-nothing `db.transaction`: idempotency re-check inside tx, stock pre-checks, conditional decrement (`.where(and(eq(id), gte(stock)))` → zero rows → `StockUnavailableError`), order/item/address inserts; memory repo duplicate-key guard; checkout early idempotency return kept. Target tests: drizzle fake-tx happy path + rollback (2), memory duplicate-key race (1), checkout concurrent same-cart (14 total). Verification green: vitest 17/17 touched, typecheck 0, full suite 296/296 (30 files), build success. Next = C02.02 `database-concurrency-rollback-proof`.

`inventory`: C02.02 DONE (2026-09-24). DB-backed proof suite on isolated real database (Neon test branch `c02-02-proof`/`br-ancient-hall-za23hv5a`, restore snapshot `pre-c02-02-main` taken first). Two files only: `drizzle/__tests__/order.test.ts` + helper `__tests__/helpers/proofDb.ts`. Proofs all passed: (A) rollback of stock decrement + every write on mid-create unique-key violation; (B) duplicate idempotency-key creates serialize → one order + one decrement (DB unique index `orders_idempotency_key_unique` asserted in `beforeAll`); (C) last-unit race never leaves stock negative; (D) order/items/address/decrement atomic. Verification green: `TEST_DATABASE_URL` evidence run 6/6 passed (2 fake-tx + 4 real), no-env run skips correctly, typecheck 0. No defect in C02.01 path → no production fix. No commit (uncommitted by design). Next = C02.03 `database-stock-constraints`.

`inventory`: C02.04 DONE (2026-09-24) — `availability.ts` `isInStock()` authoritative rule; derived `inStock` on all reads (drizzle catalog/cart, memory), writers sync the stored flag; 3 new test suites; commit `59a6bb4`; typecheck/test(322)/build green.

## Dynamic rule

When a phase becomes active:
1. run its `00-RECON.md`;
2. route across all installed OMO agents before launching it;
3. run `01-GENERATE-CHUNKS.md`;
4. generate only needed tiny prompts under `chunks/<phase>/`;
5. execute them one by one through `NEXT.md`;
6. run `99-ACCEPTANCE.md`;
7. mark phase DONE only with evidence;
8. activate the next phase.

After every chunk, re-evaluate whether future prompts should be skipped, split, inserted, reordered, or rewritten.
