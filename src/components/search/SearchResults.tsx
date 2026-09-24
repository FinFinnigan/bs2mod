import Link from "next/link";
import type { ProductCard as ProductCardType } from "@/lib/types";
import { ProductGrid } from "@/components/product/ProductGrid";
import { EmptyState } from "@/components/ui/EmptyState";

export function SearchResults({
  query,
  products,
  totalCount,
  suggestions,
}: {
  query: string;
  products: ProductCardType[];
  totalCount: number;
  suggestions?: string[];
}) {
  if (products.length === 0) {
    return (
      <EmptyState
        title={`We couldn't find matches for "${query}"`}
        body="Try a different word, or browse our popular categories."
        actions={
          <>
            <Link href="/collection/new-arrivals" className="btn btn-primary">
              New arrivals
            </Link>
            <Link href="/collection/sale" className="btn btn-secondary">
              Sale
            </Link>
            <Link href="/shop" className="btn btn-ghost">
              Clear search
            </Link>
          </>
        }
      />
    );
  }
  return (
    <div>
      <p style={{ color: "var(--color-ink-muted)", margin: "0 0 var(--space-4)" }}>
        {totalCount} result{totalCount === 1 ? "" : "s"} for &quot;{query}&quot;
      </p>
      <ProductGrid products={products} />
      {suggestions && suggestions.length > 0 && (
        <div style={{ marginTop: "var(--space-6)" }}>
          <h3 style={{ marginBottom: 8 }}>Popular searches</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {suggestions.map((s) => (
              <Link key={s} href={`/search?q=${encodeURIComponent(s)}`} className="chip">
                {s}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
