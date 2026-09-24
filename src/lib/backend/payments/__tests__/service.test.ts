import { describe, it, expect } from "vitest";
import { PaymentService } from "../service";
import { paymentRegistry, PaymentProviderRegistry } from "../registry";
import { MockPaymentProvider } from "../adapters/mock";
import { StripePaymentProvider } from "../adapters/stripe";
import { MINIMAL_CAPABILITIES } from "../capabilities";
import { UnknownProviderError } from "../types";
import type { PaymentStore, PaymentRecord, PaymentTransitionRow } from "../store";

// In-memory store for tests.
function memoryStore(): PaymentStore & {
  records: Map<string, PaymentRecord>;
  transitions: PaymentTransitionRow[];
} {
  const records = new Map<string, PaymentRecord>();
  const transitions: PaymentTransitionRow[] = [];
  return {
    records,
    transitions,
    async create(r) {
      records.set(r.id, r);
    },
    async get(id) {
      return records.get(id) ?? null;
    },
    async getByIdempotencyKey(key) {
      for (const r of records.values()) if (r.id === `pay_${key}`) return r;
      return null;
    },
    async getByProviderRef(providerRef) {
      for (const r of records.values()) if (r.providerRef === providerRef) return r;
      return null;
    },
    async appendTransition(row) {
      transitions.push(row);
    },
    async updateStatus(id, status, providerRef) {
      const r = records.get(id);
      if (r) records.set(id, { ...r, status, providerRef, updatedAt: new Date().toISOString() });
    },
    async listByOrder(orderId) {
      return [...records.values()].filter((r) => r.orderId === orderId);
    },
  };
}

function setup() {
  const registry = new PaymentProviderRegistry();
  registry.register(new MockPaymentProvider());
  const store = memoryStore();
  const service = new PaymentService({ registry, store });
  return { registry, store, service };
}

