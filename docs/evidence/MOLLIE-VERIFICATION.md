# Mollie payment adapter — verification evidence

Created: 2026-09-22 (C00.5, from scratch).
Provenance: recorded strictly from the three current-tree evidence files listed below. Legacy `C:\dev\BoyShop` copies are historical reference only and were not used.

## Scope and boundaries

- This document records repository implementation/tests plus the non-secret runtime binding facts inspected in C01.09. It contains no secret values and makes no claim that a live payment succeeded.
- Payment processing remains **fail-closed for live mode**. C01.06 chose Mollie as the live provider; C01.09 conditionally authorized `MOLLIE_ALLOW_LIVE=true` for a future production environment only. Read-only Cloudflare inspection found `MOLLIE_API_KEY` and `MOLLIE_WEBHOOK_SECRET` secret bindings on staging, but their values/prefixes are hidden and the live flag is absent. Staging must remain fail-closed. Production activation requires operator confirmation of a `live_*` key and a controlled live E2E test; no live key exists in the repository.
- No secrets appear in this document. The only key material referenced is public test fixture data that already lives in the committed test file.

## Evidence files

| File | Role |
|---|---|
| `src/lib/backend/payments/adapters/mollie.ts` | Fetch-based Mollie adapter (no SDK dependency). All Mollie-specific API paths, status names, amount formatting, and webhook signature logic are isolated here (`ARCHITECTURE.md §11`). |
| `src/lib/backend/payments/__tests__/mollie.test.ts` | Vitest suite S1–S7 plus key-guard, handleWebhook, and capabilities suites. Every HTTP path is covered by an injected `fetch` stub; no real network calls ever reach Mollie. |
| `scripts/verify-e2e-payment.cjs` | E2E post-payment verification script: fetches the order, payments, and transitions for the order created via the deployed API E2E flow. |

## Adapter design facts (`mollie.ts`)

- **Activation guard:** the adapter is not registered unless configuration supplies a Mollie API key.
- **Fail-closed key guard:** `mollieKeyIssue(apiKey, allowLive = false)`:
  - `test_*` key → allowed.
  - `live_*` key → allowed only when `allowLive` is true; otherwise rejected with "Mollie API key has a live_* prefix but live mode is not authorized (MOLLIE_ALLOW_LIVE=true)".
  - any other prefix (or empty) → rejected with "Mollie API key must start with test_ or live_".
  - The constructor throws the same issue rather than proceeding with an unusable key (verified: throws on `live_*` without `allowLive`; accepts `test_*` and `live_*` with `allowLive`).
- **Config surface** (`MollieAdapterConfig`): `apiKey` (required), `webhookSecret?`, `allowLive?` (default `false` → live fail-closed), `baseUrl?` (default `https://api.mollie.com/v2`), `fetchImpl?` (tests only).
- **REST calls** use `Authorization: Bearer <apiKey>`; body-bearing calls add `Content-Type: application/json`.
- **Error behavior:** network failure, non-2xx response, and invalid JSON all throw a wrapped `Mollie request failed: ...` error; `createSession` throws if the response lacks an id or checkout URL; `getStatus` throws on an unmapped status.

## Capability set (`MOLLIE_CAPABILITIES`)

| Capability | Value |
|---|---|
| authCapture | `automatic` |
| refund | `true` |
| partialRefund | `true` |
| voidBeforeCapture | `false` |
| hostedRedirect | `true` (Mollie Checkout hosts the payment page) |
| clientToken | `false` |
| offSession | `false` |
| webhooks | `true` |
| asyncSettlement | `true` (e.g. bank transfer settles asynchronously) |
| statusPolling | `true` |
| signatureHeader | `X-Mollie-Signature` |

Test also asserts `MOLLIE_CAPABILITIES.defaultMethod` is `undefined`.

## Status mapping (`MOLLIE_TO_STATUS`)

Mollie vocabulary is allowed only inside the adapter; it maps into neutral `PaymentStatus`:

| Mollie status | PaymentStatus |
|---|---|
| `open` | `action_required` |
| `pending` | `action_required` |
| `authorized` | `authorized` |
| `paid` | `paid` |
| `canceled` | `cancelled` |
| `expired` | `expired` |
| `failed` | `failed` |
| `refunded` | `refunded` |
| `partially_refunded` | `partially_refunded` |

## Event mapping (`MOLLIE_STATUS_TO_EVENT`)

| Mollie status | PaymentEventType |
|---|---|
| `open` / `pending` | `payment.action_required` |
| `authorized` | `payment.authorized` |
| `paid` | `payment.paid` |
| `canceled` | `payment.cancelled` |
| `expired` | `payment.expired` |
| `failed` | `payment.failed` |
| `refunded` | `payment.refunded` |
| `partially_refunded` | `payment.partially_refunded` |

## Amount handling

- `moneyToMollieAmount` → Mollie's two-decimal string, using `Math.round` on minor units (no `toFixed`): `22.95`→`"22.95"`, `68`→`"68.00"`, `1000.005`→`"1000.01"` (documented half-cent rounding).
- `mollieAmountToMoney` → parse decimal string to major-unit `Money` (default currency EUR): `"22.95"`→`22.95`, `"22.3"`→`22.3`, `"22.999"`→`23`, `"0"`→`0`; explicit currency is honored.
- Internal `minorFromString` parses `"22.95"` → integer minor units `2295` (used for refund state comparison).

