# CHANGELOG — BoyShop / BS2Mod

> **Status: PRE-LAUNCH — RELEASE BLOCKED.** This document was created from repository
> evidence only and reconciled in C00.8, then to this fork's live repository truth in
> C01.01 (2026-09-30). `BS2Mod-site` has its own Git history with **14 commits**; the
> current recorded revision is **`e3ed3f3`**. No release has been authorized or tagged.
> C01.06–C01.10 decision/evidence records are committed at HEAD, and the phase-00
> evidence corrections are committed as well — at `a0f31c6` (C00.13), then superseded
> by `70d10f8`, `f074a44`, `183c580`, `2746d7d`, `e3ed3f3`. This changelog records the
> state of the working tree and the work that has actually landed (stabilization +
> evidence); it invents **no** version numbers. No release commit/tag/push happens
> without CEO approval, so nothing below is a released version.

## How to read this changelog

## [C01.03] — 2026-09-30 — staging deployment verified

- B1 and B2 are resolved. Cloudflare Worker version `7e2c4112-a1d3-466e-91e9-24af63bb30c3` was created at `2026-09-30T19:12:11.614475Z` and deployed at `2026-09-30T19:12:13.86559Z`.
- The live staging site returned the current BoyShop page; `templates/miski2.css`, `templates/miski3.css`, and `templates/miski3/hero.png` each returned HTTP 200.
- `MOLLIE_ALLOW_LIVE` remains absent from local configuration and deployed bindings. Release remains blocked by B3, B5, and B6.

- **One entry per released version** once releases happen (post full-tree commit +
  phases 21–23).
- Today there are **zero released versions**. The two entries below describe the working
  tree: the C01.01 fork reconciliation first, then the working tree at canonical version
  `0.11.1`. Current decision/evidence records are committed at HEAD, and the phase-00
  evidence corrections are committed too — `a0f31c6` (C00.13), superseded through
  `e3ed3f3`. They do **not** remain uncommitted pending approval.
- **Versioning policy:** semantic versioning. The canonical version lives in
  `package.json` (== `package-lock.json`, verified by C00.3). New versions are only
  recorded here when a release is actually authorized — never earlier.
- Historical pre-`BS2Mod-site` versions (`0.1.0` → `0.10.2`) are preserved in the
  legacy `C:\dev\BoyShop\CHANGELOG.md` and are **reference-for-shape only, never
  copied as fact** (C00.4).

## [C01.01] — 2026-09-30 — evidence docs reconciled to this fork's live repository truth

Docs-only reconciliation of the `docs/evidence/*` documents to THIS fork. Those
documents described the previous version imported into this folder on 2026-09-24, so
their commit anchors, commit count, HEAD claims, "uncommitted" claims and the Cloudflare
staging claim were stale-by-fork. They are corrected here. Phase-00 history and legacy
`C:\dev\BoyShop` archaeology were not re-verified and are out of scope. No product
source, config, dependency, secret or test was touched; nothing was deployed and no
migration was run. This entry introduces **no** version number: canonical remains
`0.11.1`.

### Changed — repository reality (was: eight commits, HEAD `9286a8d`)

- HEAD moved `9286a8d` (8 commits) → **`e3ed3f3` (14 commits)**; the range is
  `e3ed3f3` … `0342c4c`.
