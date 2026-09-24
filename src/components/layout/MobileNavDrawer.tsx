"use client";

import Link from "next/link";
import { AGE_BANDS, CATEGORIES, SITE } from "@/lib/data/site";
import { IconClose } from "@/components/ui/icons";

export function MobileNavDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} aria-hidden="true" />
      <nav
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        style={{ top: 0, left: 0, bottom: 0, width: "min(84vw, 360px)", padding: "var(--space-4)" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span className="wordmark">{SITE.name}</span>
          <button type="button" className="header__icon" onClick={onClose} aria-label="Close menu">
            <IconClose />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <p className="eyebrow" style={{ margin: "12px 0 4px" }}>Shop by Age</p>
          {AGE_BANDS.map((a) => (
            <Link key={a.slug} href={`/collection/${a.slug}`} onClick={onClose} style={{ padding: "10px 0", fontSize: "var(--fs-body)", fontWeight: 600 }}>
              {a.label} <span style={{ color: "var(--color-ink-muted)", fontWeight: 400 }}>· {a.blurb}</span>
            </Link>
          ))}

          <p className="eyebrow" style={{ margin: "12px 0 4px" }}>Shop by Type</p>
          {CATEGORIES.map((c) => (
            <Link key={c.slug} href={`/category/${c.slug}`} onClick={onClose} style={{ padding: "10px 0", fontSize: "var(--fs-body)", fontWeight: 600 }}>
              {c.label}
            </Link>
          ))}

          <p className="eyebrow" style={{ margin: "12px 0 4px" }}>Discover</p>
          <Link href="/collection/new-arrivals" onClick={onClose} style={{ padding: "10px 0", fontSize: "var(--fs-body)", fontWeight: 600 }}>
            New arrivals
          </Link>
          <Link href="/collection/sale" onClick={onClose} className="nav-link sale" style={{ padding: "10px 0", fontSize: "var(--fs-body)", fontWeight: 600 }}>
            Sale
          </Link>
        </div>

        <div style={{ borderTop: "1px solid var(--color-border)", marginTop: 16, paddingTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          <Link href="/account" onClick={onClose} style={{ fontSize: "var(--fs-body)", fontWeight: 600 }}>Account</Link>
          <Link href="/account?tab=wishlist" onClick={onClose} style={{ fontSize: "var(--fs-body)", fontWeight: 600 }}>Wishlist</Link>
          <Link href="/size-guide" onClick={onClose} style={{ fontSize: "var(--fs-body)", fontWeight: 600 }}>Size guide</Link>
          <Link href="/story" onClick={onClose} style={{ fontSize: "var(--fs-body)", fontWeight: 600 }}>Our story</Link>
        </div>
      </nav>
    </>
  );
}
