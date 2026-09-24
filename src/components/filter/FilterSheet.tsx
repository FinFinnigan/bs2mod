"use client";

import type { FilterOption } from "@/lib/types";
import type { ActiveFilters } from "@/lib/data/products";
import { FilterGroup } from "./FilterGroup";
import { IconClose } from "@/components/ui/icons";

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

export function FilterSheet({
  open,
  onClose,
  filters,
  active,
  onChange,
  resultCount,
}: {
  open: boolean;
  onClose: () => void;
  filters: FilterOption[];
  active: ActiveFilters;
  onChange: (next: ActiveFilters) => void;
  resultCount: number;
}) {
  if (!open) return null;
  const set = (key: keyof ActiveFilters, values: string[]) =>
    onChange({ ...active, [key]: values } as ActiveFilters);

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="sheet sheet-bottom" role="dialog" aria-modal="true" aria-label="Filters">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--space-4)", borderBottom: "1px solid var(--color-border)" }}>
          <span style={{ fontWeight: 800 }}>Filters</span>
          <button type="button" className="header__icon" onClick={onClose} aria-label="Close filters">
            <IconClose />
          </button>
        </div>
        <div style={{ padding: "var(--space-4)", overflowY: "auto" }}>
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
                const selected = (active.maxPrice?.toString() ?? "") === b.value;
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
                const selected = (active.minPrice?.toString() ?? "") === b.value;
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
        <div style={{ padding: "var(--space-4)", borderTop: "1px solid var(--color-border)", display: "flex", gap: 12 }}>
          <button type="button" className="btn btn-primary btn-block" onClick={onClose}>
            Show results ({resultCount})
          </button>
        </div>
      </div>
    </>
  );
}
