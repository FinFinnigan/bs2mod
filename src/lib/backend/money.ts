// Money helpers. The database stores integer minor units (cents) to avoid
// floating-point drift; the §11 `Money` contract uses major units (euros).
// Conversion happens ONLY at the repository boundary.

import type { Money } from "@/lib/types";

export const DEFAULT_CURRENCY = "EUR";

export function toMinor(m: Money): number {
  return Math.round(m.amount * 100);
}

export function toMoney(minor: number, currency = DEFAULT_CURRENCY): Money {
  return { amount: minor / 100, currency };
}

export function money(amount: number, currency = DEFAULT_CURRENCY): Money {
  return { amount, currency };
}
