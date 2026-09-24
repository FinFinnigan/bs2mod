// Drizzle catalog repository — maps DB rows into the frozen §11 shapes. Money is
// stored in minor units and converted at this boundary. This is the "live"
// implementation of CatalogRepository; the mock data layer remains the default
// until a DATABASE_URL is configured.

import { eq, and, sql, inArray } from "drizzle-orm";
import type {
  AdminProductInput,
  AdminProductRecord,
  CatalogRepository,
  ProductListQuery,
} from "../interfaces";
import { getDb } from "../../db/client";
import {
  products,
  variants,
  type ProductRow,
  type VariantRow,
} from "../../db/schema";
import type {
  FilterOption,
  ProductCard,
  ProductPDP,
  ProductVariant,
  SearchResult,
  Badge,
} from "@/lib/types";
import type { CatalogProduct } from "@/lib/data/products";
import { toMoney } from "../../money";
import { placeholder } from "@/lib/placeholder";
import { isInStock } from "../../availability";

export function rowToCard(row: ProductRow, variantRows: VariantRow[]): ProductCard {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    categoryLabel: row.categorySlug.toUpperCase(),
    price: toMoney(row.price, row.currency),
    ...(row.compareAtPrice != null
      ? { compareAtPrice: toMoney(row.compareAtPrice, row.currency) }
      : {}),
    badges: (row.badges ?? []) as Badge[],
    image: {
      src: row.imageUrl ?? placeholder(row.name, row.colourHex ?? "#E5E0D6", "#FFFFFF"),
      alt: `${row.name} — ${row.categorySlug.toUpperCase()}`,
    },
    inStock: variantRows.length > 0 ? isInStock(variantRows) : row.inStock,
    href: `/product/${row.slug}`,
    ...(row.ageBand ? { ageLabel: row.ageBand } : {}),
  };
}

function variantRowToVariant(row: VariantRow): ProductVariant {
  return {
    id: row.id,
    sku: row.sku,
    ...(row.size ? { size: row.size } : {}),
    ...(row.colour ? { colour: row.colour } : {}),
    ...(row.colourHex ? { colourHex: row.colourHex } : {}),
    stock: row.stock,
    ...(row.priceOverride != null
      ? { price: toMoney(row.priceOverride, "EUR") }
      : {}),
  };
}

// The PLP filters client-side through the mock helpers, so the live read-model must
// return the SAME CatalogProduct shape (colours/sizes are derived from variants).
function rowToCatalogProduct(row: ProductRow, variantRows: VariantRow[]): CatalogProduct {
  const colours = [
    ...new Set(variantRows.map((v) => v.colour).filter((c): c is string => Boolean(c))),
  ];
  const sizes = [
    ...new Set(variantRows.map((v) => v.size).filter((s): s is string => Boolean(s))),
  ];
  return {
    ...rowToCard(row, variantRows),
    categorySlug: row.categorySlug,
    ageBand: row.ageBand,
    colourHex: row.colourHex ?? variantRows.find((v) => v.colourHex)?.colourHex ?? "",
    colours,
    sizes,
    material: row.material ?? "",
    fit: row.fit ?? "",
    care: row.care ?? "",
    ...(row.origin ? { origin: row.origin } : {}),
    description: row.description ?? "",
  };
}

