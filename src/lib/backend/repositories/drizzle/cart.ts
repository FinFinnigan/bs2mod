// Drizzle cart repository — persistent server-side cart. Resolves variants +
// products into the frozen §11 CartState and computes totals SERVER-SIDE from
// database prices (never trusts a browser-supplied total). Money converted at the
// boundary.

import { eq, and, inArray } from "drizzle-orm";
import type { CartRepository, CartLine } from "../interfaces";
import { StockUnavailableError } from "../interfaces";
import { getDb } from "../../db/client";
import { carts, cartItems, variants, products, type VariantRow } from "../../db/schema";
import { isInStock } from "../../availability";
import type { CartState, CartItem, ProductCard, ProductVariant } from "@/lib/types";
import { toMoney } from "../../money";
import { placeholder } from "@/lib/placeholder";

export function variantToProductCard(
  p: typeof products.$inferSelect,
  productVariants: VariantRow[]
): ProductCard {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    categoryLabel: p.categorySlug.toUpperCase(),
    price: toMoney(p.price, p.currency),
    ...(p.compareAtPrice != null
      ? { compareAtPrice: toMoney(p.compareAtPrice, p.currency) }
      : {}),
    badges: (p.badges ?? []) as ProductCard["badges"],
    image: {
      src: placeholder(p.name, p.colourHex ?? "#E5E0D6", "#FFFFFF"),
      alt: `${p.name} — ${p.categorySlug.toUpperCase()}`,
    },
    inStock: productVariants.length > 0 ? isInStock(productVariants) : p.inStock,
    href: `/product/${p.slug}`,
    ...(p.ageBand ? { ageLabel: p.ageBand } : {}),
  };
}

function variantToVariant(v: typeof variants.$inferSelect, currency: string): ProductVariant {
  return {
    id: v.id,
    sku: v.sku,
    ...(v.size ? { size: v.size } : {}),
    ...(v.colour ? { colour: v.colour } : {}),
    ...(v.colourHex ? { colourHex: v.colourHex } : {}),
    stock: v.stock,
    ...(v.priceOverride != null ? { price: toMoney(v.priceOverride, currency) } : {}),
  };
}

const FREE_SHIPPING_THRESHOLD = 50;
const MAX_QUANTITY = 99;

function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity) || quantity < 1) return 1;
  return Math.min(Math.floor(quantity), MAX_QUANTITY);
}

async function resolveCart(db: ReturnType<typeof getDb>, cartId: string): Promise<CartState> {
  const lines = await db.select().from(cartItems).where(eq(cartItems.cartId, cartId));
  const items: CartItem[] = [];

  if (lines.length > 0) {
    const variantIds = [...new Set(lines.map((l) => l.variantId))];
    const variantsById = new Map(
      (await db.select().from(variants).where(inArray(variants.id, variantIds))).map((v) => [v.id, v])
    );
    const productIds = [...new Set([...variantsById.values()].map((v) => v.productId))];
    const productsById = new Map(
      (await db.select().from(products).where(inArray(products.id, productIds))).map((p) => [p.id, p])
    );
    const allVariantsByProduct = new Map<string, VariantRow[]>();
    if (productIds.length > 0) {
      const allVariants = await db
        .select()
        .from(variants)
        .where(inArray(variants.productId, productIds));
      for (const v of allVariants) {
        const list = allVariantsByProduct.get(v.productId);
        if (list) list.push(v);
        else allVariantsByProduct.set(v.productId, [v]);
      }
    }

    for (const line of lines) {
      const variant = variantsById.get(line.variantId);
      if (!variant) continue;
      const product = productsById.get(variant.productId);
      if (!product) continue;
      const unit = variant.priceOverride ?? product.price;
      const card = variantToProductCard(product, allVariantsByProduct.get(product.id) ?? []);
      const v = variantToVariant(variant, product.currency);
      items.push({
        product: card,
        variant: v,
        quantity: line.quantity,
        lineTotal: (unit / 100) * line.quantity,
      });
    }
  }

  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
  const total = subtotal;
  return {
    items,
    itemCount,
    subtotal,
    discounts: [],
    total,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    amountToFreeShipping: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal),
  };
}

export class DrizzleCartRepository implements CartRepository {
  async getCart(id: string): Promise<CartState | null> {
    const db = getDb();
    const [cart] = await db.select().from(carts).where(eq(carts.id, id)).limit(1);
    if (!cart) return null;
    return resolveCart(db, id);
  }

  async addItem(id: string, line: CartLine): Promise<CartState> {
    const db = getDb();
    const [variant] = await db
      .select()
      .from(variants)
      .where(eq(variants.id, line.variantId))
      .limit(1);
    const existing = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.cartId, id));
    const found = existing.find((i) => i.variantId === line.variantId);
    if (variant) {
      if (variant.stock <= 0) throw new StockUnavailableError(`"${line.variantId}" is sold out`);
      const requested = (found?.quantity ?? 0) + line.quantity;
      if (requested > variant.stock) throw new StockUnavailableError(`Only ${variant.stock} left in stock`);
    }
    await db
      .insert(carts)
      .values({ id })
      .onConflictDoNothing();
    if (found) {
      await db
        .update(cartItems)
        .set({ quantity: clampQuantity(found.quantity + line.quantity) })
        .where(eq(cartItems.id, found.id));
    } else {
      await db.insert(cartItems).values({
        id: `ci_${id}_${line.variantId}`,
        cartId: id,
        variantId: line.variantId,
        quantity: clampQuantity(line.quantity),
      });
    }
    return resolveCart(db, id);
  }

  async setQty(id: string, variantId: string, quantity: number): Promise<CartState> {
    const db = getDb();
    if (!Number.isFinite(quantity) || quantity <= 0) return this.removeItem(id, variantId);
    const [variant] = await db
      .select()
      .from(variants)
      .where(eq(variants.id, variantId))
      .limit(1);
    if (variant) {
      if (variant.stock <= 0) throw new StockUnavailableError(`"${variantId}" is sold out`);
      if (quantity > variant.stock) throw new StockUnavailableError(`Only ${variant.stock} left in stock`);
    }
    await db
      .update(cartItems)
      .set({ quantity: clampQuantity(quantity) })
      .where(and(eq(cartItems.cartId, id), eq(cartItems.variantId, variantId)));
    return resolveCart(db, id);
  }

  async removeItem(id: string, variantId: string): Promise<CartState> {
    const db = getDb();
    await db
      .delete(cartItems)
      .where(and(eq(cartItems.cartId, id), eq(cartItems.variantId, variantId)));
    return resolveCart(db, id);
  }
}
