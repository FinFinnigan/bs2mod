"use client";

import { useEffect, useState } from "react";
import { IconHeart } from "@/components/ui/icons";

const KEY = "boyshop.wishlist.v1";

function readWishlist(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function WishlistToggle({ productId, label }: { productId: string; label: string }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(readWishlist().includes(productId));
  }, [productId]);

  function toggle() {
    const list = readWishlist();
    const next = list.includes(productId)
      ? list.filter((id) => id !== productId)
      : [...list, productId];
    localStorage.setItem(KEY, JSON.stringify(next));
    setSaved(next.includes(productId));
  }

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${label} from wishlist` : `Add ${label} to wishlist`}
      onClick={toggle}
      className="product-card__wishlist"
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        display: "grid",
        placeItems: "center",
        color: saved ? "var(--color-accent)" : "var(--color-ink)",
      }}
    >
      <IconHeart size={18} filled={saved} />
    </button>
  );
}
