import Link from "next/link";
import type { CartState } from "@/lib/types";
import { formatPrice } from "@/lib/currency";

export function CheckoutSummary({ cart }: { cart: CartState }) {
  return (
    <div className="card-surface" style={{ padding: "var(--space-4)" }}>
      <h2 style={{ fontSize: "var(--fs-h3)", marginBottom: 12 }}>Order summary</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {cart.items.map((item) => (
          <div key={item.variant.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: "var(--fs-body)" }}>
            <span style={{ color: "var(--color-ink-muted)" }}>
              {item.product.name} · {[item.variant.size, item.variant.colour].filter(Boolean).join(" · ")} × {item.quantity}
            </span>
            <span className="tabular">{formatPrice(item.lineTotal)}</span>
          </div>
        ))}
      </div>
      <div style={{ borderTop: "1px solid var(--color-border)", marginTop: 12, paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Subtotal</span>
          <span className="tabular">{formatPrice(cart.subtotal)}</span>
        </div>
        {cart.discounts?.map((d) => (
          <div key={d.label} style={{ display: "flex", justifyContent: "space-between", color: "var(--color-accent)" }}>
            <span>{d.label}</span>
            <span className="tabular">−{formatPrice(d.amount)}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "var(--fs-body-lg)" }}>
          <span>Total</span>
          <span className="tabular">{formatPrice(cart.total)}</span>
        </div>
      </div>
    </div>
  );
}
