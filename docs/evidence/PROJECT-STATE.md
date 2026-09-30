# PROJECT STATE — BoyShop / BS2Mod

> **Status: PRE-LAUNCH — RELEASE BLOCKED.** Source: created from scratch (C00.9);
> reconciled to repository truth in C00.9 and again to this fork's live repository
> truth in C01.01. Refreshed: 2026-09-30. `BS2Mod-site` is its own Git repository with
> **14 commits**; the current recorded revision is **`e3ed3f3`**. C01.06–C01.10
> decision/evidence records and the phase-00 evidence corrections (C00.2, C00.5–C00.9,
> closed by C00.13) are all **committed**, and the working tree is clean. Phase 00 is
> **DONE**; C01.00 read-only reconciliation is **COMPLETE** (B4 RESOLVED). Release
> phases 21–23 remain unauthorized.

## 1. Repository truth

- `BS2Mod-site` is its own Git repository: it has its own `.git`, and
  `git rev-parse --show-toplevel` returns `C:/dev/BS2Mod-site`. Earlier claims that it
  had no repository of its own and was tracked inside `C:\dev` were stale.
- The repository history is 14 commits, from `0342c4c` through current HEAD `e3ed3f3`:

  | Commit | Subject |
  | ------ | ------- |
  | `e3ed3f3` | **Current HEAD** - Correct C01.00 B4/B1 claims: production DB identified (Neon boyshop), local CF build evidence |
  | `2746d7d` | Phase 01 closeout: record C01.00 recon, sync control docs, open C01.01 |
  | `183c580` | Resolve C00.12 finding F2: gitignore the 6 local build/QA artifacts |
  | `f074a44` | Correct stale push state: BS2Mod-site is pushed and in sync; C:\dev is out of scope |
  | `70d10f8` | Phase 00 closeout: sync control docs to commit a0f31c6; open phase 01 with C01.00 recon |
  | `a0f31c6` | Phase 00 repo stabilization closeout: docs/evidence + pack control sync (C00.2-C00.13) |
  | `9286a8d` | Pre-fork: BS2Mod: Swap workflow pack to ULW-GATE + product actions/form/tests (C00.4 closeout) |
  | `988f7f4` | Pre-fork: merge `codex/miski2-theme` |
  | `7fa927c` | Pre-fork: C02.04 closeout doc sync |
  | `59a6bb4` | Pre-fork: authoritative variant-stock availability rule (C02.04) |
  | `bbfa6af` | Pre-fork: Miski3 storefront theme |
  | `5c86e1d` | Pre-fork: Miski2 storefront theme |
  | `0296ec0` | Pre-fork: initial import of BS2Mod-site (first commit that carries `docs/evidence/*`) |
  | `0342c4c` | Pre-fork: initial commit |

  Rows marked "Pre-fork" are the previous version imported into this folder. They are
  history, not current-state claims.
- Previously cited anchors (`140cf921`, `d837b0aa`, `5ed1e84`,
  `026e70ad`, `d7ee42bf`) are **absent** from this repository (rejected by
  `git cat-file -t`; absent from `git log --all`), confirmed by C00.6–C00.9.
- Do not hardcode `main` HEAD; re-read it live with `git rev-parse --short HEAD`.
- The working tree is **clean**: nothing in `docs/evidence/` is an outstanding edit.
  The phase-00 evidence corrections are committed at `a0f31c6` (C00.13) and were
  superseded by `70d10f8`, `f074a44`, `183c580`, `2746d7d`, `e3ed3f3`.
- The six local build/QA artifacts (two workflow-pack zips, `dev-server.log`,
  `dev-server.err.log`, the MISKI2 zip and its directory) are **gitignored** at
  `.gitignore:64,65,68,69,74,75`, so they are not untracked strays. `.env.local` is
  ignored via `.gitignore:29` (`.env*.local`), `.wrangler/` via `.gitignore:10` and
  `.open-next/` via `.gitignore:9`.

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
  `live_*` key confirmation. `MOLLIE_ALLOW_LIVE` is absent from both `wrangler.jsonc`
  and `.env.local`, so staging stays fail-closed. Verification:
  `docs/evidence/MOLLIE-VERIFICATION.md`.
