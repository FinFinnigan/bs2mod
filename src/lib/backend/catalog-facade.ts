// Storefront read-model facade. The storefront pages read catalog data through this
// module so they behave identically with or without a live database: when
// DATABASE_URL is configured the Drizzle repositories serve the data, otherwise the
// frozen mock layer in "@/lib/data/products" is used. Page components keep the §11
// view contracts unchanged (ProductPDP / CatalogProduct[] / SearchResult).

import { hasDatabase } from "./db/client";
import { getApp } from "./container";
import type { CatalogRepository, ProductListQuery } from "./repositories/interfaces";
import type { ProductPDP, SearchResult } from "@/lib/types";
import { AGE_BANDS } from "@/lib/data/site";
import {
  getPDP as mockGetPDP,
  products as mockProducts,
  productsByCategory as mockProductsByCategory,
  productsByCollection as mockProductsByCollection,
  searchProducts as mockSearchProducts,
  type CatalogProduct,
} from "@/lib/data/products";

// Only touch the composition root when a database is configured: getApp() itself
// throws in no-DB mode because the container falls back to throwing no-op repos.
function liveCatalog(): CatalogRepository | null {
  return hasDatabase() ? getApp().catalog : null;
}

// Mirrors the mock productsByCollection() semantics on top of the repository query.
function collectionQuery(slug: string): ProductListQuery {
  if (slug === "new-arrivals") return { filters: { isNew: true } };
  if (slug === "sale") return { filters: { onSale: true } };
  const age = AGE_BANDS.find((a) => a.slug === slug);
  if (age) return { ageBand: age.short };
  return {};
}

export async function getPDP(slug: string): Promise<ProductPDP | undefined> {
  const repo = liveCatalog();
  if (repo) return repo.getProduct(slug);
  return mockGetPDP(slug);
}

export async function allProducts(): Promise<CatalogProduct[]> {
  const repo = liveCatalog();
  if (repo) return repo.listCatalogProducts({});
  return mockProducts;
}

export async function productsByCategory(slug: string): Promise<CatalogProduct[]> {
  const repo = liveCatalog();
  if (repo) return repo.listCatalogProducts({ category: slug });
  return mockProductsByCategory(slug);
}

export async function productsByCollection(slug: string): Promise<CatalogProduct[]> {
  const repo = liveCatalog();
  if (repo) return repo.listCatalogProducts(collectionQuery(slug));
  return mockProductsByCollection(slug);
}

export async function searchProducts(query: string): Promise<SearchResult> {
  const repo = liveCatalog();
  if (repo) return repo.search(query);
  const products = mockSearchProducts(query);
  return { query, products, totalCount: products.length };
}
