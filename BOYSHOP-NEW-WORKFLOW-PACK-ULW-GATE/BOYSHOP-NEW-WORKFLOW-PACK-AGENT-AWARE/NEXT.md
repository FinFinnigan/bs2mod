# NEXT — BoyShop / BS2Mod

## Mandatory launch gate

Before execution, run:

`ROUTING-PREFLIGHT.md`

This must discover and evaluate **all currently installed OMO agents** for this chunk.

## Execute exactly this chunk

`chunks/00-repo-stabilization/C00.13-approved-commit.md`

C00.12 (pre-commit verification) is COMPLETE — verification only, no commit. All checks passed:

- **Scope**: 12 modified files, every one docs/evidence/pack/.gitignore — zero product/source/config change.
- **Secrets**: clean (the 2 `neon-url-pw` pattern hits are doc text describing C00.10's scan, not credentials).
- **Excluded visuals**: root PNGs exist, ignored, untracked; the 13 tracked images are legit assets, none at root.
- **Typecheck**: PASSED (`tsc --noEmit`). **Tests**: PASSED (325 passed / 6 skipped, 37 files).
- **`.wrangler/` ignore**: CONFIRMED at `.gitignore:10:/.wrangler/`.

Two findings recorded in CURRENT-STATE.md / IMPLEMENTATION-MAP.md:

- **F1 — HANDOFF.md stale**: lines 104/117–121/145 claim `.wrangler/` is "not gitignored" / "Release remains BLOCKED", contradicting `.gitignore:10`, CHANGELOG.md:91, GO-LIVE.md:182/242, PROJECT-STATE.md:73. Doc correction is a candidate for C00.13 scope.
- **F2 — artifact sweep hazard**: 6 untracked artifacts (2 zips, 2 logs, MISKI2 zip + dir) are NOT gitignored. `git add -A` is forbidden by the permanent rules — explicit-path staging only.

C00.13 is the approved commit of the verified working tree. **It requires explicit user approval before any commit.** Suggested scope: the 12 verified modified files + the C00.14 chunk file (untracked, belongs in the repo), optionally folding in the F1 HANDOFF.md fix. The 6 artifact entries (F2) stay untracked.

## Do not continue automatically

After C00.13 (once approved):

- commit with explicit-path staging only (never `git add -A`, never secrets);
- verify;
- update current state/map;
- dynamically choose or create exactly one next chunk;
- rewrite `NEXT.md`;
- STOP.

Still open and outside these chunks: pushing `C:\dev` to `origin/main` (its own approval, not yet granted), and the Cloudflare rebuild/`preview:cf` before any deploy, which remains an approval-gated operator step.