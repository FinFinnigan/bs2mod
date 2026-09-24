# GO LIVE — BoyShop / BS2Mod

> **Status: PRE-LAUNCH — RELEASE BLOCKED.** Created from scratch (C00.6) from current
> repo evidence only. The storefront tree exists and builds locally on the mock data
> layer. The full BoyShop tree landed in the shared `C:\dev` repository at `140cf921`
> (C01.05). Later shared-monorepo commits may advance `main`; `140cf921` remains the
> BoyShop landing commit. C01.06–C01.09 recorded production-direction decisions, but
> release phases 21–23 and the remaining safety checks are incomplete.

## 1. What is being deployed

A premium, mobile-first boys-clothing ecommerce storefront ("BoyShop / BS2Mod"):

- **Storefront** — Next.js 15 (App Router) + React 19 + TypeScript. Plain CSS.
  Backend-agnostic; renders from the mock data layer with no configuration.
- **Backend** — provider-neutral payment layer (`PaymentProvider` port + registry),
  live data layer (Drizzle + Neon when `DATABASE_URL` is set; memory/mock fallback
  otherwise), server cart, guest checkout, config/feature flags, admin bootstrap.
  API routes under `/api/...` (catalog, cart, checkout, webhooks/payment, orders).
- **Deployment targets:**
  - Cloudflare Workers via OpenNext (`open-next.config.ts`, `wrangler.jsonc`,
    script `deploy:cf`) — `boyshop-test` is deployed as the authorized staging target
  - Netlify (`netlify.toml`: `npm run build`, publish `.next`) — not selected
- **Canonical package version `0.11.1`** (C00.3 verified: `package.json` ==
  `package-lock.json`; no `VERSION` file exists).

## 2. What you need before you start

- **Local preview (already working):** Node.js 20+ and npm. No backend, no env vars —
  the storefront runs on the mock data layer when no `DATABASE_URL` is set.
- **Gates:** `npm run typecheck` (tsc --noEmit), `npm run lint` (fails build — ESLint
  gate is on in `next.config.mjs`), `npm run test` (vitest), `npm run build` (next build).
- `[x]` **Full repository tree landed.** C01.05 committed the BoyShop tree at
  `140cf921` using explicit-path staging; the workflow-pack zip remains intentionally
  untracked. Current decision/evidence edits are not committed yet and need a separate
  commit approval.
- `BLOCKER` — **No release authorization.** Phases 21 (release audit), 22 (production)
  and 23 (go-live) are all `QUEUED`; go-live is explicitly not authorized.
- `USER ACTION REQUIRED` — **Payments:** mock remains the verified safe default. C01.06
  (2026-09-23): CEO authorized **Mollie** as the live provider. Activation still
  requires a separate production environment, confirmation that its hidden API key is
  `live_*`, and a live end-to-end payment test. C01.09 conditionally authorized
  `MOLLIE_ALLOW_LIVE=true` for that production environment only; it remains absent from
  the staging Worker.
- **Production must be served over HTTPS** — the cart cookie is `Secure` in production,
  so a plain-HTTP host will not persist carts.

## 3. External services

- **Payment:** provider-neutral `PaymentProvider` registry
  (`src/lib/backend/payments/`). Mock is the verified default. Mollie adapter is
  test-mode and fail-closed for live (`MOLLIE_ALLOW_LIVE=true` is rejected unless
  explicitly set). **Mollie live has been chosen by the CEO (C01.06, 2026-09-23) but is
  not yet activated** — production secrets must never enter the repo. C01.09
  conditionally authorized the live switch for a future production environment only;
  the current staging Worker has secret bindings but their hidden key prefix is
  unverified and the switch remains absent. No live transaction has been run. Stripe
  was not chosen and its adapter is unverified.
- **Database:** Neon Postgres via Drizzle when `DATABASE_URL` is set. Not required for
  local/mock operation. **No live DB migration without CEO authorization.**
- **Hosting:** Cloudflare Workers (OpenNext) chosen for staging (C01.07, 2026-09-23) —
  `boyshop-test` worker deployed, staging hostname `boyshop-test.i-janajoe.workers.dev`.
  Netlify config exists but was **not** chosen. Final production domain not yet
  authorized (deferred; separate CEO decision). Any production deploy beyond staging
  still belongs to phases 22–23 under approval gates.

## 4. Environment variables

All optional; the storefront runs on the mock data layer with no config. Full set in
`.env.example` (no secrets are committed — `.env*.local` is gitignored). Key ones:

