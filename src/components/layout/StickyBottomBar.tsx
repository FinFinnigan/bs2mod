"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart/CartProvider";
import { IconCart, IconHome, IconMenu, IconSearch } from "@/components/ui/icons";

export function StickyBottomBar({
  onOpenMenu,
  onOpenSearch,
}: {
  onOpenMenu: () => void;
  onOpenSearch: () => void;
}) {
  const { cart, openCart } = useCart();
  const pathname = usePathname();

  return (
    <nav className="bottom-bar" aria-label="Primary">
      <Link href="/" className={pathname === "/" ? "active" : ""}>
        <IconHome size={22} />
        <span>Home</span>
      </Link>
      <button type="button" onClick={onOpenMenu}>
        <IconMenu size={22} />
        <span>Categories</span>
      </button>
      <button type="button" onClick={onOpenSearch}>
        <IconSearch size={22} />
        <span>Search</span>
      </button>
      <button type="button" onClick={openCart}>
        <span style={{ position: "relative", display: "inline-flex" }}>
          <IconCart size={22} />
          {cart.itemCount > 0 && <span className="cart-badge">{cart.itemCount}</span>}
        </span>
        <span>Cart</span>
      </button>
    </nav>
  );
}
