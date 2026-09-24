import type { Money } from "@/lib/types";
import { discountPercent, formatMoney } from "@/lib/currency";

export function Price({
  price,
  compareAt,
  size = "md",
}: {
  price: Money;
  compareAt?: Money;
  size?: "sm" | "md" | "lg";
}) {
  const pct =
    compareAt && compareAt.amount > price.amount
      ? discountPercent(price.amount, compareAt.amount)
      : 0;
  const fs =
    size === "lg" ? "var(--fs-h3)" : size === "sm" ? "var(--fs-caption)" : "var(--fs-body)";
  return (
    <span className="tabular" style={{ fontSize: fs, fontWeight: 700, display: "inline-flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
      <span>{formatMoney(price)}</span>
      {compareAt && pct > 0 && (
        <>
          <span style={{ textDecoration: "line-through", color: "var(--color-ink-muted)", fontWeight: 500 }}>
            {formatMoney(compareAt)}
          </span>
          <span style={{ color: "var(--color-accent)", fontWeight: 700 }}>−{pct}%</span>
        </>
      )}
    </span>
  );
}
