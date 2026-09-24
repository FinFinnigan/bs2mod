// In-memory repositories for tests and local development. They implement the same
// interfaces as the Drizzle repositories so services are fully testable without a
// database. NOT for production.

import type {
  AdminProductInput,
  AdminProductRecord,
  CatalogRepository,
  CartRepository,
  OrderRepository,
  CartLine,
  CreateOrderInput,
  OrderRow,
  OrderTransitionRow,
  OrderListQuery,
  OrderAddressRow,
  ProductListQuery,
} from "../interfaces";
import { StockUnavailableError } from "../interfaces";
import type {
  FilterOption,
  ProductCard,
  ProductPDP,
  ProductVariant,
  SearchResult,
  CartState,
  Badge,
} from "@/lib/types";
import type { CatalogProduct } from "@/lib/data/products";
import { toMinor, toMoney } from "../../money";
import { placeholder } from "@/lib/placeholder";

const MAX_QUANTITY = 99;

function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity) || quantity < 1) return 1;
  return Math.min(Math.floor(quantity), MAX_QUANTITY);
}

export interface MemoryProduct {
  card: ProductCard;
  categorySlug: string;
  ageBand: string;
  fit?: string;
  variants: ProductVariant[];
  description?: string;
  material?: string;
  care?: string;
  origin?: string;
  colourHex?: string;
  imageUrl?: string | null;
  archived?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

function toCatalogProduct(p: MemoryProduct): CatalogProduct {
  return {
    ...p.card,
    categorySlug: p.categorySlug,
    ageBand: p.ageBand,
    colourHex: p.colourHex ?? p.variants.find((v) => v.colourHex)?.colourHex ?? "",
    colours: [
      ...new Set(p.variants.map((v) => v.colour).filter((c): c is string => Boolean(c))),
    ],
    sizes: [
      ...new Set(p.variants.map((v) => v.size).filter((s): s is string => Boolean(s))),
    ],
    material: p.material ?? "",
    fit: p.fit ?? "",
    care: p.care ?? "",
    ...(p.origin ? { origin: p.origin } : {}),
    description: p.description ?? "",
  };
}

function toAdminProduct(p: MemoryProduct): AdminProductRecord {
  return {
    id: p.card.id,
    slug: p.card.slug,
    name: p.card.name,
    categorySlug: p.categorySlug,
    ageBand: p.ageBand,
    price: toMinor(p.card.price),
    compareAtPrice: p.card.compareAtPrice ? toMinor(p.card.compareAtPrice) : null,
    currency: p.card.price.currency,
    badges: p.card.badges,
    inStock: p.card.inStock,
    colourHex: p.colourHex ?? p.variants.find((v) => v.colourHex)?.colourHex ?? null,
    description: p.description ?? null,
    material: p.material ?? null,
    fit: p.fit ?? null,
    care: p.care ?? null,
    origin: p.origin ?? null,
    imageUrl: p.imageUrl ?? null,
    archived: p.archived ?? false,
    createdAt: p.createdAt ?? new Date(0).toISOString(),
    updatedAt: p.updatedAt ?? new Date(0).toISOString(),
    variants: p.variants.map((v) => ({ id: v.id, stock: v.stock })),
  };
}

export class MemoryCatalogRepository implements CatalogRepository {
  constructor(private data: MemoryProduct[]) {}

  findVariant(variantId: string): ProductVariant | undefined {
    for (const p of this.data) {
      const v = p.variants.find((v) => v.id === variantId);
      if (v) return v;
    }
    return undefined;
  }

  async getProduct(slug: string): Promise<ProductPDP | undefined> {
    const p = this.data.find((p) => p.card.slug === slug && !p.archived);
    if (!p) return undefined;
    const others = this.data.filter((o) => o.card.slug !== slug && !o.archived);
    return {
      ...p.card,
      gallery: [p.card.image],
      attributes: p.fit ? [{ label: "Fit", value: p.fit }] : [],
      description: p.description ?? "",
      shippingPolicy: "Free shipping on orders over €50.",
      returnsPolicy: "Free returns within 30 days.",
      reviewSummary: { count: 0, average: 0 },
      reviews: [],
      crossSell: {
        "complete-the-look": others.slice(0, 3).map((o) => o.card),
        "you-may-also-like": others.slice(3, 7).map((o) => o.card),
      },
      variants: p.variants,
    };
  }