- Live data layer (`src/lib/backend/db/`): Drizzle schema + lazy Neon client
  (connects only when `DATABASE_URL` is set). C01.08 read-only Neon inspection found
  project `boyshop`, branch `main`, database `neondb`, all 14 BoyShop tables, and six
  Drizzle migration records already present. **Neon `boyshop` is real and IS this fork's
  production database**: project id `weathered-truth-98011402`, organization
  `org-round-star-75845352`, default branch `main` = `br-soft-smoke-zar070gen`, region
  `aws-eu-west-2`, PostgreSQL 18, full storefront schema. The earlier "HTTP 404 project
  not found" reading was a **faulty lookup** — the project id was already recorded in
  `.neon`, and C01.00 marked that blocker (B4) **RESOLVED**; it is not stale-by-fork.
  No migration was authorized or run in C01.08. No restore snapshot or separate test
  branch exists.
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
  `boyshop-test` was deployed with wrangler on **2026-09-22**
  (`modified_on` 2026-09-22T01:42:07Z), hostname `boyshop-test.i-janajoe.workers.dev`.
  That deploy **predates this fork's initial import** (`0296ec0`, 2026-09-24), so staging
  serves the **previous version**: 244 source/config files here are undeployed, and
  `https://boyshop-test.i-janajoe.workers.dev` returns HTTP 200 but serves **no
  Miski2/Miski3 markers**. A redeploy is approval-gated (C01.00 blocker B1).
- Local Cloudflare build evidence **exists**: `npm run build` +
  `npx opennextjs-cloudflare build` (produces `.open-next/worker.js`) +
  `npx wrangler deploy --dry-run` (125 assets, 6972.67 KiB, nothing deployed).
- Netlify (`netlify.toml`: `npm run build`, publish `.next`) — config only, not chosen
  (C01.07).
- Env contract documented at C00.1 (GO-LIVE env contract): `NO_MOLLIE` etc. — nothing
  production-live. Staging domain authorized (C01.07); final production hostname deferred
  (separate CEO decision).

## 6. Phase 00 stabilization status

- C00.1 — repo reality check (read-only): originally recorded git root `C:\dev` with
  `BS2Mod-site/` untracked — later found stale and reworked by C00.6–C00.9.
- C00.2 — `.gitignore` hardened: C00.2 added exactly `/.wrangler/` to
  `BS2Mod-site/.gitignore`, beside the existing `/.open-next/` rule; both now match
  `git check-ignore -v` — verified.
- C00.3 — version metadata aligned to canonical `0.11.1` — verified.
- C00.4 — stale-paperwork audit (read-only): five canonical docs existed only in
  legacy `C:\dev\BoyShop` — closed.
- C00.5 — `MOLLIE-VERIFICATION.md` created from scratch — created.
- C00.6 — `GO-LIVE.md` created from scratch — created.
- C00.7 — `HANDOFF.md` created from scratch — created.
- C00.8 — `CHANGELOG.md` created from scratch — created.
- C00.9 — this document (`PROJECT-STATE.md`); created from scratch, then reconciled to
  the standalone repository's real history in C00.9.
- C00.10 — Cloudflare evidence audit (READ ONLY) — **complete**; the deploy-config
  review closed inside phase 00.
- C00.10b — `.dev.vars` guard: `BS2Mod-site/.gitignore` at HEAD already ignores
  `.dev.vars` and `.dev.vars.*` and keeps `.dev.vars.example` trackable; recorded here
  for completeness, not tracked as a separate open chunk in `NEXT.md`.
- C00.11 — ownership decision — **complete**.
- C00.12 — pre-commit verification — **complete**.
- C00.13 — approved commit of the phase-00 evidence corrections — **complete**; they are
  committed at `a0f31c6`. **Phase 00 is DONE.** Nothing in `docs/evidence/` is still
  waiting on a commit.

