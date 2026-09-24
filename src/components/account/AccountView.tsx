"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CatalogProduct } from "@/lib/data/products";
import { ProductGrid } from "@/components/product/ProductGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { Breadcrumb } from "@/components/product/Breadcrumb";
import { useToast } from "@/lib/toast/ToastProvider";

const WISHLIST_KEY = "boyshop.wishlist.v1";

export function AccountView({ products }: { products: CatalogProduct[] }) {
  const { show } = useToast();
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(WISHLIST_KEY);
      setWishlist(raw ? (JSON.parse(raw) as string[]) : []);
    } catch {
      setWishlist([]);
    }
  }, []);

  const saved = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="container" style={{ paddingTop: "var(--space-3)" }}>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Account" }]} />
      <h1>Account</h1>

      <div className="card-surface" style={{ padding: "var(--space-4)", marginTop: "var(--space-4)", display: "flex", flexDirection: "column", gap: 8 }}>
        <strong>Sign in to view your orders</strong>
        <p style={{ margin: 0, color: "var(--color-ink-muted)" }}>
          Track orders, manage addresses and save your sizes. Account features are not part of this demo build yet.
        </p>
        <div>
          <button type="button" className="btn btn-primary" onClick={() => show("Account sign-in is not part of this demo build.")}>
            Sign in
          </button>
        </div>
      </div>

      <section style={{ marginTop: "var(--space-12)" }}>
        <h2>Wishlist</h2>
        <div style={{ marginTop: "var(--space-4)" }}>
          {saved.length === 0 ? (
            <EmptyState
              title="Your wishlist is empty"
              body="Tap the heart on any product to save it here."
              actions={
                <Link href="/shop" className="btn btn-primary">
                  Shop new
                </Link>
              }
            />
          ) : (
            <ProductGrid products={saved} />
          )}
        </div>
      </section>
    </div>
  );
}