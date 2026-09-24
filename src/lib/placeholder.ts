// Deterministic inline-SVG placeholder for mock product imagery.
// Generates abstract illustrated clothing silhouettes with gradients —
// looks like a design mockup, not a labeled box.
// Replace with real CDN URLs when Team 3 wires commerce.

/** Lighten a hex colour by a factor (0 = white, 1 = original) */
function lighten(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lr = Math.round(r + (255 - r) * factor);
  const lg = Math.round(g + (255 - g) * factor);
  const lb = Math.round(b + (255 - b) * factor);
  return `#${lr.toString(16).padStart(2, "0")}${lg.toString(16).padStart(2, "0")}${lb.toString(16).padStart(2, "0")}`;
}

/** Darken a hex colour */
function darken(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const dr = Math.round(r * (1 - factor));
  const dg = Math.round(g * (1 - factor));
  const db = Math.round(b * (1 - factor));
  return `#${dr.toString(16).padStart(2, "0")}${dg.toString(16).padStart(2, "0")}${db.toString(16).padStart(2, "0")}`;
}

type ClothingType = "hoodie" | "tee" | "joggers" | "shorts" | "jacket" | "polo" | "shirt" | "set";

function detectType(label: string): ClothingType {
  const l = label.toLowerCase();
  if (l.includes("hoodie") || l.includes("hood")) return "hoodie";
  if (l.includes("jogger") || l.includes("pant") || l.includes("trouser")) return "joggers";
  if (l.includes("short")) return "shorts";
  if (l.includes("jacket") || l.includes("coat") || l.includes("vest")) return "jacket";
  if (l.includes("polo")) return "polo";
  if (l.includes("shirt") || l.includes("oxford") || l.includes("button")) return "shirt";
  if (l.includes("set") || l.includes("kit")) return "set";
  return "tee";
}