  private matches(p: MemoryProduct, query: ProductListQuery): boolean {
    if (p.archived) return false;
    if (query.category && p.categorySlug !== query.category) return false;
    if (query.ageBand && p.ageBand !== query.ageBand) return false;
    const f = query.filters;
    if (f?.type?.length && !f.type.includes(p.categorySlug)) return false;
    if (f?.age?.length && !f.age.includes(p.ageBand)) return false;
    if (f?.fit?.length && !f.fit.includes(p.fit ?? "")) return false;
    if (f?.onSale && !p.card.compareAtPrice) return false;
    if (f?.isNew && !p.card.badges.includes("new")) return false;
    if (f?.maxPrice != null && p.card.price.amount > f.maxPrice) return false;
    return true;
  }

  async listProducts(query: ProductListQuery): Promise<ProductCard[]> {
    let out = this.data.filter((p) => this.matches(p, query));
    if (query.sort === "price-asc") out = [...out].sort((a, b) => a.card.price.amount - b.card.price.amount);
    if (query.sort === "price-desc") out = [...out].sort((a, b) => b.card.price.amount - a.card.price.amount);
    return out.map((p) => p.card);
  }

  async listCatalogProducts(query: ProductListQuery): Promise<CatalogProduct[]> {
    let out = this.data.filter((p) => this.matches(p, query));
    if (query.sort === "price-asc") out = [...out].sort((a, b) => a.card.price.amount - b.card.price.amount);
    if (query.sort === "price-desc") out = [...out].sort((a, b) => b.card.price.amount - a.card.price.amount);
    return out.map(toCatalogProduct);
  }

  async buildFilters(_query: ProductListQuery): Promise<FilterOption[]> {
    const visible = this.data.filter((p) => !p.archived);
    const age = [...new Set(visible.map((p) => p.ageBand))];
    const types = [...new Set(visible.map((p) => p.categorySlug))];
    return [
      {
        key: "age",
        label: "Age band",
        type: "multi",
        options: age.map((a) => ({ value: a, label: a, count: visible.filter((p) => p.ageBand === a).length })),
      },
      {
        key: "type",
        label: "Type",
        type: "multi",
        options: types.map((t) => ({ value: t, label: t.toUpperCase(), count: visible.filter((p) => p.categorySlug === t).length })),
      },
    ];
  }

  async search(q: string): Promise<SearchResult> {
    const ql = q.trim().toLowerCase();
    const cards = this.data
      .filter((p) => !p.archived && p.card.name.toLowerCase().includes(ql))
      .map((p) => p.card);
    return { query: q, products: cards, totalCount: cards.length };
  }

  async listAdminProducts(): Promise<AdminProductRecord[]> {
    return this.data.map(toAdminProduct);
  }

  async getAdminProduct(id: string): Promise<AdminProductRecord | null> {
    const p = this.data.find((p) => p.card.id === id);
    return p ? toAdminProduct(p) : null;
  }

  async createAdminProduct(input: AdminProductInput): Promise<AdminProductRecord> {
    const now = new Date().toISOString();
    const p: MemoryProduct = {
      card: {
        id: input.id,
        slug: input.slug,
        name: input.name,
        categoryLabel: input.categorySlug.toUpperCase(),
        price: toMoney(input.price, input.currency ?? "EUR"),
        ...(input.compareAtPrice != null
          ? { compareAtPrice: toMoney(input.compareAtPrice, input.currency ?? "EUR") }
          : {}),
        badges: (input.badges ?? []) as Badge[],
        image: {
          src: input.imageUrl ?? placeholder(input.name, input.colourHex ?? "#E5E0D6", "#FFFFFF"),
          alt: `${input.name} — ${input.categorySlug.toUpperCase()}`,
        },
        inStock: input.inStock ?? true,
        href: `/product/${input.slug}`,
        ...(input.ageBand ? { ageLabel: input.ageBand } : {}),
      },
      categorySlug: input.categorySlug,
      ageBand: input.ageBand,
      ...(input.fit ? { fit: input.fit } : {}),
      variants: [],
      ...(input.description ? { description: input.description } : {}),
      ...(input.material ? { material: input.material } : {}),
      ...(input.care ? { care: input.care } : {}),
      ...(input.origin ? { origin: input.origin } : {}),
      ...(input.colourHex ? { colourHex: input.colourHex } : {}),
      ...(input.imageUrl != null ? { imageUrl: input.imageUrl } : {}),
      archived: input.archived ?? false,
      createdAt: now,
      updatedAt: now,
    };
    this.data.push(p);
    return toAdminProduct(p);
  }

