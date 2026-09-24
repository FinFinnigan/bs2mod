"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { SITE } from "@/lib/data/site";
import { IconClose } from "@/components/ui/icons";

export function PromoStrip() {
  const [dismissed, setDismissed] = useState(false);
  const pathname = usePathname();
  if (dismissed || pathname?.startsWith("/checkout")) return null;
  return (
    <div className="promo-strip" role="region" aria-label="Announcement">
      <span>{SITE.promoStrip}</span>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss announcement"
        style={{
          background: "transparent",
          border: "none",
          color: "rgba(255,255,255,0.8)",
          padding: "14px",
          margin: "-14px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <IconClose size={16} />
      </button>
    </div>
  );
}
