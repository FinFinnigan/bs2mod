// Seed the live Neon database from the frozen mock catalog.
//
// Source of truth: src/lib/data/products.ts (products) + src/lib/data/site.ts
// (categories) + getPDP(slug).variants (variants). Prices in the mock are major
// units (euros); the database stores integer minor units (cents).
//
// Run with: npm run db:seed   (loads .env.local first)

import { existsSync } from "node:fs";
import { resolve } from "node:path";

const money = (amount: number) => Math.round(amount * 100);

async function main() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (existsSync(envPath)) process.loadEnvFile(envPath);

  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local (see GO-LIVE.md) before seeding.",
    );
  }

  const { getDb } = await import("@/lib/backend/db/client");
  const { categories, products, variants } = await import(
    "@/lib/backend/db/schema"
  );
  const { CATEGORIES } = await import("@/lib/data/site");
  const { products: catalog, getPDP } = await import("@/lib/data/products");

  const db = getDb();

  const categoryRows = CATEGORIES.map((c, index) => ({
    id: c.slug,
    slug: c.slug,
    label: c.label,
    position: index,
  }));

  const productRows = catalog.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    categorySlug: p.categorySlug,
    ageBand: p.ageBand,
    price: money(p.price.amount),
    compareAtPrice: p.compareAtPrice ? money(p.compareAtPrice.amount) : null,
    currency: p.price.currency,
    badges: p.badges as string[],
    inStock: p.inStock,
    colourHex: p.colourHex ?? null,
    description: p.description ?? null,
    material: p.material ?? null,
    fit: p.fit ?? null,
    care: p.care ?? null,
    origin: p.origin ?? null,
  }));

  const variantRows = catalog.flatMap((p) => {
    const pdp = getPDP(p.slug);
    return (pdp?.variants ?? []).map((v) => ({
      id: v.id,
      productId: p.id,
      sku: v.sku,
      size: v.size ?? null,
      colour: v.colour ?? null,
      colourHex: v.colourHex ?? null,
      stock: v.stock,
      priceOverride: v.price ? money(v.price.amount) : null,
    }));
  });

  // Idempotent: clear children before parents (FK order variants -> products ->
  // categories). Catalog tables are never written to at runtime, so a full reset
  // is safe; transactional order/payment data is left untouched.
  await db.delete(variants);
  await db.delete(products);
  await db.delete(categories);

  await db.insert(categories).values(categoryRows);
  await db.insert(products).values(productRows);
  await db.insert(variants).values(variantRows);

  console.log(
    `Seeded ${categoryRows.length} categories, ${productRows.length} products, ${variantRows.length} variants.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
