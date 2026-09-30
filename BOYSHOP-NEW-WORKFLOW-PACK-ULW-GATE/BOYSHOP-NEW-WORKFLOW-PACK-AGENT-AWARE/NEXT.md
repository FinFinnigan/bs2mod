# NEXT — BoyShop / BS2Mod

## Mandatory launch gate

Before execution, run:

`ROUTING-PREFLIGHT.md`

This must discover and evaluate **all currently installed OMO agents** for this chunk.

## Execute exactly this chunk

`chunks/01-existing-release-blockers/C01.00-release-blocker-recon.md`

Phase 00 (repo stabilization) is **COMPLETE**. C00.13 closed it with commit `a0f31c6` (13 approved paths, explicit-path staging, never `git add -A`):

- **Scope**: 13 files — `.gitignore`, 5 evidence docs, CURRENT-STATE / IMPLEMENTATION-MAP / NEXT / phase-00 INDEX, chunk records C00.9 / C00.10, and the new C00.14 boundary record. Zero product/source/config/dependency change.
- **Post-commit regression**: PASSED — `tsc --noEmit` exit 0; 325 tests passed / 6 skipped across 37 files, exit 0 (identical to the C00.12 baseline, no regression).
- **F1 RESOLVED**: `docs/evidence/HANDOFF.md` no longer claims `.wrangler/` is "not gitignored"; it now matches `.gitignore:10` (`/.wrangler/`, confirmed via `git check-ignore -v .wrangler/`) and records the C00.5–C00.13 docs/evidence commit.
- **F2 still OPEN by design**: the 6 local artifacts (2 zips, 2 logs, MISKI2 zip + dir) remain untracked and NOT gitignored, so explicit-path staging stays mandatory.

Repo state: `BS2Mod-site` `main` is **in sync with `origin/main`** and fully pushed. HEAD is `70d10f8` ("Phase 00 closeout: sync control docs to commit `a0f31c6`; open phase 01 with C01.00 recon"), which contains `a0f31c6`. Verified against the live remote with `git ls-remote origin refs/heads/main` → `70d10f8`, identical to local HEAD; `git log origin/main..HEAD` is empty. **There is nothing left to push in this repository.**

`C:\dev` is a **different repository belonging to different projects** (`origin FinFinnigan/dev.git`; it holds Clix, GPP-site, Helios, leroy, Microsites). It no longer contains this project — commit `01ef174c` untracked all 481 `BS2Mod-site/**` paths, and `git ls-files -- BS2Mod-site` there now returns zero files. Its 2 unpushed commits belong to GPP and to that untracking itself. **They are out of scope for this project and must not be pushed as part of BS2Mod-site work.**

C01.00 is READ-ONLY: it re-verifies every release blocker against live repo truth, records proof / approval-gate status / what each blocker gates, orders them by dependency, and generates only the tiny phase-01 chunks the evidence justifies. It is **not** the broad release audit and does not authorize a deploy, push, live payment activation, or DB migration.

## Do not continue automatically

After C01.00:

- commit with explicit-path staging only (never `git add -A`, never secrets);
- verify;
- update current state/map;
- dynamically choose or create exactly one next chunk;
- rewrite `NEXT.md`;
- STOP.

Still open and outside these chunks, each needing its own approval: the Cloudflare rebuild / `preview:cf` before any deploy (the staging Worker is stale and no local build evidence exists); `MOLLIE_ALLOW_LIVE=true`; any live DB migration. **Pushing `BS2Mod-site` is no longer an open item — it is done and verified in sync.** Any future `C:\dev` push belongs to other projects and is out of scope here.
