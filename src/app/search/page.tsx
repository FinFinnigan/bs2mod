import { searchProducts } from "@/lib/backend/catalog-facade";
import { SearchResults } from "@/components/search/SearchResults";
import { Breadcrumb } from "@/components/product/Breadcrumb";

const SUGGESTIONS = ["Hoodie", "Tracksuit", "Jacket", "Sneakers", "Set"];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q ?? "";
  const results = await searchProducts(query);

  return (
    <div className="container" style={{ paddingTop: "var(--space-3)" }}>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Search" }]} />
      <h1 style={{ marginBottom: "var(--space-4)" }}>Search</h1>
      <SearchResults query={query} products={results.products} totalCount={results.totalCount} suggestions={SUGGESTIONS} />
    </div>
  );
}
