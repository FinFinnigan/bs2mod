import type { ProductCard as ProductCardType } from "@/lib/types";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products }: { products: ProductCardType[] }) {
  return (
    <div className="grid-products">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