describe("PaymentService", () => {
  it("creates a payment and is idempotent on the idempotency key", async () => {
    const { service, store } = setup();
    const init = {
      orderId: "ord_1",
      amount: { amount: 50, currency: "EUR" },
      returnUrl: "https://example.com/return",
    };
    const a = await service.create(init, { providerId: "mock", idempotencyKey: "k1" });
    const b = await service.create(init, { providerId: "mock", idempotencyKey: "k1" });
    expect(a.id).toBe(b.id);
    expect(store.records.size).toBe(1);
  });

  it("begins a session through the provider port", async () => {
    const { service } = setup();
    const init = {
      orderId: "ord_2",
      amount: { amount: 50, currency: "EUR" },
      returnUrl: "https://example.com/return",
    };
    const record = await service.create(init, { providerId: "mock", idempotencyKey: "k2" });
    const session = await service.begin(record, init);
    expect(session.kind).toBe("client_token");
    expect(session.providerId).toBe("mock");
  });

  it("applies a valid status transition and deduplicates replays", async () => {
    const { service } = setup();
    const init = { orderId: "ord_3", amount: { amount: 50, currency: "EUR" }, returnUrl: "/" };
    const record = await service.create(init, { providerId: "mock", idempotencyKey: "k3" });
    const s1 = await service.applyStatus(record, "paid", { idempotencyKey: "e1" });
    expect(s1).toBe("paid");
    // Replaying the same event is a no-op (dedup).
    const s2 = await service.applyStatus(record, "paid", { idempotencyKey: "e1" });
    expect(s2).toBe("paid");
  });

  it("rejects an unknown provider", async () => {
    const { service } = setup();
    const init = { orderId: "ord_4", amount: { amount: 50, currency: "EUR" }, returnUrl: "/" };
    await expect(
      service.create(init, { providerId: "nope", idempotencyKey: "k4" })
    ).rejects.toThrow(UnknownProviderError);
  });

  it("handles a normalized webhook event", async () => {
    const { service } = setup();
    const init = { orderId: "ord_5", amount: { amount: 50, currency: "EUR" }, returnUrl: "/" };
    const record = await service.create(init, { providerId: "mock", idempotencyKey: "k5" });
    const status = await service.handleEvent(record, {
      type: "payment.paid",
      providerRef: "mock_ref_1",
      occurredAt: new Date().toISOString(),
      idempotencyKey: "wh_1",
    });
    expect(status).toBe("paid");
  });

  it("advertises capabilities without assuming identical providers", () => {
    const mock = new MockPaymentProvider();
    expect(mock.capabilities.refund).toBe(false); // mock cannot refund
    expect(MINIMAL_CAPABILITIES.statusPolling).toBe(true);
  });

  it("derives the default method from the provider's declared capabilities", () => {
    const { registry, service } = setup();
    registry.register(new StripePaymentProvider({ secretKey: "sk_test_dummy" }));
    expect(service.defaultMethod("mock")).toBeUndefined();
    expect(service.defaultMethod("stripe")).toBe("card");
  });

  it("maps a payment.expired event and deduplicates replays (S8)", async () => {
    const { service, store } = setup();
    const init = { orderId: "ord_8", amount: { amount: 50, currency: "EUR" }, returnUrl: "/" };
    const record = await service.create(init, { providerId: "mock", idempotencyKey: "k8" });
    const event = {
      type: "payment.expired",
      providerRef: "mock_ref_8",
      occurredAt: new Date().toISOString(),
      idempotencyKey: "wh_exp_1",
    };
    const first = await service.handleEvent(record, event);
    expect(first).toBe("expired");
    expect(store.records.get(record.id)?.status).toBe("expired");
    expect(store.transitions.filter((t) => t.toState === "expired")).toHaveLength(1);

    const replay = await service.handleEvent(record, event);
    expect(replay).toBe("expired");
    expect(store.transitions.filter((t) => t.toState === "expired")).toHaveLength(1);
  });

  it("treats a duplicate delivery at the target status as an idempotent no-op (S9)", async () => {
    const { service, store } = setup();
    const init = { orderId: "ord_9", amount: { amount: 50, currency: "EUR" }, returnUrl: "/" };
    const record = await service.create(init, { providerId: "mock", idempotencyKey: "k9" });
    const first = await service.applyStatus(record, "paid", { idempotencyKey: "reconcile_1" });
    const second = await service.applyStatus(record, "paid", { idempotencyKey: "wh_late_1" });
    expect(first).toBe("paid");
    expect(second).toBe("paid");
    expect(store.records.get(record.id)?.status).toBe("paid");
    expect(store.transitions.filter((t) => t.toState === "paid")).toHaveLength(1);
  });

  it("keeps the authoritative status when a late conflicting webhook arrives (S9)", async () => {
    const { service, store } = setup();
    const init = { orderId: "ord_10", amount: { amount: 50, currency: "EUR" }, returnUrl: "/" };
    const record = await service.create(init, { providerId: "mock", idempotencyKey: "k10" });
    const paid = await service.applyStatus(record, "paid", { idempotencyKey: "reconcile_2" });
    // Reconcile already settled at "paid", so the late "failed" delivery is no
    // longer a reachable edge (paid -> failed). The race net keeps "paid" rather
    // than throwing InvalidTransitionError — first authoritative transition wins.
    const late = await service.applyStatus(record, "failed", { idempotencyKey: "wh_late_2" });
    expect(paid).toBe("paid");
    expect(late).toBe("paid");
    expect(store.records.get(record.id)?.status).toBe("paid");
    expect(store.transitions.filter((t) => t.toState === "paid")).toHaveLength(1);
    expect(store.transitions.filter((t) => t.toState === "failed")).toHaveLength(0);
  });
});

describe("PaymentProviderRegistry", () => {
  it("lists only enabled providers", () => {
    const r = new PaymentProviderRegistry();
    r.register(new MockPaymentProvider());
    expect(r.list().map((p) => p.id)).toEqual(["mock"]);
    expect(r.has("mock")).toBe(true);
    expect(() => r.get("missing")).toThrow(UnknownProviderError);
  });
});
