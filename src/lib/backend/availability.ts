// C02.04 — One authoritative availability rule.
//
// `variants.stock` is the single source of truth for availability. Every
// availability read and every write that touches variant stock derives
// product-level `inStock` through this one helper, so the stored
// `products.inStock` column can no longer disagree with variant stock.

export function isInStock(variants: ReadonlyArray<{ stock: number }>): boolean {
  return variants.some((v) => v.stock > 0);
}