"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { OrderStatus } from "@/lib/backend/repositories/interfaces";

type Action = "confirm" | "fulfill" | "cancel" | "refund";

const ACTIONS: { action: Action; label: string; from: OrderStatus[] }[] = [
  { action: "confirm", label: "Confirm", from: ["placed"] },
  { action: "fulfill", label: "Fulfill", from: ["confirmed"] },
  { action: "cancel", label: "Cancel", from: ["placed", "confirmed"] },
  { action: "refund", label: "Refund", from: ["confirmed"] },
];

export function OrdersActions({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const router = useRouter();
  const [busy, setBusy] = useState<Action | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(action: Action) {
    setBusy(action);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error ?? "Something went wrong. Please try again.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
        {ACTIONS.map(({ action, label, from }) => (
          <button
            key={action}
            type="button"
            className={action === "cancel" ? "btn btn-secondary" : "btn btn-primary"}
            disabled={!from.includes(status) || busy !== null}
            onClick={() => run(action)}
          >
            {busy === action ? "Working…" : label}
          </button>
        ))}
      </div>
      {status === "confirmed" && (
        <p style={{ margin: "var(--space-2) 0 0", color: "var(--color-ink-muted)", fontSize: "var(--fs-caption)" }}>
          Payment refund is best-effort.
        </p>
      )}
      {error && <p style={{ margin: "var(--space-2) 0 0", color: "var(--color-error)" }}>{error}</p>}
    </div>
  );
}