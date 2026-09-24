// Persistence boundary for payment state. The PaymentService depends on THIS
// interface, never on the database. A Drizzle/Neon implementation lives behind it;
// a test/memory implementation is used in unit tests.

import type { Money, PaymentStatus } from "./types";

export interface PaymentRecord {
  id: string; // our internal payment id
  orderId: string;
  providerId: string;
  providerRef: string | null;
  status: PaymentStatus;
  amount: Money;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentTransitionRow {
  id: string;
  paymentId: string;
  fromState: PaymentStatus;
  toState: PaymentStatus;
  providerRef: string | null;
  idempotencyKey: string;
  occurredAt: string;
}

export interface PaymentStore {
  create(record: PaymentRecord): Promise<void>;
  get(id: string): Promise<PaymentRecord | null>;
  getByIdempotencyKey(key: string): Promise<PaymentRecord | null>;
  getByProviderRef(providerRef: string): Promise<PaymentRecord | null>;
  appendTransition(row: PaymentTransitionRow): Promise<void>;
  updateStatus(id: string, status: PaymentStatus, providerRef: string | null): Promise<void>;
  listByOrder(orderId: string): Promise<PaymentRecord[]>;
}
