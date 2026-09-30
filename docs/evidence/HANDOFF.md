# HANDOFF — BoyShop / BS2Mod

> **Status: PRE-LAUNCH — RELEASE BLOCKED.** Reconciled to this fork's live repository
> state (C00.7, then re-reconciled 2026-09-30 in C01.01). This document is the
> team/state handoff; `docs/evidence/GO-LIVE.md` is the authoritative operations
> handoff. The working tree is **clean**; nothing in `docs/evidence/` is an
> outstanding edit.
>
> **Commit anchors.** Earlier wording in this document named `140cf921` (full-tree
> landing) and `d837b0aa` (initial evidence commit) as anchors. **Neither commit exists
> in this repository** — `git cat-file -t` rejects both and neither appears in
> `git log --all`. They belong to an external/shared history that is not this Git
> repository. `BS2Mod-site` is its own repository
> (`git rev-parse --show-toplevel` → `C:/dev/BS2Mod-site`), branch `main`, with
> **14 commits** (`git rev-list --count HEAD`) from `0342c4c` to current HEAD
> **`e3ed3f3`**:
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
> | `0296ec0` | Pre-fork: initial import of BS2Mod-site — first commit that carries `docs/evidence/*` |
> | `0342c4c` | Pre-fork: initial commit |
>
> Rows marked "Pre-fork" are the previous version imported into this folder. They are
> history, not current-state claims. (Corrected C01.01: HEAD is `e3ed3f3` with 14
> commits, not `9286a8d` with eight.)
>
> This file was itself first committed at `0296ec0`; the C00.7–C00.13 reconciliation
> edits landed in the C00.13 approved docs/evidence commit `a0f31c6` (2026-09-30),
> followed by `70d10f8`, `f074a44`, `183c580`, `2746d7d`, `e3ed3f3`.
>
> **C01.06–C01.10 decision records are committed**, not pending. Earlier wording here
> that called them "uncommitted" was stale.

## 1. What is being handed over

> **C01.03 update (2026-09-30):** staging Worker `boyshop-test` now serves this fork. Version `7e2c4112-a1d3-466e-91e9-24af63bb30c3` was deployed at `2026-09-30T19:12:13.86559Z`; Miski2 and Miski3 deployed assets returned HTTP 200. B1 and B2 are resolved. `MOLLIE_ALLOW_LIVE` remains absent and staging is not authorized for live payments.

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
  `vars` sets `PAYMENT_PROVIDER: "mollie"` and `PAYMENT_PROVIDERS: "mock,mollie"`, and
  `MOLLIE_ALLOW_LIVE` is **absent from both `wrangler.jsonc` and `.env.local`**, so staging
  stays fail-closed.
- **Live data layer** (`src/lib/backend/db/`): Drizzle schema + lazy Neon client (only
  connects when `DATABASE_URL` is set). C01.08 read-only inspection found the schema
  already on Neon `boyshop/main`. **Neon `boyshop` is real and IS this fork's production
  database**: project id `weathered-truth-98011402`, organization
  `org-round-star-75845352`, default branch `main` = `br-soft-smoke-zar070gn`, region
  `aws-eu-west-2`, PostgreSQL 18, full storefront schema. The earlier
  "HTTP 404 project not found" reading was a **faulty lookup** — the project id was
  already recorded in `.neon`, and C01.00 marked that blocker (B4) **RESOLVED**; it is
  not stale-by-fork. No snapshot/test branch exists; future migrations require those
  safeguards and approval.
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
  `chunks/00-repo-stabilization/`. The six local build/QA artifacts (two workflow-pack
  zips, `dev-server.log`, `dev-server.err.log`, and the `references/` MISKI2 zip and its
  directory) are **gitignored** at `.gitignore:64,65,68,69,74,75` — they are not
  untracked strays, so the working tree is **clean**.
  *(Corrected C00.7: the previously cited "full tree landed at `140cf921`" and
  "C01.06–C01.10 remains uncommitted" wording was stale — the tree is tracked and
  committed here, and the C01 decision records are committed at HEAD.)*
- **No release authorization.** Phases 21 (release audit), 22 (production) and 23
  (go-live) are `QUEUED`.
- **Payments:** Mollie chosen, but production environment/key-prefix confirmation, flag
  application, and a live E2E payment remain incomplete. Staging stays fail-closed.
- **Hosting:** Cloudflare Workers staging is authorized at
  `boyshop-test.i-janajoe.workers.dev` (`wrangler.jsonc` `PUBLIC_URL`); Worker
  `boyshop-test` `modified_on` **2026-09-22T01:42:07Z**. That deploy **predates this
  fork's initial import** (`0296ec0`, 2026-09-24), so staging serves the **previous
  version**: 244 source/config files here are undeployed, and
  `https://boyshop-test.i-janajoe.workers.dev` returns HTTP 200 but serves **no
  Miski2/Miski3 markers**. A redeploy is approval-gated (C01.00 blocker B1). Final brand
  domain and production Worker deferred.
- **Local Cloudflare build evidence exists:** `npm run build` +
  `npx opennextjs-cloudflare build` (produces `.open-next/worker.js`) +
  `npx wrangler deploy --dry-run` (125 assets, 6972.67 KiB, nothing deployed). Neither
  `.open-next/` nor `.wrangler/` is tracked; both are build/local state.
- **Database:** Neon `boyshop/main` is this fork's production database (see section 3);
  snapshot, test branch, source/database verification, and future-migration approval
  remain open.
- **No automated E2E suite committed** in-repo. Payment behavior is proven by
  injected-fetch unit tests (Mollie) and the scripted manual E2E precedent (legacy).

## 5. Handoff review notes (for the receiving party)

- Confirm **no live credentials** in the tree: only `.env.example` is tracked.
  `.env*.local` is gitignored — the anchor moved, it is now `.gitignore:29:.env*.local`
  (this file previously cited line 28). `.env.local` exists locally and defines only
  `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `NEON_BRANCH` — no Mollie key material.
- **`.wrangler/` is gitignored.** `.gitignore` covers `/.open-next/` (`.gitignore:9`),
  `/build`, `/.env*.local` (`.gitignore:29`), `.dev.vars*` and QA artifacts, and
  `.gitignore:10` carries `/.wrangler/`
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
repository and were replaced with the then-current 8-commit table; the "decision/evidence
updates are uncommitted" wording was corrected (C01.06–C01.10 records are committed at
HEAD); the page and component inventories were re-verified against actual routes/groups.
Corrected in C00.13: the C00.7 claim that `.wrangler/` is not gitignored was itself wrong —
`.gitignore:10` carries `/.wrangler/` (C00.2), verified by `git check-ignore -v
.wrangler/`. Corrected in C01.01: HEAD is `e3ed3f3` with **14 commits**, not `9286a8d`
with eight; `.env.local` is ignored at `.gitignore:29`, not `:28`, and the six build/QA
artifacts are gitignored rather than untracked strays; Neon `boyshop` is this fork's
production database and the earlier "HTTP 404 project not found" reading is withdrawn as
a faulty lookup; staging still serves the pre-fork build deployed 2026-09-22; and local
Cloudflare build evidence does exist. **Release remains BLOCKED.** `BS2Mod-site` is an
independent repository, so re-read current HEAD before relying on any commit anchor
recorded here._
