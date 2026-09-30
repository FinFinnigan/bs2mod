# GO LIVE — BoyShop / BS2Mod

> **Status: PRE-LAUNCH — RELEASE BLOCKED.** Updated to this fork's live repository
> state (C01.01, 2026-09-30). The storefront tree exists and builds locally on the mock
> data layer. Phase 00 is DONE (C00.10–C00.13 complete); C01.00 reconciliation is
> COMPLETE with blockers B1..B6 recorded and **B4 RESOLVED**.
>
> **Commit anchors (corrected 2026-09-30, C00.6).** This document previously named
> `140cf921` (C01.05 full-tree landing) and `d837b0aa` (initial evidence commit) as
> anchors. **Neither commit exists in this repository** — `git cat-file -t` rejects
> both, and neither appears in `git log --all`. They belong to an external/shared
> history that is not this Git repository. `BS2Mod-site` is its own Git repository
> (`git rev-parse --show-toplevel` → `C:/dev/BS2Mod-site`).
>
> **Commit chain (corrected 2026-09-30, C01.01).** `git rev-parse --short HEAD` is
> `e3ed3f3` and `git rev-list --count HEAD` is **14**. This repository's real history,
> newest first:
>
> | Commit | Subject |
> |---|---|
> | `e3ed3f3` | **Current HEAD** - Correct C01.00 B4/B1 claims: production DB identified (Neon boyshop), local CF build evidence |
> | `2746d7d` | Phase 01 closeout: record C01.00 recon, sync control docs, open C01.01 |
> | `183c580` | Resolve C00.12 finding F2: gitignore the 6 local build/QA artifacts |
> | `f074a44` | Correct stale push state: BS2Mod-site is pushed and in sync; C:\dev is out of scope |
> | `70d10f8` | Phase 00 closeout: sync control docs to commit a0f31c6; open phase 01 with C01.00 recon |
> | `a0f31c6` | Phase 00 repo stabilization closeout: docs/evidence + pack control sync (C00.2-C00.13) |
> | `9286a8d` | Pre-fork: workflow-pack swap to ULW-GATE + product actions/form/tests (C00.4 closeout) |
> | `988f7f4` | Pre-fork: merge `codex/miski2-theme` |
> | `7fa927c` | Pre-fork: C02.04 closeout doc sync |
> | `59a6bb4` | Pre-fork: authoritative variant-stock availability rule (C02.04) |
> | `bbfa6af` | Pre-fork: Miski3 storefront theme |
> | `5c86e1d` | Pre-fork: Miski2 storefront theme |
> | `0296ec0` | Pre-fork: initial import of BS2Mod-site (first commit that carries `docs/evidence/*`) |
> | `0342c4c` | Pre-fork: initial commit |
>
> Rows marked "Pre-fork" are this fork's inherited history as imported on 2026-09-24.
>
> **Working tree is clean** (verified 2026-09-30, C01.01): `git status --porcelain`
> is empty apart from this document's own edit, `origin/main` = `e3ed3f3`, and
> `git log origin/main..HEAD` is empty. Nothing under `docs/evidence/` is an
> outstanding working-tree edit.
>
> **C01.06–C01.10 decision records are committed**, not pending: `docs/evidence/*`
> (CHANGELOG, GO-LIVE, PROJECT-STATE, HANDOFF, MOLLIE-VERIFICATION) are tracked and
> clean at HEAD. The phase-00 evidence corrections are committed at `a0f31c6` (C00.13)
> and were superseded by `70d10f8`, `f074a44`, `183c580`, `2746d7d`, `e3ed3f3`. Earlier
> wording in this document that called them "uncommitted" or "pending approval" was
> stale.
>
> Release phases 21–23 and the remaining safety checks are still incomplete.

## 1. What is being deployed

> **C01.03 correction (2026-09-30):** staging is current. Version `7e2c4112-a1d3-466e-91e9-24af63bb30c3` was created at `2026-09-30T19:12:11.614475Z` and deployed at `2026-09-30T19:12:13.86559Z`. The live site returned HTTP 200 for `templates/miski2.css`, `templates/miski3.css`, and `templates/miski3/hero.png`. B1 and B2 are resolved; live payments remain fail-closed.

A premium, mobile-first boys-clothing ecommerce storefront ("BoyShop / BS2Mod"):

