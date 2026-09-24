// Drizzle payment store — implements the PaymentStore persistence boundary using
// the `payments` + `payment_transitions` tables. Auditable state transitions are
// appended, never overwritten. Idempotency keys are unique.

import { eq, desc } from "drizzle-orm";
import type {
  PaymentStore,
  PaymentRecord,
  PaymentTransitionRow,
} from "../../payments/store";
import { getDb } from "../../db/client";
import { payments, paymentTransitions } from "../../db/schema";
import { toMinor, toMoney } from "../../money";

export class DrizzlePaymentStore implements PaymentStore {
  async create(record: PaymentRecord): Promise<void> {
    const db = getDb();
    await db.insert(payments).values({
      id: record.id,
      orderId: record.orderId,
      providerId: record.providerId,
      providerRef: record.providerRef,
      status: record.status,
      amount: toMinor(record.amount),
      currency: record.currency,
      idempotencyKey: record.id,
    });
  }

  async get(id: string): Promise<PaymentRecord | null> {
    const db = getDb();
    const [row] = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
    if (!row) return null;
    return {
      id: row.id,
      orderId: row.orderId,
      providerId: row.providerId,
      providerRef: row.providerRef,
      status: row.status as PaymentRecord["status"],
      amount: toMoney(row.amount, row.currency),
      currency: row.currency,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async getByIdempotencyKey(key: string): Promise<PaymentRecord | null> {
    // The service derives the payment id from the key (`pay_${key}`), so the
    // lookup must match that id. The `idempotency_key` column stores the same
    // value as the record id (see create), keeping the unique constraint.
    return this.get(`pay_${key}`);
  }

  async getByProviderRef(providerRef: string): Promise<PaymentRecord | null> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(payments)
      .where(eq(payments.providerRef, providerRef))
      .limit(1);
    if (!row) return null;
    return this.get(row.id);
  }

  async appendTransition(row: PaymentTransitionRow): Promise<void> {
    const db = getDb();
    await db.insert(paymentTransitions).values({
      id: row.id,
      paymentId: row.paymentId,
      fromState: row.fromState,
      toState: row.toState,
      providerRef: row.providerRef,
      idempotencyKey: row.idempotencyKey,
      occurredAt: new Date(row.occurredAt),
    });
  }

  async updateStatus(id: string, status: string, providerRef: string | null): Promise<void> {
    const db = getDb();
    await db
      .update(payments)
      .set({ status, providerRef, updatedAt: new Date() })
      .where(eq(payments.id, id));
  }

  async listByOrder(orderId: string): Promise<PaymentRecord[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(payments)
      .where(eq(payments.orderId, orderId))
      .orderBy(desc(payments.createdAt));
    const out: PaymentRecord[] = [];
    for (const row of rows) {
      out.push({
        id: row.id,
        orderId: row.orderId,
        providerId: row.providerId,
        providerRef: row.providerRef,
        status: row.status as PaymentRecord["status"],
        amount: toMoney(row.amount, row.currency),
        currency: row.currency,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      });
    }
    return out;
  }
}
