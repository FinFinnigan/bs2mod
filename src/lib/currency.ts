import type { Money } from "./types";

export const DEFAULT_CURRENCY = "EUR";

export function formatMoney(m: Money): string {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: m.currency || DEFAULT_CURRENCY,
  }).format(m.amount);
}

export function formatPrice(amount: number, currency = DEFAULT_CURRENCY): string {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency,
  }).format(amount);
}

export function discountPercent(price: number, compareAt: number): number {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}
