"use client";

import { useRouter } from "next/navigation";

const STATUSES = [
  "draft",
  "placed",
  "confirmed",
  "fulfilled",
  "cancelled",
  "failed",
  "refunded",
] as const;

export function OrdersFilter({ current }: { current?: string }) {
  const router = useRouter();

  return (
    <select
      aria-label="Filter orders by status"
      value={current ?? ""}
      onChange={(e) => {
        const value = e.target.value;
        router.push(value ? `/admin/orders?status=${value}` : "/admin/orders");
        router.refresh();
      }}
      style={{
        minHeight: 44,
        padding: "0 14px",
        borderRadius: "var(--radius-input)",
        border: "1px solid var(--color-border)",
        background: "var(--color-surface)",
        color: "var(--color-ink)",
        fontSize: "var(--fs-body)",
      }}
    >
      <option value="">All statuses</option>
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}