- **Storefront** — Next.js `^15.1.6` (App Router) + React `^19.0.0` + TypeScript.
  Plain CSS. Backend-agnostic; renders from the mock data layer with no configuration.
- **Backend** — provider-neutral payment layer (`PaymentProvider` port + registry),
  live data layer (Drizzle + Neon when `DATABASE_URL` is set; memory/mock fallback
  otherwise), server cart, guest checkout, config/feature flags, admin bootstrap.
  API routes under `/api/...` (catalog, cart, checkout, webhooks/payment, orders).
- **Deployment targets:**
  - Cloudflare Workers via OpenNext (`open-next.config.ts`, `wrangler.jsonc`,
    script `deploy:cf`) — `boyshop-test` is the authorized staging target, but the
    deployed Worker predates this fork and serves the previous version (see §19, B2)
  - Netlify (`netlify.toml`: `npm run build`, publish `.next`) — not selected
- **Canonical package version `0.11.1`** (C00.3 verified and re-verified 2026-09-30
  in C00.6: `package.json` `version` and `package-lock.json` `version` both `0.11.1`;
  no `VERSION` file exists).

## 2. What you need before you start

- **Local preview (already working):** Node.js 20+ and npm. No backend, no env vars —
  the storefront runs on the mock data layer when no `DATABASE_URL` is set.
- **Gates:** `npm run typecheck` (tsc --noEmit), `npm run lint` (fails build — ESLint
  gate is on in `next.config.mjs`), `npm run test` (vitest), `npm run build` (next build).
- `[x]` **Full repository tree landed and tracked.** The `BS2Mod-site/` tree is committed
  in this repository; the newest commit is `e3ed3f3` and the history is 14 commits
  (`e3ed3f3` … `0342c4c`). The workflow-pack zip is intentionally excluded from version
  control and is gitignored, not merely untracked. *(Corrected C00.6: the previously cited
  landing commit `140cf921` is not an object in this repository.)*
- `[x]` **Decision/evidence records committed.** C01.06–C01.10 records are committed at
  HEAD. The phase-00 evidence corrections, including C00.5's
  `docs/evidence/MOLLIE-VERIFICATION.md` fix, are committed at `a0f31c6` (C00.13), so no
  evidence edit is awaiting commit approval.
- `BLOCKER` — **No release authorization.** Phases 21 (release audit), 22 (production)
  and 23 (go-live) are all `QUEUED`; go-live is explicitly not authorized.
- `USER ACTION REQUIRED` — **Payments:** mock remains the verified safe default. C01.06
  (2026-09-23): CEO authorized **Mollie** as the live provider. Activation still
  requires a separate production environment, confirmation that its hidden API key is
  `live_*`, and a live end-to-end payment test. C01.09 conditionally authorized
  `MOLLIE_ALLOW_LIVE=true` for that production environment only; as of 2026-09-30
  (C01.01) the key is absent from both `wrangler.jsonc` and `.env.local`, so staging
  stays fail-closed.
- **Production must be served over HTTPS** — the cart cookie is `Secure` in production,
  so a plain-HTTP host will not persist carts.

## 3. External services

- **Payment:** provider-neutral `PaymentProvider` registry
  (`src/lib/backend/payments/`). Mock is the verified default. Mollie adapter is
  test-mode and fail-closed for live (`MOLLIE_ALLOW_LIVE=true` is rejected unless
  explicitly set). **Mollie live has been chosen by the CEO (C01.06, 2026-09-23) but is
  not yet activated** — production secrets must never enter the repo. C01.09
  conditionally authorized the live switch for a future production environment only; the
  current staging Worker has secret bindings but their hidden key prefix is unverified
  and `MOLLIE_ALLOW_LIVE` is absent from both `wrangler.jsonc` and `.env.local`. No live
  transaction has been run. Stripe was not chosen and its adapter is unverified.
- **Database:** Neon Postgres via Drizzle when `DATABASE_URL` is set. Not required for
  local/mock operation. **No live DB migration without CEO authorization.**
- **Hosting:** Cloudflare Workers (OpenNext) chosen for staging (C01.07, 2026-09-23) —
  `boyshop-test` worker deployed, staging hostname `boyshop-test.i-janajoe.workers.dev`.
  **The deployed Worker predates this fork**: `modified_on` is
  `2026-09-22T01:42:07Z`, earlier than this fork's 2026-09-24 initial import, and the
  live URL returns HTTP 200 while serving no Miski2/Miski3 markers, so it serves the
  pre-fork version. 244 source/config files in this tree are undeployed. Redeploying
  staging is blocked pending approval (B1/B2). Netlify config exists but was **not**
  chosen. Final production domain not yet authorized (deferred; separate CEO decision).
  Any production deploy beyond staging still belongs to phases 22–23 under approval
  gates.

