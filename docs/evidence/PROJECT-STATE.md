# PROJECT STATE — BoyShop / BS2Mod

> **Status: PRE-LAUNCH — RELEASE BLOCKED.** Source: created from scratch (C00.9).
> Refreshed: 2026-09-23. Initial evidence landed at `d837b0aa`; the full BoyShop tree
> landed at `140cf921` (C01.05). C01.06–C01.10 decisions are synchronized in the
> working tree but not committed. Release phases 21–23 remain unauthorized.

## 1. Repository truth

- Git repository root is `C:\dev`; `BS2Mod-site/` has no `.git` of its own.
- `BS2Mod-site/` is tracked inside `C:\dev` as of full-tree commit `140cf921`; the
  workflow-pack zip is intentionally excluded and remains untracked. Current evidence
  edits require a separate approved commit.
- Current `main` HEAD advances with unrelated `C:\dev` commits (it was `d7ee42bf` when
  this document was first drafted) — re-read live with `git rev-parse --short HEAD`;
  do not hardcode a HEAD value. Documentation expecting `026e70ad` / `5ed1e84` is stale.

## 2. Canonical version

- Canonical package version `0.11.1` (C00.3 verified: `package.json` ==
  `package-lock.json`, top-level and root entry).
- No `VERSION` file exists in `BS2Mod-site/`.

## 3. Storefront stack

- Next.js 15 (App Router) + React 19 + TypeScript, plain CSS (design tokens as CSS
  custom properties). No Tailwind, no commerce SDK in components.
- Backend-agnostic rendering: with no `DATABASE_URL` the storefront renders from the
  mock data layer (`src/lib/data/`) with zero configuration (safe default).

## 4. Backend stack

- Provider-neutral payment layer (`src/lib/backend/payments/`): `PaymentProvider`
  port + registry + store/service; adapters — Mock (verified default) and Mollie
  (chosen for future live use in C01.06, still fail-closed). C01.09 conditionally
  authorizes `MOLLIE_ALLOW_LIVE=true` only on a future production environment after
  `live_*` key confirmation. Verification: `docs/evidence/MOLLIE-VERIFICATION.md`.
- Live data layer (`src/lib/backend/db/`): Drizzle schema + lazy Neon client
  (connects only when `DATABASE_URL` is set). C01.08 read-only Neon inspection found
  project `boyshop`, branch `main`, database `neondb`, all 14 BoyShop tables, and six
  Drizzle migration records already present. CEO designated it as the production
  candidate; no migration was authorized or run in C01.08. No restore snapshot or
  separate test branch exists.
- Catalog facade (`src/lib/backend/catalog-facade.ts`): live-or-mock dispatch.
- Server cart + guest checkout: server-authoritative totals, idempotent order
  placement (`src/lib/backend/cart`, `orders/`, `api/`).
- Config / feature flags (`src/lib/backend/config/`): env-driven with safe defaults;
  `FEATURE_*` flags (wishlist/reviews/account/promotions/recommendations — off by
  default).
- Admin bootstrap: `npm run db:create-admin` (`AUTH_ADMIN_EMAIL/PASSWORD`).
- API routes `/api/...`: catalog, cart, checkout, webhooks/payment, orders.

## 5. Deployment

- Cloudflare Workers via OpenNext (`open-next.config.ts`, `wrangler.jsonc`, script
  `deploy:cf`; Worker name `boyshop-test`) — staging authorized (C01.07): worker
  deployed (wrangler, latest 2026-09-22), hostname `boyshop-test.i-janajoe.workers.dev`.
- Netlify (`netlify.toml`: `npm run build`, publish `.next`) — config only, not chosen
  (C01.07).
- Env contract documented at C00.1 (GO-LIVE env contract): `NO_MOLLIE` etc. — nothing
  production-live. Staging domain authorized (C01.07); final production hostname deferred
  (separate CEO decision).

## 6. Phase 00 stabilization status

- C00.1 — repo reality check (read-only): git root `C:\dev`, `BS2Mod-site/`
  untracked, HEAD at the time `d7ee42bf` — rework.
- C00.2 — `.gitignore` hardened (`.open-next/` added to `BS2Mod-site/.gitignore`;
  `.wrangler/` already ignored by `C:\dev\.gitignore`) — verified.
- C00.3 — version metadata aligned to canonical `0.11.1` — verified.
- C00.4 — stale-paperwork audit (read-only): five canonical docs existed only in
  legacy `C:\dev\BoyShop` — closed.
- C00.5 — `MOLLIE-VERIFICATION.md` created from scratch — created.
- C00.6 — `GO-LIVE.md` created from scratch — created.
- C00.7 — `HANDOFF.md` created from scratch — created.
- C00.8 — `CHANGELOG.md` created from scratch — created.
- C00.9 — this document (`PROJECT-STATE.md`) created from scratch.
- C00.10 — Cloudflare evidence audit (READ ONLY): deploy config clean and Git-suitable; `.wrangler/` + `.open-next/` verified git-ignored; found `.dev.vars` unguarded — verified.
- C00.10b — `.dev.vars` + `.dev.vars.*` added to `BS2Mod-site/.gitignore` (lines 33–36); `.dev.vars.example` kept trackable; verified via `git check-ignore` + temp-file probe — verified.

## 7. Go-live blockers

| Blocker | Why | Who must act | Action |
| ------- | --- | ------------ | ------ |
| Decision/evidence updates uncommitted | Full tree landed at `140cf921`; C01.06–C01.10 records remain working-tree edits | CEO | Verify and approve exact documentation commit |
| Release not authorized | Phases 21/22/23 `QUEUED` | CEO | Run release audit, production prep, go-live phases |
| Live payment not activated | Mollie chosen and flag conditionally authorized, but staging stays fail-closed; production/key confirmation/live E2E pending | CEO / operator | Prepare production, confirm `live_*`, apply flag there, run live E2E |
| No live domain/hosting | Staging authorized on workers.dev (C01.07: Cloudflare Workers, `boyshop-test.i-janajoe.workers.dev`); final brand domain deferred | CEO | Decide + authorize the final hostname (later phase) |
| Database migration safety incomplete | Existing `boyshop/main` already has the schema, but no restore snapshot or test branch exists | CEO | Snapshot, branch, verify, test, then separately authorize future migration |
| Production live switch not applied | C01.09 conditional approval cannot apply to staging; production environment does not exist | CEO / operator | Apply only after production + hidden `live_*` confirmation |

## 8. Next steps

1. Run C01.99 acceptance after C01.10 evidence synchronization.
2. Verify and obtain CEO approval for the exact decision/evidence documentation commit.
3. Keep phases 21–23 `QUEUED` until their own authorization and safeguards are met.
4. Production preparation must close the payment, final-domain, database-safety,
   monitoring, and rollback blockers listed above.

## Historical reference

The five canonical docs (CHANGELOG, GO-LIVE, PROJECT-STATE, TEAM-3-HANDOFF,
TEAM-1-HANDOFF) previously existed only in the legacy `C:\dev\BoyShop` folder and
are reference-for-shape ONLY per C00.4 — never copied as fact. The canonical record
for `BS2Mod-site/` starts with the evidence docs created from scratch this phase.

---

_Last verified vs repository/account state: 2026-09-23 (0.11.1). Initial evidence
landed at `d837b0aa`; the full tree landed at `140cf921`; C01.06–C01.10 records remain
uncommitted. Release stays BLOCKED pending acceptance, documentation commit approval,
and phases 21–23. Shared-monorepo HEAD advances independently._
