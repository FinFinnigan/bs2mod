"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { ProductPDP } from "@/lib/types";
import { formatMoney } from "@/lib/currency";
import { useCart } from "@/lib/cart/CartProvider";
import { useToast } from "@/lib/toast/ToastProvider";
import { CATEGORIES } from "@/lib/data/site";
import { Breadcrumb } from "@/components/storefront/vanilla/product/Breadcrumb";
import { Gallery } from "@/components/storefront/vanilla/product/Gallery";
import { VariantSelector, type VariantSelection } from "@/components/product/VariantSelector";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { StockIndicator } from "@/components/product/StockIndicator";
import { Price } from "@/components/ui/Price";
import { BadgeRow } from "@/components/storefront/vanilla/ui/Badge";
import { Stars } from "@/components/ui/Stars";
import { pickPrimaryBadge } from "@/lib/badges";
import { IconLock, IconReturn, IconTruck } from "@/components/ui/icons";
import { ProductGrid } from "@/components/product/ProductGrid";
import { WishlistToggle } from "@/components/storefront/vanilla/product/WishlistToggle";

export function PdpView({ pdp }: { pdp: ProductPDP }) {
  const { addItem } = useCart();
  const { show } = useToast();
  const [sel, setSel] = useState<VariantSelection>({});
  const [hint, setHint] = useState("");
  const [readMore, setReadMore] = useState(false);
  const [writing, setWriting] = useState(false);
  const sizeRef = useRef<HTMLDivElement>(null);

  const sizes = useMemo(
    () => Array.from(new Set(pdp.variants.map((v) => v.size).filter(Boolean))) as string[],
    [pdp.variants]
  );
  const colours = useMemo(() => {
    const m = new Map<string, string | undefined>();
    pdp.variants.forEach((v) => {
      if (v.colour) m.set(v.colour, v.colourHex);
    });
    return Array.from(m.entries()).map(([name, hex]) => ({ name, hex }));
  }, [pdp.variants]);

  const distribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    pdp.reviews.forEach((r) => {
      const idx = Math.min(4, Math.max(0, Math.round(r.rating) - 1));
      counts[idx] += 1;
    });
    const total = pdp.reviews.length || 1;
    return counts
      .map((count, i) => ({ stars: i + 1, count, pct: (count / total) * 100 }))
      .reverse();
  }, [pdp.reviews]);

  const selectedVariant = useMemo(
    () => pdp.variants.find((v) => v.size === sel.size && v.colour === sel.colour),
    [pdp.variants, sel]
  );
  const price = selectedVariant?.price ?? pdp.price;
  const catSlug = CATEGORIES.find((c) => c.label.toUpperCase() === pdp.categoryLabel)?.slug;
  const primaryBadge = pickPrimaryBadge(pdp.badges);

  function addToBag() {
    if (!selectedVariant) {
      setHint("Select a size and colour first");
      sizeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    addItem(pdp, selectedVariant);
    show(`Added to bag ┬À ${[selectedVariant.size, selectedVariant.colour].filter(Boolean).join(" ")}`);
  }

  const soldOut = selectedVariant != null && selectedVariant.stock <= 0;

  return (
    <div className="container" style={{ paddingTop: "var(--space-4)" }}>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: pdp.categoryLabel, href: catSlug ? `/category/${catSlug}` : undefined },
          { label: pdp.name },
        ]}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "var(--space-8)" }} className="pdp-layout">
        <Gallery images={pdp.gallery} />

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <BadgeRow badges={primaryBadge ? [primaryBadge] : []} />
          <div>
            <div className="eyebrow">{pdp.categoryLabel}</div>
            <h1 style={{ marginTop: 4 }}>{pdp.name}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
              {pdp.reviewSummary.count > 0 ? (
                <a href="#reviews" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--color-ink)" }}>
                  <Stars rating={pdp.reviewSummary.average} />
                  <span className="tabular" style={{ color: "var(--color-ink-muted)" }}>
                    {pdp.reviewSummary.average.toFixed(1)} ({pdp.reviewSummary.count})
                  </span>
                </a>
              ) : (
                <span style={{ color: "var(--color-ink-muted)" }}>No reviews yet</span>
              )}
            </div>
          </div>

          <Price price={price} compareAt={pdp.compareAtPrice} size="lg" />

          <div ref={sizeRef}>
            <VariantSelector
              sizes={sizes}
              colours={colours}
              variants={pdp.variants}
              selected={sel}
              onSelect={(next) => {
                setSel(next);
                setHint("");
              }}
              category={pdp.categoryLabel}
            />
          </div>

          {selectedVariant && <StockIndicator stock={selectedVariant.stock} />}
          {hint && (
            <p role="alert" style={{ color: "var(--color-error)", margin: 0, fontSize: "var(--fs-caption)" }}>
              {hint}
            </p>
          )}

          {soldOut ? (
            <button
              className="btn btn-secondary btn-block"
              type="button"
              onClick={() => show("We'll let you know when it's back in stock.")}
            >
              Notify me
            </button>
          ) : (
            <AddToCartButton
              label={selectedVariant ? "Add to bag" : "Add to bag"}
              priceLabel={formatMoney(price)}
              onClick={addToBag}
              disabled={!selectedVariant}
            />
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "var(--space-4)", flexWrap: "wrap", fontSize: "var(--fs-caption)", color: "var(--color-ink-muted)" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <IconLock size={16} /> Secure checkout
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <IconTruck size={16} /> Free delivery over Ôé¼50
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <IconReturn size={16} /> Free 30-day returns
              </span>
            </div>
            <WishlistToggle productId={pdp.id} label={pdp.name} />
          </div>

          <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "var(--space-4)" }}>
            <h3>Description</h3>
            <p style={{ color: "var(--color-ink-muted)", margin: "8px 0 0", display: "-webkit-box", WebkitLineClamp: readMore ? undefined : 3, WebkitBoxOrient: "vertical", overflow: readMore ? "visible" : "hidden" }}>
              {pdp.description}
            </p>
            {pdp.description.split(" ").length > 30 && (
              <button type="button" className="size-guide-link" onClick={() => setReadMore(!readMore)}>
                {readMore ? "Read less" : "Read more"}
              </button>
            )}
          </div>

          <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "var(--space-4)" }}>
            <h3>Details</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
              <tbody>
                {pdp.attributes.map((a) => (
                  <tr key={a.label} style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <td style={{ padding: "8px 0", color: "var(--color-ink-muted)", width: "40%" }}>{a.label}</td>
                    <td style={{ padding: "8px 0", fontWeight: 600 }}>{a.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ background: "var(--color-well)", borderRadius: "var(--radius-card)", padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: 8 }}>
            <div>
              <strong>Shipping</strong>
              <p style={{ margin: "4px 0 0", color: "var(--color-ink-muted)", fontSize: "var(--fs-caption)" }}>{pdp.shippingPolicy}</p>
            </div>
            <div>
              <strong>Returns</strong>
              <p style={{ margin: "4px 0 0", color: "var(--color-ink-muted)", fontSize: "var(--fs-caption)" }}>{pdp.returnsPolicy}</p>
            </div>
          </div>
        </div>
      </div>

      <section style={{ marginTop: "var(--space-12)" }}>
        <h2>Complete the look</h2>
        <div style={{ marginTop: "var(--space-4)" }}>
          <ProductGrid products={pdp.crossSell["complete-the-look"]} />
        </div>
      </section>

      <section style={{ marginTop: "var(--space-12)" }}>
        <h2>You may also like</h2>
        <div style={{ marginTop: "var(--space-4)" }}>
          <ProductGrid products={pdp.crossSell["you-may-also-like"]} />
        </div>
      </section>

      <section id="reviews" style={{ marginTop: "var(--space-12)", maxWidth: 720 }}>
        <h2>Reviews</h2>
        {pdp.reviewSummary.count > 0 ? (
          <div style={{ marginTop: "var(--space-4)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="tabular" style={{ fontSize: "var(--fs-display)", fontWeight: 800 }}>
                {pdp.reviewSummary.average.toFixed(1)}
              </span>
              <div>
                <Stars rating={pdp.reviewSummary.average} size={18} />
                <p style={{ margin: "4px 0 0", color: "var(--color-ink-muted)", fontSize: "var(--fs-caption)" }}>
                  {pdp.reviewSummary.count} review{pdp.reviewSummary.count === 1 ? "" : "s"}
                </p>
              </div>
            </div>
            <div style={{ marginTop: "var(--space-4)", display: "flex", flexDirection: "column", gap: 6 }}>
              {distribution.map((d) => (
                <div key={d.stars} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "var(--fs-caption)" }}>
                  <span style={{ width: 72, flexShrink: 0 }}>
                    <Stars rating={d.stars} size={12} />
                  </span>
                  <div style={{ flex: 1, height: 8, borderRadius: "var(--radius-pill)", background: "var(--color-well)", overflow: "hidden" }}>
                    <div style={{ width: `${d.pct}%`, height: "100%", background: "var(--color-primary)" }} />
                  </div>
                  <span className="tabular" style={{ width: 24, textAlign: "right", color: "var(--color-ink-muted)" }}>
                    {d.count}
                  </span>
                </div>
              ))}
            </div>
            <ul style={{ marginTop: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              {pdp.reviews.map((r) => (
                <li key={r.id} style={{ borderTop: "1px solid var(--color-border)", paddingTop: "var(--space-4)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <strong>{r.author}</strong>
                    <span style={{ color: "var(--color-ink-muted)", fontSize: "var(--fs-caption)" }}>
                      {new Date(r.date).toLocaleDateString("en-IE", { month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <Stars rating={r.rating} />
                  </div>
                  <p style={{ margin: "6px 0 0", fontWeight: 600 }}>{r.title}</p>
                  <p style={{ margin: "4px 0 0", color: "var(--color-ink-muted)" }}>{r.comment}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p style={{ color: "var(--color-ink-muted)" }}>No reviews yet ÔÇö be the first to review this product.</p>
        )}

        {!writing ? (
          <button type="button" className="btn btn-secondary" style={{ marginTop: "var(--space-4)" }} onClick={() => setWriting(true)}>
            Write a review
          </button>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setWriting(false);
              show("Thanks for your review!");
            }}
            className="card-surface"
            style={{ marginTop: "var(--space-4)", padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: 12, maxWidth: 480 }}
          >
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "var(--fs-caption)", fontWeight: 600 }}>
              Rating
              <select required defaultValue="5" style={{ padding: 8, borderRadius: "var(--radius-input)", border: "1px solid var(--color-border)" }}>
                <option value="5">5 ÔÇö Excellent</option>
                <option value="4">4 ÔÇö Good</option>
                <option value="3">3 ÔÇö Average</option>
                <option value="2">2 ÔÇö Poor</option>
                <option value="1">1 ÔÇö Terrible</option>
              </select>
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "var(--fs-caption)", fontWeight: 600 }}>
              Title
              <input required style={{ padding: 8, borderRadius: "var(--radius-input)", border: "1px solid var(--color-border)" }} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "var(--fs-caption)", fontWeight: 600 }}>
              Review
              <textarea required style={{ padding: 8, borderRadius: "var(--radius-input)", border: "1px solid var(--color-border)", minHeight: 80 }} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "var(--fs-caption)", fontWeight: 600 }}>
              Name
              <input required style={{ padding: 8, borderRadius: "var(--radius-input)", border: "1px solid var(--color-border)" }} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "var(--fs-caption)", fontWeight: 600 }}>
              Email
              <input required type="email" style={{ padding: 8, borderRadius: "var(--radius-input)", border: "1px solid var(--color-border)" }} />
            </label>
            <button type="submit" className="btn btn-primary">
              Submit review
            </button>
          </form>
        )}
      </section>

      <style jsx>{`
        @media (min-width: 1024px) {
          .pdp-layout {
            grid-template-columns: 1.2fr 1fr;
          }
        }
      `}</style>
    </div>
  );
}
