// Mock payment adapter — deterministic, no network, no credentials. Used for unit
// tests and as the safe default when no real provider is configured. It advertises
// a small capability set and exercises the same port as a real provider.

import type { PaymentProvider } from "../provider";
import { MINIMAL_CAPABILITIES } from "../capabilities";
import { money } from "../../money";
import type {
  PaymentEvent,
  PaymentInitiation,
  PaymentResult,
  PaymentSession,
  PaymentStatus,
} from "../types";

export interface MockPaymentProviderOptions {
  /** Force getStatus to return this status instead of the default "paid". */
  getStatusResult?: PaymentStatus;
}

export class MockPaymentProvider implements PaymentProvider {
  readonly id = "mock";
  readonly capabilities = {
    ...MINIMAL_CAPABILITIES,
    clientToken: true,
    signatureHeader: "x-webhook-signature",
  };

  private readonly getStatusResult: PaymentStatus;

  constructor(opts: MockPaymentProviderOptions = {}) {
    this.getStatusResult = opts.getStatusResult ?? "paid";
  }

  async createSession(init: PaymentInitiation): Promise<PaymentSession> {
    return {
      kind: "client_token",
      publicToken: `mock_token_${init.orderId}`,
      providerRef: `mock_ref_${init.orderId}`,
      providerId: this.id,
    };
  }

  async getStatus(providerRef: string): Promise<PaymentResult> {
    return { status: this.getStatusResult, providerRef };
  }

  async handleWebhook(raw: unknown): Promise<PaymentEvent | null> {
    // Mock webhooks: any payload with a type becomes a normalized paid event.
    const t = (raw as { type?: string } | null)?.type;
    if (!t) return null;
    return {
      type: "payment.paid",
      providerRef: `mock_ref_${t}`,
      occurredAt: new Date().toISOString(),
      idempotencyKey: `mock_${t}`,
    };
  }
}