- The real commit chain, newest first:

  | Commit | Subject |
  |---|---|
  | `e3ed3f3` | **Current HEAD** - Correct C01.00 B4/B1 claims: production DB identified (Neon boyshop), local CF build evidence |
  | `2746d7d` | Phase 01 closeout: record C01.00 recon, sync control docs, open C01.01 |
  | `183c580` | Resolve C00.12 finding F2: gitignore the 6 local build/QA artifacts |
  | `f074a44` | Correct stale push state: BS2Mod-site is pushed and in sync; C:\dev is out of scope |
  | `70d10f8` | Phase 00 closeout: sync control docs to commit a0f31c6; open phase 01 with C01.00 recon |
  | `a0f31c6` | Phase 00 repo stabilization closeout: docs/evidence + pack control sync (C00.2-C00.13) |
  | `9286a8d` | Pre-fork: workflow-pack swap to ULW-GATE + product actions/form/tests (C00.4 closeout) |
  | `988f7f4` | Pre-fork: merge `codex/miski2-theme` |
  | `7fa927c` | Pre-fork: C02.04 closeout doc sync |
  | `59a6bb4` | Pre-fork: authoritative variant-stock availability rule (C02.04) |
  | `bbfa6af` | Pre-fork: Miski3 storefront theme |
  | `5c86e1d` | Pre-fork: Miski2 storefront theme |
  | `0296ec0` | Pre-fork: initial import of BS2Mod-site (first commit that carries `docs/evidence/*`) |
  | `0342c4c` | Pre-fork: initial commit |

  Rows marked "Pre-fork" are the previous version imported into this folder. They are
  history, not current-state claims. Previously cited anchors (`140cf921`, `d837b0aa`,
  `5ed1e84`, `026e70ad`, `d7ee42bf`) remain **absent** from this repository.
- The working tree is **clean**. The six local build/QA artifacts (two workflow-pack zips,
  `dev-server.log`, `dev-server.err.log`, the MISKI2 zip and its directory) are
  **gitignored** at `.gitignore:64,65,68,69,74,75`, so they are not untracked strays.
  `.env.local` is ignored via `.gitignore:29`, `.wrangler/` via `.gitignore:10` and
  `.open-next/` via `.gitignore:9`. `origin/main` = `e3ed3f3` and
  `git log origin/main..HEAD` is empty.

### Fixed — the evidence corrections were committed, not outstanding

- The phase-00 evidence corrections are **committed** at `a0f31c6` (C00.13) and were
  superseded by `70d10f8`, `f074a44`, `183c580`, `2746d7d`, `e3ed3f3`. The earlier
  statement in the entry below that no evidence-document commit had been made in this
  repository was false, and is corrected in place there.
- Phase 00 is **DONE**: C00.10, C00.11, C00.12 and C00.13 are all complete. No
  documentation commit is outstanding.
- C01.00 read-only reconciliation is **COMPLETE** — blockers B1..B6 recorded, **B4
  RESOLVED**.

### Changed — Neon production database identity

- Neon project **`boyshop`** (id `weathered-truth-98011402`, organization
  `org-round-star-75845352`, default branch `main` = `br-soft-smoke-zar070gn`, region
  `aws-eu-west-2`, PostgreSQL 18, full storefront schema) **is real and IS this fork's
  production database**. The earlier "HTTP 404 project not found" reading was a
  **faulty lookup** — the project id was already recorded in `.neon` — so this claim was
  never stale-by-fork. The "production candidate"/unidentified/404 hedging is withdrawn.
- The separate database-safety caveat is unchanged: no restore snapshot or test branch
  exists, so any future migration needs snapshot, branch, verify and test first. No
  migration was authorized or run.

### Changed — staging serves the pre-fork build; local build evidence exists

- Worker `boyshop-test` has `modified_on` 2026-09-22T01:42:07Z, which **predates this
  fork's initial import** (`0296ec0`, 2026-09-24), so it serves the **previous version**:
  244 source/config files here are undeployed, and
  `https://boyshop-test.i-janajoe.workers.dev` returns HTTP 200 but serves **no
  Miski2/Miski3 markers**. The 2026-09-22 deploy date is true, but it is not evidence
  that staging is current. A redeploy is approval-gated (B1; B2 clears afterwards).
- Local Cloudflare build evidence **exists**: `npm run build` +
  `npx opennextjs-cloudflare build` (produces `.open-next/worker.js`) +
  `npx wrangler deploy --dry-run` (125 assets, 6972.67 KiB, **nothing deployed**).

### Unchanged — payment flag stays fail-closed

- `MOLLIE_ALLOW_LIVE` is **absent** from both `wrangler.jsonc` and `.env.local` (checked
  by key name only; no credential value is recorded in this document), so staging remains
  fail-closed. C01.09 authorized it only conditionally, for a future production
  environment, after hidden `live_*` key confirmation and live E2E.
