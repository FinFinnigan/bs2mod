# CURRENT-STATE — BoyShop / BS2Mod

Last refreshed: 2026-09-30 (C01.00 recon closeout — release blockers established and recorded in `IMPLEMENTATION-MAP.md`; `BS2Mod-site` at HEAD `183c580`, 12 commits, in sync with `origin/main`; C00.13 closeout commit `a0f31c6`; typecheck + tests green)

## Active phase
Phase 00 — Repo stabilization: **COMPLETE** (C00.1–C00.14 all closed; C00.13 committed)
Phase 01 — Existing release blockers: **ACTIVE**; C01.00 recon is COMPLETE and next chunk is `C01.01` (evidence-doc fork reconciliation, docs only)

## Verified repo truth (2026-09-30)
- `BS2Mod-site` is its own git repository (own `.git`; `rev-parse --show-toplevel` → `C:/dev/BS2Mod-site`), branch `main`, HEAD `183c580`; `origin https://github.com/FinFinnigan/bs2mod.git`; `main` is **in sync with `origin/main` — fully pushed** (verified: `git ls-remote origin refs/heads/main` → `183c580` = local HEAD; `git log origin/main..HEAD` empty). The C00.13 closeout commit `a0f31c6` is an ancestor of HEAD and is on the remote. Real history is 12 commits (`183c580` … `0342c4c`).
- **Nested-repo hazard: RESOLVED (2026-09-30, commit `01ef174c` in `C:\dev`).** The enclosing `C:\dev` is a separate git repository (`origin FinFinnigan/dev.git`) that used to track **481 `BS2Mod-site/**` files** as plain files (`100644`, not a `160000` gitlink) while `C:\dev\.gitignore` lines 1–3 already declared `BS2Mod-site/` as ignored — the rule was inert because the paths were already tracked. The owner chose to untrack it; those 481 paths are now index-removed and `C:\dev` HEAD carries **0** `BS2Mod-site` files (`git -C C:\dev ls-files -- BS2Mod-site` returns nothing). The existing ignore rule is now effective. **`C:\dev` is NOT part of this project and is out of scope for BS2Mod-site work** — it holds Clix, GPP-site, Helios, leroy and Microsites. Its 2 unpushed commits (`9f5310b4` GPP work, `01ef174c` the untracking) belong to those projects, not to BoyShop. Do not list a `C:\dev` push as a BoyShop blocker and do not push it as part of this project's work. The other five `C:\dev` projects are untouched (447 tracked files).
- `package.json` + `package-lock.json` both `0.11.1`; no `VERSION` file; working tree clean for both
- `docs/evidence/*` (HANDOFF, PROJECT-STATE, CHANGELOG, GO-LIVE, MOLLIE-VERIFICATION) tracked and **committed at HEAD `a0f31c6`** (C00.13). The C00.5–C00.9 reconciliations plus the C00.13 F1 HANDOFF correction are in history — no outstanding evidence-doc edits. Status PRE-LAUNCH / release blocked.
- `next ^15.1.6` + `react ^19.0.0`; `wrangler.jsonc` worker `boyshop-test`, `PUBLIC_URL=https://boyshop-test.i-janajoe.workers.dev`, `main=.open-next/worker.js`, `vars` set no `MOLLIE_ALLOW_LIVE`; `netlify.toml` unselected; `open-next.config.ts` present (default `defineCloudflareConfig()`); scripts `deploy:cf` (`wrangler deploy`) and `preview:cf` (`wrangler dev --remote`)
- **Cloudflare deploy evidence (C01.00 recon; supersedes the C00.10 reading):** worker `boyshop-test` EXISTS (id `49164c690eb347fb830cc825e1aaf73f`, created `2026-09-21T23:10:54Z`, `modified_on` `2026-09-22T01:42:07Z`) and `https://boyshop-test.i-janajoe.workers.dev` returns HTTP 200 with `server: cloudflare`. That `modified_on` **predates this fork's initial import (2026-09-24)**, and **244 source/config files are undeployed**. The live URL returns 200 but serves **no Miski2/Miski3 markers**, which proves it serves the **pre-fork version** — it is stale-by-fork, not merely behind HEAD. There is also **no local build/deploy evidence**: `/.open-next/`, `/.wrangler/`, `out/` and `build/` are all absent on disk, no wrangler deploy log, and `deploy:cf` has never been exercised from this tree.
- `.env.local` EXISTS (343 B; modified 2026-09-24; gitignored via `.gitignore:29 .env*.local`; untracked). Key names only: `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `NEON_BRANCH` — no Mollie/key material. Treat as a live DB credential at rest; must stay untracked.
- `.neon` EXISTS (103 B; gitignored via `.gitignore:52`): `orgId org-round-star-75845352`, `projectId weathered-truth-98011402`, `branch main` — identifiers only, no password. No `.dev.vars` / `.dev.vars.*` on disk.
- `/.open-next/` and `/.wrangler/` are gitignored via `.gitignore:9` / `.gitignore:10`. Neither directory currently exists on disk.
- **Secret scan: clean** (C00.10, scope unchanged by C00.13 — C00.13 touched no secret-bearing file). Only `.env.example` (placeholder `postgres://user:pass@host/db`) and two test files using `postgres://test:test@localhost…`.
- no `MODALITY_WORKBOOK.md`, no `opencode.json`, no repo-root `AGENTS.md` in the project — confirmed absent repo-wide in C00.11; the live agent config is user-level, outside every repository. Root visual PNGs exist and are gitignored

