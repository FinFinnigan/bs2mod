"use client";

import type { ProductVariant } from "@/lib/types";
import { SizeGuideLink } from "./SizeGuideLink";

export interface VariantSelection {
  size?: string;
  colour?: string;
}

interface ColourDef {
  name: string;
  hex?: string;
}

export function VariantSelector({
  sizes,
  colours,
  variants,
  selected,
  onSelect,
  category,
}: {
  sizes: string[];
  colours: ColourDef[];
  variants: ProductVariant[];
  selected: VariantSelection;
  onSelect: (next: VariantSelection) => void;
  category: string;
}) {
  const sizeAvailable = (s: string) => variants.some((v) => v.size === s && v.stock > 0);
  const colourAvailable = (c: string) => variants.some((v) => v.colour === c && v.stock > 0);
  const lowStockFor = (s: string) => {
    const stock = variants.filter((v) => v.size === s).reduce((m, v) => Math.max(m, v.stock), 0);
    return stock > 0 && stock <= 3;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <div className="variant-label">
          <span id="size-label">Size</span>
          <SizeGuideLink category={category} />
        </div>
        <div className="pill-row" style={{ marginTop: 8 }} role="group" aria-labelledby="size-label">
          {sizes.map((s) => (
            <button
              key={s}
              type="button"
              className="pill"
              aria-pressed={selected.size === s}
              disabled={!sizeAvailable(s)}
              onClick={() => onSelect({ ...selected, size: s })}
            >
              {s}
              {lowStockFor(s) && selected.size === s ? " · Last one" : ""}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="variant-label">
          <span id="colour-label">Colour</span>
          {selected.colour && <span style={{ color: "var(--color-ink-muted)", fontWeight: 500 }}>{selected.colour}</span>}
        </div>
        <div className="swatch-row" style={{ marginTop: 8 }} role="group" aria-labelledby="colour-label">
          {colours.map((c) => (
            <button
              key={c.name}
              type="button"
              className="swatch"
              aria-pressed={selected.colour === c.name}
              aria-label={`Colour ${c.name}`}
              disabled={!colourAvailable(c.name)}
              onClick={() => onSelect({ ...selected, colour: c.name })}
              style={{
                background: c.hex ?? "var(--color-well)",
                opacity: colourAvailable(c.name) ? 1 : 0.3,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