- Still open and **not** authorized: B1 staging redeploy, B2 staging serves the pre-fork
  build, B3 live payment (CEO), B5 production domain/hosting (CEO), B6 release phases
  21–23 (CEO). No release or tag exists; release stays BLOCKED.

## [Unreleased] — 0.11.1

Canonical package version `0.11.1` (C00.3 verified: `package.json` ==
`package-lock.json` top-level and root entry; no `VERSION` file exists).
Local verification gates (mock data, no env vars): `npm run typecheck` 0 errors,
`npm run lint` exit 0, `npm run test` green, `npm run build` completes.

### Added — storefront (built before phase 00, present in the working tree)

- Premium mobile-first boys-clothing ecommerce storefront: **Next.js 15 (App Router) +
  React 19 + TypeScript**, plain CSS (design tokens as CSS custom properties); no
  Tailwind, no commerce SDK in components.
- Backend-agnostic rendering: with no `DATABASE_URL` the storefront renders from the
  mock data layer (`src/lib/data/`) with zero configuration (safe default).
- Pages (`src/app/`): `home` (`page.tsx`), `shop`, `product/[slug]`,
  `category/[slug]`, `collection/[slug]`, `search`, `cart`, `checkout`,
  `size-guide`, `story`, `account`, `admin`, `pages/*`, `not-found`.
- Components (`src/components/`): `layout/`, `plp/`, `pdp/`, `product/`, `filter/`,
  `cart/`, `search/`, `ui/`, `account/`.

### Added — commerce backend (built before phase 00, present in the working tree)

- **Provider-neutral payment layer** (`src/lib/backend/payments/`): `PaymentProvider`
  port + registry + store/service; adapters — **Mock** (verified default) and
  **Mollie** (test-mode, fail-closed for live; verified in `MOLLIE-VERIFICATION.md`,
  C00.5).
- **Live data layer** (`src/lib/backend/db/`): Drizzle schema (`schema.ts`) + lazy
  Neon client. C01.08 read-only inspection found the schema and six Drizzle migration
  records already on Neon `boyshop/main`. **Neon `boyshop` is real and IS this fork's
  production database** (corrected C01.01): project id `weathered-truth-98011402`,
  organization `org-round-star-75845352`, default branch `main` =
  `br-soft-smoke-zar070gn`, region `aws-eu-west-2`, PostgreSQL 18. The earlier
  "HTTP 404 project not found" reading was a **faulty lookup** — the project id was
  already recorded in `.neon` — so it is not stale-by-fork; C01.00 blocker **B4 is
  RESOLVED**. No snapshot/test branch exists, and no migration was run by C01.08.
- **Catalog facade** (`src/lib/backend/catalog-facade.ts`): live-or-mock dispatch.
- **Server cart + guest checkout**: server-authoritative totals, idempotent order
  placement (`src/lib/backend/cart`, `orders/`, `api/`).
- **Config / feature flags** (`src/lib/backend/config/`): env-driven with safe
  defaults; `FEATURE_*` flags (wishlist/reviews/account/promotions/recommendations —
  off by default).
- **Admin bootstrap**: `npm run db:create-admin` (`AUTH_ADMIN_EMAIL/PASSWORD`).
- **API routes** `/api/...`: catalog, cart, checkout, webhooks/payment, orders.
- **No new npm dependencies** were added during phase 00; the declared set in
  `package.json` is unchanged (C00.5/C00.6/C00.7/C00.8 made no source changes).

### Added — deployment configuration and staging

- **Cloudflare Workers** via OpenNext: `open-next.config.ts`, `wrangler.jsonc`,
  `npm run deploy:cf` (Worker `boyshop-test`). Live account inspection confirmed it is
  deployed; C01.07 authorized it as staging at `boyshop-test.i-janajoe.workers.dev`.
  (Corrected C01.01: that deploy is `modified_on` 2026-09-22T01:42:07Z and predates this
  fork's 2026-09-24 import, so staging serves the **previous version** — 244
  source/config files here are undeployed, and the live URL returns HTTP 200 with **no
  Miski2/Miski3 markers**. Local Cloudflare build evidence exists; nothing was
  redeployed.)