| Variable | Purpose | Required? |
|---|---|---|
| `PAYMENT_PROVIDER` | active provider id (`mock` default) | no |
| `PAYMENT_PROVIDERS` | enabled provider ids (default `mock`; `mock,mollie` in Worker) | no |
| `MOLLIE_API_KEY` / `MOLLIE_WEBHOOK_SECRET` | Mollie adapter only, test-mode | no (never commit live keys) |
| `MOLLIE_ALLOW_LIVE` | fail-closed live switch — conditionally authorized by C01.09 for production only; absent on staging | no |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Stripe test-mode comments only | no |
| `DATABASE_URL` | Neon Postgres for the live data layer | no (mock default) |
| `AUTH_ADMIN_EMAIL` / `AUTH_ADMIN_PASSWORD` | admin bootstrap (`npm run db:create-admin`) | no |
| `FEATURE_*` | feature flags (wishlist/reviews/account/promotions/recommendations) | no |
| `SHIPPING_FREE_THRESHOLD` / `SHIPPING_FLAT_RATE` | shipping data | no |

## 5. Database

Schema defined in `src/lib/backend/db/schema.ts` (Drizzle). Scripts:
`npm run db:generate`, `db:migrate`, `db:seed`, `db:create-admin`.
Read-only Neon inspection in C01.08 found project `boyshop`, branch `main`, database
`neondb`, all 14 BoyShop tables, and six Drizzle migration records already present.
CEO designated this existing branch as the **production candidate**; no migration was
authorized or run in C01.08. There is no restore snapshot and no separate test branch.
Before any future schema change: create a restore snapshot, create/test on a separate
branch, verify repository schema/migrations against the database, and obtain explicit
migration approval. With no `DATABASE_URL`, the app still uses the mock data layer.

## 6. Storage

None yet.

## 7. Authentication

Guest checkout (server cart + checkout API). Customer accounts are feature-flagged off
(`FEATURE_ACCOUNT=false`). Admin bootstrap exists via `db:create-admin`
(`AUTH_ADMIN_EMAIL/PASSWORD`) but no production auth deployment is authorized.

## 8. External APIs

- Payment webhooks (`/api/webhooks/payment`) — requires the selected provider's webhook
  delivery in production; not applicable while release is blocked.
- No other production external APIs are in use.

## 9. Domain and DNS

`PARTIAL — staging authorized, production domain deferred.` C01.07 (2026-09-23): CEO
chose **staging on workers.dev first** — hosting provider **Cloudflare Workers**,
staging hostname **`boyshop-test.i-janajoe.workers.dev`** (already live over HTTPS).
No custom production domain has been chosen; none of the account zones is a BoyShop
domain and none is bound to this Worker. Binding a final brand domain remains a
separate CEO decision (later phase). The test Worker URL in `wrangler.jsonc` `vars`
(`PUBLIC_URL`) is the authorized staging target, not a production release.

## 10. Build

Working directory: project root (`C:\dev\BS2Mod-site`).

1. Install dependencies: `npm install`
2. Type-check: `npm run typecheck`
3. Unit tests: `npm run test`
4. Lint: `npm run lint` (fails `next build` on errors)
5. Production build: `npm run build` (outputs `.next/`)
6. Local dev: `npm run dev`
7. Cloudflare preview: `npm run preview:cf` (wrangler dev --remote)
8. Cloudflare deploy script exists: `npm run deploy:cf` (wrangler deploy) — **do not
   run against production without release authorization**

Expected (mock, local): typecheck 0 errors, lint exit 0, tests green, `next build`
completes. No environment variables are required for the mock build.

## 11. Production deployment

`PARTIAL` — Cloudflare Workers is selected and `boyshop-test.i-janajoe.workers.dev`
is the authorized deployed staging target (C01.07). No separate production Worker,
final brand domain, or production release is authorized. Production deployment remains
in phases 21–23.

## 12. After deployment

Not applicable — release blocked.

## 13. Production smoke test

Not applicable — release blocked.

## 14. Security check

- No secrets exist in the repo; `.env*.local` and `.wrangler/` are gitignored.
- Gate: keep it that way — no live keys in version control, no `git add -A`.
- Payment live mode is fail-closed. C01.09 conditionally authorizes
  `MOLLIE_ALLOW_LIVE=true` only on a future production environment after confirmation
  of a hidden `live_*` key; the flag remains absent on staging.

## 15. Backup and restore

Neon `boyshop/main` is the production candidate and already contains the application
schema. No restore snapshot or test branch exists (C01.08), so database rollback
readiness is incomplete.

## 16. Monitoring and logging

Worker observability is enabled in `wrangler.jsonc`. Runtime log/trace behavior has not
been audited for production; production monitoring remains phase-22 work.

