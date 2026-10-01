# CURRENT-STATE — BoyShop / BS2Mod

Last refreshed: 2026-10-01. HEAD is `3e21455ca1aaefa6402b11952e5d24a72a61878f` (25 commits, measured just before the C01.07 sync commit); C01.04 through C01.07 are complete.

## Active phase
Phase 00 — Repo stabilization: **COMPLETE** (C00.1–C00.14 all closed; C00.13 committed)
Phase 01 — Existing release blockers: **ACTIVE**; C01.00 through C01.07 are complete. B1, B2, and B4 are resolved; B3, B5, and B6 remain blocked.

## Staging deployment evidence
- Latest `boyshop-test` version `4b722aab-7758-4255-8842-23aac1480861` was deployed 2026-10-01 from HEAD `3e21455` under explicit owner approval; 126 bundled asset files, 12 newly uploaded.
- The live site loaded the active Vanilla storefront: hero and editorial images loaded and the browser console reported no errors.
- `MOLLIE_ALLOW_LIVE` remains absent from `wrangler.jsonc`, `.env.local`, and deployed bindings.

## Verified repo truth (2026-10-01)
- `BS2Mod-site` is its own git repository (own `.git`; `rev-parse --show-toplevel` → `C:/dev/BS2Mod-site`), branch `main`; `origin https://github.com/FinFinnigan/bs2mod.git`. HEAD is `3e21455ca1aaefa6402b11952e5d24a72a61878f` (25 commits, measured just before the C01.07 sync commit), and `main` is in sync with `origin/main`.
- **Nested-repo hazard: RESOLVED (2026-09-30, commit `01ef174c` in `C:\dev`).** The enclosing `C:\dev` is a separate git repository (`origin FinFinnigan/dev.git`) that used to track **481 `BS2Mod-site/**` files** as plain files (`100644`, not a `160000` gitlink) while `C:\dev\.gitignore` lines 1–3 already declared `BS2Mod-site/` as ignored — the rule was inert because the paths were already tracked. The owner chose to untrack it; those 481 paths are now index-removed and `C:\dev` HEAD carries **0** `BS2Mod-site` files (`git -C C:\dev ls-files -- BS2Mod-site` returns nothing). The existing ignore rule is now effective. **`C:\dev` is NOT part of this project and is out of scope for BS2Mod-site work** — it holds Clix, GPP-site, Helios, leroy and Microsites. Its 2 unpushed commits (`9f5310b4` GPP work, `01ef174c` the untracking) belong to those projects, not to BoyShop. Do not list a `C:\dev` push as a BoyShop blocker and do not push it as part of this project's work. The other five `C:\dev` projects are untouched (447 tracked files).
- `package.json` + `package-lock.json` both `0.11.1`; no `VERSION` file; working tree clean for both
- `docs/evidence/*` (HANDOFF, PROJECT-STATE, CHANGELOG, GO-LIVE, MOLLIE-VERIFICATION) tracked and **committed at HEAD `a0f31c6`** (C00.13). The C00.5–C00.9 reconciliations plus the C00.13 F1 HANDOFF correction are in history — no outstanding evidence-doc edits. Status PRE-LAUNCH / release blocked.
- `next ^15.1.6` + `react ^19.0.0`; `wrangler.jsonc` worker `boyshop-test`, `PUBLIC_URL=https://boyshop-test.i-janajoe.workers.dev`, `main=.open-next/worker.js`, `vars` set no `MOLLIE_ALLOW_LIVE`; `netlify.toml` unselected; `open-next.config.ts` present (default `defineCloudflareConfig()`); scripts `deploy:cf` (`wrangler deploy`) and `preview:cf` (`wrangler dev --remote`)
- **Cloudflare deployment evidence:** C01.03 deployed the current fork to `boyshop-test`; B1 and B2 are resolved. The 2026-10-01 deploy ran `wrangler deploy` against `main = .open-next/worker.js` as defined in `wrangler.jsonc`, and the deployed artifact is the Worker version recorded under "Staging deployment evidence" above. The C01.06 read-only audit verified the local Next.js and OpenNext bundles build successfully and made no deployment.
- `.env.local` EXISTS (343 B; modified 2026-09-24; gitignored via `.gitignore:29 .env*.local`; untracked). Key names only: `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `NEON_BRANCH` — no Mollie/key material. Treat as a live DB credential at rest; must stay untracked.
- `.neon` EXISTS (103 B; gitignored via `.gitignore:52`): `orgId org-round-star-75845352`, `projectId weathered-truth-98011402`, `branch main` — identifiers only, no password. No `.dev.vars` / `.dev.vars.*` on disk. **(2026-09-30) This is the production database:** Neon project **`boyshop`** (`weathered-truth-98011402`, branch `main` = `br-soft-smoke-zar070gn`, region `aws-eu-west-2`, PostgreSQL 18) was confirmed live with the full storefront schema (`products`, `variants`, `carts`, `orders`, `payments`, `users`, `sessions`, `settings`, `categories`, `addresses`, …). The earlier "`boyshop` → HTTP 404" recon reading was a **faulty lookup**, not a missing project — **B4 is RESOLVED.**
- `/.open-next/` and `/.wrangler/` are both present on disk and gitignored via `.gitignore:9` and `.gitignore:10`. `.open-next/worker.js` exists and was last modified on disk 2026-09-23 00:48, so the on-disk artifact predates the 2026-10-01 deploy; which build produced it is not recorded here.
- **Secret scan: clean** (C00.10, scope unchanged by C00.13 — C00.13 touched no secret-bearing file). Only `.env.example` (placeholder `postgres://user:pass@host/db`) and two test files using `postgres://test:test@localhost…`.
- no `MODALITY_WORKBOOK.md`, no `opencode.json`, no repo-root `AGENTS.md` in the project — confirmed absent repo-wide in C00.11; the live agent config is user-level, outside every repository. Root visual PNGs exist and are gitignored

