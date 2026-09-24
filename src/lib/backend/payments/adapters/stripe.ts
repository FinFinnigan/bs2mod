// Stripe payment adapter — the FIRST concrete adapter, test-mode only.
//
// Provider-specific everything lives HERE and nowhere else: the Stripe SDK import,
// Stripe status names, PaymentIntent/Checkout-Session field mapping, and the webhook
// signature check. The rest of the app never sees a Stripe type (ARCHITECTURE.md §11).
//
// It is NOT activated unless configuration supplies a Stripe secret key, and it is
// test-mode only until the CEO separately authorizes live credentials.

import Stripe from "stripe";
import type { PaymentProvider } from "../provider";
import type { PaymentCapabilities } from "../capabilities";
import type {
  PaymentEvent,
  PaymentInitiation,
  PaymentResult,
  PaymentSession,
  Money,
  PaymentStatus,
} from "../types";

export interface StripeAdapterConfig {
  secretKey: string;
  webhookSecret?: string;
  apiVersion?: string;
}

export const STRIPE_CAPABILITIES: PaymentCapabilities = {
  authCapture: "automatic",
  refund: true,
  partialRefund: true,
  voidBeforeCapture: true,
  hostedRedirect: true, // Stripe Checkout Sessions redirect to a hosted page
  clientToken: true, // PaymentIntent client_secret for a drop-in/Elements flow
  offSession: true,
  webhooks: true,
  asyncSettlement: false,
  statusPolling: true,
  defaultMethod: "card", // Checkout Sessions default to card
  signatureHeader: "stripe-signature",
};

// Stripe's own status names, mapped into OUR neutral PaymentStatus. This is the
// only place Stripe status vocabulary is allowed to appear.
const STRIPE_TO_STATUS: Record<string, PaymentStatus> = {
  requires_payment_method: "created",
  requires_confirmation: "created",
  requires_action: "action_required",
  requires_capture: "authorized",
  processing: "authorized",
  succeeded: "paid",
  canceled: "cancelled",
  refunded: "refunded",
  partially_refunded: "partially_refunded",
  failed: "failed",
};

export class StripePaymentProvider implements PaymentProvider {
  readonly id = "stripe";
  readonly capabilities = STRIPE_CAPABILITIES;
  private stripe: Stripe;
  private webhookSecret?: string;

  constructor(config: StripeAdapterConfig) {
    this.stripe = new Stripe(config.secretKey, {
      apiVersion: (config.apiVersion as Stripe.LatestApiVersion) ?? "2025-03-31.basil",
    });
    this.webhookSecret = config.webhookSecret;
  }

  async createSession(init: PaymentInitiation): Promise<PaymentSession> {
    // Redirect-hosted flow via Checkout Session — provider-hosted, no card data
    // touches our servers.
    const session = await this.stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: init.amount.currency.toLowerCase(),
            unit_amount: Math.round(init.amount.amount * 100),
            product_data: { name: `Order ${init.orderId}` },
          },
        },
      ],
      client_reference_id: init.orderId,
      success_url: init.returnUrl,
      cancel_url: init.returnUrl,
      metadata: init.meta ?? {},
    });

    return {
      kind: "redirect",
      url: session.url ?? undefined,
      providerRef: session.id,
      providerId: this.id,
    };
  }

  async getStatus(providerRef: string): Promise<PaymentResult> {
    // Reconcile from the authoritative Checkout Session.
    const session = await this.stripe.checkout.sessions.retrieve(providerRef);
    const intentId =
      typeof session.payment_intent === "string" ? session.payment_intent : undefined;
    if (intentId) {
      const intent = await this.stripe.paymentIntents.retrieve(intentId);
      return { status: mapStripeStatus(intent.status), providerRef: intent.id };
    }
    return { status: mapStripeStatus(session.status ?? ""), providerRef };
  }

  async refund(providerRef: string, amount?: Money): Promise<PaymentResult> {
    const intentId = await this.resolveIntentId(providerRef);
    const refund = await this.stripe.refunds.create({
      payment_intent: intentId,
      ...(amount ? { amount: Math.round(amount.amount * 100) } : {}),
    });
    return { status: mapStripeStatus(refund.status ?? "succeeded"), providerRef };
  }

  async handleWebhook(raw: unknown, signature: unknown): Promise<PaymentEvent | null> {
    if (!this.webhookSecret) return null;
    const payload = raw as string | Buffer;
    const sig = signature as string | string[];
    const event = this.stripe.webhooks.constructEvent(payload, sig, this.webhookSecret);
    return stripeEventToPaymentEvent(event);
  }

  private async resolveIntentId(providerRef: string): Promise<string> {
    // If we hold a PaymentIntent id, use it; otherwise resolve via the Checkout
    // Session's payment_intent.
    if (providerRef.startsWith("pi_")) return providerRef;
    const session = await this.stripe.checkout.sessions.retrieve(providerRef);
    const intentId =
      typeof session.payment_intent === "string" ? session.payment_intent : undefined;
    if (!intentId) throw new Error(`No payment intent for session ${providerRef}`);
    return intentId;
  }
}

function mapStripeStatus(status: string): PaymentStatus {
  return STRIPE_TO_STATUS[status] ?? "created";
}

function stripeEventToPaymentEvent(event: Stripe.Event): PaymentEvent | null {
  switch (event.type) {
    case "payment_intent.succeeded": {
      const pi = event.data.object as Stripe.PaymentIntent;
      return {
        type: "payment.paid",
        providerRef: pi.id,
        amount: { amount: (pi.amount ?? 0) / 100, currency: pi.currency.toUpperCase() },
        status: "paid",
        occurredAt: new Date(event.created * 1000).toISOString(),
        idempotencyKey: `stripe_${event.id}`,
      };
    }
    case "payment_intent.payment_failed": {
      const pi = event.data.object as Stripe.PaymentIntent;
      return {
        type: "payment.failed",
        providerRef: pi.id,
        status: "failed",
        occurredAt: new Date(event.created * 1000).toISOString(),
        idempotencyKey: `stripe_${event.id}`,
      };
    }
    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const refunded = charge.refunded && charge.amount_refunded > 0;
      return {
        type: refunded && charge.amount_refunded < charge.amount ? "payment.partially_refunded" : "payment.refunded",
        providerRef: typeof charge.payment_intent === "string" ? charge.payment_intent : charge.id,
        amount: { amount: (charge.amount_refunded ?? 0) / 100, currency: charge.currency.toUpperCase() },
        status: refunded && charge.amount_refunded < charge.amount ? "partially_refunded" : "refunded",
        occurredAt: new Date(event.created * 1000).toISOString(),
        idempotencyKey: `stripe_${event.id}`,
      };
    }
    default:
      return null;
  }
}