## 4. Environment variables

All optional; the storefront runs on the mock data layer with no config. Full set in
`.env.example` (no secrets are committed — `.env*.local` is gitignored). Key ones:

| Variable | Purpose | Required? |
|---|---|---|
| `PAYMENT_PROVIDER` | active provider id (`mock` default) | no |
| `PAYMENT_PROVIDERS` | enabled provider ids (default `mock`; `mock,mollie` in Worker) | no |
| `MOLLIE_API_KEY` / `MOLLIE_WEBHOOK_SECRET` | Mollie adapter only, test-mode | no (never commit live keys) |
| `MOLLIE_ALLOW_LIVE` | fail-closed live switch — conditionally authorized by C01.09 for production only; absent from both `wrangler.jsonc` and `.env.local`, so staging stays fail-closed | no |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Stripe test-mode comments only | no |
| `DATABASE_URL` | Neon Postgres for the live data layer | no (mock default) |
| `AUTH_ADMIN_EMAIL` / `AUTH_ADMIN_PASSWORD` | admin bootstrap (`npm run db:create-admin`) | no |
| `FEATURE_*` | feature flags (wishlist/reviews/account/promotions/recommendations) | no |
| `SHIPPING_FREE_THRESHOLD` / `SHIPPING_FLAT_RATE` | shipping data | no |

## 5. Database

Schema defined in `src/lib/backend/db/schema.ts` (Drizzle). Scripts:
`npm run db:generate`, `db:migrate`, `db:seed`, `db:create-admin`.
**This is the production database.** The Neon project is `boyshop`
(id `weathered-truth-98011402`, org `org-round-star-75845352`), default branch `main`
(`br-soft-smoke-zar070gen`), region `aws-eu-west-2`, PostgreSQL 18, database `neondb`,
with all 14 BoyShop tables and six Drizzle migration records already present
(C01.08 inspection, re-confirmed by C01.00 on 2026-09-30). The project id was already
recorded in `.neon`. An earlier reading of this database as "unidentified / HTTP 404
project not found" was a **faulty lookup** and is withdrawn; the project is real and it
is this fork's production database. No migration was authorized or run in C01.08.
There is no restore snapshot and no separate test branch.
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
staging hostname **`boyshop-test.i-janajoe.workers.dev`** (live over HTTPS).
**Staging currently serves the pre-fork build** (Worker `modified_on`
`2026-09-22T01:42:07Z`, before the 2026-09-24 fork import; 244 source/config files
undeployed; the live response carries no Miski2/Miski3 markers), so it is not evidence
that this fork works. No custom production domain has been chosen; none of the account
zones is a BoyShop domain and none is bound to this Worker. Binding a final brand domain
remains a separate CEO decision (later phase). The test Worker URL in `wrangler.jsonc`
`vars` (`PUBLIC_URL`) is the authorized staging target, not a production release.

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

Local Cloudflare build evidence **exists** (C01.01, 2026-09-30): `npm run build`, then
`npx opennextjs-cloudflare build` producing `.open-next/worker.js`, then
`npx wrangler deploy --dry-run` which reported 125 assets totalling 6972.67 KiB and
deployed nothing. The build path is proven from this tree; only deploy authorization is
missing.

Expected (mock, local): typecheck 0 errors, lint exit 0, tests green, `next build`
completes. No environment variables are required for the mock build.

## 11. Production deployment

`PARTIAL` — Cloudflare Workers is selected and `boyshop-test.i-janajoe.workers.dev`
is the authorized deployed staging target (C01.07), but what is deployed there is the
**pre-fork** version: Worker `modified_on` `2026-09-22T01:42:07Z` predates this fork's
2026-09-24 import, 244 source/config files from this tree are undeployed, and the live
URL's 200 response carries no Miski2/Miski3 markers. No separate production Worker,
final brand domain, or production release is authorized. Production deployment remains
in phases 21–23, and redeploying staging needs separate approval.

## 12. After deployment

Not applicable — release blocked.

## 13. Production smoke test

Not applicable — release blocked.