## 7. Go-live blockers

| Blocker | Why | Who must act | Action |
| ------- | --- | ------------ | ------ |
| B1 — staging redeploy not authorized | Worker `boyshop-test` `modified_on` 2026-09-22T01:42:07Z predates the 2026-09-24 import; 244 source/config files undeployed | CEO | Authorize the Cloudflare redeploy |
| B2 — staging serves the pre-fork build | `https://boyshop-test.i-janajoe.workers.dev` returns 200 but with no Miski2/Miski3 markers | CEO / operator | Redeploy once B1 is approved |
| B6 — release not authorized | Phases 21/22/23 `QUEUED` | CEO | Run release audit, production prep, go-live phases |
| B3 — live payment not activated | Mollie chosen and flag conditionally authorized, but staging stays fail-closed (`MOLLIE_ALLOW_LIVE` absent from `wrangler.jsonc` and `.env.local`); production/key confirmation/live E2E pending | CEO / operator | Prepare production, confirm `live_*`, apply flag there, run live E2E |
| B5 — no live domain/hosting | Staging authorized on workers.dev (C01.07: Cloudflare Workers, `boyshop-test.i-janajoe.workers.dev`); final brand domain deferred | CEO | Decide + authorize the final hostname (later phase) |
| Production live switch not applied | C01.09 conditional approval cannot apply to staging; production environment does not exist | CEO / operator | Apply only after production + hidden `live_*` confirmation |

Resolved:

- B4 — production database identity. Neon `boyshop` (`weathered-truth-98011402`) is real
  and IS this fork's production database; the earlier "HTTP 404 project not found"
  reading was a faulty lookup. The separate database-safety caveat still stands: no
  restore snapshot or test branch exists for Neon `boyshop/main`, so a future migration
  still needs snapshot, branch, verify and test first.
- "Decision/evidence updates uncommitted". The C01.06–C01.10 records and the phase-00
  evidence corrections are committed (C00.13 at `a0f31c6`, through `e3ed3f3`) and the
  working tree is clean.

## 8. Next steps

1. Phase 00 is **done** — C00.10 through C00.13 are all complete and the evidence
   corrections are committed at `a0f31c6`. C01.00 read-only reconciliation is complete
   and C01.01 corrected these evidence docs to this fork. No documentation commit is
   outstanding.
2. Get the B1 approval decision for the Cloudflare staging redeploy; B2 clears once
   staging serves this fork's build.
3. Keep phases 21–23 `QUEUED` (B6) until their own authorization and safeguards are met.
4. Production preparation must close the payment, final-domain, database-safety,
   monitoring, and rollback blockers listed above.

## Historical reference

The five canonical docs (CHANGELOG, GO-LIVE, PROJECT-STATE, TEAM-3-HANDOFF,
TEAM-1-HANDOFF) previously existed only in the legacy `C:\dev\BoyShop` folder and
are reference-for-shape ONLY per C00.4 — never copied as fact. The canonical record
for `BS2Mod-site/` starts with the evidence docs created from scratch this phase.

---

_Last verified vs repository/account state: 2026-09-30 (0.11.1). The repository has 14
recorded commits; the current HEAD is `e3ed3f3`. C01.06–C01.10 records and the phase-00
evidence corrections (C00.2, C00.5–C00.9) are committed — the corrections landed at
`a0f31c6` (C00.13) and were superseded by `70d10f8`, `f074a44`, `183c580`, `2746d7d`,
`e3ed3f3` — and the working tree is clean. Corrections made in C01.01: HEAD is `e3ed3f3`
with 14 commits, not `9286a8d` with eight; the build/QA artifacts are gitignored rather
than untracked; Neon `boyshop` is this fork's production database and the earlier 404
reading is withdrawn as a faulty lookup; staging still serves the pre-fork build deployed
2026-09-22; local Cloudflare build evidence exists. Release stays BLOCKED pending the
B1/B2/B3/B5/B6 decisions and phases 21–23._
