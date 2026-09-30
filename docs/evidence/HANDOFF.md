# HANDOFF — BoyShop / BS2Mod

> **Status: PRE-LAUNCH — RELEASE BLOCKED.** Reconciled to current committed repository
> state (C00.7, 2026-09-30). This document is the team/state handoff;
> `docs/evidence/GO-LIVE.md` is the authoritative operations handoff.
>
> **Commit anchors (corrected 2026-09-30, C00.7).** Earlier wording in this document
> named `140cf921` (full-tree landing) and `d837b0aa` (initial evidence commit) as
> anchors. **Neither commit exists in this repository** — `git cat-file -t` rejects both
> and neither appears in `git log --all`. They belong to an external/shared history that
> is not this Git repository. `BS2Mod-site` is its own repository
> (`git rev-parse --show-toplevel` → `C:/dev/BS2Mod-site`), branch `main`, and its real
> history is:
>
> | Commit | Subject |
> |---|---|
> | `9286a8d` | **HEAD at C00.7 verification** — workflow-pack swap to ULW-GATE + product actions/form/tests (C00.4 closeout) |
> | `988f7f4` | Merge `codex/miski2-theme` |
> | `7fa927c` | C02.04 closeout doc sync |
> | `59a6bb4` | Authoritative variant-stock availability rule (C02.04) |
> | `bbfa6af` | Miski3 storefront theme |
> | `5c86e1d` | Miski2 storefront theme |
> | `0296ec0` | Initial import of BS2Mod-site — first commit that carries `docs/evidence/*` |
> | `0342c4c` | Initial commit |
>
> This file was itself last committed at `0296ec0`; the C00.7–C00.13 reconciliation
> edits are committed in the C00.13 approved docs/evidence commit (2026-09-30).
>
> **C01.06–C01.10 decision records are committed**, not pending. Earlier wording here
> that called them "uncommitted" was stale.

## 1. What is being handed over

The **BoyShop / BS2Mod** project root (`C:\dev\BS2Mod-site`): a premium, mobile-first
boys-clothing ecommerce storefront plus its provider-neutral commerce backend, at
canonical package version `0.11.1` (C00.3 verified and re-verified 2026-09-30:
`package.json` `version` and `package-lock.json` `version` both `0.11.1`; no `VERSION`
file exists — the version lives in `package.json`).

## 2. Storefront (visitor-facing)

- **Stack:** Next.js `^15.1.6` (App Router) + React `^19.0.0` + TypeScript, plain CSS
  (design tokens as CSS custom properties). No Tailwind, no commerce SDK in components.
- **Pages** (`src/app/`, verified from `page.tsx` routes 2026-09-30): `/` (home),
  `/shop`, `/product/[slug]`, `/category/[slug]`, `/collection/[slug]`, `/search`,
  `/cart`, `/checkout`, `/checkout/confirmation`, `/size-guide`, `/story`, `/account`,
  `/pages/[slug]`, `not-found.tsx`, plus the admin surface —
  `/admin/login`, `/admin/forbidden`, and the protected group
  `/admin/(protected)/` with `orders`, `orders/[id]`, `products`,
  `products/[id]/edit`, and `storefront`.
- **Components** (`src/components/`): themed groups — `account/`, `cart/`, `filter/`,
  `home/`, `layout/`, `pdp/`, `plp/`, `product/`, `search/`, `storefront/`, `ui/`.
- **Rendering:** backend-agnostic. With no `DATABASE_URL` the storefront renders from
  the mock data layer (`src/lib/data/`) — the safe default; no env vars are required
  locally.
- **Config files present:** `next.config.mjs` (ESLint gate on; no `next.config.ts`),
  `wrangler.jsonc`, `netlify.toml` (present but not the selected target),
  `open-next.config.ts`, `drizzle.config.ts`, `tsconfig.json`.

## 3. Commerce backend (server-side)

- **Provider-neutral payment layer** (`src/lib/backend/payments/`): `types.ts`,
  `state-machine.ts`, `provider.ts` (port), `capabilities.ts`, `registry.ts`,
  `store.ts`, `service.ts` + adapters. Mock is the verified default; Mollie is selected
  for future live payments (C01.06) but remains fail-closed. C01.09 conditionally
  authorizes `MOLLIE_ALLOW_LIVE=true` only on a future production environment after
  confirmation of a hidden `live_*` key. Verification:
  `docs/evidence/MOLLIE-VERIFICATION.md` (C00.5). Re-verified 2026-09-30: `wrangler.jsonc`
  `vars` sets `PAYMENT_PROVIDER: "mollie"` and `PAYMENT_PROVIDERS: "mock,mollie"` but
  **no `MOLLIE_ALLOW_LIVE`**, so staging stays fail-closed.
- **Live data layer** (`src/lib/backend/db/`): Drizzle schema + lazy Neon client (only
  connects when `DATABASE_URL` is set). Read-only inspection found the schema already on
  Neon `boyshop/main`, designated the production candidate in C01.08. No snapshot/test
  branch exists; future migrations require those safeguards and approval.
- **Catalog facade** (`src/lib/backend/catalog-facade.ts`): live-or-mock dispatch —
  returns the live repository only when `hasDatabase()` is true.
