# NEXT — BoyShop / BS2Mod

## Mandatory launch gate

Before execution, run:

`ROUTING-PREFLIGHT.md`

This must discover and evaluate **all currently installed OMO agents** for this chunk.

## Execute exactly this chunk

`chunks/02-inventory/C02.04-authoritative-availability-rule.md`

Phase 02 chunk 4 — one authoritative availability rule: `variants.stock` becomes the single source of truth; a shared `isInStock()` helper derives availability, all availability readers (storefront card, cart card, admin record) and stock-touching writers (create/update admin product in Drizzle + memory repos) use it, so product-level `inStock` can no longer disagree with variant stock. No schema changes; the column is retained (removing it is out of scope).

Why: C02.03 locked non-negative `variants.stock` in the database, but product `inStock` is still a stored boolean that can disagree with variant quantities (a known supporting gap from Phase 02 reconnaissance). C02.04 removes that disagreement with a shared derivation and introduces `isInStock()`.

## Do not continue automatically

After this chunk:
- exactly one chunk executed;
- `NEXT.md` points to exactly the next chunk (C02.05 `admin-variant-stock-editing`);
- STOP.