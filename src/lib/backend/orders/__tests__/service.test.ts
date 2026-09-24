import { describe, it, expect, afterEach } from "vitest";
import { OrderService } from "../service";
import { MemoryOrderRepository } from "../../repositories/memory";
import { InvalidOrderTransitionError } from "../types";
import { eventBus } from "../../events/bus";
import type { OrderRow, CreateOrderInput } from "../../repositories/interfaces";
import type { PaymentStatus } from "../../payments/types";

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

let disposeEvents: (() => void) | null = null;

function collectEvents() {
  const events: { name: string; payload: Record<string, unknown> }[] = [];
  const offUpdated = eventBus.on("order.updated", (e) => {
    events.push({ name: e.name, payload: e.payload });
  });
  const offFulfilled = eventBus.on("order.fulfilled", (e) => {
    events.push({ name: e.name, payload: e.payload });
  });
  disposeEvents = () => {
    offUpdated();
    offFulfilled();
  };
  return events;
}

afterEach(() => {
  disposeEvents?.();
  disposeEvents = null;
});

describe("OrderService", () => {
  it("applying the current status is a no-op — no row, no emit", async () => {
    const repo = new MemoryOrderRepository();
    const order = makeOrder();
    await repo.create(createInput(order), order);
    const events = collectEvents();
    const service = new OrderService({ orderRepo: repo });

    const result = await service.applyStatus(order, "placed");

    expect(result).toBe("placed");
    expect(repo.transitions).toHaveLength(0);
    expect(events).toHaveLength(0);
  });

  it("applies a valid transition — updates the order, appends a row, emits once", async () => {
    const repo = new MemoryOrderRepository();
    const order = makeOrder();
    await repo.create(createInput(order), order);
    const events = collectEvents();
    const service = new OrderService({
      orderRepo: repo,
      id: () => "tr_1",
      now: () => new Date("2026-01-02T00:00:00.000Z"),
    });

    const result = await service.applyStatus(order, "confirmed");

    expect(result).toBe("confirmed");
    const stored = await repo.get(order.id);
    expect(stored?.status).toBe("confirmed");
    expect(repo.transitions).toHaveLength(1);
    expect(repo.transitions[0]).toMatchObject({
      id: "tr_1",
      orderId: order.id,
      fromState: "placed",
      toState: "confirmed",
      idempotencyKey: "ord_1_placed_confirmed",
      occurredAt: "2026-01-02T00:00:00.000Z",
    });
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      name: "order.updated",
      payload: { orderId: order.id, status: "confirmed" },
    });
  });

  it("throws on an illegal edge and writes nothing", async () => {
    const repo = new MemoryOrderRepository();
    const order = makeOrder();
    await repo.create(createInput(order), order);
    const events = collectEvents();
    const service = new OrderService({ orderRepo: repo });

    await expect(service.applyStatus(order, "fulfilled")).rejects.toThrow(
      InvalidOrderTransitionError
    );
    expect(repo.transitions).toHaveLength(0);
    expect(events).toHaveLength(0);
  });

  it("emits order.fulfilled when an order is fulfilled", async () => {
    const repo = new MemoryOrderRepository();
    const order = makeOrder({ status: "confirmed" });
    await repo.create(createInput(order), order);
    const events = collectEvents();
    const service = new OrderService({ orderRepo: repo });

    const result = await service.applyStatus(order, "fulfilled");

    expect(result).toBe("fulfilled");
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      name: "order.fulfilled",
      payload: { orderId: order.id },
    });
  });

  it("maps payment events per §5", async () => {
    const cases: Array<{ payment: PaymentStatus; expected: OrderRow["status"] | null }> = [
      { payment: "captured", expected: "confirmed" },
      { payment: "paid", expected: "confirmed" },
      { payment: "failed", expected: "failed" },
      { payment: "cancelled", expected: "cancelled" },
      { payment: "expired", expected: "cancelled" },
      { payment: "created", expected: null },
      { payment: "action_required", expected: null },
      { payment: "authorized", expected: null },
      { payment: "voided", expected: null },
      { payment: "refunded", expected: null },
      { payment: "partially_refunded", expected: null },
      { payment: "disputed", expected: null },
    ];

    for (const c of cases) {
      const repo = new MemoryOrderRepository();
      const order = makeOrder();
      await repo.create(createInput(order), order);
      const service = new OrderService({ orderRepo: repo });

      const result = await service.handlePaymentEvent(order, c.payment);

      expect(result).toBe(c.expected);
      const stored = await repo.get(order.id);
      expect(stored?.status).toBe(c.expected ?? "placed");
    }
  });

  it("a refunded payment event on a confirmed order applies refunded via PAYMENT_TO_ORDER", async () => {
    const repo = new MemoryOrderRepository();
    const order = makeOrder({ status: "confirmed" });
    await repo.create(createInput(order), order);
    const service = new OrderService({ orderRepo: repo });

    const result = await service.handlePaymentEvent(order, "refunded");

    expect(result).toBe("refunded");
    const stored = await repo.get(order.id);
    expect(stored?.status).toBe("refunded");
    expect(repo.transitions).toHaveLength(1);
    expect(repo.transitions[0]).toMatchObject({ fromState: "confirmed", toState: "refunded" });
  });

  it("never throws on a terminal order — intake is a no-op", async () => {
    const repo = new MemoryOrderRepository();
    const order = makeOrder({ status: "fulfilled" });
    await repo.create(createInput(order), order);
    const events = collectEvents();
    const service = new OrderService({ orderRepo: repo });

    const result = await service.handlePaymentEvent(order, "paid");

    expect(result).toBeNull();
    expect(repo.transitions).toHaveLength(0);
    expect(events).toHaveLength(0);
  });

  it("replaying the same payment event is a no-op", async () => {
    const repo = new MemoryOrderRepository();
    const order = makeOrder();
    await repo.create(createInput(order), order);
    const service = new OrderService({ orderRepo: repo });

    await service.handlePaymentEvent(order, "paid");
    const stored = await repo.get(order.id);
    expect(stored?.status).toBe("confirmed");

    const again = await service.handlePaymentEvent(stored!, "paid");
    expect(again).toBeNull();
    expect(repo.transitions).toHaveLength(1);
  });
});