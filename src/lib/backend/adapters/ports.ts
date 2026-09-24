// Data adapter ports — the mock → live seam (ARCHITECTURE.md §4.2). Components
// consume the §11 shapes; these interfaces define how a data source supplies them.
// The `mock` implementation is today's src/lib/data/; a `live` implementation reads
// Postgres. Swapping is a config change, never a component rewrite.

import type {
  FilterOption,
  ProductCard,
  ProductPDP,
  SearchResult,
} from "@/lib/types";

export interface ProductQuery {
  category?: string;
  ageBand?: string;
  collection?: string;
  filters?: Record<string, string[]>;
  sort?: string;
}

export interface CatalogAdapter {
  getProduct(slug: string): Promise<ProductPDP | undefined>;
  listProducts(query: ProductQuery): Promise<ProductCard[]>;
  buildFilters(query: ProductQuery): Promise<FilterOption[]>;
  search(q: string): Promise<SearchResult>;
}

export interface CartLine {
  variantId: string;
  quantity: number;
}

export interface CartAdapter {
  getCart(id: string): Promise<import("@/lib/types").CartState | null>;
  addItem(id: string, line: CartLine): Promise<void>;
  setQty(id: string, variantId: string, quantity: number): Promise<void>;
  removeItem(id: string, variantId: string): Promise<void>;
}

export interface CheckoutAdapter {
  createOrder(cartId: string): Promise<{ orderId: string }>;
  getShippingRates(cartId: string): Promise<{ label: string; amount: number }[]>;
  confirmOrder(orderId: string): Promise<void>;
}

export interface ContentAdapter {
  getSite(): Promise<Record<string, unknown>>;
  getPage(slug: string): Promise<{ title: string; body: string[] } | undefined>;
  getCollections(): Promise<{ slug: string; label: string }[]>;
  getCategories(): Promise<{ slug: string; label: string }[]>;
}
