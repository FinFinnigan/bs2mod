# NEXT — BoyShop / BS2Mod

## Mandatory launch gate

Before execution, run:

`ROUTING-PREFLIGHT.md`

This must discover and evaluate **all currently installed OMO agents** for this chunk.

## Execute exactly this chunk

`chunks/01-existing-release-blockers/C01.01-evidence-docs-fork-reconciliation.md`

Phase 00 (repo stabilization) is **COMPLETE**. C00.13 closed it with commit `a0f31c6` (13 approved paths, explicit-path staging, never `git add -A`):

- **Scope**: 13 files — `.gitignore`, 5 evidence docs, CURRENT-STATE / IMPLEMENTATION-MAP / NEXT / phase-00 INDEX, chunk records C00.9 / C00.10, and the new C00.14 boundary record. Zero product/source/config/dependency change.
- **Post-commit regression**: PASSED — `tsc --noEmit` exit 0; 325 tests passed / 6 skipped across 37 files, exit 0 (identical to the C00.12 baseline, no regression).
- **F1 RESOLVED**: `docs/evidence/HANDOFF.md` no longer claims `.wrangler/` is "not gitignored"; it now matches `.gitignore:10` (`/.wrangler/`, confirmed via `git check-ignore -v .wrangler/`) and records the C00.5–C00.13 docs/evidence commit.
- **F2 RESOLVED (2026-09-30)**: the 6 local artifacts (2 pack zips, 2 dev-server logs, MISKI2 zip + dir) are now **gitignored** (`.gitignore:64,65,68,69,74,75`, each verified with `git check-ignore -v`) and `git status` is clean. 0 tracked files match the new rules; the pack folder's 133 tracked files and `public/templates/miski2.css` are intact (408 tracked files total). Explicit-path staging stays mandatory as a rule, but is no longer forced by untracked strays.

**C01.00 (phase-01 release-blocker recon, READ-ONLY) is COMPLETE.** It changed nothing and established the authoritative blocker record, now written into `IMPLEMENTATION-MAP.md`:

- **Owner fork clarification**: the five `docs/evidence/*` docs describe the **previous version that was forked into this folder**. Their commit anchors, commit counts, HEAD claims, "uncommitted" claims, the Neon `boyshop`/`boyshop/main` production-candidate claim and the Cloudflare staging claim are **stale-by-fork and are not being chased**. Legacy `C:\dev\BoyShop` and the old Neon project are out of scope.
- **Five ordered blockers (B4 resolved 2026-09-30)**: **B1** no Cloudflare **deploy** performed for this fork (local build + bundle-validation evidence NOW EXISTS; operator, approval-gated) → the deploy is the prerequisite for B2; **B2** staging Worker serves the pre-fork version (now technically unblocked, but no deploy is authorized) → blocks staging as a review/demo target; **B3** live payment not authorized (`MOLLIE_ALLOW_LIVE` absent) — CEO; **B5** production domain/hosting not authorized — CEO; **B6** release phases 21–23 not authorized — CEO, last. **B4 is RESOLVED:** the production database is identified as Neon **`boyshop`** (`weathered-truth-98011402`, branch `main`) — the earlier "HTTP 404 project not found" reading was a **faulty lookup** and has been corrected. Order: B1 → B2; B3 and B5 wait on a production environment; B6 last.
- **Not blockers**: **F2 is RESOLVED** (the 6 artifacts stay gitignored) and **push state is in sync**. Neither is a release blocker.
- **Consequence for phase 01**: every remaining blocker is approval-gated or owner-input, so exactly one non-gated chunk is justified — C01.01.

C01.01 is **docs only**: it reconciles the five `docs/evidence/*` docs to this fork's live truth. Zero product/source/config/dependency/secret change. It is **not** the broad release audit and does not authorize a deploy, push, live payment activation, or DB migration.

Repo state: at the **C01.00 recon baseline** `BS2Mod-site` `main` was **in sync with `origin/main`** and fully pushed, HEAD `183c580` with **12 commits** (`183c580` … `0342c4c`); the post-phase-00 chain is `a0f31c6` (C00.13) → `70d10f8` → `f074a44` → `183c580`, so the phase-00 evidence corrections and the F2 closure are all committed and on the remote. That was verified then with `git ls-remote origin refs/heads/main` → `183c580`, identical to local HEAD, and `git log origin/main..HEAD` empty. **Since then the 2026-09-30 B4/B1 correction advances HEAD to `2746d7d` (13 commits).**

`C:\dev` is a **different repository belonging to different projects** (`origin FinFinnigan/dev.git`; it holds Clix, GPP-site, Helios, leroy, Microsites). It no longer contains this project — commit `01ef174c` untracked all 481 `BS2Mod-site/**` paths, and `git ls-files -- BS2Mod-site` there now returns zero files. Its 2 unpushed commits belong to GPP and to that untracking itself. **They are out of scope for this project and must not be pushed as part of BS2Mod-site work.**

## Do not continue automatically

After C01.01:

- commit with explicit-path staging only (never `git add -A`, never secrets);
- verify;
- update current state/map;
- dynamically choose or create exactly one next chunk;
- rewrite `NEXT.md`;
- STOP.

Still open and outside these chunks, each needing its own approval: the Cloudflare **deploy** (local build/bundle evidence now EXISTS — 2026-09-30; the staging Worker still serves the pre-fork version); `MOLLIE_ALLOW_LIVE=true`; any live DB migration. **The production database is no longer an open item — it is identified: Neon `boyshop` (`weathered-truth-98011402`, branch `main`); B4 is RESOLVED and the earlier 404 was a faulty lookup.** **Pushing `BS2Mod-site` is not an open item** — the repo was in sync at the recon baseline, and the 2026-09-30 correction commits were pushed with owner approval. Any future `C:\dev` push belongs to other projects and is out of scope here.
