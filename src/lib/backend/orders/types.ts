// Order domain types. The order state machine is the ONLY way an order's status
// changes; this error is thrown when a caller attempts an illegal edge.

import type { OrderStatus } from "../repositories/interfaces";

export class InvalidOrderTransitionError extends Error {
  readonly from: OrderStatus;
  readonly to: OrderStatus;

  constructor(from: OrderStatus, to: OrderStatus) {
    super(`Invalid order state transition: ${from} -> ${to}`);
    this.name = "InvalidOrderTransitionError";
    this.from = from;
    this.to = to;
  }
}