## 17. Rollback

Code rollback can anchor to full-tree commit `140cf921` (C01.05), but subsequent
decision/evidence updates remain uncommitted. Database rollback is not ready because
Neon has no restore snapshot. Production rollback procedures remain undocumented.

## 18. Go / No-Go checklist

- `[x]` Local mock storefront builds and runs (Next.js + TypeScript; verified by C00.x
  evidence chain)
- `[x]` Version metadata aligned (`0.11.1`, C00.3)
- `[x]` Mollie payment adapter verified against its code/test evidence
  (`docs/evidence/MOLLIE-VERIFICATION.md`, C00.5)
- `[x]` **Full-tree committed repository state** — landed at `140cf921` (C01.05;
  workflow-pack zip intentionally excluded)
- `[ ]` C01.06–C01.10 decision/evidence updates committed under separate approval
- `[ ]` Payment provider activated for production (Mollie live chosen C01.06;
  C01.09 conditional switch approval recorded; activation pending production environment,
  confirmed `live_*` secret, flag application, and live E2E)
- `[~]` Database production candidate designated (C01.08: existing Neon `boyshop/main`;
  schema already present); future migration blocked pending snapshot + test branch +
  schema verification + separate approval
- `[~]` Production domain/hosting authorized — staging **authorized** (C01.07: Cloudflare
  Workers, `boyshop-test.i-janajoe.workers.dev`); final brand domain deferred (separate
  CEO decision)
- `[ ]` Production env vars configured
- `[ ]` Release audit complete (phase 21, QUEUED)
- `[ ]` Production prep complete (phase 22, QUEUED)
- `[ ]` Authorized go-live + smoke tests (phase 23, QUEUED)

## 19. Known blockers

| Blocker | Why | Who must act | Action | Verification |
| ------- | --- | ------------ | ------ | ------------ |
| Decision/evidence updates uncommitted | C01.06–C01.10 records are unstaged working-tree changes | CEO | Verify scope/secrets, then explicitly approve a documentation commit | Exact intended docs committed; zip excluded |
| Release not authorized | Phases 21/22/23 `QUEUED` | CEO | Run release audit, production prep, go-live phases | Phase statuses DONE |
| Live payment not activated | Mollie live chosen (C01.06); C01.09 conditionally authorized the flag, but staging remains fail-closed, production environment/key verification and live E2E are pending | CEO / operator | Create production environment, confirm hidden key is `live_*`, apply flag there only, run live E2E | Live payment E2E test PASS |
| No production domain/hosting | Staging authorized on workers.dev (C01.07); final brand domain not chosen; no zone bound to this Worker | CEO | Decide + authorize the final hostname (later phase) | Custom domain serves over HTTPS |
| Database migration safety incomplete | Existing `boyshop/main` already has the schema, but no restore snapshot or test branch exists | CEO | Snapshot, branch, verify, test, then separately authorize any future migration | Snapshot + test branch + verified schema match |
| Canonical docs exist | Initial versions committed at `d837b0aa`; synchronized through C01.10 in the working tree | CEO | Commit the synchronized records after verification | Current docs committed without secrets |

_Historical note: the five canonical docs (CHANGELOG, GO-LIVE, PROJECT-STATE,
TEAM-3-HANDOFF, TEAM-1-HANDOFF) previously existed only in legacy `C:\dev\BoyShop` and
were reference-for-shape only — never copied as fact (C00.4); the canonical set was
recreated from scratch under `BS2Mod-site/docs/evidence/` (C00.5–C00.9)._

## 20. Product is LIVE when

- `[x]` Full `BS2Mod-site/` tree landed at `140cf921` (C01.05)
- `[ ]` Current decision/evidence updates committed
- `[ ]` Release audit passed (phase 21)
- `[ ]` Production systems prepared under approval gates (phase 22)
- `[ ]` Authorized go-live performed with production smoke tests PASS (phase 23)
- `[ ]` Live payment provider authorized and E2E-verified (provider choice DONE
  C01.06 — Mollie; activation + live E2E still pending)
- `[ ]` Production domain serves over HTTPS (staging workers.dev is HTTPS; final
  brand domain deferred per C01.07)
- `[ ]` Rollback path documented

---

_Last verified: 2026-09-23 (0.11.1). Initial evidence landed at `d837b0aa`; the full
BoyShop tree landed at `140cf921`; C01.06–C01.10 synchronized decisions remain
uncommitted. Shared-monorepo `main` advances independently, so re-read current HEAD and
retain `140cf921` as the BoyShop landing reference._