## Working tree (2026-09-30, post-C00.13)
- **No modified tracked files.** C00.13 committed 13 paths (12 previously-modified + the new C00.14 chunk record): 418 insertions / 159 deletions, commit `a0f31c6`
- `BS2Mod-site` `main` is **in sync with `origin/main` — fully pushed**, nothing left to push (HEAD `183c580` = live remote `main`)
- **F2 RESOLVED (2026-09-30).** The 6 local artifacts are now gitignored, so `git status` is clean and the "swept by `git add -A`" hazard is closed: `BOYSHOP-NEW-WORKFLOW-PACK-ULW-GATE.zip`, `BOYSHOP-POSTBUILD-INFRA-READINESS-PACK.zip` (duplicate zips of already-tracked folders), `dev-server.log`, `dev-server.err.log`, and `references/MISKI2-FINAL-OVERHAUL-SOURCE.zip` + `references/MISKI2-FINAL-OVERHAUL-SOURCE/` (upstream design source; the theme itself stays tracked as `public/templates/miski2.css`). All six verified with `git check-ignore -v` against `.gitignore:64,65,68,69,74,75`. Confirmed 0 tracked files match the new rules, the pack folder's 133 tracked files are intact, and 408 tracked files total. Explicit-path staging is still the rule, but no longer forced by untracked strays.
- ignored on disk: `artifacts/` (QA screenshots), root `*.png`, `node_modules/`, `.next/`, `.codegraph/`, `.omo/`, `/.wrangler/` (verified ignored, 0 tracked)
- the only expected post-commit modifications are this closeout's own documentation sync (CURRENT-STATE / IMPLEMENTATION-MAP / NEXT / phase-00 INDEX / new C01.00 chunk) — docs only, zero product/source/config change

