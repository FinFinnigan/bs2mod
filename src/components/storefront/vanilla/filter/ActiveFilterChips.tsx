"use client";

import type { ActiveFilters } from "@/lib/data/products";
import { AGE_BANDS, CATEGORIES } from "@/lib/data/site";

function labelFor(key: string, value: string): string {
  if (key === "age") return AGE_BANDS.find((a) => a.short === value)?.label ?? value;
  if (key === "type") return CATEGORIES.find((c) => c.slug === value)?.label ?? value;
  return value;
}

export function ActiveFilterChips({
  active,
  onRemove,
  onClearAll,
}: {
  active: ActiveFilters;
  onRemove: (key: string, value: string) => void;
  onClearAll: () => void;
}) {
  const entries: { key: string; value: string; label: string }[] = [];
  (["age", "type", "size", "fit", "colour"] as const).forEach((k) => {
    active[k].forEach((v) => entries.push({ key: k, value: v, label: labelFor(k, v) }));
  });
  if (active.onSale) entries.push({ key: "onSale", value: "onSale", label: "On sale" });
  if (active.isNew) entries.push({ key: "isNew", value: "isNew", label: "New" });
  if (active.minPrice != null && active.maxPrice != null) {
    entries.push({ key: "price", value: "", label: `Ôé¼${active.minPrice}ÔÇô${active.maxPrice}` });
  } else {
    if (active.minPrice != null)
      entries.push({ key: "minPrice", value: "", label: `From Ôé¼${active.minPrice}` });
    if (active.maxPrice != null)
      entries.push({ key: "maxPrice", value: "", label: `Under Ôé¼${active.maxPrice}` });
  }

  if (!entries.length) return null;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
      {entries.map((e) => (
        <span key={`${e.key}-${e.value}-${e.label}`} className="chip">
          {e.label}
          <button
            type="button"
            aria-label={`Remove filter ${e.label}`}
            onClick={() => onRemove(e.key, e.value)}
            style={{ border: "none", background: "transparent", fontWeight: 700, fontSize: 14, lineHeight: 1, padding: 0, color: "var(--color-ink)" }}
          >
            ├ù
          </button>
        </span>
      ))}
      <button type="button" onClick={onClearAll} style={{ border: "none", background: "transparent", color: "var(--color-primary)", fontSize: "var(--fs-caption)", fontWeight: 600, textDecoration: "underline", padding: 0 }}>
        Clear all
      </button>
    </div>
  );
}
