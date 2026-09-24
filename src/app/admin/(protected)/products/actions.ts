"use server";

// ADM-002 Phase B: product create / update / archive server actions. These run
// exclusively as plain HTML form POSTs — no client-side data fetching, no
// "use client" components. Every action self-gates on the admin session, fails
// closed when the database is unavailable, and reports validation failures by
// redirecting back to the originating page with a ?error= message.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hasDatabase } from "@/lib/backend/db/client";
import { getApp } from "@/lib/backend/container";
import { AdminProductsService } from "@/lib/backend/services/admin-products";
import {
  adminProductPatchSchema,
  adminProductSchema,
  firstIssueMessage,
} from "@/lib/backend/api/validation";
import { money, toMinor } from "@/lib/backend/money";
import { adminGateDecision } from "../../gate";
import { getAdminSession } from "../../session";

async function requireService(): Promise<AdminProductsService> {
  const session = await getAdminSession();
  const decision = adminGateDecision(session?.role);
  if (decision === "login") redirect("/admin/login");
  if (decision === "forbidden") redirect("/admin/forbidden");
  // Fail-closed: never fall through to a database call when it is unavailable.
  if (!hasDatabase()) redirect("/admin/products");
  return new AdminProductsService({ catalog: getApp().catalog });
}

// --- FormData coercion helpers (kept private; never exposed as actions) ---

function text(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function nullableText(value: FormDataEntryValue | null): string | null {
  const trimmed = text(value);
  return trimmed === "" ? null : trimmed;
}

function checked(formData: FormData, key: string): boolean {
  return formData.get(key) === "on";
}

function eurosToCents(value: FormDataEntryValue | null): number | undefined {
  const trimmed = text(value);
  // Empty means "leave unchanged" on patch; create then fails zod (price required).
  if (trimmed === "") return undefined;
  const amount = Number(trimmed);
  // Invalid input stays NaN so the schema's .int() rejection reports it.
  if (Number.isNaN(amount)) return Number.NaN;
  return toMinor(money(amount));
}

function priceCents(formData: FormData): number | undefined {
  return eurosToCents(formData.get("price"));
}

function compareAtCents(formData: FormData): number | null {
  const cents = eurosToCents(formData.get("compareAtPrice"));
  // Empty compare-at means "no discounted reference price" → explicitly null
  // (update treats null as clear). Non-empty invalid input yields NaN, which
  // the schema's .nullable().int() rejects.
  return text(formData.get("compareAtPrice")) === "" ? null : (cents ?? null);
}

function currencyValue(formData: FormData): string | undefined {
  const value = text(formData.get("currency")).toUpperCase();
  return value === "" ? undefined : value;
}

function badgeList(formData: FormData): string[] {
  return text(formData.get("badges"))
    .split(",")
    .map((b) => b.trim())
    .filter(Boolean);
}

// Per-variant stock inputs (name="variantStock-<variantId>"). Empty input means
// "leave unchanged" → the variant is skipped. Invalid input stays NaN so the
// schema's .int().nonnegative() rejection reports it (same pattern as
// eurosToCents). Returns undefined when nothing matched so the create path and
// no-variant products are unaffected.
function variantStocks(formData: FormData): { id: string; stock: number }[] | undefined {
  const variants: { id: string; stock: number }[] = [];
  for (const [key, value] of formData.entries()) {
    const match = /^variantStock-(.+)$/.exec(key);
    if (!match) continue;
    const trimmed = typeof value === "string" ? value.trim() : "";
    if (trimmed === "") continue;
    variants.push({ id: match[1], stock: Number(trimmed) });
  }
  return variants.length > 0 ? variants : undefined;
}

function productFields(formData: FormData) {
  const variants = variantStocks(formData);
  return {
    slug: text(formData.get("slug")),
    name: text(formData.get("name")),
    categorySlug: text(formData.get("categorySlug")),
    ageBand: text(formData.get("ageBand")),
    price: priceCents(formData),
    compareAtPrice: compareAtCents(formData),
    currency: currencyValue(formData),
    badges: badgeList(formData),
    // When variants exist the inStock checkbox is disabled and a hidden
    // inStockDerived marker is submitted instead; omit inStock so the repo's
    // variant-derived sync (C02.04) is the only writer of the flag.
    ...(formData.get("inStockDerived") === "1" ? {} : { inStock: checked(formData, "inStock") }),
    colourHex: nullableText(formData.get("colourHex")),
    description: nullableText(formData.get("description")),
    material: nullableText(formData.get("material")),
    fit: nullableText(formData.get("fit")),
    care: nullableText(formData.get("care")),
    origin: nullableText(formData.get("origin")),
    imageUrl: nullableText(formData.get("imageUrl")),
    ...(variants ? { variants } : {}),
  };
}

export async function createProduct(formData: FormData): Promise<void> {
  const service = await requireService();
  const parsed = adminProductSchema.safeParse(productFields(formData));
  if (!parsed.success) {
    redirect(
      `/admin/products/new?error=${encodeURIComponent(firstIssueMessage(parsed.error))}`
    );
  }
  await service.create(parsed.data);
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProduct(formData: FormData): Promise<void> {
  const service = await requireService();
  const id = text(formData.get("id"));
  if (id === "") redirect("/admin/products");

  const parsed = adminProductPatchSchema.safeParse({
    ...productFields(formData),
    archived: checked(formData, "archived"),
  });
  if (!parsed.success) {
    redirect(
      `/admin/products/${id}/edit?error=${encodeURIComponent(firstIssueMessage(parsed.error))}`
    );
  }
  const updated = await service.update(id, parsed.data);
  if (!updated) redirect("/admin/products");
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function setArchived(formData: FormData): Promise<void> {
  const service = await requireService();
  const id = text(formData.get("id"));
  if (id === "") redirect("/admin/products");
  const archived = formData.get("archived") === "true";
  await service.update(id, { archived });
  revalidatePath("/admin/products");
  redirect("/admin/products");
}