## Current execution
`chunks/00-repo-stabilization/C00.13-approved-docs-evidence-commit.md` — **COMPLETE (committed).** Owner approval granted. Staged 13 approved paths by explicit path (never `git add -A`), inspected the staged diff, committed as `a0f31c6`. Post-commit regression verification PASSED: `npm run typecheck` (`tsc --noEmit`, exit 0, no errors) and `npm test` (325 passed / 6 skipped across 37 files, exit 0) — identical to the C00.12 baseline, so no regression. **Finding F1 RESOLVED and committed:** `docs/evidence/HANDOFF.md` no longer claims `.wrangler/` is "not gitignored" (corrected to reflect `.gitignore:10` `/.wrangler/`, verified via `git check-ignore -v .wrangler/`) and records the C00.5–C00.13 docs/evidence commit plus the intentionally-untracked artifacts. **Finding F2 was deliberately left OPEN at that point** (the 6 artifacts stayed untracked and unignored); **it has since been RESOLVED on 2026-09-30** — the 6 artifacts are now gitignored and `git status` is clean. Explicit-path staging remains the standing rule, but is no longer forced by untracked strays. Git emitted only benign LF→CRLF warnings while staging. No product source, config, dependency, or secret changed.

## Next execution
`chunks/01-existing-release-blockers/C01.01-evidence-docs-fork-reconciliation.md` — the single next chunk. Docs only: reconcile the five `docs/evidence/*` docs to this fork's live truth (12 commits at `183c580`, not 8 at `9286a8d`; tree clean, not 6 untracked; phase-00 corrections committed at `a0f31c6`, not "uncommitted"; `.gitignore:29`, not `:28`; the Neon and Cloudflare claims are stale-by-fork and out of scope). Zero product/source/config/dependency/secret change. Explicitly **not** a deploy, push, live payment activation, or DB migration.

## Release blockers (C01.00 recon, 2026-09-30)

**Owner fork clarification:** the five `docs/evidence/*` docs describe the **previous version that was forked into this folder**. Their commit anchors, commit counts, HEAD claims, "uncommitted" claims, the Neon `boyshop`/`boyshop/main` production-candidate claim and the Cloudflare staging claim are **stale-by-fork** and are **explicitly not being chased**. Legacy `C:\dev\BoyShop` and the old Neon project are out of scope.

**Ordered blockers** (authoritative record: `IMPLEMENTATION-MAP.md`):
- **B1** no local Cloudflare build/deploy evidence — operator, approval-gated; blocks any deploy, and is the prerequisite for B2
- **B2** staging Worker serves the pre-fork version — depends on B1; blocks staging as a review/demo target
- **B3** live payment not authorized (`MOLLIE_ALLOW_LIVE` absent) — CEO
- **B4** production database unidentified (Neon `boyshop` → HTTP 404) — **owner input required**; blocks migrations, production prep and B3
- **B5** production domain/hosting not authorized — CEO
- **B6** release phases 21–23 not authorized — CEO; last

Order: B1 → B2. B4 runs in parallel but needs an owner answer before it can start. B3 and B5 both wait on a production environment existing. B6 is last. **F2 is RESOLVED and push state is in sync — neither is a blocker.**

**Release remains BLOCKED; phases 21/22/23 stay QUEUED.**

## Re-plan note (C00.13 closeout)
Phase 00 is closed. All of C00.1–C00.14 are complete: the reality check, version/metadata checks, the `.wrangler/` ignore, the five evidence-doc reconciliations (MOLLIE-VERIFICATION, GO-LIVE, HANDOFF, CHANGELOG, PROJECT-STATE), the Cloudflare/Git/secret audit, the nested-repo boundary fix (executed in `C:\dev` as `01ef174c`), the retirement of C00.11 as a false premise, pre-commit verification, and the approved commit itself. Phase 00's exit intent — trustworthy repository truth, metadata, docs, evidence and Git scope — is met. **Release remains BLOCKED; phases 21–23 stay QUEUED.** `BS2Mod-site` is fully pushed and in sync with `origin/main` at `183c580` — the earlier "1 commit ahead, not pushed" note in the C00.13 closeout records was stale and has been corrected. `C:\dev` is a different repository for different projects and is out of scope. Still open and approval-gated: the Cloudflare rebuild / `preview:cf` before any deploy (the staging Worker is stale and no local build evidence exists), `MOLLIE_ALLOW_LIVE=true`, and any live DB migration.

## Update rule
Keep this concise. Replace stale current facts; do not use it as a long history log.