## 14. Security check

- No secrets exist in the repo; `.env.local` is gitignored via `.gitignore:29`
  (`.env*.local`), `.wrangler/` via `.gitignore:10`, and `.open-next/` via
  `.gitignore:9`.
- Gate: keep it that way — no live keys in version control, no `git add -A`.
- Payment live mode is fail-closed. C01.09 conditionally authorizes
  `MOLLIE_ALLOW_LIVE=true` only on a future production environment after confirmation
  of a hidden `live_*` key; the key is absent from both `wrangler.jsonc` and
  `.env.local`, so staging remains fail-closed.

## 15. Backup and restore

Neon `boyshop/main` (`weathered-truth-98011402`, `aws-eu-west-2`, PostgreSQL 18) **is
the production database** and already contains the application schema. No restore
snapshot or test branch exists (C01.08), so database rollback readiness is incomplete.

## 16. Monitoring and logging

Worker observability is enabled in `wrangler.jsonc`. Runtime log/trace behavior has not
been audited for production; production monitoring remains phase-22 work.

## 17. Rollback

Code rollback anchors to this repository's real history. The current release-bearing
HEAD is `e3ed3f3` (14 commits, `e3ed3f3` … `0342c4c`); the full-tree import is
`0296ec0`. *(Corrected C00.6: the previously cited `140cf921` is not an object in this
repository and cannot be a rollback target here.)* The phase-00 evidence corrections,
including the C00.5 Mollie fix, are protected by anchor `a0f31c6` (C00.13), so no
documentation fix is currently unanchored. Database rollback is not ready because Neon
has no restore snapshot. Production rollback procedures remain undocumented.

## 18. Go / No-Go checklist

- `[x]` Local mock storefront builds and runs (Next.js + TypeScript; verified by C00.x
  evidence chain)
- `[x]` Version metadata aligned (`0.11.1`, C00.3)
- `[x]` Mollie payment adapter verified against its code/test evidence
  (`docs/evidence/MOLLIE-VERIFICATION.md`, C00.5)
- `[x]` **Full-tree committed repository state** — `BS2Mod-site/` tree tracked and
  committed in this repository; HEAD `e3ed3f3`, 14 commits, working tree clean
  (workflow-pack zip gitignored, not untracked)
- `[x]` C01.06–C01.10 decision/evidence records **committed** at HEAD; the C00.5 Mollie
  doc correction is committed at `a0f31c6` (C00.13)
- `[ ]` Payment provider activated for production (Mollie live chosen C01.06;
  C01.09 conditional switch approval recorded; activation pending production environment,
  confirmed `live_*` secret, flag application, and live E2E)
- `[x]` Production database identified (C01.00 re-confirmed 2026-09-30): Neon
  `boyshop` = `weathered-truth-98011402`, branch `main` (`br-soft-smoke-zar070gen`),
  `aws-eu-west-2`, PostgreSQL 18, full storefront schema already present. Future
  migration still blocked pending snapshot + test branch + schema verification +
  separate approval
- `[~]` Production domain/hosting authorized — staging **authorized** (C01.07: Cloudflare
  Workers, `boyshop-test.i-janajoe.workers.dev`) but serving the **pre-fork** build
  (`modified_on` `2026-09-22T01:42:07Z`, 244 files undeployed); final brand domain
  deferred (separate CEO decision)
- `[ ]` Production env vars configured
- `[ ]` Release audit complete (phase 21, QUEUED)
- `[ ]` Production prep complete (phase 22, QUEUED)
- `[ ]` Authorized go-live + smoke tests (phase 23, QUEUED)

## 19. Known blockers

Blocker register below reflects the C01.00 reconciliation of 2026-09-30 (B1..B6, with
B4 resolved). B1, B2, B3, B5, and B6 remain open and are **not** authorized by this
chunk. The former "working tree not clean" blocker is closed: the tree is clean because
the six build/QA artifacts are gitignored at `.gitignore:64,65,68,69,74,75`.

