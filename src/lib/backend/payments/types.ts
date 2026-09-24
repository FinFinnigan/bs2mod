// Provider-neutral payment domain types.
// NO provider SDK types, IDs, status names or payloads may appear here — these
// are shared with the application/domain layer and must never leak Stripe/PSP
// specifics (ARCHITECTURE.md §6).

import type { Money as MoneyShape } from "@/lib/types";

// Re-export the §11 Money shape so backend modules import it from one place,
// while keeping it identical to the frozen UI contract (no new type).
export type Money = MoneyShape;

// Our own internal payment status names (never a provider's status string).
export type PaymentStatus =
  | "created"
  | "action_required"
  | "authorized"
  | "captured"
  | "paid"
  | "failed"
  | "cancelled"
  | "voided"
  | "refunded"
  | "partially_refunded"
  | "expired"
  | "disputed";

// Request to begin a payment. orderId is OUR internal order id, not a provider id.
export interface PaymentInitiation {
  orderId: string;
  amount: Money;
  customerRef?: string;
  returnUrl: string;
  method?: string; // provider-agnostic method hint ("card", "bank_transfer", ...)
  meta?: Record<string, string>;
}

// How the UI must continue the payment. Provider-agnostic: the presentation layer
// only branches on `kind`, never on which provider produced it.
export interface PaymentSession {
  kind: "redirect" | "client_token" | "off_session" | "none";
  url?: string; // provider-hosted payment page (redirect kind)
  publicToken?: string; // client-side token (client_token kind)
  providerRef: string; // provider-specific id — adapter-only metadata, not a domain id
  providerId: string; // which adapter produced this (for registry routing)
}

// Result of an operation, normalized into OUR status names.
export interface PaymentResult {
  status: PaymentStatus;
  providerRef?: string;
  raw?: unknown; // adapter-internal; must NOT be surfaced to UI/domain
}

// A normalized, provider-neutral event from a webhook (or poll). Deduplicated by
// the service before any state transition is applied.
export interface PaymentEvent {
  type: string; // provider-agnostic event type (see PaymentEventType below)
  providerRef: string;
  amount?: Money;
  status?: PaymentStatus;
  occurredAt: string; // ISO 8601
  idempotencyKey: string;
}

export type PaymentEventType =
  | "payment.authorized"
  | "payment.captured"
  | "payment.paid"
  | "payment.failed"
  | "payment.cancelled"
  | "payment.voided"
  | "payment.refunded"
  | "payment.partially_refunded"
  | "payment.action_required"
  | "payment.disputed";

// Throw when a provider does not support a capability. The service treats an
// unimplemented optional method the same way.
export class NotSupportedError extends Error {
  constructor(providerId: string, capability: string) {
    super(`Payment provider "${providerId}" does not support ${capability}`);
    this.name = "NotSupportedError";
  }
}

export class UnknownProviderError extends Error {
  constructor(providerId: string) {
    super(`No payment provider registered with id "${providerId}"`);
    this.name = "UnknownProviderError";
  }
}

export class InvalidTransitionError extends Error {
  constructor(from: PaymentStatus, to: PaymentStatus) {
    super(`Invalid payment state transition: ${from} -> ${to}`);
    this.name = "InvalidTransitionError";
  }
}
