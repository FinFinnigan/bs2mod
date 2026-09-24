import type { OrderStatus } from "@/lib/backend/repositories/interfaces";

const STATUS_COLOR: Record<OrderStatus, string> = {
  draft: "var(--color-ink-muted)",
  placed: "var(--color-warn)",
  confirmed: "var(--color-primary)",
  fulfilled: "var(--color-ok)",
  cancelled: "var(--color-error)",
  failed: "var(--color-error)",
  refunded: "var(--color-ink-muted)",
};

export function StatusChip({ status }: { status: OrderStatus }) {
  return (
    <span
      className="chip"
      style={{
        color: STATUS_COLOR[status],
        border: `1px solid ${STATUS_COLOR[status]}`,
      }}
    >
      {status}
    </span>
  );
}