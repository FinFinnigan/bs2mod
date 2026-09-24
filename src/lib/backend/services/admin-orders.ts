// AdminOrdersService — admin order-management surface (ADM-004). Wraps the
// OrderRepository port and the OrderService state machine for the admin API
// routes. Illegal transitions surface as InvalidOrderTransitionError; unknown
// ids surface as AdminOrderNotFoundError (code "ORDER_NOT_FOUND").

import type {
  OrderRepository,
  OrderRow,
  OrderTransitionRow,
  OrderStatus,
  OrderAddressRow,
} from "../repositories/interfaces";
import type { OrderService } from "../orders/service";
import type { PaymentService } from "../payments/service";
import type { PaymentRecord } from "../payments/store";

export interface AdminOrdersDeps {
  orderRepo: OrderRepository;
  ordersService: OrderService;
  payments?: PaymentService;
  id?: () => string;
}

export interface AdminOrderListQuery {
  status?: OrderStatus;
  limit?: number;
  offset?: number;
}

export interface AdminOrderDetail {
  order: OrderRow;
  transitions: OrderTransitionRow[];
  payments: PaymentRecord[];
  addresses: OrderAddressRow[];
}

export interface AdminOrderRefundResult extends AdminOrderDetail {
  refundAttempts: { ok: number; failed: number };
}

export class AdminOrderNotFoundError extends Error {
  readonly code = "ORDER_NOT_FOUND";

  constructor(id: string) {
    super(`Order not found: ${id}`);
    this.name = "AdminOrderNotFoundError";
  }
}

export class AdminOrdersService {
  private deps: AdminOrdersDeps;

  constructor(deps: AdminOrdersDeps) {
    this.deps = deps;
  }

  async list(query?: AdminOrderListQuery): Promise<{ rows: OrderRow[]; total: number }> {
    return this.deps.orderRepo.list(query);
  }

  async get(id: string): Promise<AdminOrderDetail> {
    const order = await this.requireOrder(id);
    const [transitions, payments, addresses] = await Promise.all([
      this.deps.orderRepo.listTransitions(id),
      this.deps.payments ? this.deps.payments.store.listByOrder(id) : Promise.resolve([]),
      this.deps.orderRepo.getAddresses(id),
    ]);
    return { order, transitions, payments, addresses };
  }

  async confirm(id: string): Promise<AdminOrderDetail> {
    const order = await this.requireOrder(id);
    await this.deps.ordersService.applyStatus(order, "confirmed");
    return this.get(id);
  }

  async fulfill(id: string): Promise<AdminOrderDetail> {
    const order = await this.requireOrder(id);
    await this.deps.ordersService.applyStatus(order, "fulfilled");
    return this.get(id);
  }

  async cancel(id: string): Promise<AdminOrderDetail> {
    const order = await this.requireOrder(id);
    await this.deps.ordersService.applyStatus(order, "cancelled");
    return this.get(id);
  }

  async refund(id: string): Promise<AdminOrderRefundResult> {
    const order = await this.requireOrder(id);
    let ok = 0;
    let failed = 0;
    if (this.deps.payments) {
      const records = await this.deps.payments.store.listByOrder(id);
      for (const record of records) {
        if (record.status !== "paid" || !record.providerRef) continue;
        try {
          await this.deps.payments.refund(record);
          ok += 1;
        } catch {
          failed += 1;
        }
      }
    }
    await this.deps.ordersService.applyStatus(order, "refunded");
    const detail = await this.get(id);
    return { ...detail, refundAttempts: { ok, failed } };
  }

  private async requireOrder(id: string): Promise<OrderRow> {
    const order = await this.deps.orderRepo.get(id);
    if (!order) throw new AdminOrderNotFoundError(id);
    return order;
  }
}