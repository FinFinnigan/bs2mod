// Mock catalog data — the owner-editable content layer (no-code scope).
// Team 3 later serves the same §11 shapes over the network; components never change.

import type {
  FilterOption,
  ProductCard,
  ProductPDP,
  ProductVariant,
  Review,
} from "@/lib/types";
import { placeholder, COLOUR_HEX } from "@/lib/placeholder";
import {
  AGE_BANDS,
  CATEGORIES,
  FIT_OPTIONS,
  SIZES_BY_AGE,
} from "./site";

export interface CatalogProduct extends ProductCard {
  categorySlug: string;
  ageBand: string; // "3-5" | "6-8" | "9-12" | "13-14"
  colourHex: string;
  colours: string[];
  sizes: string[];
  material: string;
  fit: string;
  care: string;
  origin?: string;
  description: string;
}

type P = Omit<CatalogProduct, "href" | "image" | "inStock" | "price"> & {
  price: number;
  compareAt?: number;
  colourHex: string;
};

function toCard(p: P): CatalogProduct {
  return {
    ...p,
    price: { amount: p.price, currency: "EUR" },
    ...(p.compareAt
      ? { compareAtPrice: { amount: p.compareAt, currency: "EUR" } }
      : {}),
    href: `/product/${p.slug}`,
    image: {
      src: placeholder(p.name, p.colourHex, "#FFFFFF"),
      alt: `${p.name} — ${p.categoryLabel}`,
    },
    inStock: true,
    ageLabel: AGE_BANDS.find((a) => a.short === p.ageBand)?.short ?? p.ageBand,
  };
}

const CAT_LABEL: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c.label.toUpperCase()])
);

