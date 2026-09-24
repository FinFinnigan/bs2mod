# CURRENT-STATE — BoyShop / BS2Mod

Last refreshed: 2026-09-24 (C00.4 stale-paperwork audit)

## Active phase
Phase 00 — Repo stabilization

## Verified repo truth (2026-09-24)
- `BS2Mod-site` is now its own git repository (own `.git`; `rev-parse --show-toplevel` → `C:/dev/BS2Mod-site`)
- branch `main`, HEAD `988f7f4` (merge of `codex/miski2-theme`); nested history: initial import, Miski2/Miski3 themes, C02.04 closeout
- doc-claimed parent-landing commit `140cf921` (and `5ed1e84`, `026e70ad`) are NOT present in this nested repo
- `package.json` + `package-lock.json` both `0.11.1`; no `VERSION` file (version lives in `package.json`); working tree clean for both
- `docs/evidence/*` (HANDOFF, PROJECT-STATE, CHANGELOG, GO-LIVE, MOLLIE-VERIFICATION) are COMMITTED and clean at HEAD; status PRE-LAUNCH / release blocked
- synchronized decision records (C01.06–C01.10, incl. `MOLLIE_ALLOW_LIVE=true` rationale in GO-LIVE) ARE committed at HEAD — the docs' "uncommitted" wording is stale
- `.env.local` now EXISTS on disk (343 B, 2026-09-24 08:17, gitignored in nested and parent repo); MOLLIE-VERIFICATION.md "no such file exists" statement is stale
- `/.open-next/` and `.wrangler/` gitignored; `wrangler.jsonc` holds vars only; no local CF build evidence
- no `MODALITY_WORKBOOK.md`, no `opencode.json`, no repo-root `AGENTS.md`; root visual PNGs exist and are gitignored

## Working tree (uncommitted, approval-gated)
- tracked `BOYSHOP-NEW-WORKFLOW-PACK/` deleted (~290 files) — ownership/decision gate
- modified: `src/app/admin/(protected)/products/actions.ts`, `product-form.tsx`
- untracked: `BOYSHOP-NEW-WORKFLOW-PACK-ULW-GATE*`, dev-server logs, `references/MISKI2-*`, products `__tests__/`

## Current execution
`chunks/00-repo-stabilization/C00.4-audit-stale-paperwork.md` — COMPLETE (read-only audit; findings reported, docs untouched)

## Next execution
`chunks/00-repo-stabilization/C00.5-update-mollie-paperwork.md`

## Update rule
Keep this concise. Replace stale current facts; do not use it as a long history log.