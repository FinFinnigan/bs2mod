// Repository interfaces — the DB/adapter boundary. Application services depend on
// THESE interfaces, never on Drizzle/Neon directly (ARCHITECTURE.md: Neon/Postgres
// must be replaceable at the adapter boundary; no DB calls from UI components).

import type {
  FilterOption,
  ProductCard,
  ProductPDP,
  SearchResult,
  CartState,
  Money,
} from "@/lib/types";
import type { CatalogProduct } from "@/lib/data/products";

export class StockUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StockUnavailableError";
  }
}

// ---- Catalog ----

export interface ProductListQuery {
  category?: string;
  ageBand?: string;
  collection?: string;
  sort?: string;
  filters?: {
    age?: string[];
    type?: string[];
    size?: string[];
    fit?: string[];
    colour?: string[];
    onSale?: boolean;
    isNew?: boolean;
    maxPrice?: number;
  };
}

export interface AdminVariantStock {
  id: string;
  stock: number;
}

// Prices are integer minor units (cents) — same convention as the storefront.
export interface AdminProductInput {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  ageBand: string;
  price: number;
  compareAtPrice?: number | null;
  currency?: string;
  badges?: string[];
  inStock?: boolean;
  colourHex?: string | null;
  description?: string | null;
  material?: string | null;
  fit?: string | null;
  care?: string | null;
  origin?: string | null;
  imageUrl?: string | null;
  archived?: boolean;
  variants?: AdminVariantStock[];
}

export interface AdminProductRecord {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  ageBand: string;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  badges: string[];
  inStock: boolean;
  colourHex: string | null;
  description: string | null;
  material: string | null;
  fit: string | null;
  care: string | null;
  origin: string | null;
  imageUrl: string | null;
  archived: boolean;
  variants?: AdminVariantStock[];
  createdAt: string;
  updatedAt: string;
}

export interface CatalogRepository {
  getProduct(slug: string): Promise<ProductPDP | undefined>;
  listProducts(query: ProductListQuery): Promise<ProductCard[]>;
  // Storefront read-model: full CatalogProduct rows (incl. colours/sizes derived
  // from variants) so the PLP can filter client-side exactly like the mock layer.
  listCatalogProducts(query: ProductListQuery): Promise<CatalogProduct[]>;
  buildFilters(query: ProductListQuery): Promise<FilterOption[]>;
  search(q: string): Promise<SearchResult>;
  // Storefront reads never see archived products; admin reads include them.
  // updateAdminProduct treats undefined as "leave unchanged" and null as "clear".
  listAdminProducts(): Promise<AdminProductRecord[]>;
  getAdminProduct(id: string): Promise<AdminProductRecord | null>;
  createAdminProduct(input: AdminProductInput): Promise<AdminProductRecord>;
  updateAdminProduct(
    id: string,
    input: Partial<AdminProductInput>
  ): Promise<AdminProductRecord | null>;
}

// ---- Cart ----

export interface CartLine {
  variantId: string;
  quantity: number;
}

export interface CartRepository {
  getCart(id: string): Promise<CartState | null>;
  addItem(id: string, line: CartLine): Promise<CartState>;
  setQty(id: string, variantId: string, quantity: number): Promise<CartState>;
  removeItem(id: string, variantId: string): Promise<CartState>;
}

// ---- Orders ----

export type OrderStatus =
  | "draft"
  | "placed"
  | "confirmed"
  | "fulfilled"
  | "cancelled"
  | "failed"
  | "refunded";

export interface OrderItemRow {
  variantId: string;
  productId: string;
  sku: string;
  name: string;
  size?: string;
  colour?: string;
  unitPrice: Money;
  quantity: number;
  lineTotal: Money;
}

export interface OrderRow {
  id: string;
  cartId?: string;
  email?: string;
  userId?: string; // owner (null for guest orders)
  publicToken: string; // opaque, server-generated public lookup token
  status: OrderStatus;
  subtotal: Money;
  shippingAmount: Money;
  total: Money;
  currency: string;
  items: OrderItemRow[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderTransitionRow {
  id: string;
  orderId: string;
  fromState: OrderStatus;
  toState: OrderStatus;
  idempotencyKey: string;
  occurredAt: string;
}

export interface OrderAddressRow {
  id: string;
  orderId: string;
  kind: "shipping" | "billing";
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
  country: string;
}

export interface CreateOrderInput {
  id: string;
  cartId: string;
  email?: string;
  userId?: string;
  shippingAddress: {
    fullName: string;
    line1: string;
    line2?: string;
    city: string;
    postcode: string;
    country: string;
  };
  idempotencyKey: string;
}

export interface OrderListQuery {
  status?: OrderStatus;
  limit?: number;
  offset?: number;
}

export interface OrderRepository {
  create(input: CreateOrderInput, order: OrderRow): Promise<void>;
  get(id: string): Promise<OrderRow | null>;
  getByPublicToken(token: string): Promise<OrderRow | null>;
  getByIdempotencyKey(key: string): Promise<OrderRow | null>;
  updateStatus(id: string, status: OrderStatus): Promise<void>;
  appendTransition(row: OrderTransitionRow): Promise<void>;
  // Admin listing — newest first. `total` counts every matching row (before
  // limit/offset), so the admin UI can paginate.
  list(query?: OrderListQuery): Promise<{ rows: OrderRow[]; total: number }>;
  listTransitions(orderId: string): Promise<OrderTransitionRow[]>;
  // Admin read-back of the addresses recorded at checkout (shipping/billing).
  getAddresses(orderId: string): Promise<OrderAddressRow[]>;
}

// ---- Settings ----

// Generic key/value store (backed by the `settings` table when a database is
// present). Values are JSON-serializable. Used for site-wide preferences such
// as the active storefront template.
export interface SettingsRepository {
  get(key: string): Promise<unknown | undefined>;
  set(key: string, value: unknown): Promise<void>;
}