/** SVG paths for simplified clothing silhouettes */
const SILHOUETTES: Record<ClothingType, string> = {
  hoodie: `
    <path d="M200 180 C200 160 240 140 300 135 L300 110 C300 95 280 85 265 90 L250 100 L250 70 C250 55 235 45 220 50 L200 60 L180 50 C165 45 150 55 150 70 L150 100 L135 90 C120 85 100 95 100 110 L100 135 C160 140 200 160 200 180Z"
      fill="FILL" stroke="STROKE" stroke-width="3"/>
    <path d="M150 100 L130 180 L115 340 L175 340 L175 200 L200 180 L225 200 L225 340 L285 340 L270 180 L250 100"
      fill="FILL2" stroke="STROKE" stroke-width="2" opacity="0.6"/>
    <ellipse cx="200" cy="135" rx="22" ry="16" fill="none" stroke="STROKE" stroke-width="2" opacity="0.4"/>
    <line x1="200" y1="180" x2="200" y2="340" stroke="STROKE" stroke-width="1.5" opacity="0.3"/>
    <path d="M140 180 Q200 200 260 180" fill="none" stroke="STROKE" stroke-width="2" opacity="0.35"/>
  `,
  tee: `
    <path d="M200 170 C200 155 230 145 300 140 L310 160 L280 200 L255 195 L255 340 L145 340 L145 195 L120 200 L90 160 L100 140 C170 145 200 155 200 170Z"
      fill="FILL" stroke="STROKE" stroke-width="3"/>
    <path d="M145 195 L120 200 L90 160 L100 140 L155 155 L155 195Z"
      fill="FILL2" stroke="STROKE" stroke-width="2" opacity="0.5"/>
    <path d="M255 195 L280 200 L310 160 L300 140 L245 155 L245 195Z"
      fill="FILL2" stroke="STROKE" stroke-width="2" opacity="0.5"/>
    <path d="M165 170 Q200 185 235 170" fill="none" stroke="STROKE" stroke-width="2.5" opacity="0.4"/>
    <line x1="200" y1="185" x2="200" y2="340" stroke="STROKE" stroke-width="1" opacity="0.15"/>
  `,
  joggers: `
    <path d="M140 100 L260 100 L265 110 L260 180 L250 340 L215 340 L210 200 L200 190 L190 200 L185 340 L150 340 L140 180 L135 110Z"
      fill="FILL" stroke="STROKE" stroke-width="3"/>
    <path d="M140 100 L260 100" stroke="STROKE" stroke-width="3"/>
    <path d="M145 108 L255 108" stroke="STROKE" stroke-width="1.5" opacity="0.3"/>
    <rect x="175" y="108" width="50" height="12" rx="3" fill="none" stroke="STROKE" stroke-width="1.5" opacity="0.35"/>
    <line x1="200" y1="190" x2="200" y2="340" stroke="STROKE" stroke-width="1" opacity="0.2"/>
    <path d="M155 250 L180 250" stroke="STROKE" stroke-width="1.5" opacity="0.25"/>
    <path d="M220 250 L245 250" stroke="STROKE" stroke-width="1.5" opacity="0.25"/>
  `,
  shorts: `
    <path d="M140 120 L260 120 L265 130 L255 230 L230 240 L215 240 L200 180 L185 240 L170 240 L145 230 L135 130Z"
      fill="FILL" stroke="STROKE" stroke-width="3"/>
    <path d="M140 120 L260 120" stroke="STROKE" stroke-width="3"/>
    <path d="M145 128 L255 128" stroke="STROKE" stroke-width="1.5" opacity="0.3"/>
    <rect x="175" y="128" width="50" height="10" rx="3" fill="none" stroke="STROKE" stroke-width="1.5" opacity="0.35"/>
    <line x1="200" y1="180" x2="200" y2="240" stroke="STROKE" stroke-width="1" opacity="0.2"/>
    <path d="M150 185 L175 185" stroke="STROKE" stroke-width="1.5" opacity="0.2"/>
    <path d="M225 185 L250 185" stroke="STROKE" stroke-width="1.5" opacity="0.2"/>
  `,
  jacket: `
    <path d="M200 170 C200 155 235 145 310 140 L320 165 L285 210 L260 205 L265 350 L135 350 L140 205 L115 210 L80 165 L90 140 C165 145 200 155 200 170Z"
      fill="FILL" stroke="STROKE" stroke-width="3"/>
    <line x1="200" y1="175" x2="200" y2="350" stroke="STROKE" stroke-width="2.5" opacity="0.5"/>
    <circle cx="200" cy="210" r="4" fill="STROKE" opacity="0.4"/>
    <circle cx="200" cy="240" r="4" fill="STROKE" opacity="0.4"/>
    <circle cx="200" cy="270" r="4" fill="STROKE" opacity="0.4"/>
    <path d="M155 175 Q200 190 245 175" fill="none" stroke="STROKE" stroke-width="2" opacity="0.35"/>
    <rect x="115" y="280" width="30" height="20" rx="3" fill="none" stroke="STROKE" stroke-width="1.5" opacity="0.25"/>
  `,
  polo: `
    <path d="M200 170 C200 155 230 145 300 140 L310 160 L280 200 L255 195 L255 340 L145 340 L145 195 L120 200 L90 160 L100 140 C170 145 200 155 200 170Z"
      fill="FILL" stroke="STROKE" stroke-width="3"/>
    <path d="M175 170 L175 210 L200 220 L225 210 L225 170" fill="none" stroke="STROKE" stroke-width="2" opacity="0.45"/>
    <circle cx="200" cy="195" r="3" fill="STROKE" opacity="0.35"/>
    <circle cx="200" cy="210" r="3" fill="STROKE" opacity="0.35"/>
    <path d="M165 170 Q200 182 235 170" fill="none" stroke="STROKE" stroke-width="2.5" opacity="0.4"/>
  `,
  shirt: `
    <path d="M200 170 C200 155 230 145 300 140 L310 160 L280 200 L255 195 L255 340 L145 340 L145 195 L120 200 L90 160 L100 140 C170 145 200 155 200 170Z"
      fill="FILL" stroke="STROKE" stroke-width="3"/>
    <line x1="200" y1="175" x2="200" y2="340" stroke="STROKE" stroke-width="2" opacity="0.4"/>
    <circle cx="200" cy="200" r="3" fill="STROKE" opacity="0.35"/>
    <circle cx="200" cy="220" r="3" fill="STROKE" opacity="0.35"/>
    <circle cx="200" cy="240" r="3" fill="STROKE" opacity="0.35"/>
    <circle cx="200" cy="260" r="3" fill="STROKE" opacity="0.35"/>
    <path d="M165 170 Q200 185 235 170" fill="none" stroke="STROKE" stroke-width="2.5" opacity="0.4"/>
    <rect x="145" y="290" width="25" height="18" rx="2" fill="none" stroke="STROKE" stroke-width="1.5" opacity="0.25"/>
  `,
  set: `
    <path d="M155 130 L245 130 L250 140 L235 190 L225 188 L225 220 L175 220 L175 188 L165 190 L150 140Z"
      fill="FILL" stroke="STROKE" stroke-width="2.5"/>
    <path d="M165 130 Q200 142 235 130" fill="none" stroke="STROKE" stroke-width="2" opacity="0.4"/>
    <path d="M145 240 L255 240 L258 248 L250 340 L230 348 L215 348 L200 290 L185 348 L170 348 L150 340 L142 248Z"
      fill="FILL2" stroke="STROKE" stroke-width="2.5" opacity="0.7"/>
    <line x1="200" y1="290" x2="200" y2="348" stroke="STROKE" stroke-width="1" opacity="0.2"/>
    <text x="200" y="375" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="STROKE" text-anchor="middle" opacity="0.35" letter-spacing="2">SET</text>
  `,
};

export function placeholder(
  label: string,
  bg = "#E5E0D6",
  fg = "#1B1F26",
  w = 600,
  h = 800
): string {
  const type = detectType(label);
  const bgLight = lighten(bg, 0.3);
  const bgLighter = lighten(bg, 0.55);
  const fgSoft = fg + "18";
  const silhouette = SILHOUETTES[type]
    .replace(/FILL2/g, bgLight)
    .replace(/FILL/g, bg)
    .replace(/STROKE/g, fg);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg${type}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bgLighter}"/>
      <stop offset="100%" stop-color="${bg}"/>
    </linearGradient>
    <radialGradient id="glow${type}" cx="0.5" cy="0.35" r="0.6">
      <stop offset="0%" stop-color="${bgLight}" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="${bg}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="dots${type}" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="10" cy="10" r="1" fill="${fg}" opacity="0.06"/>
    </pattern>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg${type})"/>
  <rect width="${w}" height="${h}" fill="url(#glow${type})"/>
  <rect width="${w}" height="${h}" fill="url(#dots${type})"/>
  <g transform="translate(${(w - 400) / 2}, ${(h - 500) / 2 - 20}) scale(1.6)">
    ${silhouette}
  </g>
</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// Colour tokens used to tint placeholders by product colour.
export const COLOUR_HEX: Record<string, string> = {
  Navy: "#1E2A44",
  White: "#F5F3EE",
  Slate: "#5C6470",
  Forest: "#2E4A3A",
  Sand: "#D9CDB6",
  Rust: "#B4552D",
  Black: "#1B1F26",
  "Flag Blue": "#2354E6",
  Tangerine: "#FF6B35",
};
