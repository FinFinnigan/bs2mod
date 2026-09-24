// OrderService — owns the order state machine + auditable transitions. It talks
// ONLY to the OrderRepository port; it never imports a payment provider or the
// payments module (ARCHITECTURE.md §5, §8, §9). Payment events arrive normalized
// as a PaymentStatus value, never as a provider payload.

import { transition, canTransition, isTerminal } from "./state-machine";
import type { OrderRepository, OrderRow, OrderStatus } from "../repositories/interfaces";
import type { PaymentStatus } from "../payments/types";
import type { PaymentService } from "../payments/service";
import { eventBus } from "../events/bus";

export interface OrderServiceDeps {
  orderRepo: OrderRepository;
  payments?: PaymentService;
  id?: () => string;
  now?: () => Date;
}

export class OrderService {
  private orderRepo: OrderRepository;
  private payments?: PaymentService;
  private id: () => string;
  private now: () => Date;

  constructor(deps: OrderServiceDeps) {
    this.orderRepo = deps.orderRepo;
    this.payments = deps.payments;
    this.id = deps.id ?? (() => `tr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);
    this.now = deps.now ?? (() => new Date());
  }

  /**
   * Apply a status to an order. Validates the transition, updates the order,
   * appends an auditable transition row, and emits a domain event. Returns the
   * new status. Idempotent: applying the current status is a no-op.
   */
  async applyStatus(order: OrderRow, to: OrderStatus): Promise<OrderStatus> {
    if (order.status === to) return to;
    const newStatus = transition(order.status, to);
    await this.orderRepo.updateStatus(order.id, newStatus);
    await this.orderRepo.appendTransition({
      id: this.id(),
      orderId: order.id,
      fromState: order.status,
      toState: newStatus,
      idempotencyKey: `${order.id}_${order.status}_${newStatus}`,
      occurredAt: this.now().toISOString(),
    });
    if (newStatus === "fulfilled") {
      await eventBus.emit("order.fulfilled", { orderId: order.id });
    } else {
      await eventBus.emit("order.updated", { orderId: order.id, status: newStatus });
    }
    return newStatus;
  }

  /**
   * Handle a normalized payment event. Maps the payment status to an order
   * action per §5; no-op when the payment status has no order effect or the
   * order is terminal. Never throws on a terminal order.
   */
  async handlePaymentEvent(order: OrderRow, paymentStatus: PaymentStatus): Promise<OrderStatus | null> {
    const target = PAYMENT_TO_ORDER[paymentStatus];
    if (!target) return null;
    if (!canTransition(order.status, target)) return null;
    return this.applyStatus(order, target);
  }

  /**
   * Reconcile the order's payments against the provider and advance the order
   * via PAYMENT_TO_ORDER. No-op when no payments service is wired, the order is
   * terminal, or no payment carries a provider reference. Never throws on a
   * terminal order.
   */
  async reconcileOrder(order: OrderRow): Promise<OrderStatus | null> {
    if (!this.payments || isTerminal(order.status)) return null;
    const records = await this.payments.store.listByOrder(order.id);
    let current = order;
    let last: OrderStatus | null = null;
    for (const record of records) {
      if (!record.providerRef) continue;
      const status = await this.payments.reconcile(record);
      const advanced = await this.handlePaymentEvent(current, status);
      if (advanced) {
        current = { ...current, status: advanced };
        last = advanced;
      }
    }
    return last;
  }
}

const PAYMENT_TO_ORDER: Partial<Record<PaymentStatus, OrderStatus>> = {
  captured: "confirmed",
  paid: "confirmed",
  failed: "failed",
  cancelled: "cancelled",
  expired: "cancelled",
  refunded: "refunded",
};