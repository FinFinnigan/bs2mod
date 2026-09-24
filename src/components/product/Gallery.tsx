"use client";

import { useRef, useState } from "react";
import type { ProductImage } from "@/lib/types";

export function Gallery({ images }: { images: ProductImage[] }) {
  const [index, setIndex] = useState(0);
  const touchX = useRef<number | null>(null);
  const total = images.length;

  function go(i: number) {
    setIndex((i + total) % total);
  }

  if (total === 0) return null;

  return (
    <div className="product-gallery">
      <div
        className="product-gallery__main"
        style={{ position: "relative", borderRadius: "var(--radius-card)", overflow: "hidden", background: "var(--color-well)" }}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current == null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
          touchX.current = null;
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[index].src} alt={images[index].alt} style={{ width: "100%", aspectRatio: "3 / 4", objectFit: "cover" }} />
        <span
          style={{
            position: "absolute",
            right: 12,
            bottom: 12,
            background: "rgba(27,31,38,0.7)",
            color: "var(--color-ink-on-dark)",
            padding: "4px 10px",
            borderRadius: "var(--radius-pill)",
            fontSize: "var(--fs-caption)",
            fontWeight: 700,
          }}
        >
          {index + 1} / {total}
        </span>
      </div>
      <div className="product-gallery__thumbs" style={{ display: "flex", gap: 8, marginTop: 8, overflowX: "auto" }}>
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Image ${i + 1} of ${total}`}
            aria-current={i === index}
            onClick={() => setIndex(i)}
            style={{
              flex: "0 0 auto",
              width: 64,
              height: 64,
              borderRadius: "var(--radius-control)",
              overflow: "hidden",
              border: i === index ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
              padding: 0,
              background: "var(--color-well)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </button>
        ))}
      </div>
    </div>
  );
}
