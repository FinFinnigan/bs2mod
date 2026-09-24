// The PaymentProvider port. This is the single, provider-neutral contract every
// payment adapter implements. Core commerce logic references THIS interface only;
// concrete adapters (Stripe, Mollie, Adyen, PayPal, Mock) sit behind it
// (ARCHITECTURE.md §6).

import type {
  PaymentCapabilities,
} from "./capabilities";
import type {
  PaymentEvent,
  PaymentInitiation,
  PaymentResult,
  PaymentSession,
  Money,
} from "./types";

export interface PaymentProvider {
  readonly id: string;
  readonly capabilities: PaymentCapabilities;

  // Begin a payment. Returns the provider-agnostic session describing how the UI
  // must continue (redirect / client_token / off_session).
  createSession(init: PaymentInitiation): Promise<PaymentSession>;

  // Poll the provider for authoritative status (used when no webhook or for
  // reconciliation). Maps provider status into OUR PaymentStatus names.
  getStatus(providerRef: string): Promise<PaymentResult>;

  // Optional operations. A provider that lacks a capability omits the method; the
  // service treats it as unsupported and never calls it.
  authorize?(providerRef: string, amount?: Money): Promise<PaymentResult>;
  capture?(providerRef: string, amount?: Money): Promise<PaymentResult>;
  void?(providerRef: string): Promise<PaymentResult>;
  refund?(providerRef: string, amount?: Money): Promise<PaymentResult>;

  // Handle an inbound webhook. The adapter verifies the signature and returns a
  // normalized PaymentEvent, or null when the event is not relevant to us.
  handleWebhook(raw: unknown, signature: unknown): Promise<PaymentEvent | null>;
}
