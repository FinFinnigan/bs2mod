// Backend-agnostic data shapes — frozen §11 of design-direction.md.
// Components render ONLY from these types; they never import a commerce SDK.

export type Badge = "new" | "sale" | "bestseller" | "limited";

export type Money = { amount: number; currency: string };

export interface ProductImage {
  src: string;
  alt: string;
}

export interface ProductCard {
  id: string;
  slug: string;
  name: string;
  categoryLabel: string; // "HOODIES", "T-SHIRTS", etc.
  price: Money;
  compareAtPrice?: Money;
  range?: { min: number; max: number };
  badges: Badge[];
  image: ProductImage;
  inStock: boolean;
  href: string;
  ageLabel?: string; // "3-5Y", "6-8Y", "9-12Y", "13-14Y"
}

export interface ProductVariant {
  id: string;
  sku: string;
  size?: string;
  colour?: string;
  colourHex?: string;
  stock: number; // 0 = sold out, ≤3 = low stock
  price?: Money; // variant-specific price override
}

export interface Review {
  id: string;
  author: string;
  date: string; // ISO 8601
  rating: number; // 1-5
  title: string;
  comment: string;
}

export interface ReviewSummary {
  count: number;
  average: number;
}

export interface ProductPDP extends ProductCard {
  gallery: ProductImage[];
  attributes: { label: string; value: string }[];
  description: string;
  shippingPolicy: string;
  returnsPolicy: string;
  reviewSummary: ReviewSummary;
  reviews: Review[];
  crossSell: {
    "complete-the-look": ProductCard[];
    "you-may-also-like": ProductCard[];
  };
  variants: ProductVariant[];
  selectedVariant?: ProductVariant;
}

export interface CartItem {
  product: ProductCard;
  variant: ProductVariant;
  quantity: number;
  lineTotal: number; // variant.price × quantity
}

export interface CartState {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discounts?: { label: string; amount: number }[];
  total: number;
  freeShippingThreshold: number; // €50
  amountToFreeShipping: number;
}

export interface FilterOptionValue {
  value: string;
  label: string;
  count: number;
  hex?: string;
}

export interface FilterOption {
  key: string;
  label: string;
  type: "single" | "multi" | "range" | "toggle";
  options: FilterOptionValue[];
}

export interface SearchResult {
  query: string;
  products: ProductCard[];
  totalCount: number;
  suggestions?: string[];
}