- **Server cart + guest checkout** (`src/lib/backend/cart`, `orders/`, `api/`):
  server-authoritative totals, idempotent order placement.
- **Config / feature flags** (`src/lib/backend/config/`): env-driven settings with safe
  defaults. `wrangler.jsonc` sets all `FEATURE_*` flags false
  (wishlist/reviews/account/promotions/recommendations).
- **API routes:** `/api/...` — catalog, cart, checkout, webhooks/payment, orders.
- **Auth:** guest checkout is primary; admin bootstrap exists via `db:create-admin`
  (`AUTH_ADMIN_EMAIL/PASSWORD`), feature-flagged account UI off by default.

## 4. What is NOT in place (deferred / blocked)

- **C00.5–C00.13 documentation/evidence changes are committed** (C00.13 approved
  docs/evidence commit, 2026-09-30): `docs/evidence/MOLLIE-VERIFICATION.md` (C00.5),
  `docs/evidence/GO-LIVE.md` (C00.6), this file (C00.7, corrected C00.13), and the pack
  control files `CURRENT-STATE.md` / `IMPLEMENTATION-MAP.md` / `NEXT.md` /
  `chunks/00-repo-stabilization/`. Untracked and intentionally **not** committed: two
  workflow-pack zips, `dev-server.log`, `dev-server.err.log`, and the `references/`
  MISKI2 source archive (local build/QA artifacts, kept out of the repository).
  *(Corrected C00.7: the previously cited "full tree landed at `140cf921`" and
  "C01.06–C01.10 remains uncommitted" wording was stale — the tree is tracked and
  committed here, and the C01 decision records are committed at HEAD.)*
- **No release authorization.** Phases 21 (release audit), 22 (production) and 23
  (go-live) are `QUEUED`.
- **Payments:** Mollie chosen, but production environment/key-prefix confirmation, flag
  application, and a live E2E payment remain incomplete. Staging stays fail-closed.
- **Hosting:** Cloudflare Workers staging is deployed and authorized at
  `boyshop-test.i-janajoe.workers.dev` (`wrangler.jsonc` `PUBLIC_URL`); final brand
  domain and production Worker deferred.
- **No local Cloudflare build evidence.** Neither `.open-next/` nor `.wrangler/` exists
  in this tree, and both are build/local artifacts, so `deploy:cf` has not been
  exercised here.
- **Database:** existing Neon `boyshop/main` is the production candidate; snapshot, test
  branch, source/database verification, and future-migration approval remain open.
- **No automated E2E suite committed** in-repo. Payment behavior is proven by
  injected-fetch unit tests (Mollie) and the scripted manual E2E precedent (legacy).

## 5. Handoff review notes (for the receiving party)

- Confirm **no live credentials** in the tree: only `.env.example` is tracked.
  `.env*.local` is gitignored (`.gitignore:28`); `.env.local` exists locally and defines
  only `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `NEON_BRANCH` — no Mollie key material.
- **`.wrangler/` is gitignored.** `.gitignore` covers `/.open-next/`, `/build`,
  `/.env*.local`, `.dev.vars*` and QA artifacts, and `.gitignore:10` carries `/.wrangler/`
  (added C00.2) — verified by `git check-ignore -v .wrangler/` →
  `.gitignore:10:/.wrangler/`. The directory does not currently exist, so there is no
  local Wrangler state today; if it were created it would be ignored, not visible.
  *(Corrected C00.13: the C00.7 claim that `.wrangler/` is **not** gitignored was itself
  wrong — the ignore entry has been in place since C00.2.)*
- Confirm **payment live mode is fail-closed**: `live_*` Mollie keys are rejected unless
  `MOLLIE_ALLOW_LIVE=true` (CEO-authorized) — see `MOLLIE-VERIFICATION.md`.
- Confirm **no new npm dependencies** were added outside the declared set in
  `package.json` (C00.5/C00.6/C00.7 made no source changes).
- Full environment/requirement detail: `docs/evidence/GO-LIVE.md` (C00.6) is the
  authoritative operations handoff; this document is the team/state handoff.
- Legacy handoff documents (TEAM-1-HANDOFF, TEAM-3-HANDOFF) exist only in the historical
  `C:\dev\BoyShop` tree and are reference-for-shape only — never copied as fact (C00.4).

## 6. Handoff acceptance

- **Handed off by:** Workflow (phase 00 repo stabilization, C00.7) — 2026-09-30
- **Accepted by:** _(pending — synchronized evidence commit plus phases 21–23)_

---

_Last verified: 2026-09-30 (C00.13) against package version `0.11.1` on branch `main`.
Corrections made in C00.7: cited commits `140cf921` and `d837b0aa` do not exist in this
repository and were replaced with the real 8-commit table; the "decision/evidence updates
are uncommitted" wording was corrected (C01.06–C01.10 records are committed at HEAD); the
page and component inventories were re-verified against actual routes/groups. Corrected in
C00.13: the C00.7 claim that `.wrangler/` is not gitignored was itself wrong —
`.gitignore:10` carries `/.wrangler/` (C00.2), verified by `git check-ignore -v
.wrangler/`. **Release remains BLOCKED.** `BS2Mod-site` is an independent repository, so
re-read current HEAD before relying on any commit anchor recorded here._
