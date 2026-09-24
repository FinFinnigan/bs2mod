// Site configuration + taxonomy + editorial content.
// This is the OWNER-EDITABLE config layer (no-code scope): a future backoffice
// writes these fields; components never hardcode them.

export const SITE = {
  name: "BOYSHOP",
  tagline: "Premium boys' clothing",
  currency: "EUR",
  freeShippingThreshold: 50,
  promoStrip: "Free delivery over €50 · Free 30-day returns",
  announcement: "New: the Back-to-School drop is live",
  contactEmail: "hello@boyshop.example",
};

export const AGE_BANDS = [
  {
    slug: "ages-3-5",
    label: "3–5",
    short: "3-5Y",
    blurb: "Little explorers",
    palette: {
      background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)",
    },
  },
  {
    slug: "ages-6-8",
    label: "6–8",
    short: "6-8Y",
    blurb: "Big adventures",
    palette: {
      background: "linear-gradient(135deg, var(--color-ok) 0%, var(--color-primary) 100%)",
    },
  },
  {
    slug: "ages-9-12",
    label: "9–12",
    short: "9-12Y",
    blurb: "On the move",
    palette: {
      background: "linear-gradient(135deg, var(--color-ink) 0%, var(--color-ink-muted) 100%)",
    },
  },
  {
    slug: "ages-13-14",
    label: "13–14",
    short: "13-14Y",
    blurb: "Almost grown",
    palette: {
      background: "linear-gradient(135deg, var(--color-accent) 0%, var(--color-warn) 100%)",
    },
  },
] as const;

export const SIZES_BY_AGE: Record<string, string[]> = {
  "3-5": ["3Y", "4Y", "5Y"],
  "6-8": ["6Y", "7Y", "8Y"],
  "9-12": ["9Y", "10Y", "11-12Y"],
  "13-14": ["13Y", "14Y"],
};

export const CATEGORIES = [
  { slug: "tshirts", label: "T-Shirts" },
  { slug: "hoodies", label: "Hoodies" },
  { slug: "sweaters", label: "Sweaters" },
  { slug: "jeans", label: "Jeans" },
  { slug: "trousers", label: "Trousers" },
  { slug: "jackets", label: "Jackets" },
  { slug: "tracksuits", label: "Tracksuits" },
  { slug: "sets", label: "Sets" },
  { slug: "sneakers", label: "Sneakers" },
  { slug: "accessories", label: "Accessories" },
] as const;

export const COLLECTIONS = [
  { slug: "new-arrivals", label: "New arrivals" },
  { slug: "sale", label: "Sale" },
  { slug: "spring", label: "Fresh Starts" },
  { slug: "summer", label: "Play Explore Repeat" },
  { slug: "autumn", label: "Bigger Stories" },
  { slug: "winter", label: "Built Different" },
  ...AGE_BANDS.map((a) => ({ slug: a.slug, label: `Shop ${a.label}` })),
] as const;

export const FIT_OPTIONS = ["Regular", "Slim"] as const;

// ---- Seasonal campaigns (D-4) ----
// Four quarterly campaigns per design-direction §2b / §14-#2. The homepage hero,
// chip rail and featured grid render from the ACTIVE season (see HERO below).
// Palettes are composed ONLY from the frozen §3 token set — no new hexes.
// Owner-editable (no-code scope): swap copy, links or product mix here.

export type CampaignId = "spring" | "summer" | "autumn" | "winter";

// All palette values are CSS built from frozen §3 tokens only.
export interface CampaignPalette {
  background: string;
  text: string;
  textMuted: string;
  accent: string;
}

export interface Campaign {
  id: CampaignId;
  name: string;
  eyebrow: string;
  headline: string;
  subcopy: string;
  ctaLabel: string;
  ctaHref: string;
  overlay: string; // hand-lettered overlay (modular, §14-#3)
  palette: CampaignPalette;
  productMix: {
    collection: string; // existing collection slug (site.ts COLLECTIONS)
    heading: string;
    ctaLabel: string;
    ctaHref: string;
  };
  chipRail: { label: string; href: string; hot?: boolean }[];
}

