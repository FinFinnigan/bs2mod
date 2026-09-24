"use client";

import type { FilterOption } from "@/lib/types";
import type { ActiveFilters } from "@/lib/data/products";
import { FilterGroup } from "./FilterGroup";

const PRICE_BUCKETS = [
  { value: "", label: "Any price" },
  { value: "25", label: "Under €25" },
  { value: "50", label: "Under €50" },
  { value: "75", label: "Under €75" },
];

const MIN_PRICE_BUCKETS = [
  { value: "", label: "Any price" },
  { value: "25", label: "From €25" },
  { value: "50", label: "From €50" },
  { value: "75", label: "From €75" },
];

export function FilterRail({
  filters,
  active,
  onChange,
}: {
  filters: FilterOption[];
  active: ActiveFilters;
  onChange: (next: ActiveFilters) => void;
}) {
  function set(key: keyof ActiveFilters, values: string[]) {
    onChange({ ...active, [key]: values } as ActiveFilters);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--space-2) 0" }}>
        <span style={{ fontWeight: 800 }}>Filters</span>
        <button
          type="button"
          onClick={() => onChange({ ...active, age: [], type: [], size: [], fit: [], colour: [], onSale: false, isNew: false, minPrice: undefined, maxPrice: undefined })}
          style={{ border: "none", background: "transparent", color: "var(--color-primary)", fontSize: "var(--fs-caption)", fontWeight: 600, textDecoration: "underline", padding: 0 }}
        >
          Clear all
        </button>
      </div>

      {filters.map((f) => (
        <FilterGroup
          key={f.key}
          option={f}
          values={(active[f.key as keyof ActiveFilters] as string[]) ?? []}
          onChange={(v) => set(f.key as keyof ActiveFilters, v)}
        />
      ))}

      <div className="filter-group">
        <div className="variant-label">Price</div>
        <div className="pill-row" style={{ marginTop: 8 }}>
          {PRICE_BUCKETS.map((b) => {
            const current = active.maxPrice?.toString() ?? "";
            const selected = current === b.value;
            return (
              <button
                key={b.value}
                type="button"
                className="pill"
                aria-pressed={selected}
                onClick={() => onChange({ ...active, maxPrice: b.value ? Number(b.value) : undefined })}
              >
                {b.label}
              </button>
            );
          })}
        </div>
        <div className="pill-row" style={{ marginTop: 8 }}>
          {MIN_PRICE_BUCKETS.map((b) => {
            const current = active.minPrice?.toString() ?? "";
            const selected = current === b.value;
            return (
              <button
                key={b.value}
                type="button"
                className="pill"
                aria-pressed={selected}
                onClick={() => onChange({ ...active, minPrice: b.value ? Number(b.value) : undefined })}
              >
                {b.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="filter-group">
        <div className="pill-row">
          <button type="button" className="pill" aria-pressed={active.onSale} onClick={() => onChange({ ...active, onSale: !active.onSale })}>
            On sale
          </button>
          <button type="button" className="pill" aria-pressed={active.isNew} onClick={() => onChange({ ...active, isNew: !active.isNew })}>
            New
          </button>
        </div>
      </div>
    </div>
  );
}
