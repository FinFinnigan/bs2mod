"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart/CartProvider";
import { AGE_BANDS, CATEGORIES, SITE } from "@/lib/data/site";
import { IconCart, IconHeart, IconMenu, IconSearch } from "@/components/ui/icons";
import { PromoStrip } from "./PromoStrip";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { StickyBottomBar } from "./StickyBottomBar";
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
    </>
  );
}