export const CAMPAIGNS: Campaign[] = [
  {
    id: "spring",
    name: "Fresh Starts",
    eyebrow: "New season · Spring 2026",
    headline: "Fresh starts.",
    subcopy: "Light layers and easy fits for the first warm days.",
    ctaLabel: "Shop the drop",
    ctaHref: "/collection/spring",
    overlay: "Good boys, brighter days",
    palette: {
      background: "linear-gradient(135deg, var(--color-ok) 0%, var(--color-primary) 100%)",
      text: "var(--color-surface)",
      textMuted: "rgba(255,255,255,0.72)",
      accent: "var(--color-accent)",
    },
    productMix: {
      collection: "new-arrivals",
      heading: "Fresh in",
      ctaLabel: "Shop all",
      ctaHref: "/collection/new-arrivals",
    },
    chipRail: [
      { label: "⚡ New drop", href: "/collection/new-arrivals", hot: true },
      { label: "T-Shirts", href: "/category/tshirts" },
      { label: "Sets", href: "/category/sets" },
      { label: "Sneakers", href: "/category/sneakers" },
    ],
  },
  {
    id: "summer",
    name: "Play Explore Repeat",
    eyebrow: "New season · Summer 2026",
    headline: "Play. Explore. Repeat.",
    subcopy: "Bright, breathable kit built for long days outside.",
    ctaLabel: "Shop the drop",
    ctaHref: "/collection/summer",
    overlay: "Sun play, good vibes",
    palette: {
      background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)",
      text: "var(--color-surface)",
      textMuted: "rgba(255,255,255,0.72)",
      accent: "var(--color-accent)",
    },
    productMix: {
      collection: "sale",
      heading: "Summer sale",
      ctaLabel: "Shop sale",
      ctaHref: "/collection/sale",
    },
    chipRail: [
      { label: "⚡ Summer sale", href: "/collection/sale", hot: true },
      { label: "Sets", href: "/category/sets" },
      { label: "T-Shirts", href: "/category/tshirts" },
      { label: "Sneakers", href: "/category/sneakers" },
    ],
  },
  {
    id: "autumn",
    name: "Bigger Stories",
    eyebrow: "New season · Autumn 2026",
    headline: "Bigger stories.",
    subcopy: "Tough enough for the playground, sharp enough for the photo.",
    ctaLabel: "Shop the drop",
    ctaHref: "/collection/autumn",
    overlay: "Good boys, brighter days",
    palette: {
      background: "linear-gradient(135deg, var(--color-primary-hover) 0%, var(--color-primary) 45%, var(--color-primary) 100%)",
      text: "var(--color-surface)",
      textMuted: "rgba(255,255,255,0.72)",
      accent: "var(--color-accent)",
    },
    productMix: {
      collection: "autumn",
      heading: "New in",
      ctaLabel: "Shop all",
      ctaHref: "/collection/new-arrivals",
    },
    chipRail: [
      { label: "⚡ New drop", href: "/collection/new-arrivals", hot: true },
      { label: "Sale", href: "/collection/sale" },
      { label: "Sets", href: "/category/sets" },
      { label: "Hoodies", href: "/category/hoodies" },
      { label: "Sneakers", href: "/category/sneakers" },
    ],
  },
  {
    id: "winter",
    name: "Built Different",
    eyebrow: "New season · Winter 2026",
    headline: "Built different.",
    subcopy: "Warm, technical layers for the coldest playgrounds.",
    ctaLabel: "Shop the drop",
    ctaHref: "/collection/winter",
    overlay: "Good boys, brighter days",
    palette: {
      background: "linear-gradient(135deg, var(--color-ink) 0%, var(--color-primary-hover) 100%)",
      text: "var(--color-surface)",
      textMuted: "rgba(255,255,255,0.72)",
      accent: "var(--color-accent)",
    },
    productMix: {
      collection: "new-arrivals",
      heading: "New in",
      ctaLabel: "Shop all",
      ctaHref: "/collection/new-arrivals",
    },
    chipRail: [
      { label: "⚡ New drop", href: "/collection/new-arrivals", hot: true },
      { label: "Jackets", href: "/category/jackets" },
      { label: "Hoodies", href: "/category/hoodies" },
      { label: "Sweaters", href: "/category/sweaters" },
    ],
  },
];