const P_: P[] = [
  {
    id: "p1",
    slug: "slate-hoodie",
    name: "Slate Hoodie",
    categorySlug: "hoodies",
    categoryLabel: "HOODIES",
    ageBand: "9-12Y",
    price: 34,
    compareAt: 49,
    badges: ["sale", "bestseller"],
    colourHex: COLOUR_HEX.Slate,
    colours: ["Slate", "Navy", "Black"],
    sizes: ["9Y", "10Y", "11-12Y"],
    material: "80% organic cotton, 20% recycled polyester",
    fit: "Regular",
    care: "Machine wash 30°",
    origin: "Portugal",
    description:
      "Our brushed-back fleece hoodie with a roomy fit and ribbed cuffs that keep their shape. Warm enough for the walk to school, light enough for the playground.",
  },
  {
    id: "p2",
    slug: "cloud-tee",
    name: "Cloud Tee",
    categorySlug: "tshirts",
    categoryLabel: "T-SHIRTS",
    ageBand: "3-5Y",
    price: 18,
    badges: ["new"],
    colourHex: COLOUR_HEX.White,
    colours: ["White", "Flag Blue"],
    sizes: ["3Y", "4Y", "5Y"],
    material: "100% organic cotton",
    fit: "Regular",
    care: "Machine wash 40°",
    description:
      "A soft everyday tee in breathable single-jersey cotton. Pre-shrunk so the fit stays true wash after wash.",
  },
  {
    id: "p3",
    slug: "navy-track-set",
    name: "Navy Track Set",
    categorySlug: "sets",
    categoryLabel: "SETS",
    ageBand: "6-8Y",
    price: 42,
    badges: ["new"],
    colourHex: COLOUR_HEX.Navy,
    colours: ["Navy", "Black"],
    sizes: ["6Y", "7Y", "8Y"],
    material: "Recycled poly-cotton fleece",
    fit: "Regular",
    care: "Machine wash 30°",
    origin: "Turkey",
    description:
      "Matching zip hoodie and joggers. Stretchy, quick-drying and made for parkour practice on the sofa.",
  },
  {
    id: "p4",
    slug: "forest-jacket",
    name: "Forest Padded Jacket",
    categorySlug: "jackets",
    categoryLabel: "JACKETS",
    ageBand: "9-12Y",
    price: 65,
    badges: ["limited"],
    colourHex: COLOUR_HEX.Forest,
    colours: ["Forest", "Black"],
    sizes: ["9Y", "10Y", "11-12Y"],
    material: "Recycled shell, down-free insulation",
    fit: "Regular",
    care: "Machine wash 30° gentle",
    description:
      "A water-repellent padded jacket with taped seams and a hidden hood. Built for puddles and everything after.",
  },
  {
    id: "p5",
    slug: "rust-joggers",
    name: "Rust Joggers",
    categorySlug: "trousers",
    categoryLabel: "TROUSERS",
    ageBand: "6-8Y",
    price: 26,
    compareAt: 34,
    badges: ["sale"],
    colourHex: COLOUR_HEX.Rust,
    colours: ["Rust", "Slate"],
    sizes: ["6Y", "7Y", "8Y"],
    material: "Brushed cotton fleece",
    fit: "Slim",
    care: "Machine wash 40°",
    description:
      "Slim-fit joggers with an elasticated waist and zipped pockets. Soft inside, tough outside.",
  },
  {
    id: "p6",
    slug: "sand-crew-sweater",
    name: "Sand Crew Sweater",
    categorySlug: "sweaters",
    categoryLabel: "SWEATERS",
    ageBand: "9-12Y",
    price: 38,
    badges: ["bestseller"],
    colourHex: COLOUR_HEX.Sand,
    colours: ["Sand", "Navy"],
    sizes: ["9Y", "10Y", "11-12Y"],
    material: "Lambswool blend",
    fit: "Regular",
    care: "Hand wash or wool cycle",
    origin: "Scotland",
    description:
      "A classic crew-neck in a soft lambswool blend. Looks smart over a collar, feels like a favourite.",
  },
  {
    id: "p7",
    slug: "flag-blue-hoodie",
    name: "Flag Blue Hoodie",
    categorySlug: "hoodies",
    categoryLabel: "HOODIES",
    ageBand: "13-14Y",
    price: 40,
    badges: ["new"],
    colourHex: COLOUR_HEX["Flag Blue"],
    colours: ["Flag Blue", "White"],
    sizes: ["13Y", "14Y"],
    material: "80% organic cotton, 20% recycled polyester",
    fit: "Regular",
    care: "Machine wash 30°",
    description:
      "The grown-up cut of our classic hoodie — longer body, dropped shoulders, still unmistakably comfortable.",
  },
  {
    id: "p8",
    slug: "tangerine-tee",
    name: "Tangerine Tee",
    categorySlug: "tshirts",
    categoryLabel: "T-SHIRTS",
    ageBand: "6-8Y",
    price: 19,
    badges: ["new"],
    colourHex: COLOUR_HEX.Tangerine,
    colours: ["Tangerine", "White"],
    sizes: ["6Y", "7Y", "8Y"],
    material: "100% organic cotton",
    fit: "Regular",
    care: "Machine wash 40°",
    description:
      "A bright pop-of-colour tee for when the school run needs some energy.",
  },
  {
    id: "p9",
    slug: "navy-sneakers",
    name: "Navy Canvas Sneakers",
    categorySlug: "sneakers",
    categoryLabel: "SNEAKERS",
    ageBand: "9-12Y",
    price: 45,
    badges: ["bestseller"],
    colourHex: COLOUR_HEX.Navy,
    colours: ["Navy", "White"],
    sizes: ["9Y", "10Y", "11-12Y"],
    material: "Organic canvas upper, rubber sole",
    fit: "Regular",
    care: "Wipe clean",
    origin: "Spain",
    description:
      "Lightweight canvas sneakers with a grippy rubber sole and easy elastic laces. No tying, no fuss.",
  },
  {
    id: "p10",
    slug: "forest-tracksuit",
    name: "Forest Tracksuit",
    categorySlug: "tracksuits",
    categoryLabel: "TRACKSUITS",
    ageBand: "3-5Y",
    price: 39,
    compareAt: 52,
    badges: ["sale"],
    colourHex: COLOUR_HEX.Forest,
    colours: ["Forest"],
    sizes: ["3Y", "4Y", "5Y"],
    material: "Recycled poly-cotton fleece",
    fit: "Regular",
    care: "Machine wash 30°",
    description:
      "A cosy full tracksuit for little ones — zip top and joggers with room to move.",
  },
  {
    id: "p11",
    slug: "black-jacket",
    name: "Black Shell Jacket",
    categorySlug: "jackets",
    categoryLabel: "JACKETS",
    ageBand: "13-14Y",
    price: 70,
    badges: [],
    colourHex: COLOUR_HEX.Black,
    colours: ["Black", "Flag Blue"],
    sizes: ["13Y", "14Y"],
    material: "Recycled shell, mesh lining",
    fit: "Slim",
    care: "Machine wash 30°",
    description:
      "A lightweight shell for layering. Packable into its own pocket, so it lives in the school bag.",
  },
  {
    id: "p12",
    slug: "white-crew-set",
    name: "White Crew Set",
    categorySlug: "sets",
    categoryLabel: "SETS",
    ageBand: "3-5Y",
    price: 44,
    badges: ["new"],
    colourHex: COLOUR_HEX.White,
    colours: ["White", "Sand"],
    sizes: ["3Y", "4Y", "5Y"],
    material: "100% organic cotton",
    fit: "Regular",
    care: "Machine wash 40°",
    description:
      "A matching tee and short set for warmer days — crisp, soft and easy to throw on.",
  },
];