## Webhook signature verification

- `verifyMollieSignature(rawBody, signature, secret)`: constant-time HMAC-SHA256 comparison (`timingSafeEqual`).
- Accepts Mollie's `sha256=<hex>` header format and a bare hex digest (backward compatible).
- Returns `false` (never throws) when the secret or the signature is missing.
- Applied **only when a signature is present.** Classic Mollie webhooks carry no signature (the authenticated fetch is the security control) and are accepted; a signed request that cannot be verified is rejected, never accepted.

## Webhook handling (`handleWebhook`)

- Parses three body shapes: classic form-encoded (`id=...`), JSON `id`, and next-gen JSON events where the changed entity reference is `entityId` (the event `id`, e.g. `evt_...`, is never treated as the payment id).
- **Never trusts the webhook body status** — it fetches the authoritative payment from the Mollie API and maps the response (a stale body claiming `open` yields `payment.paid` when the API says `paid`).
- Returns a normalized `PaymentEvent` with `idempotencyKey: "mollie_<paymentId>"`; `occurredAt` uses `paidAt ?? createdAt ?? now`.
- Unknown/unmapped status or missing body id → `null`.

## Refund behavior

- `refund(providerRef, amount?)` POSTs `/payments/{ref}/refunds`; the amount body is omitted when no amount is given (full refund).
- Authoritative final state comes from re-fetching the payment and comparing `refunded` vs total amount: `refunded < total` → `partially_refunded`, otherwise `refunded`.

## Test suite verification (`mollie.test.ts`, 40 Vitest cases, `BASE = https://api.mollie.com/v2`, `API_KEY = test_abc`)

| Suite | Verifies |
|---|---|
| S1 `moneyToMollieAmount` (2) | format to two-decimal string; documented half-cent rounding via `Math.round` |
| S2 `mollieAmountToMoney` (2) | parse decimal strings incl. `"22.3"`, `"22.999"`, `"0"`; explicit currency |
| S3 status maps (3) | full `MOLLIE_TO_STATUS` and `MOLLIE_STATUS_TO_EVENT` mappings; unknown → `undefined` |
| S4 `verifyMollieSignature` (4) | accepts correct `sha256=<hex>`; accepts bare hex; rejects wrong key; `false` when secret/signature missing |
| S5 `createSession` (3) | POST `/payments` with Bearer auth and body `{amount, description "Order ord_1", redirectUrl}`; optional `method` only when set; throws when checkout URL missing |
| S6 `getStatus` (4) | GET `/payments/{ref}` maps status; async `banktransfer` `open` → `action_required` (never `paid`); typed errors for HTTP 500 and network reject |
| S7 `refund` (3) | partial refund → `partially_refunded`; full refund → `refunded`; amount body omitted when not given |
| key guard (6) | `test_*` accepted; `live_*` rejected without `allowLive`; accepted with it; `""` / `prod_xyz` rejected; constructor throws on `live_*` without `allowLive` |
| `handleWebhook` (12) | classic unsigned accepted (with and without a configured secret); form body parsed; signed-but-unverifiable → `null`; malformed JSON → `null`; no id → `null`; next-gen `entityId` used over event id; full normalized event; authoritative GET overrides stale body status; `canceled`/`failed` mapping |
| capabilities (1) | exact capability set; `defaultMethod` undefined |

## E2E verification script (`verify-e2e-payment.cjs`)

- Purpose: verify the E2E payment webhook result — fetch order + payment + transitions for the order created via the deployed API E2E flow.
- Inputs: loads `DATABASE_URL` from `.env.local` when that file exists (existing env vars are never overwritten; no such file exists in the tree today); order id from `ORDER_ID` env, else argv[2], else the E2E default `ord_56058dfa7b8cd442f0fe6f3e27023e3b`.
- Queries (via `@neondatabase/serverless`):
  - `orders` — `id, status, total, currency, created_at, updated_at`
  - `payments` — `id, order_id, provider_id, provider_ref, status, amount, currency, idempotency_key, created_at, updated_at` ordered by `created_at`
  - `payment_transitions` — `id, payment_id, from_state, to_state, provider_ref, idempotency_key, occurred_at` ordered by `occurred_at`
  - `order_transitions` — `id, order_id, from_state, to_state, idempotency_key, occurred_at` ordered by `occurred_at`
- Output: pretty-printed JSON `{ order, payments, transitions, orderTransitions }`; failures print stack and exit `1`.

## Open gaps / not documented here

- **Live-mode behavior is NOT verified.** No live Mollie transaction, live webhook, or production settlement has been exercised. C01.09 is conditional authorization only, not verification or activation.
- The adapter has not been exercised against the real Mollie API in this tree; all HTTP behavior is proven by injected-fetch tests only.
- End-to-end script execution requires `DATABASE_URL` supplied via environment (e.g. a local `.env.local` if the operator creates one; no such file exists in the tree today) and an order created by a prior deployed E2E flow.
