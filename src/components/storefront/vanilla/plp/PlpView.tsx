"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { CatalogProduct } from "@/lib/data/products";
import {
  applyFilters,
  buildFilters,
  EMPTY_FILTERS,
  type ActiveFilters,
} from "@/lib/data/products";
import { ProductGrid } from "@/components/product/ProductGrid";
import { EmptyState } from "@/components/storefront/vanilla/ui/EmptyState";
import { FilterRail } from "@/components/filter/FilterRail";
import { FilterSheet } from "@/components/filter/FilterSheet";
import { ActiveFilterChips } from "@/components/storefront/vanilla/filter/ActiveFilterChips";
import { SortControl } from "@/components/storefront/vanilla/filter/SortControl";

export function PlpView({
  title,
  products: initial,
  preSelectAge,
  preSelectSale,
}: {
  title: string;
  products: CatalogProduct[];
  preSelectAge?: string;
  preSelectSale?: boolean;
}) {
  const filters = useMemo(() => buildFilters(), []);
  const [active, setActive] = useState<ActiveFilters>({
    ...EMPTY_FILTERS,
    age: preSelectAge ? [preSelectAge] : [],
    onSale: preSelectSale ?? false,
  });
  const [sort, setSort] = useState("featured");
  const [sheetOpen, setSheetOpen] = useState(false);

  const results = useMemo(
    () => applyFilters(initial, active, sort),
    [initial, active, sort]
  );

  function removeFilter(key: string, value: string) {
    if (key === "onSale") setActive({ ...active, onSale: false });
    else if (key === "isNew") setActive({ ...active, isNew: false });
    else if (key === "maxPrice") setActive({ ...active, maxPrice: undefined });
    else if (key === "minPrice") setActive({ ...active, minPrice: undefined });
    else if (key === "price") setActive({ ...active, minPrice: undefined, maxPrice: undefined });
    else setActive({ ...active, [key]: (active[key as keyof ActiveFilters] as string[]).filter((v) => v !== value) } as ActiveFilters);
  }

  function clearAll() {
    setActive(EMPTY_FILTERS);
  }

  const hasActive =
    active.age.length > 0 ||
    active.type.length > 0 ||
    active.size.length > 0 ||
    active.fit.length > 0 ||
    active.colour.length > 0 ||
    active.onSale ||
    active.isNew ||
    active.minPrice != null ||
    active.maxPrice != null;

  return (
    <div className="container" style={{ paddingTop: "var(--space-6)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <h1>{title}</h1>
        <span style={{ color: "var(--color-ink-muted)" }} className="tabular">
          {results.length} item{results.length === 1 ? "" : "s"}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 8 }}>
        <button type="button" className="btn btn-secondary mobile-only" onClick={() => setSheetOpen(true)}>
          Filters{hasActive ? ` (${results.length})` : ""}
        </button>
        <SortControl value={sort} onChange={setSort} />
        <style jsx>{`
          .mobile-only {
            display: inline-flex;
          }
          @media (min-width: 1024px) {
            .mobile-only {
              display: none;
            }
          }
        `}</style>
      </div>

      <ActiveFilterChips active={active} onRemove={removeFilter} onClearAll={clearAll} />

      <div style={{ display: "flex", gap: "var(--space-8)", marginTop: "var(--space-4)" }}>
        <aside style={{ display: "none", width: 240, flexShrink: 0 }} className="plp-rail">
          <FilterRail filters={filters} active={active} onChange={setActive} />
          <style jsx>{`
            .plp-rail {
              display: none;
            }
            @media (min-width: 1024px) {
              .plp-rail {
                display: block;
              }
            }
          `}</style>
        </aside>

        <div style={{ flex: 1, minWidth: 0 }}>
          {results.length === 0 ? (
            <EmptyState
              title="No products match your filters"
              body="Try clearing a filter or two, or browse everything."
              actions={
                <button className="btn btn-primary" onClick={clearAll}>
                  Clear filters
                </button>
              }
            />
          ) : (
            <ProductGrid products={results} />
          )}
        </div>
      </div>

      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        filters={filters}
        active={active}
        onChange={setActive}
        resultCount={results.length}
      />
    </div>
  );
}