export const products: CatalogProduct[] = P_.map(toCard);

// ---- Lookups ----

export function getProduct(slug: string): CatalogProduct | undefined {
  return products.find((p) => p.slug === slug);
}

export function productsByCategory(slug: string): CatalogProduct[] {
  return products.filter((p) => p.categorySlug === slug);
}

export function productsByAge(band: string): CatalogProduct[] {
  // band is one of AGE_BANDS.short values e.g. "3-5Y"
  return products.filter((p) => p.ageBand === band);
}

export function productsByCollection(slug: string): CatalogProduct[] {
  if (slug === "new-arrivals") return products.filter((p) => p.badges.includes("new"));
  if (slug === "sale") return products.filter((p) => p.compareAtPrice);
  const age = AGE_BANDS.find((a) => a.slug === slug);
  if (age) return products.filter((p) => p.ageBand === age.short);
  return products;
}

export function searchProducts(query: string): CatalogProduct[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.categoryLabel.toLowerCase().includes(q) ||
      (p.ageLabel ?? "").toLowerCase().includes(q)
  );
}

// ---- PDP builder ----

function makeVariants(p: CatalogProduct): ProductVariant[] {
  const out: ProductVariant[] = [];
  p.colours.forEach((colour, ci) => {
    p.sizes.forEach((size, si) => {
      let stock = 9 - si - ci;
      if (size === p.sizes[p.sizes.length - 1] && ci === p.colours.length - 1)
        stock = 0; // sold out
      if (si === 1 && ci === 1) stock = 2; // low stock
      if (stock < 0) stock = 1;
      out.push({
        id: `${p.id}-${colour}-${size}`.toLowerCase(),
        sku: `${p.slug}-${colour}-${size}`.toUpperCase(),
        size,
        colour,
        colourHex: COLOUR_HEX[colour] ?? "#E5E0D6",
        stock,
      });
    });
  });
  return out;
}

const REVIEW_POOL = [
  { author: "Sarah M.", rating: 5, title: "Washes brilliantly", comment: "Has survived a full term of playground duty. Still looks new." },
  { author: "James T.", rating: 4, title: "Great fit", comment: "True to size. My son refuses to take it off." },
  { author: "Amina K.", rating: 5, title: "Quality you can feel", comment: "Soft, sturdy, no pilling. Worth every cent." },
  { author: "Rob P.", rating: 3, title: "Slightly large", comment: "Nice fabric but runs a touch big. Size down if between." },
];

function makeReviews(seed: number, count: number): Review[] {
  const out: Review[] = [];
  for (let i = 0; i < count; i++) {
    const r = REVIEW_POOL[(seed + i) % REVIEW_POOL.length];
    out.push({
      id: `rv-${seed}-${i}`,
      author: r.author,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      date: new Date(Date.UTC(2026, 7 - (i % 6), 4 + i)).toISOString(),
    });
  }
  return out;
}

