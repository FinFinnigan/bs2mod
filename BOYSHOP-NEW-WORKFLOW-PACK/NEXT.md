# NEXT — BoyShop / BS2Mod

## Mandatory launch gate

Before execution, run:

`ROUTING-PREFLIGHT.md`

This must discover and evaluate **all currently installed OMO agents** for this chunk.

## Execute exactly this chunk

`chunks/02-inventory/C02.05-admin-variant-stock-editing.md`

Phase 02 chunk 5 — admin variant-stock editing: per-variant quantity inputs in the admin product edit form (`product-form.tsx` ~lines 208–216), `productFields()` (`actions.ts` ~line 82) reads them, saving updates `variants.stock` through the existing validated mutation path; availability reads flow through the C02.04 rule without toggling the product-level flag.

Why: C02.04 made variant quantities the single source of truth for availability, but the admin form still exposes only the product-level `inStock` flag, not per-variant quantities — C02.05 closes that known supporting gap.

## Do not continue automatically

After this chunk:
- exactly one chunk executed;
- `NEXT.md` points to exactly the next chunk, determined at C02.05 closeout — C02.05 is the last of the five generated chunks, then C02.99 phase-02 acceptance;
- STOP.