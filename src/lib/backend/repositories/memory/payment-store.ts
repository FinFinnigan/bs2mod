// In-memory PaymentStore for tests (implements the same boundary as the Drizzle
// store). Not for production.

import type { PaymentStore, PaymentRecord, PaymentTransitionRow } from "../../payments/store";

export class MemoryPaymentStore implements PaymentStore {
  records = new Map<string, PaymentRecord>();
  transitions: PaymentTransitionRow[] = [];

  async create(record: PaymentRecord): Promise<void> {
    this.records.set(record.id, record);
  }

  async get(id: string): Promise<PaymentRecord | null> {
    return this.records.get(id) ?? null;
  }

  async getByIdempotencyKey(key: string): Promise<PaymentRecord | null> {
    // Same contract as the Drizzle store: payments are created with id `pay_${key}`.
    for (const r of this.records.values()) if (r.id === `pay_${key}`) return r;
    return null;
  }

  async getByProviderRef(providerRef: string): Promise<PaymentRecord | null> {
    for (const r of this.records.values()) if (r.providerRef === providerRef) return r;
    return null;
  }

  async appendTransition(row: PaymentTransitionRow): Promise<void> {
    this.transitions.push(row);
  }

  async updateStatus(id: string, status: string, providerRef: string | null): Promise<void> {
    const r = this.records.get(id);
    if (r) this.records.set(id, { ...r, status: status as PaymentRecord["status"], providerRef, updatedAt: new Date().toISOString() });
  }

  async listByOrder(orderId: string): Promise<PaymentRecord[]> {
    return [...this.records.values()].filter((r) => r.orderId === orderId);
  }
}
