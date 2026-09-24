// PaymentService — owns internal payment IDs + the state machine. It talks ONLY to
// the PaymentProvider port and the PaymentStore; it never imports a provider SDK
// (ARCHITECTURE.md §5, §8, §9).

import { paymentRegistry, type PaymentProviderRegistry } from "./registry";
import { canTransition, transition, isTerminal } from "./state-machine";
import type { PaymentProvider } from "./provider";
import type {
  PaymentInitiation,
  PaymentResult,
  PaymentStatus,
  PaymentEvent,
  PaymentSession,
  Money,
} from "./types";
import { NotSupportedError } from "./types";
import type { PaymentStore, PaymentRecord } from "./store";

export interface PaymentServiceDeps {
  registry?: PaymentProviderRegistry;
  store: PaymentStore;
  now?: () => Date;
}

export class PaymentService {
  private registry: PaymentProviderRegistry;
  store: PaymentStore;
  private now: () => Date;

  constructor(deps: PaymentServiceDeps) {
    this.registry = deps.registry ?? paymentRegistry;
    this.store = deps.store;
    this.now = deps.now ?? (() => new Date());
  }

  private providerFor(id: string): PaymentProvider {
    return this.registry.get(id);
  }

  /**
   * The provider's declared default payment method hint, or undefined when it
   * declares none. Checkout consults this instead of hardcoding provider ids.
   */
  defaultMethod(providerId: string): string | undefined {
    return this.providerFor(providerId).capabilities.defaultMethod;
  }

  /**
   * Create a payment for an order. Idempotent: reusing the same idempotencyKey
   * returns the existing payment instead of creating a duplicate.
   */
  async create(init: PaymentInitiation, opts: { providerId: string; idempotencyKey: string }): Promise<PaymentRecord> {
    const existing = await this.store.getByIdempotencyKey(opts.idempotencyKey);
    if (existing) return existing;

    const provider = this.providerFor(opts.providerId);
    const record: PaymentRecord = {
      id: `pay_${opts.idempotencyKey}`,
      orderId: init.orderId,
      providerId: opts.providerId,
      providerRef: null,
      status: "created",
      amount: init.amount,
      currency: init.amount.currency,
      createdAt: this.now().toISOString(),
      updatedAt: this.now().toISOString(),
    };
    await this.store.create(record);
    await this.store.appendTransition({
      id: `tr_${opts.idempotencyKey}_0`,
      paymentId: record.id,
      fromState: "created",
      toState: "created",
      providerRef: null,
      idempotencyKey: opts.idempotencyKey,
      occurredAt: this.now().toISOString(),
    });
    return record;
  }

  /**
   * Begin the provider-side payment and return the provider-agnostic session.
   */
  async begin(record: PaymentRecord, init: PaymentInitiation): Promise<PaymentSession> {
    const provider = this.providerFor(record.providerId);
    const session = await provider.createSession(init);
    // Persist the provider reference so webhooks can correlate back to our payment.
    if (session.providerRef && session.providerRef !== record.providerRef) {
      await this.store.updateStatus(record.id, record.status, session.providerRef);
    }
    return session;
  }

  /**
   * Apply a provider-confirmed status to our record. Validates the transition,
   * deduplicates by idempotency key, and appends an auditable transition row.
   * Returns the new status. Idempotent: replaying the same event is a no-op.
   *
   * Race net: the store is authoritative. A webhook and a browser-reconcile can
   * both deliver the same final status, so re-read before judging the edge. A
   * replay at the target is a no-op; a late delivery that can no longer be
   * reached (e.g. "failed" after the payment already settled at "paid") is also
   * a no-op — the first authoritative transition wins rather than throwing.
   */
  async applyStatus(
    record: PaymentRecord,
    to: PaymentStatus,
    opts: { providerRef?: string; idempotencyKey: string }
  ): Promise<PaymentStatus> {
    const current = (await this.store.get(record.id)) ?? record;
    if (current.status === to) return current.status;
    if (!canTransition(current.status, to)) return current.status;
    const newStatus = transition(current.status, to);
    await this.store.updateStatus(record.id, newStatus, opts.providerRef ?? current.providerRef);
    await this.store.appendTransition({
      id: `tr_${record.id}_${Date.now()}`,
      paymentId: record.id,
      fromState: current.status,
      toState: newStatus,
      providerRef: opts.providerRef ?? current.providerRef,
      idempotencyKey: opts.idempotencyKey,
      occurredAt: this.now().toISOString(),
    });
    return newStatus;
  }

  /**
   * Handle a normalized webhook event: deduplicate, map to a status, apply the
   * transition. Returns the resulting record (or null if the event is irrelevant).
   */
  async handleEvent(record: PaymentRecord, event: PaymentEvent): Promise<PaymentStatus | null> {
    const target = EVENT_TO_STATUS[event.type];
    if (!target) return null;
    if (record.status === target) return record.status;
    return this.applyStatus(record, target, {
      providerRef: event.providerRef,
      idempotencyKey: event.idempotencyKey,
    });
  }

  /**
   * Reconcile against the provider's authoritative status. Maps the provider
   * result into our state and applies a safe transition if it advances.
   */
  async reconcile(record: PaymentRecord): Promise<PaymentStatus> {
    const provider = this.providerFor(record.providerId);
    if (!record.providerRef) return record.status;
    const result = await provider.getStatus(record.providerRef);
    return this.applyResult(record, result);
  }

  private async applyResult(record: PaymentRecord, result: PaymentResult): Promise<PaymentStatus> {
    if (result.status === record.status) return record.status;
    return this.applyStatus(record, result.status, {
      providerRef: result.providerRef,
      idempotencyKey: `reconcile_${record.id}_${result.status}`,
    });
  }

  /**
   * Capture an authorized payment (manual auth-capture providers only).
   */
  async capture(record: PaymentRecord, amount?: Money): Promise<PaymentResult> {
    const provider = this.providerFor(record.providerId);
    if (!provider.capture) throw this.notSupported(record.providerId, "capture");
    const result = await provider.capture(record.providerRef ?? "", amount);
    await this.applyResult(record, result);
    return result;
  }

  /**
   * Refund a captured/paid payment.
   */
  async refund(record: PaymentRecord, amount?: Money): Promise<PaymentResult> {
    const provider = this.providerFor(record.providerId);
    if (!provider.refund) throw this.notSupported(record.providerId, "refund");
    const result = await provider.refund(record.providerRef ?? "", amount);
    await this.applyResult(record, result);
    return result;
  }

  /**
   * Void an authorized (not yet captured) payment.
   */
  async void(record: PaymentRecord): Promise<PaymentResult> {
    const provider = this.providerFor(record.providerId);
    if (!provider.void) throw this.notSupported(record.providerId, "void");
    const result = await provider.void(record.providerRef ?? "");
    await this.applyResult(record, result);
    return result;
  }

  private notSupported(providerId: string, capability: string): NotSupportedError {
    return new NotSupportedError(providerId, capability);
  }

  isTerminal(status: PaymentStatus): boolean {
    return isTerminal(status);
  }
}

const EVENT_TO_STATUS: Record<string, PaymentStatus> = {
  "payment.authorized": "authorized",
  "payment.captured": "captured",
  "payment.paid": "paid",
  "payment.failed": "failed",
  "payment.cancelled": "cancelled",
  "payment.voided": "voided",
  "payment.refunded": "refunded",
  "payment.partially_refunded": "partially_refunded",
  "payment.action_required": "action_required",
  "payment.disputed": "disputed",
  "payment.expired": "expired",
};