export function getPDP(slug: string): ProductPDP | undefined {
  const p = getProduct(slug);
  if (!p) return undefined;
  const variants = makeVariants(p);
  const reviews = makeReviews(p.id.charCodeAt(1), 4);
  const average =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;
  const others = products.filter((o) => o.slug !== p.slug).slice(0, 7);
  const attributes = [
    { label: "Material", value: p.material },
    { label: "Fit", value: p.fit },
    { label: "Care", value: p.care },
    ...(p.origin ? [{ label: "Origin", value: p.origin }] : []),
  ];
  return {
    ...p,
    gallery: [
      { src: placeholder(`${p.name} · Front`, p.colourHex, "#FFFFFF"), alt: `${p.name} front` },
      { src: placeholder(`${p.name} · Detail`, p.colourHex, "#FFFFFF", 600, 600), alt: `${p.name} detail` },
      { src: placeholder(`${p.name} · Flat`, p.colourHex, "#FFFFFF", 600, 600), alt: `${p.name} flat lay` },
    ],
    attributes,
    description: p.description,
    shippingPolicy: "Free shipping on orders over €50. Standard delivery 3–5 business days.",
    returnsPolicy: "Free returns within 30 days of purchase. Items must be unworn with tags attached.",
    reviewSummary: { count: reviews.length, average },
    reviews,
    crossSell: {
      "complete-the-look": others.slice(0, 3),
      "you-may-also-like": others.slice(3, 7),
    },
    variants,
  };
}

// ---- Filters ----

export function buildFilters(): FilterOption[] {
  const ages = AGE_BANDS.map((a) => ({
    value: a.short,
    label: a.label,
    count: products.filter((p) => p.ageBand === a.short).length,
  }));
  const types = CATEGORIES.map((c) => ({
    value: c.slug,
    label: c.label,
    count: products.filter((p) => p.categorySlug === c.slug).length,
  }));
  const sizes = Object.values(SIZES_BY_AGE)
    .flat()
    .map((s) => ({
      value: s,
      label: s,
      count: products.filter((p) => p.sizes.includes(s)).length,
    }));
  const colours = Object.entries(COLOUR_HEX)
    .slice(0, 6)
    .map(([name, hex]) => ({
      value: name,
      label: name,
      hex,
      count: products.filter((p) => p.colours.includes(name)).length,
    }));
  return [
    { key: "age", label: "Age band", type: "multi", options: ages },
    { key: "type", label: "Type", type: "multi", options: types },
    { key: "size", label: "Size", type: "multi", options: sizes },
    {
      key: "fit",
      label: "Fit",
      type: "multi",
      options: FIT_OPTIONS.map((f) => ({ value: f, label: f, count: products.filter((p) => p.fit === f).length })),
    },
    { key: "colour", label: "Colour", type: "multi", options: colours },
  ];
}

export interface ActiveFilters {
  age: string[];
  type: string[];
  size: string[];
  fit: string[];
  colour: string[];
  onSale: boolean;
  isNew: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export const EMPTY_FILTERS: ActiveFilters = {
  age: [],
  type: [],
  size: [],
  fit: [],
  colour: [],
  onSale: false,
  isNew: false,
  minPrice: undefined,
};

export function applyFilters(
  list: CatalogProduct[],
  f: ActiveFilters,
  sort: string
): CatalogProduct[] {
  let out = list.filter((p) => {
    if (f.age.length && !f.age.includes(p.ageBand)) return false;
    if (f.type.length && !f.type.includes(p.categorySlug)) return false;
    if (f.size.length && !p.sizes.some((s) => f.size.includes(s))) return false;
    if (f.fit.length && !f.fit.includes(p.fit)) return false;
    if (f.colour.length && !p.colours.some((c) => f.colour.includes(c)))
      return false;
    if (f.onSale && !p.compareAtPrice) return false;
    if (f.isNew && !p.badges.includes("new")) return false;
    // Price range uses §11 overlap semantics: a product matches when its
    // price band (range ?? single price) intersects the selected band.
    if (f.minPrice != null) {
      const max = p.range?.max ?? p.price.amount;
      if (max < f.minPrice) return false;
    }
    if (f.maxPrice != null) {
      const min = p.range?.min ?? p.price.amount;
      if (min > f.maxPrice) return false;
    }
    return true;
  });
  switch (sort) {
    case "price-asc":
      out = [...out].sort((a, b) => a.price.amount - b.price.amount);
      break;
    case "price-desc":
      out = [...out].sort((a, b) => b.price.amount - a.price.amount);
      break;
    case "newest":
      out = [...out].sort(
        (a, b) => Number(b.badges.includes("new")) - Number(a.badges.includes("new"))
      );
      break;
    default:
      break; // featured
  }
  return out;
}