// Active-season selector (D-4). Deterministic by design: a const default, no
// date/network flakiness. Rotate the campaign by changing ACTIVE_SEASON_ID.
export const ACTIVE_SEASON_ID: CampaignId = "autumn";

/** Pure selector — returns the active campaign (falls back to the first). */
export function getActiveSeason(): Campaign {
  return CAMPAIGNS.find((c) => c.id === ACTIVE_SEASON_ID) ?? CAMPAIGNS[0];
}

export const HERO = {
  activeSeasonId: ACTIVE_SEASON_ID,
} as const;

export const STORY_BAND = {
  eyebrow: "The story",
  headline: "Made for the messy bits.",
  body: "Hard-wearing cottons, easy fits and colours that survive the playground — designed by parents who know how fast boys grow.",
  pullQuote: "Boys grow fast — the clothes should keep up.",
  ctaLabel: "Our story",
  ctaHref: "/story",
  image: {
    alt: "Boys in BoyShop layers, out and about",
    label: "Lifestyle image slot",
  },
};

export const VALUE_PROPS = [
  { icon: "truck", title: "Free delivery", body: "On orders over €50" },
  { icon: "return", title: "30-day returns", body: "Free, no questions" },
  { icon: "shield", title: "Built to last", body: "Reinforced seams" },
] as const;

export const FOOTER_LINKS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "Shop by Age", href: "/shop" },
      { label: "New arrivals", href: "/collection/new-arrivals" },
      { label: "Sale", href: "/collection/sale" },
      { label: "All products", href: "/shop" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Size guide", href: "/size-guide" },
      { label: "Shipping & returns", href: "/pages/shipping-returns" },
      { label: "Contact", href: "/pages/contact" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Our story", href: "/story" },
      { label: "Privacy policy", href: "/pages/privacy" },
      { label: "Terms", href: "/pages/terms" },
    ],
  },
];

// Presentation-only card-brand labels rendered in the storefront footer. These are
// content, NOT the backend payment-provider registry: keep this list in sync by hand
// with the providers actually enabled in "@/lib/backend/payments/registry.ts". Provider
// parity is out of scope for this presentation list.
export const PAYMENT_METHODS = ["Visa", "Mastercard", "PayPal", "Apple Pay"];

export const SIZE_GUIDE = {
  intro:
    "Measure chest and height, then pick the band. When in doubt, size up — boys grow fast.",
  measurements: [
    { size: "3Y", height: "98 cm", chest: "54 cm" },
    { size: "4Y", height: "104 cm", chest: "56 cm" },
    { size: "5Y", height: "110 cm", chest: "58 cm" },
    { size: "6Y", height: "116 cm", chest: "61 cm" },
    { size: "7Y", height: "122 cm", chest: "64 cm" },
    { size: "8Y", height: "128 cm", chest: "67 cm" },
    { size: "9Y", height: "134 cm", chest: "70 cm" },
    { size: "10Y", height: "140 cm", chest: "73 cm" },
    { size: "11-12Y", height: "152 cm", chest: "78 cm" },
    { size: "13Y", height: "158 cm", chest: "82 cm" },
    { size: "14Y", height: "164 cm", chest: "86 cm" },
  ],
};

export const POLICIES: Record<string, { title: string; body: string[] }> = {
  "shipping-returns": {
    title: "Shipping & returns",
    body: [
      "Free shipping on orders over €50. Standard delivery 3–5 business days.",
      "Free returns within 30 days of purchase. Items must be unworn with tags attached.",
    ],
  },
  privacy: {
    title: "Privacy policy",
    body: [
      "We collect only what we need to fulfil your order and improve the experience.",
      "Analytics only runs with your explicit consent. You can withdraw at any time.",
    ],
  },
  terms: {
    title: "Terms",
    body: [
      "Prices are shown in EUR and include VAT.",
      "This storefront is a static/mock build; no live payments are processed.",
    ],
  },
  contact: {
    title: "Contact",
    body: [`Email us at ${SITE.contactEmail}. We reply within one business day.`],
  },
};