- **Netlify**: config exists but was not selected.

### Changed — phase 01 release-blocker reconciliation

- `BS2Mod-site` is a standalone repository. Its recorded history was eight commits, from
  `0342c4c` through the then-current HEAD `9286a8d` — true when recorded, but superseded:
  HEAD is now `e3ed3f3` with 14 commits (see the C01.01 entry above). Previously cited
  commit anchors are not present in this repository.
- C01.06: Mollie chosen as the future live provider; not activated.
- C01.07: Cloudflare Workers staging authorized; final brand domain deferred.
- C01.08: existing Neon `boyshop/main` designated the production database; database
  snapshot/test-branch/schema-verification gates remain open. (C01.01: the earlier
  "production candidate" hedging is withdrawn — Neon `boyshop` **is** this fork's
  production database, so B4 is RESOLVED. The snapshot/test-branch gate is unchanged.)
- C01.09: `MOLLIE_ALLOW_LIVE=true` conditionally authorized for a future production
  environment only; absent on staging — and, confirmed C01.01, absent from both
  `wrangler.jsonc` and `.env.local`, so staging stays fail-closed; hidden `live_*` key
  confirmation + live E2E required.
- C01.10: decision/evidence records are committed at HEAD.

### Changed — phase 00 repo stabilization (C00.1–C00.10b, landed)

- Repo reality check: `BS2Mod-site` is its own Git repository, rooted at
  `C:\dev\BS2Mod-site`.
- `.gitignore` hardening (C00.2): `/.open-next/` and `/.wrangler/` are both ignored
  directly by this repository.
- Version metadata aligned to canonical `0.11.1` (C00.3) — `package.json` ==
  `package-lock.json`; no version drift found/corrected beyond this.
- Stale-paperwork audit (C00.4, read-only): the five canonical docs (CHANGELOG,
  GO-LIVE, PROJECT-STATE, TEAM-3-HANDOFF, TEAM-1-HANDOFF) existed **only** in legacy
  `C:\dev\BoyShop`; zero `.md` files existed outside the workflow pack in
  `BS2Mod-site/` at that time.
- Evidence docs created from scratch (from repo evidence only):
  - `MOLLIE-VERIFICATION.md` (C00.5) — Mollie adapter verified against its code and
    injected-fetch unit tests; live mode is fail-closed.
  - `GO-LIVE.md` (C00.6) — operations handoff skeleton; verdict **RELEASE BLOCKED**.
  - `HANDOFF.md` (C00.7) — team/state handoff; same verdict.
  - `CHANGELOG.md` (C00.8) — this document, reconciled to the repository's actual
    commit history.
- No secrets introduced: only `.env.example` is in the tree; `.env*.local` and
  `.wrangler/` are gitignored.
- C00.10 through C00.13 are complete, and phase 00 is DONE. (Corrected C01.01: this
  bullet previously read "C00.10 through C00.13 remain deferred" and stated that no
  evidence-document commit had been made in this repository. Both claims were
  **false**. The phase-00 evidence corrections are committed at `a0f31c6` (C00.13) and
  were superseded by `70d10f8`, `f074a44`, `183c580`, `2746d7d`, `e3ed3f3`.)

## Historical reference (pre-BS2Mod-site)

Versions `0.1.0` → `0.10.2` of the earlier BoyShop project are recorded in
`C:\dev\BoyShop\CHANGELOG.md` (legacy). They describe the history that led to the
`BS2Mod-site` tree at `0.11.1`. Per C00.4 they are **reference-for-shape only** — the
canonical record for `BS2Mod-site/` starts with this document.

---

_Last verified: 2026-09-30 (0.11.1). Current HEAD is `e3ed3f3`; the repository has 14
recorded commits. The phase-00 evidence corrections are committed at `a0f31c6` (C00.13)
and were superseded by `70d10f8`, `f074a44`, `183c580`, `2746d7d`, `e3ed3f3`, so no
documentation commit is outstanding. No release or tag exists. Release remains blocked
pending acceptance, the B1/B2/B3/B5/B6 decisions, and phases 21–23._
