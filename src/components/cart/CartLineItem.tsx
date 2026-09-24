"use client";

import Link from "next/link";
import type { CartItem } from "@/lib/types";
import { formatPrice } from "@/lib/currency";
import { QtyStepper } from "./QtyStepper";

export function CartLineItem({
  item,
  onUpdate,
  onRemove,
}: {
  item: CartItem;
  onUpdate: (qty: number) => void;
  onRemove: () => void;
}) {
  const unit = item.variant.price?.amount ?? item.product.price.amount;
  return (
    <div style={{ display: "flex", gap: 12, padding: "var(--space-3) 0" }}>
      <Link href={item.product.href} style={{ flex: "0 0 auto" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.product.image.src}
          alt={item.product.image.alt}
          style={{ width: 72, height: 72, borderRadius: 12, objectFit: "cover" }}
        />
      </Link>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <Link href={item.product.href} style={{ fontWeight: 600, color: "var(--color-ink)" }}>
            {item.product.name}
          </Link>
          <button
            type="button"
            aria-label={`Remove ${item.product.name}`}
            onClick={onRemove}
            style={{ border: "none", background: "transparent", color: "var(--color-ink-muted)", fontSize: "var(--fs-caption)", textDecoration: "underline", padding: 0 }}
          >
            Remove
          </button>
        </div>
        <div style={{ fontSize: "var(--fs-caption)", color: "var(--color-ink-muted)" }}>
          {[item.variant.size, item.variant.colour].filter(Boolean).join(" · ")}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="tabular" style={{ fontSize: "var(--fs-caption)", color: "var(--color-ink-muted)" }}>
              {formatPrice(unit)}
            </span>
            <QtyStepper value={item.quantity} onChange={onUpdate} label={item.product.name} />
          </div>
          <span className="tabular" style={{ fontWeight: 700 }}>
            {formatPrice(unit * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}