export function rowToAdminProduct(row: ProductRow, variantRows: VariantRow[]): AdminProductRecord {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    categorySlug: row.categorySlug,
    ageBand: row.ageBand,
    price: row.price,
    compareAtPrice: row.compareAtPrice ?? null,
    currency: row.currency,
    badges: row.badges ?? [],
    inStock: variantRows.length > 0 ? isInStock(variantRows) : row.inStock,
    colourHex: row.colourHex ?? null,
    description: row.description ?? null,
    material: row.material ?? null,
    fit: row.fit ?? null,
    care: row.care ?? null,
    origin: row.origin ?? null,
    imageUrl: row.imageUrl ?? null,
    archived: row.archived,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function withVariants(row: ProductRow): Promise<AdminProductRecord> {
  const db = getDb();
  const variantRows = await db
    .select()
    .from(variants)
    .where(eq(variants.productId, row.id));
  return {
    ...rowToAdminProduct(row, variantRows),
    variants: variantRows.map((v) => ({ id: v.id, stock: v.stock })),
  };
}

async function variantsByProduct(
  db: ReturnType<typeof getDb>,
  productIds: string[]
): Promise<Map<string, VariantRow[]>> {
  if (!productIds.length) return new Map();
  const variantRows = await db
    .select()
    .from(variants)
    .where(inArray(variants.productId, productIds));
  const byProduct = new Map<string, VariantRow[]>();
  for (const v of variantRows) {
    const list = byProduct.get(v.productId);
    if (list) list.push(v);
    else byProduct.set(v.productId, [v]);
  }
  return byProduct;
}

export class DrizzleCatalogRepository implements CatalogRepository {
  async getProduct(slug: string): Promise<ProductPDP | undefined> {
    const db = getDb();
    const [product] = await db
      .select()
      .from(products)
      .where(and(eq(products.slug, slug), eq(products.archived, false)))
      .limit(1);
    if (!product) return undefined;

    const variantRows = await db
      .select()
      .from(variants)
      .where(eq(variants.productId, product.id));

    const others = await db
      .select()
      .from(products)
      .where(eq(products.archived, false))
      .limit(8);

    const attributes = [
      { label: "Material", value: product.material ?? "" },
      { label: "Fit", value: product.fit ?? "" },
      { label: "Care", value: product.care ?? "" },
      ...(product.origin ? [{ label: "Origin", value: product.origin }] : []),
    ].filter((a) => a.value);

    const othersById = await variantsByProduct(db, others.map((o) => o.id));

    return {
      ...rowToCard(product, variantRows),
      gallery: [
        { src: placeholder(`${product.name} · Front`, product.colourHex ?? "#E5E0D6", "#FFFFFF"), alt: `${product.name} front` },
        { src: placeholder(`${product.name} · Detail`, product.colourHex ?? "#E5E0D6", "#FFFFFF", 600, 600), alt: `${product.name} detail` },
      ],
      attributes,
      description: product.description ?? "",
      shippingPolicy: "Free shipping on orders over €50. Standard delivery 3–5 business days.",
      returnsPolicy: "Free returns within 30 days of purchase. Items must be unworn with tags attached.",
      reviewSummary: { count: 0, average: 0 },
      reviews: [],
      crossSell: {
        "complete-the-look": others
          .filter((o) => o.id !== product.id)
          .slice(0, 3)
          .map((o) => rowToCard(o, othersById.get(o.id) ?? [])),
        "you-may-also-like": others
          .filter((o) => o.id !== product.id)
          .slice(3, 7)
          .map((o) => rowToCard(o, othersById.get(o.id) ?? [])),
      },
      variants: variantRows.map(variantRowToVariant),
    };
  }

  async listProducts(query: ProductListQuery): Promise<ProductCard[]> {
    const db = getDb();
    const conditions = [eq(products.archived, false)];
    if (query.category) conditions.push(eq(products.categorySlug, query.category));
    if (query.ageBand) conditions.push(eq(products.ageBand, query.ageBand));

    let rows = conditions.length
      ? await db.select().from(products).where(and(...conditions))
      : await db.select().from(products);

    const f = query.filters;
    if (f) {
      rows = rows.filter((r) => {
        if (f.type?.length && !f.type.includes(r.categorySlug)) return false;
        if (f.age?.length && !f.age.includes(r.ageBand)) return false;
        if (f.fit?.length && !f.fit.includes(r.fit ?? "")) return false;
        if (f.onSale && r.compareAtPrice == null) return false;
        if (f.isNew && !(r.badges ?? []).includes("new")) return false;
        if (f.maxPrice != null && r.price / 100 > f.maxPrice) return false;
        return true;
      });
    }

    const byProduct = await variantsByProduct(db, rows.map((r) => r.id));
    let out = rows.map((r) => rowToCard(r, byProduct.get(r.id) ?? []));
    switch (query.sort) {
      case "price-asc":
        out = [...out].sort((a, b) => a.price.amount - b.price.amount);
        break;
      case "price-desc":
        out = [...out].sort((a, b) => b.price.amount - a.price.amount);
        break;
      default:
        break;
    }
    return out;
  }

  async listCatalogProducts(query: ProductListQuery): Promise<CatalogProduct[]> {
    const db = getDb();
    const conditions = [eq(products.archived, false)];
    if (query.category) conditions.push(eq(products.categorySlug, query.category));
    if (query.ageBand) conditions.push(eq(products.ageBand, query.ageBand));

    let rows = conditions.length
      ? await db.select().from(products).where(and(...conditions))
      : await db.select().from(products);

    const f = query.filters;
    if (f) {
      rows = rows.filter((r) => {
        if (f.type?.length && !f.type.includes(r.categorySlug)) return false;
        if (f.age?.length && !f.age.includes(r.ageBand)) return false;
        if (f.fit?.length && !f.fit.includes(r.fit ?? "")) return false;
        if (f.onSale && r.compareAtPrice == null) return false;
        if (f.isNew && !(r.badges ?? []).includes("new")) return false;
        if (f.maxPrice != null && r.price / 100 > f.maxPrice) return false;
        return true;
      });
    }

    switch (query.sort) {
      case "price-asc":
        rows = [...rows].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        rows = [...rows].sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }

    if (!rows.length) return [];

    const byProduct = await variantsByProduct(db, rows.map((r) => r.id));

    return rows.map((r) => rowToCatalogProduct(r, byProduct.get(r.id) ?? []));
  }

  async buildFilters(query: ProductListQuery): Promise<FilterOption[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(products)
      .where(eq(products.archived, false));
    const ageBands = [...new Set(rows.map((r) => r.ageBand))];
    const types = [...new Set(rows.map((r) => r.categorySlug))];
    const fits = [...new Set(rows.map((r) => r.fit).filter(Boolean))] as string[];
    return [
      {
        key: "age",
        label: "Age band",
        type: "multi",
        options: ageBands.map((a) => ({
          value: a,
          label: a,
          count: rows.filter((r) => r.ageBand === a).length,
        })),
      },
      {
        key: "type",
        label: "Type",
        type: "multi",
        options: types.map((t) => ({
          value: t,
          label: t.toUpperCase(),
          count: rows.filter((r) => r.categorySlug === t).length,
        })),
      },
      {
        key: "fit",
        label: "Fit",
        type: "multi",
        options: fits.map((f) => ({
          value: f,
          label: f,
          count: rows.filter((r) => r.fit === f).length,
        })),
      },
    ];
  }

  async search(q: string): Promise<SearchResult> {
    const db = getDb();
    const query = q.trim().toLowerCase();
    if (!query) return { query: q, products: [], totalCount: 0 };
    const rows = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.archived, false),
          sql`lower(${products.name}) LIKE ${`%${query}%`} OR lower(${products.categorySlug}) LIKE ${`%${query}%`}`
        )
      );
    const byProduct = await variantsByProduct(db, rows.map((r) => r.id));
    const cards = rows.map((r) => rowToCard(r, byProduct.get(r.id) ?? []));
    return { query: q, products: cards, totalCount: cards.length };
  }

  async listAdminProducts(): Promise<AdminProductRecord[]> {
    const db = getDb();
    const rows = await db.select().from(products);
    return Promise.all(rows.map(withVariants));
  }

  async getAdminProduct(id: string): Promise<AdminProductRecord | null> {
    const db = getDb();
    const [row] = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return row ? withVariants(row) : null;
  }

  async createAdminProduct(input: AdminProductInput): Promise<AdminProductRecord> {
    const db = getDb();
    const [row] = await db
      .insert(products)
      .values({
        id: input.id,
        slug: input.slug,
        name: input.name,
        categorySlug: input.categorySlug,
        ageBand: input.ageBand,
        price: input.price,
        compareAtPrice: input.compareAtPrice ?? null,
        currency: input.currency ?? "EUR",
        badges: input.badges ?? [],
        inStock: input.inStock ?? true,
        colourHex: input.colourHex ?? null,
        description: input.description ?? null,
        material: input.material ?? null,
        fit: input.fit ?? null,
        care: input.care ?? null,
        origin: input.origin ?? null,
        imageUrl: input.imageUrl ?? null,
        archived: input.archived ?? false,
      })
      .returning();
    return withVariants(row);
  }

  async updateAdminProduct(
    id: string,
    input: Partial<AdminProductInput>
  ): Promise<AdminProductRecord | null> {
    const db = getDb();
    const patch: Partial<typeof products.$inferInsert> = {};
    if (input.slug !== undefined) patch.slug = input.slug;
    if (input.name !== undefined) patch.name = input.name;
    if (input.categorySlug !== undefined) patch.categorySlug = input.categorySlug;
    if (input.ageBand !== undefined) patch.ageBand = input.ageBand;
    if (input.price !== undefined) patch.price = input.price;
    if (input.compareAtPrice !== undefined) patch.compareAtPrice = input.compareAtPrice;
    if (input.currency !== undefined) patch.currency = input.currency;
    if (input.badges !== undefined) patch.badges = input.badges;
    if (input.inStock !== undefined) patch.inStock = input.inStock;
    if (input.colourHex !== undefined) patch.colourHex = input.colourHex;
    if (input.description !== undefined) patch.description = input.description;
    if (input.material !== undefined) patch.material = input.material;
    if (input.fit !== undefined) patch.fit = input.fit;
    if (input.care !== undefined) patch.care = input.care;
    if (input.origin !== undefined) patch.origin = input.origin;
    if (input.imageUrl !== undefined) patch.imageUrl = input.imageUrl;
    if (input.archived !== undefined) patch.archived = input.archived;
    patch.updatedAt = new Date();
    const [row] = await db
      .update(products)
      .set(patch)
      .where(eq(products.id, id))
      .returning();
    if (!row) return null;
    if (input.variants) {
      for (const v of input.variants) {
        await db
          .update(variants)
          .set({ stock: v.stock })
          .where(and(eq(variants.id, v.id), eq(variants.productId, id)));
      }
      const variantRows = await db.select().from(variants).where(eq(variants.productId, id));
      const [synced] = await db
        .update(products)
        .set({ inStock: isInStock(variantRows) })
        .where(eq(products.id, id))
        .returning();
      return withVariants(synced ?? row);
    }
    return withVariants(row);
  }
}
