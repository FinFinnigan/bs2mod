# Phase 23 — Go-live

## Outcome
Perform authorized release and production smoke tests.

## Focus
- deploy
- landing/catalog/cart/checkout/payment/confirmation
- admin
- builder
- rollback readiness

## Shape
1. `00-RECON.md`
2. `01-GENERATE-CHUNKS.md`
3. generated tiny chunks one-by-one via `NEXT.md`
4. `99-ACCEPTANCE.md`

Every launch runs agent-aware routing across all currently installed OMO agents.

Do not start unless `IMPLEMENTATION-MAP.md` marks this phase active.
