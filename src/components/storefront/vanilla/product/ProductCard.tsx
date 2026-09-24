"use client";

import Link from "next/link";
import type { ProductCard as ProductCardType } from "@/lib/types";
import { Price } from "@/components/ui/Price";
import { BadgePill } from "@/components/storefront/vanilla/ui/Badge";
import { WishlistToggle } from "./WishlistToggle";

export function ProductCard({ product }: { product: ProductCardType }) {
  const badge = product.badges[0];
  return (
    <div className={`product-card ${product.inStock ? "" : "is-sold-out"}`}>
      <Link href={product.href} aria-label={product.name}>
        <div className="product-card__media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.image.src} alt={product.image.alt} loading="lazy" />
          {badge && (
            <span className="product-card__badge">
              <BadgePill badge={badge} />
            </span>
          )}
          {!product.inStock && (
            <span
              className="product-card__badge"
              style={{ top: "auto", bottom: 8, left: 8, background: "var(--color-ink)", color: "#fff", padding: "4px 10px", borderRadius: "var(--radius-pill)", fontSize: "var(--fs-caption)", fontWeight: 700 }}
            >
              Sold out
            </span>
          )}
        </div>
      </Link>
      <WishlistToggle productId={product.id} label={product.name} />
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <div className="eyebrow" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <span>{product.categoryLabel}</span>
          {product.ageLabel && <span>┬À {product.ageLabel}</span>}
        </div>
        <Link href={product.href} style={{ fontWeight: 600, color: "var(--color-ink)" }}>
          {product.name}
        </Link>
        <Price price={product.price} compareAt={product.compareAtPrice} size="sm" />
      </div>
    </div>
  );
}