## Working tree (2026-10-01, post-deploy)
- **No modified tracked files** before this sync began. HEAD advanced through the staging Worker database I/O fix (`349da08`) and the active Vanilla/admin image cleanup (`ecb8080`, `7e769d7`, `3e21455`); this sync's only modification is this file.
- `BS2Mod-site` `main` is in sync with `origin/main` at `3e21455ca1aaefa6402b11952e5d24a72a61878f` (25 commits, measured just before the C01.07 sync commit); those commits were pushed.
- **F2 RESOLVED (2026-09-30).** The 6 local artifacts are now gitignored, so `git status` is clean and the "swept by `git add -A`" hazard is closed: `BOYSHOP-NEW-WORKFLOW-PACK-ULW-GATE.zip`, `BOYSHOP-POSTBUILD-INFRA-READINESS-PACK.zip` (duplicate zips of already-tracked folders), `dev-server.log`, `dev-server.err.log`, and `references/MISKI2-FINAL-OVERHAUL-SOURCE.zip` + `references/MISKI2-FINAL-OVERHAUL-SOURCE/` (upstream design source; the theme itself stays tracked as `public/templates/miski2.css`). All six verified with `git check-ignore -v` against `.gitignore:64,65,68,69,74,75`. Confirmed 0 tracked files match the new rules, the pack folder's 133 tracked files are intact, and 408 tracked files total. Explicit-path staging is still the rule, but no longer forced by untracked strays.
- ignored on disk: `artifacts/` (QA screenshots), root `*.png`, `node_modules/`, `.next/`, `.codegraph/`, `.omo/`, `/.wrangler/` (verified ignored, 0 tracked)
- No product source, configuration, secret, or release action was in scope for this documentation-only sync (2026-10-01).

## Current execution
`chunks/01-existing-release-blockers/C01.07-current-state-sync.md` — **the documentation-only current-state sync.** Replaced stale current facts in this file so it matches the repo; no product source, config, secret, deploy, or database action.

## Next execution
No further chunk is queued — C01.07 was the last chunk in Phase 01. Progress now waits on owner actions: B3 (live payment authorization), B5 (production domain/hosting), and B6 (release-phase approval).

## Release blockers (C01.00 recon, 2026-09-30)

**Owner fork clarification:** the five `docs/evidence/*` docs describe the **previous version that was forked into this folder**. Their commit anchors, commit counts, HEAD claims, "uncommitted" claims, and the Cloudflare staging claim are **stale-by-fork** and are **explicitly not being chased**. Legacy `C:\dev\BoyShop` is out of scope. **Exception (2026-09-30):** the Neon `boyshop` database is **not** stale-by-fork and the earlier 404 reading was wrong — it is real and is **this fork's production DB** (see resolved B4 below).

**Ordered blockers** (authoritative record: `IMPLEMENTATION-MAP.md`):
- **B1 — RESOLVED (2026-09-30)** C01.03 deployed the current fork to the staging Worker.
- **B2 — RESOLVED (2026-09-30)** staging serves the current BoyShop experience and its required template assets returned HTTP 200.
- **B3** live payment not authorized (`MOLLIE_ALLOW_LIVE` absent) — CEO
- **B4 — RESOLVED (2026-09-30)** production database identified: Neon **`boyshop`** (`weathered-truth-98011402`, branch `main`); the earlier 404 was a faulty lookup. No longer blocks migrations/production prep
- **B5** production domain/hosting not authorized — CEO
- **B6** release phases 21–23 not authorized — CEO; last

**B4 is RESOLVED (database identified) and is no longer a blocker.** B3 waits for a production environment and live Mollie authorization; B5 waits for a purchased production domain; B6 is last and requires owner approval.

**Release remains BLOCKED; phases 21/22/23 stay QUEUED.**

## Re-plan note (C00.13 closeout)
Phase 00 is closed. C01.00 through C01.07 are complete. The remaining release blockers are B3 (live payments), B5 (production domain/hosting), and B6 (release-phase approval). `C:\dev` is a separate repository and remains out of scope. **Release remains BLOCKED; phases 21–23 stay QUEUED.**

## Update rule
Keep this concise. Replace stale current facts; do not use it as a long history log.
