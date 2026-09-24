# CHANGELOG — BoyShop / BS2Mod

> **Status: PRE-LAUNCH — RELEASE BLOCKED.** Created from scratch (C00.8) from current
> repo evidence only. The full BoyShop tree is committed at `140cf921` (C01.05), but
> no release has been authorized or tagged. C01.06–C01.10 decision/evidence updates
> remain uncommitted.
> This changelog records the state of the working tree and the work that has actually
> landed (stabilization + evidence); it invents **no** version numbers. No release
> commit/tag/push happens without CEO approval, so nothing below is a released version.

## How to read this changelog

- **One entry per released version** once releases happen (post full-tree commit +
  phases 21–23).
- Today there are **zero released versions**. The single entry below describes the
  working tree at canonical version `0.11.1` (full tree committed at `140cf921`;
  current decision/evidence updates uncommitted).
- **Versioning policy:** semantic versioning. The canonical version lives in
  `package.json` (== `package-lock.json`, verified by C00.3). New versions are only
  recorded here when a release is actually authorized — never earlier.
- Historical pre-`BS2Mod-site` versions (`0.1.0` → `0.10.2`) are preserved in the
  legacy `C:\dev\BoyShop\CHANGELOG.md` and are **reference-for-shape only, never
  copied as fact** (C00.4).

## [Unreleased] — 0.11.1 (full tree at `140cf921`; decision records uncommitted)

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
  records already on Neon `boyshop/main`; it is designated the production candidate.
  No snapshot/test branch exists, and no migration was run by C01.08.
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
- **Netlify**: config exists but was not selected.

### Changed — phase 01 release-blocker reconciliation

- C01.05: full tree committed at `140cf921` (478 files; zip excluded).
- C01.06: Mollie chosen as the future live provider; not activated.
- C01.07: Cloudflare Workers staging authorized; final brand domain deferred.
- C01.08: existing Neon `boyshop/main` designated production candidate; database
  snapshot/test-branch/schema-verification gates remain open.
- C01.09: `MOLLIE_ALLOW_LIVE=true` conditionally authorized for a future production
  environment only; absent on staging; hidden `live_*` key confirmation + live E2E required.
- C01.10: evidence synchronized to repository and live account truth.

### Changed — phase 00 repo stabilization (C00.1–C00.10b, landed)

- Repo reality check performed (C00.1, read-only): git root is `C:\dev`;
  `BS2Mod-site/` has no own `.git`; at that time it was entirely untracked with HEAD
  `d7ee42bf` (an unrelated GPP-site commit).
- `.gitignore` hardened (C00.2): `.open-next/` added to `BS2Mod-site/.gitignore`
  (line 9); `.wrangler/` already ignored by `C:\dev\.gitignore` (lines 26–27).
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
  - `CHANGELOG.md` (C00.8) — this document.
- No secrets introduced: only `.env.example` is in the tree; `.env*.local` and
  `.wrangler/` are gitignored.
- Cloudflare evidence audit + follow-up (C00.10 → C00.10b): deploy config clean and
  Git-suitable; `.wrangler/` + `.open-next/` verified git-ignored; `.dev.vars` +
  `.dev.vars.*` added to `BS2Mod-site/.gitignore` (lines 33–36) guarding local
  secrets; `.dev.vars.example` kept trackable. Verified via `git check-ignore` and
  temporary-file probes.
- Evidence docs committed (C00.13, CEO-approved): commit `d837b0aa` — exactly the five
  evidence docs under `BS2Mod-site/docs/evidence/` (629 insertions), staged by
  explicit path only; no secrets in the staged diff.

## Historical reference (pre-BS2Mod-site)

Versions `0.1.0` → `0.10.2` of the earlier BoyShop project are recorded in
`C:\dev\BoyShop\CHANGELOG.md` (legacy). They describe the history that led to the
`BS2Mod-site` tree at `0.11.1`. Per C00.4 they are **reference-for-shape only** — the
canonical record for `BS2Mod-site/` starts with this document.

---

_Last verified: 2026-09-23 (0.11.1). Initial evidence landed at `d837b0aa`; full tree
landed at `140cf921`; C01.06–C01.10 records remain uncommitted. No release/tag exists.
Release remains blocked pending acceptance, documentation commit approval, and phases
21–23. Shared-monorepo HEAD advances independently._
