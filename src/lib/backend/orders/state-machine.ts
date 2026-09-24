// Our internal order state machine. Transitions are the ONLY way an order's
// status changes — callers can never write our state directly. Allowed edges are
// validated; any illegal edge throws (ARCHITECTURE.md §8).

import type { OrderStatus } from "../repositories/interfaces";
import { InvalidOrderTransitionError } from "./types";

const ALLOWED: Record<OrderStatus, readonly OrderStatus[]> = {
  draft: ["placed"],
  placed: ["confirmed", "cancelled", "failed"],
  confirmed: ["fulfilled", "cancelled", "refunded"],
  fulfilled: [],
  cancelled: [],
  failed: [],
  refunded: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ALLOWED[from].includes(to);
}

export function assertTransition(from: OrderStatus, to: OrderStatus): void {
  if (!canTransition(from, to)) throw new InvalidOrderTransitionError(from, to);
}

export function transition(from: OrderStatus, to: OrderStatus): OrderStatus {
  assertTransition(from, to);
  return to;
}

// Terminal states: no further transitions are permitted.
export function isTerminal(s: OrderStatus): boolean {
  return ALLOWED[s].length === 0;
}

// States considered "money confirmed" for order-fulfilment purposes.
export function isMoneyConfirmed(s: OrderStatus): boolean {
  return s === "confirmed";
}