  async updateAdminProduct(
    id: string,
    input: Partial<AdminProductInput>
  ): Promise<AdminProductRecord | null> {
    const p = this.data.find((p) => p.card.id === id);
    if (!p) return null;
    const card = { ...p.card };
    if (input.currency !== undefined) card.price = toMoney(card.price.amount, input.currency);
    if (input.price !== undefined) card.price = toMoney(input.price, card.price.currency);
    if (input.compareAtPrice !== undefined)
      card.compareAtPrice =
        input.compareAtPrice != null ? toMoney(input.compareAtPrice, card.price.currency) : undefined;
    if (input.slug !== undefined) {
      card.slug = input.slug;
      card.href = `/product/${input.slug}`;
    }
    if (input.name !== undefined) {
      card.name = input.name;
      card.image = { ...card.image, alt: `${input.name} — ${p.categorySlug.toUpperCase()}` };
    }
    if (input.categorySlug !== undefined) {
      p.categorySlug = input.categorySlug;
      card.categoryLabel = input.categorySlug.toUpperCase();
    }
    if (input.ageBand !== undefined) {
      p.ageBand = input.ageBand;
      card.ageLabel = input.ageBand || undefined;
    }
    if (input.badges !== undefined) card.badges = input.badges as Badge[];
    if (input.inStock !== undefined) card.inStock = input.inStock;
    if (input.colourHex !== undefined) p.colourHex = input.colourHex ?? undefined;
    if (input.imageUrl !== undefined) {
      p.imageUrl = input.imageUrl;
      card.image = {
        ...card.image,
        src: input.imageUrl ?? placeholder(card.name, p.colourHex ?? "#E5E0D6", "#FFFFFF"),
      };
    }
    if (input.fit !== undefined) p.fit = input.fit ?? undefined;
    if (input.description !== undefined) p.description = input.description ?? undefined;
    if (input.material !== undefined) p.material = input.material ?? undefined;
    if (input.care !== undefined) p.care = input.care ?? undefined;
    if (input.origin !== undefined) p.origin = input.origin ?? undefined;
    if (input.archived !== undefined) p.archived = input.archived;
    if (input.variants !== undefined) {
      for (const v of input.variants) {
        const target = p.variants.find((x) => x.id === v.id);
        if (target) target.stock = v.stock;
      }
    }
    p.card = card;
    p.updatedAt = new Date().toISOString();
    return toAdminProduct(p);
  }
}

export class MemoryCartRepository implements CartRepository {
  private carts = new Map<string, Map<string, number>>();
  constructor(private catalog: MemoryCatalogRepository) {}

  async getCart(id: string): Promise<CartState | null> {
    if (!this.carts.has(id)) return null;
    return this.resolve(id);
  }

  async addItem(id: string, line: CartLine): Promise<CartState> {
    const variant = this.catalog.findVariant(line.variantId);
    if (variant) {
      if (variant.stock <= 0) throw new StockUnavailableError(`"${line.variantId}" is sold out`);
      const requested = (this.carts.get(id)?.get(line.variantId) ?? 0) + line.quantity;
      if (requested > variant.stock) throw new StockUnavailableError(`Only ${variant.stock} left in stock`);
    }
    let c = this.carts.get(id);
    if (!c) {
      c = new Map();
      this.carts.set(id, c);
    }
    c.set(line.variantId, clampQuantity((c.get(line.variantId) ?? 0) + line.quantity));
    return this.resolve(id);
  }

  async setQty(id: string, variantId: string, quantity: number): Promise<CartState> {
    if (!Number.isFinite(quantity) || quantity <= 0) return this.removeItem(id, variantId);
    const variant = this.catalog.findVariant(variantId);
    if (variant) {
      if (variant.stock <= 0) throw new StockUnavailableError(`"${variantId}" is sold out`);
      if (quantity > variant.stock) throw new StockUnavailableError(`Only ${variant.stock} left in stock`);
    }
    const c = this.carts.get(id);
    if (c) c.set(variantId, clampQuantity(quantity));
    return this.resolve(id);
  }

  async removeItem(id: string, variantId: string): Promise<CartState> {
    const c = this.carts.get(id);
    if (c) c.delete(variantId);
    return this.resolve(id);
  }

