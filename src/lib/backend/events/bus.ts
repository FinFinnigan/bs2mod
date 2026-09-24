// Outbound event bus — the low-code/no-code integration seam (ARCHITECTURE.md §10).
// Modules publish domain events (order.created, payment.captured, …); external or
// no-code tools subscribe without touching source. In-process now; the transport
// (webhook POST, queue) is a later, swappable sink behind the same interface.

export type DomainEventName =
  | "order.created"
  | "order.updated"
  | "order.fulfilled"
  | "payment.created"
  | "payment.captured"
  | "payment.paid"
  | "payment.refunded"
  | "payment.failed";

export interface DomainEvent {
  name: DomainEventName;
  payload: Record<string, unknown>;
  occurredAt: string;
  id: string;
}

export type EventHandler = (event: DomainEvent) => void | Promise<void>;

export class EventBus {
  private handlers = new Map<DomainEventName, Set<EventHandler>>();

  on(name: DomainEventName, handler: EventHandler): () => void {
    let set = this.handlers.get(name);
    if (!set) {
      set = new Set();
      this.handlers.set(name, set);
    }
    set.add(handler);
    return () => set.delete(handler);
  }

  async emit(name: DomainEventName, payload: Record<string, unknown>): Promise<void> {
    const event: DomainEvent = {
      name,
      payload,
      occurredAt: new Date().toISOString(),
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    };
    const set = this.handlers.get(name);
    if (!set) return;
    await Promise.allSettled([...set].map((h) => Promise.resolve(h(event))));
  }
}

// Single app instance. External sinks (webhook dispatcher, no-code connector) attach
// to this bus at startup.
export const eventBus = new EventBus();
