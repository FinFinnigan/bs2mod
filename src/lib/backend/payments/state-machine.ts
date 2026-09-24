// Our internal payment state machine. Transitions are the ONLY way a payment's
// status changes — providers can never write our state directly. Allowed edges are
// validated; any illegal edge throws (ARCHITECTURE.md §8).

import { InvalidTransitionError, type PaymentStatus } from "./types";

const ALLOWED: Record<PaymentStatus, readonly PaymentStatus[]> = {
  created: ["action_required", "paid", "failed", "cancelled", "expired"],
  action_required: ["authorized", "paid", "failed", "cancelled", "expired"],
  authorized: ["captured", "voided", "failed", "expired"],
  captured: ["refunded", "partially_refunded", "disputed"],
  paid: ["refunded", "partially_refunded", "disputed"],
  failed: [],
  cancelled: [],
  voided: ["refunded"], // rare: refund a voided authorization
  refunded: [],
  partially_refunded: ["refunded"],
  expired: [],
  disputed: [],
};

export function canTransition(from: PaymentStatus, to: PaymentStatus): boolean {
  return ALLOWED[from].includes(to);
}

export function assertTransition(from: PaymentStatus, to: PaymentStatus): void {
  if (!canTransition(from, to)) throw new InvalidTransitionError(from, to);
}

export function transition(from: PaymentStatus, to: PaymentStatus): PaymentStatus {
  assertTransition(from, to);
  return to;
}

// Terminal states: no further transitions are permitted.
export function isTerminal(s: PaymentStatus): boolean {
  return ALLOWED[s].length === 0;
}

// States considered "money confirmed" for order-fulfilment purposes.
export function isSettled(s: PaymentStatus): boolean {
  return s === "captured" || s === "paid";
}