| Blocker | Why | Who must act | Action | Verification |
| ------- | --- | ------------ | ------ | ------------ |
| Deploy not authorized (B1) | Any redeploy is approval-gated; 244 source/config files in this fork are undeployed | CEO | Explicitly approve a staging deploy | Approved deploy recorded, Worker `modified_on` updated |
| Staging serves the pre-fork version (B2) | Worker `boyshop-test` `modified_on` is `2026-09-22T01:42:07Z`, before the 2026-09-24 fork import; `https://boyshop-test.i-janajoe.workers.dev` returns HTTP 200 but serves no Miski2/Miski3 markers, proving it serves the previous version | CEO / operator | Redeploy staging after B1 approval | Live response contains this fork's markers |
| Live payment off (B3) | Mollie live chosen (C01.06); C01.09 conditionally authorized the flag, but staging remains fail-closed (`MOLLIE_ALLOW_LIVE` absent from both `wrangler.jsonc` and `.env.local`), and production environment/key verification and live E2E are pending | CEO / operator | Create production environment, confirm hidden key is `live_*`, apply flag there only, run live E2E | Live payment E2E test PASS |
| No production domain/hosting (B5) | Staging authorized on workers.dev (C01.07); final brand domain not chosen; no zone bound to this Worker | CEO | Decide + authorize the final hostname (later phase) | Custom domain serves over HTTPS |
| Release phases 21–23 not authorized (B6) | Phases 21/22/23 `QUEUED` | CEO | Run release audit, production prep, go-live phases | Phase statuses DONE |
| Database migration safety incomplete | The production database (`boyshop` / `weathered-truth-98011402`, `aws-eu-west-2`, PostgreSQL 18) already has the schema, but no restore snapshot or test branch exists | CEO | Snapshot, branch, verify, test, then separately authorize any future migration | Snapshot + test branch + verified schema match |
| Staging redeploy blocked on B1 | Local Cloudflare build evidence **exists** (`npm run build`, `npx opennextjs-cloudflare build` → `.open-next/worker.js`, `npx wrangler deploy --dry-run` reporting 125 assets / 6972.67 KiB with nothing deployed), so the build path is proven; what is missing is deploy authorization | CEO | Approve the staging deploy; no new build evidence required | Deployment recorded in B1 |

_Historical note: the five canonical docs (CHANGELOG, GO-LIVE, PROJECT-STATE,
TEAM-3-HANDOFF, TEAM-1-HANDOFF) previously existed only in legacy `C:\dev\BoyShop` and
were reference-for-shape only — never copied as fact (C00.4); the canonical set was
recreated from scratch under `BS2Mod-site/docs/evidence/` (C00.5–C00.9)._

## 20. Product is LIVE when

- `[x]` Full `BS2Mod-site/` tree tracked and committed in this repository (HEAD `e3ed3f3`,
  14 commits, working tree clean)
- `[x]` Current decision/evidence records committed; the C00.5 Mollie correction is
  committed at `a0f31c6` (C00.13)
- `[ ]` Release audit passed (phase 21)
- `[ ]` Production systems prepared under approval gates (phase 22)
- `[ ]` Authorized go-live performed with production smoke tests PASS (phase 23)
- `[ ]` Live payment provider authorized and E2E-verified (provider choice DONE
  C01.06 — Mollie; activation + live E2E still pending)
- `[ ]` Production domain serves over HTTPS (staging workers.dev is HTTPS; final
  brand domain deferred per C01.07)
- `[ ]` Rollback path documented

---

_Last verified: 2026-09-30 (C01.01), against package version `0.11.1` on branch `main`
at HEAD `e3ed3f3` (14 commits). Corrections made in C00.6 and retained: the cited landing
commit `140cf921` and initial-evidence commit `d837b0aa` do not exist in this repository
(`git cat-file -t` rejects both; absent from `git log --all`), so this repository is its
own history — root `C:\dev\BS2Mod-site`, full-tree import `0296ec0`. Corrections made in
C01.01: HEAD is `e3ed3f3` with 14 commits, not `9286a8d` with eight; the working tree is
clean because the six build/QA artifacts (two pack zips, `dev-server.log`,
`dev-server.err.log`, MISKI2 zip and directory) are gitignored at `.gitignore:64,65,68,69,74,75`;
the phase-00 evidence corrections are committed at `a0f31c6` (C00.13); staging predates
this fork's 2026-09-24 import and serves the previous version; local Cloudflare build
evidence exists; and Neon `boyshop` (`weathered-truth-98011402`) **is** this fork's
production database. `MOLLIE_ALLOW_LIVE` is absent from both `wrangler.jsonc` and
`.env.local`. **Release remains BLOCKED.** `BS2Mod-site` is an independent repository, so
re-read current HEAD before relying on any commit anchor recorded here._
