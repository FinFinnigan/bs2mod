# HANDOFF — BoyShop / BS2Mod

> **Status: PRE-LAUNCH — RELEASE BLOCKED.** Created from scratch (C00.7) from current
> repo evidence only. Legacy handoff documents (TEAM-1-HANDOFF, TEAM-3-HANDOFF) exist
> only in the historical `C:\dev\BoyShop` tree and are reference-for-shape only —
> never copied as fact (C00.4). Initial evidence landed at `d837b0aa`; the full tree
> landed at `140cf921` (C01.05). Cloudflare staging and Neon account state were
> inspected in C01.07–C01.09. Release remains blocked; current decision/evidence
> updates are not committed yet.

## 1. What is being handed over

The **BoyShop / BS2Mod** project root (`C:\dev\BS2Mod-site`): a premium,
mobile-first boys-clothing ecommerce storefront plus its provider-neutral commerce
backend, at canonical package version `0.11.1` (C00.3 verified: `package.json` ==
`package-lock.json`; no `VERSION` file exists).

## 2. Storefront (visitor-facing)

- **Stack:** Next.js 15 (App Router) + React 19 + TypeScript, plain CSS (design
  tokens as CSS custom properties). No Tailwind, no commerce SDK in components.
- **Pages** (`src/app/`): home (`page.tsx`), `shop`, `product/[slug]`,
  `category/[slug]`, `collection/[slug]`, `search`, `cart`, `checkout`,
  `size-guide`, `story`, `account`, `admin`, `pages/*`, `not-found`.
- **Components** (`src/components/`): themed groups — `layout/`, `plp/`, `pdp/`,
  `product/`, `filter/`, `cart/`, `search/`, `ui/`, `account/`.
- **Rendering:** backend-agnostic. With no `DATABASE_URL` the storefront renders
  from the mock data layer (`src/lib/data/`) — the safe default; no env vars are
  required locally.

## 3. Commerce backend (server-side)

- **Provider-neutral payment layer** (`src/lib/backend/payments/`): neutral
  types/state-machine/provider port/registry/store/service + adapters. Mock is the
  verified default; Mollie is selected for future live payments (C01.06) but remains
  fail-closed. C01.09 conditionally authorizes `MOLLIE_ALLOW_LIVE=true` only on a future
  production environment after confirmation of a hidden `live_*` key. Verification:
  `docs/evidence/MOLLIE-VERIFICATION.md` (C00.5).
- **Live data layer** (`src/lib/backend/db/`): Drizzle schema + lazy Neon client
  (only connects when `DATABASE_URL` is set). Read-only inspection found the schema
  already on Neon `boyshop/main`, designated the production candidate in C01.08. No
  snapshot/test branch exists; future migrations require those safeguards and approval.
- **Catalog facade** (`src/lib/backend/catalog-facade.ts`): live-or-mock dispatch —
  returns the live repository only when `hasDatabase()` is true.
- **Server cart + guest checkout** (`src/lib/backend/cart`, `orders/`, `api/`):
  server-authoritative totals, idempotent order placement.
- **Config / feature flags** (`src/lib/backend/config/`): env-driven settings with
  safe defaults; `FEATURE_*` flags (wishlist/reviews/account/promotions/recommendations
  off by default).
- **API routes:** `/api/...` — catalog, cart, checkout, webhooks/payment, orders.
- **Auth:** guest checkout is primary; admin bootstrap exists via `db:create-admin`
  (`AUTH_ADMIN_EMAIL/PASSWORD`), feature-flagged account UI off by default.

## 4. What is NOT in place (deferred / blocked)

- **Current decision/evidence edits are uncommitted.** The full tree landed at
  `140cf921`; the workflow-pack zip remains intentionally untracked. C01.06–C01.10
  documentation needs verification and separate commit approval.
- **No release authorization.** Phases 21 (release audit), 22 (production) and 23
  (go-live) are `QUEUED`.
- **Payments:** Mollie chosen, but production environment/key-prefix confirmation,
  flag application, and a live E2E payment remain incomplete. Staging stays fail-closed.
- **Hosting:** Cloudflare Workers staging is deployed and authorized at
  `boyshop-test.i-janajoe.workers.dev`; final brand domain and production Worker deferred.
- **Database:** existing Neon `boyshop/main` is the production candidate; snapshot,
  test branch, source/database verification, and future-migration approval remain open.
- **No automated E2E suite committed** in-repo. Payment behavior is proven by
  injected-fetch unit tests (Mollie) and the scripted manual E2E precedent (legacy).

## 5. Handoff review notes (for the receiving party)

- Confirm **no live credentials** in the tree: only `.env.example` is committed;
  `.env*.local` and `.wrangler/` are gitignored.
- Confirm **payment live mode is fail-closed**: `live_*` Mollie keys are rejected
  unless `MOLLIE_ALLOW_LIVE=true` (CEO-authorized) — see `MOLLIE-VERIFICATION.md`.
- Confirm **no new npm dependencies** were added outside the declared set in
  `package.json` (C00.5/C00.6/C00.7 made no source changes).
- Full environment/requirement detail: `docs/evidence/GO-LIVE.md` (C00.6) is the
  authoritative operations handoff; this document is the team/state handoff.

## 6. Handoff acceptance

- **Handed off by:** Workflow (phase 00 repo stabilization, C00.7) — 2026-09-22
- **Accepted by:** _(pending — synchronized evidence commit plus phases 21–23)_
