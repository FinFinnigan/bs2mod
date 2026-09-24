// AdminOrdersService — admin order-management surface (ADM-004). Exercises the
// list/get/confirm/fulfill/cancel/refund methods against the real in-memory
// repositories, the error contract (ORDER_NOT_FOUND, InvalidOrderTransitionError),
// and the best-effort refund accounting.

import { describe, it, expect } from "vitest";
import { AdminOrdersService, AdminOrderNotFoundError } from "../admin-orders";
import { MemoryOrderRepository } from "../../repositories/memory";
import { MemoryPaymentStore } from "../../repositories/memory/payment-store";
import { PaymentService } from "../../payments/service";
import { PaymentProviderRegistry } from "../../payments/registry";
import { MockPaymentProvider } from "../../payments/adapters/mock";
import { OrderService } from "../../orders/service";
import { InvalidOrderTransitionError } from "../../orders/types";
import type { OrderRow, CreateOrderInput } from "../../repositories/interfaces";
import type { PaymentRecord } from "../../payments/store";

function makeOrder(overrides: Partial<OrderRow> = {}): OrderRow {
  return {
    id: "ord_1",
    cartId: "cart_1",
    email: "parent@example.com",
    publicToken: "tok_1",
    status: "placed",
    subtotal: { amount: 50, currency: "EUR" },
    shippingAmount: { amount: 4.95, currency: "EUR" },
    total: { amount: 54.95, currency: "EUR" },
    currency: "EUR",
    items: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function createInput(order: OrderRow): CreateOrderInput {
  return {
    id: order.id,
    cartId: order.cartId ?? "cart_1",
    shippingAddress: {
      fullName: "Test Parent",
      line1: "1 Main St",
      city: "Dublin",
      postcode: "D01",
      country: "IE",
    },
    idempotencyKey: `key_${order.id}`,
  };
}

function makePayment(overrides: Partial<PaymentRecord> = {}): PaymentRecord {
  return {
    id: "pay_1",
    orderId: "ord_1",
    providerId: "mock",
    providerRef: "mock_ref_1",
    status: "paid",
    amount: { amount: 54.95, currency: "EUR" },
    currency: "EUR",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function setup() {
  const repo = new MemoryOrderRepository();
  const store = new MemoryPaymentStore();
  const registry = new PaymentProviderRegistry();
  registry.register(new MockPaymentProvider());
  const payments = new PaymentService({ registry, store });
  const ordersService = new OrderService({ orderRepo: repo, payments });
  const service = new AdminOrdersService({ orderRepo: repo, ordersService, payments });
  return { repo, store, payments, service };
}

async function seedOrder(
  repo: MemoryOrderRepository,
  overrides: Partial<OrderRow> = {}
): Promise<OrderRow> {
  const order = makeOrder(overrides);
  await repo.create(createInput(order), order);
  return order;
}

describe("AdminOrdersService — list and get", () => {
  it("lists orders newest first with a total", async () => {
    const { repo, service } = setup();
    await seedOrder(repo, { id: "ord_1", createdAt: "2026-01-01T00:00:00.000Z" });
    await seedOrder(repo, { id: "ord_2", createdAt: "2026-01-02T00:00:00.000Z" });
    await seedOrder(repo, { id: "ord_3", createdAt: "2026-01-03T00:00:00.000Z" });

    const { rows, total } = await service.list();
    expect(total).toBe(3);
    expect(rows.map((o) => o.id)).toEqual(["ord_3", "ord_2", "ord_1"]);
  });

  it("filters by status and paginates", async () => {
    const { repo, service } = setup();
    await seedOrder(repo, { id: "ord_1", status: "confirmed", createdAt: "2026-01-01T00:00:00.000Z" });
    await seedOrder(repo, { id: "ord_2", status: "placed", createdAt: "2026-01-02T00:00:00.000Z" });
    await seedOrder(repo, { id: "ord_3", status: "confirmed", createdAt: "2026-01-03T00:00:00.000Z" });

    const confirmed = await service.list({ status: "confirmed" });
    expect(confirmed.total).toBe(2);
    expect(confirmed.rows.map((o) => o.id)).toEqual(["ord_3", "ord_1"]);

    const page = await service.list({ limit: 1, offset: 1 });
    expect(page.rows.map((o) => o.id)).toEqual(["ord_2"]);
    expect(page.total).toBe(3);
  });

  it("get returns the order with transitions and payments", async () => {
    const { repo, store, service } = setup();
    await seedOrder(repo, { status: "confirmed" });
    await store.create(makePayment());
    await repo.appendTransition({
      id: "tr_1",
      orderId: "ord_1",
      fromState: "placed",
      toState: "confirmed",
      idempotencyKey: "k",
      occurredAt: "2026-01-02T00:00:00.000Z",
    });

    const detail = await service.get("ord_1");
    expect(detail.order.status).toBe("confirmed");
    expect(detail.transitions).toHaveLength(1);
    expect(detail.transitions[0]).toMatchObject({ fromState: "placed", toState: "confirmed" });
    expect(detail.payments).toHaveLength(1);
    expect(detail.payments[0].id).toBe("pay_1");
  });

  it("get returns empty transitions and payments for an order with none", async () => {
    const { repo, service } = setup();
    await seedOrder(repo);

    const detail = await service.get("ord_1");
    expect(detail.transitions).toEqual([]);
    expect(detail.payments).toEqual([]);
  });

  it("get throws ORDER_NOT_FOUND for an unknown id", async () => {
    const { service } = setup();
    await expect(service.get("nope")).rejects.toThrow(AdminOrderNotFoundError);
    await expect(service.get("nope")).rejects.toMatchObject({ code: "ORDER_NOT_FOUND" });
  });
});

describe("AdminOrdersService — mutations", () => {
  it("confirm advances placed → confirmed and returns the fresh detail", async () => {
    const { repo, service } = setup();
    await seedOrder(repo);

    const detail = await service.confirm("ord_1");
    expect(detail.order.status).toBe("confirmed");
    expect(detail.transitions).toHaveLength(1);
    expect(detail.transitions[0]).toMatchObject({ fromState: "placed", toState: "confirmed" });
    expect((await repo.get("ord_1"))?.status).toBe("confirmed");
  });

  it("confirm on a non-placed order throws InvalidOrderTransitionError", async () => {
    const { repo, service } = setup();
    await seedOrder(repo, { status: "fulfilled" });

    await expect(service.confirm("ord_1")).rejects.toThrow(InvalidOrderTransitionError);
  });

  it("fulfill advances confirmed → fulfilled", async () => {
    const { repo, service } = setup();
    await seedOrder(repo, { status: "confirmed" });

    const detail = await service.fulfill("ord_1");
    expect(detail.order.status).toBe("fulfilled");
    expect((await repo.get("ord_1"))?.status).toBe("fulfilled");
  });

  it("cancel advances placed and confirmed → cancelled", async () => {
    const { repo, service } = setup();
    await seedOrder(repo, { id: "ord_1", status: "placed" });
    await seedOrder(repo, { id: "ord_2", status: "confirmed" });

    expect((await service.cancel("ord_1")).order.status).toBe("cancelled");
    expect((await service.cancel("ord_2")).order.status).toBe("cancelled");
  });

  it("refund advances confirmed → refunded and reports refund attempts", async () => {
    const { repo, store, service } = setup();
    await seedOrder(repo, { status: "confirmed" });
    await store.create(makePayment());

    const result = await service.refund("ord_1");
    expect(result.order.status).toBe("refunded");
    expect(result.refundAttempts).toEqual({ ok: 0, failed: 1 });
    expect((await repo.get("ord_1"))?.status).toBe("refunded");
  });

  it("refund skips payments without a provider reference", async () => {
    const { repo, store, service } = setup();
    await seedOrder(repo, { status: "confirmed" });
    await store.create(makePayment({ providerRef: null }));

    const result = await service.refund("ord_1");
    expect(result.order.status).toBe("refunded");
    expect(result.refundAttempts).toEqual({ ok: 0, failed: 0 });
  });

  it("refund on a non-confirmed order throws InvalidOrderTransitionError", async () => {
    const { repo, service } = setup();
    await seedOrder(repo, { status: "placed" });

    await expect(service.refund("ord_1")).rejects.toThrow(InvalidOrderTransitionError);
  });

  it("mutations on an unknown id throw ORDER_NOT_FOUND", async () => {
    const { service } = setup();
    await expect(service.confirm("nope")).rejects.toMatchObject({ code: "ORDER_NOT_FOUND" });
    await expect(service.fulfill("nope")).rejects.toMatchObject({ code: "ORDER_NOT_FOUND" });
    await expect(service.cancel("nope")).rejects.toMatchObject({ code: "ORDER_NOT_FOUND" });
    await expect(service.refund("nope")).rejects.toMatchObject({ code: "ORDER_NOT_FOUND" });
  });
});

describe("AdminOrdersService — without a payments dependency", () => {
  it("get returns payments: [] and refund reports no attempts", async () => {
    const repo = new MemoryOrderRepository();
    const ordersService = new OrderService({ orderRepo: repo });
    const service = new AdminOrdersService({ orderRepo: repo, ordersService });
    await seedOrder(repo, { status: "confirmed" });

    const detail = await service.get("ord_1");
    expect(detail.payments).toEqual([]);

    const result = await service.refund("ord_1");
    expect(result.order.status).toBe("refunded");
    expect(result.refundAttempts).toEqual({ ok: 0, failed: 0 });
  });
});