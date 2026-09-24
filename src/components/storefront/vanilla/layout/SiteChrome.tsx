"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart/CartProvider";
import { AGE_BANDS, CATEGORIES, SITE } from "@/lib/data/site";
import { IconCart, IconHeart, IconMenu, IconSearch } from "@/components/ui/icons";
import { PromoStrip } from "./PromoStrip";
import { MobileNavDrawer } from "@/components/layout/MobileNavDrawer";
import { StickyBottomBar } from "@/components/layout/StickyBottomBar";
import { SearchOverlay } from "@/components/search/SearchOverlay";

export function SiteChrome() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { cart, openCart } = useCart();

  return (
    <>
      <header className="header-wrap">
        <PromoStrip />
        <div className="header container">
          <button
            type="button"
            className="header__icon mobile-only"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <IconMenu />
          </button>

          <Link href="/" className="wordmark">
            {SITE.name}
          </Link>

          <nav className="desktop-nav" aria-label="Primary">
            <details className="nav-dropdown" onMouseLeave={(event) => event.currentTarget.removeAttribute("open")}>
              <summary>Shop by Age</summary>
              <div className="nav-dropdown__panel">
                {AGE_BANDS.map((a) => (
                  <Link key={a.slug} href={`/collection/${a.slug}`}>
                    {a.label}
                  </Link>
                ))}
              </div>
            </details>
            <details className="nav-dropdown" onMouseLeave={(event) => event.currentTarget.removeAttribute("open")}>
              <summary>Shop by Type</summary>
              <div className="nav-dropdown__panel">
                {CATEGORIES.map((c) => (
                  <Link key={c.slug} href={`/category/${c.slug}`}>
                    {c.label}
                  </Link>
                ))}
              </div>
            </details>
            <Link href="/collection/new-arrivals" className="nav-link">
              New
            </Link>
            <Link href="/collection/sale" className="nav-link sale">
              Sale
            </Link>
          </nav>

          <div style={{ flex: 1 }} />

          <button type="button" className="header__icon" onClick={() => setSearchOpen(true)} aria-label="Search">
            <IconSearch />
          </button>
          <Link href="/account" className="nav-link desktop-only" style={{ whiteSpace: "nowrap" }}>
            Account
          </Link>
          <Link href="/account?tab=wishlist" className="header__icon desktop-only" aria-label="Wishlist">
            <IconHeart />
          </Link>
          <button type="button" className="header__icon" onClick={openCart} aria-label="Open cart">
            <IconCart />
            {cart.itemCount > 0 && <span className="cart-badge">{cart.itemCount}</span>}
          </button>
        </div>
      </header>

      <MobileNavDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <StickyBottomBar onOpenMenu={() => setMenuOpen(true)} onOpenSearch={() => setSearchOpen(true)} />

      <style jsx>{`
        .mobile-only {
          display: inline-flex;
        }
        .desktop-only {
          display: none;
        }
        @media (min-width: 1024px) {
          .mobile-only {
            display: none;
          }
          .desktop-only {
            display: inline-flex;
          }
        }
        .nav-dropdown {
          position: relative;
        }
        .nav-dropdown summary {
          list-style: none;
          cursor: pointer;
          font-size: var(--fs-body);
          font-weight: 600;
          color: var(--color-ink);
          display: inline-flex;
          align-items: center;
          gap: 2px;
          user-select: none;
        }
        .nav-dropdown summary::-webkit-details-marker {
          display: none;
        }
        .nav-dropdown summary::after {
          content: "";
          width: 0;
          height: 0;
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-top: 5px solid currentColor;
          margin-left: 4px;
        }
        .nav-dropdown__panel {
          position: absolute;
          top: 100%;
          left: 0;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 12px;
          box-shadow: var(--shadow-md);
          padding: 8px;
          min-width: 220px;
          display: flex;
          flex-direction: column;
          z-index: 45;
        }
        .nav-dropdown:not([open]) .nav-dropdown__panel {
          display: none;
        }
        .nav-dropdown__panel a {
          padding: 10px 12px;
          border-radius: 8px;
          font-size: var(--fs-body);
          font-weight: 600;
        }
        .nav-dropdown__panel a:hover {
          background: var(--color-well);
        }
      `}</style>
    </>
  );
}
