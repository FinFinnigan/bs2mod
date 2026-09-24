# DECISION-GATES

Stop for explicit user/CEO approval where applicable:
- Git commit/tag/push;
- live DB migration;
- `MOLLIE_ALLOW_LIVE=true`;
- production payment activation;
- production/live-impacting deployment;
- destructive database action;
- destructive replacement/deletion of approved template/layout;
- ambiguous-file ownership;
- material new dependency/provider commitment;
- model/provider escalation when user authorization is required;
- scope expansion beyond the active chunk.

A blocked decision becomes the single `NEXT.md` item when nothing else can safely proceed.

## Resolved decisions

- **2026-09-23 (C01.06) — Live payment provider = Mollie live (CEO choice 1).** Production secret provisioning (`live_*` key + webhook secret, production environment only, **never in the repository**) and a live end-to-end payment test are still required before real money can be taken. `MOLLIE_ALLOW_LIVE=true` remains a **separate** gate (C01.09) — this decision does not pre-grant it. Mock stays the verified default until activation. Stripe was **not** chosen (adapter exists but is unverified; would need its own recon + chunks).
- **2026-09-23 (C01.07) — Production domain/hosting = staging on workers.dev first (CEO choice 3).** Hosting provider = **Cloudflare Workers** (existing `wrangler.jsonc` + OpenNext + deployed `boyshop-test` worker; Netlify stub not chosen). Staging hostname = **`boyshop-test.i-janajoe.workers.dev`** (already live over HTTPS, account subdomain `i-janajoe`, no DNS work needed). The final brand production domain is **explicitly deferred** — none of the account zones (clixshop.eu/.nl, jijslaagtvandaag.nl, slimslagen.nl, surinyami.nl, taxisaid.nl) is a BoyShop domain; no zone is bound to the BoyShop worker. Binding a final custom domain = a later CEO decision. No deploy/DNS/TLS action taken in this chunk.
- **2026-09-23 (C01.08) — Existing Neon `boyshop/main` = production candidate (CEO choice 1, revised after live inspection).** Read-only Neon inspection found project `boyshop` (`weathered-truth-98011402`), branch `main` (`br-soft-smoke-zar070gn`), database `neondb`, all 14 BoyShop tables, and six Drizzle migration records already present. No restore snapshot or separate test branch exists. This decision **does not authorize or run a migration now**. Before any future schema change: create a restore snapshot, create a separate test branch, verify repository schema/migrations against the database, test there, and obtain explicit migration approval. The prior paperwork claim that no live schema had been applied was false and is superseded by this inspection.
- **2026-09-23 (C01.09) — `MOLLIE_ALLOW_LIVE=true` conditionally authorized for production only (CEO choice 1).** Read-only Cloudflare inspection found `MOLLIE_API_KEY` and `MOLLIE_WEBHOOK_SECRET` secret bindings on `boyshop-test`, but secret values are hidden and the key prefix cannot be verified; `MOLLIE_ALLOW_LIVE` is absent. The current Worker is authorized as staging only (C01.07), so the flag **must remain absent there**. It may be added only after a separate production environment exists, an operator confirms its secret key starts with `live_`, and a controlled live end-to-end payment test is ready. This decision did not change any Worker binding, secret, deployment, or payment state.