  private async resolve(id: string): Promise<CartState> {
    const c = this.carts.get(id) ?? new Map();
    const items = [];
    let itemCount = 0;
    let subtotal = 0;
    for (const [variantId, qty] of c) {
      const product = this.findProductByVariant(variantId);
      if (!product) continue;
      const variant = product.variants.find((v) => v.id === variantId);
      if (!variant) continue;
      const unit = variant.price?.amount ?? product.card.price.amount;
      items.push({
        product: product.card,
        variant,
        quantity: qty,
        lineTotal: unit * qty,
      });
      itemCount += qty;
      subtotal += unit * qty;
    }
    return {
      items,
      itemCount,
      subtotal,
      discounts: [],
      total: subtotal,
      freeShippingThreshold: 50,
      amountToFreeShipping: Math.max(0, 50 - subtotal),
    };
  }

  private findProductByVariant(variantId: string): MemoryProduct | undefined {
    return (this.catalog as unknown as { data: MemoryProduct[] }).data.find((p) =>
      p.variants.some((v) => v.id === variantId)
    );
  }
}

export class MemoryOrderRepository implements OrderRepository {
  private orders = new Map<string, OrderRow>();
  private byKey = new Map<string, string>();
  private byToken = new Map<string, string>();
  private addresses = new Map<string, OrderAddressRow[]>();
  transitions: OrderTransitionRow[] = [];
  constructor(private catalog?: MemoryCatalogRepository) {}

  async create(input: CreateOrderInput, order: OrderRow): Promise<void> {
    // Idempotency parity with the Drizzle unique key: a duplicate key must not
    // decrement stock or persist a second order. The service-level check handles
    // sequential retries; this guard covers concurrent requests that both pass
    // it. create() has no awaits before this point, so concurrent calls run
    // deterministically — the first completes, the second hits the guard.
    if (this.byKey.has(input.idempotencyKey)) {
      throw new Error(`Duplicate idempotency key: ${input.idempotencyKey}`);
    }
    if (this.catalog) {
      for (const item of order.items) {
        const variant = this.catalog.findVariant(item.variantId);
        if (variant && variant.stock < item.quantity) {
          throw new StockUnavailableError(
            variant.stock <= 0
              ? `"${item.variantId}" is sold out`
              : `Only ${variant.stock} left in stock`
          );
        }
      }
      for (const item of order.items) {
        const variant = this.catalog.findVariant(item.variantId);
        if (variant) variant.stock -= item.quantity;
      }
    }
    this.orders.set(order.id, order);
    this.byKey.set(input.idempotencyKey, order.id);
    this.byToken.set(order.publicToken, order.id);
    this.addresses.set(order.id, [
      {
        id: `addr_${order.id}_shipping`,
        orderId: order.id,
        kind: "shipping",
        fullName: input.shippingAddress.fullName,
        line1: input.shippingAddress.line1,
        line2: input.shippingAddress.line2,
        city: input.shippingAddress.city,
        postcode: input.shippingAddress.postcode,
        country: input.shippingAddress.country,
      },
    ]);
  }

  async get(id: string): Promise<OrderRow | null> {
    return this.orders.get(id) ?? null;
  }

  async getByPublicToken(token: string): Promise<OrderRow | null> {
    const id = this.byToken.get(token);
    return id ? (this.orders.get(id) ?? null) : null;
  }

  async getByIdempotencyKey(key: string): Promise<OrderRow | null> {
    const id = this.byKey.get(key);
    return id ? (this.orders.get(id) ?? null) : null;
  }

  async updateStatus(id: string, status: OrderRow["status"]): Promise<void> {
    const o = this.orders.get(id);
    if (o) this.orders.set(id, { ...o, status, updatedAt: new Date().toISOString() });
  }

  async appendTransition(row: OrderTransitionRow): Promise<void> {
    this.transitions.push(row);
  }

  async list(query: OrderListQuery = {}): Promise<{ rows: OrderRow[]; total: number }> {
    const all = [...this.orders.values()];
    const filtered = query.status ? all.filter((o) => o.status === query.status) : all;
    const sorted = [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const limit = query.limit ?? 50;
    const offset = query.offset ?? 0;
    return { rows: sorted.slice(offset, offset + limit), total: sorted.length };
  }

  async listTransitions(orderId: string): Promise<OrderTransitionRow[]> {
    return this.transitions
      .filter((t) => t.orderId === orderId)
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  }

  async getAddresses(orderId: string): Promise<OrderAddressRow[]> {
    return this.addresses.get(orderId) ?? [];
  }
}
