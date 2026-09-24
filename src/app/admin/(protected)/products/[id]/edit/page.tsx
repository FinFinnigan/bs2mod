import { notFound } from "next/navigation";
import { hasDatabase } from "@/lib/backend/db/client";
import { getApp } from "@/lib/backend/container";
import { AdminProductsService } from "@/lib/backend/services/admin-products";
import ProductForm from "../../product-form";
import { AdminUnavailable } from "../../../admin-unavailable";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit product · BoyShop Admin" };

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  if (!hasDatabase()) return <AdminUnavailable />;
  const service = new AdminProductsService({ catalog: getApp().catalog });
  const product = await service.get(id);
  if (!product) notFound();

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "var(--space-4)" }}>
      <h1>Edit product</h1>
      <p style={{ color: "var(--color-ink-muted)" }}>
        Prices are entered in euros and stored as cents.
      </p>
      <div style={{ marginTop: "var(--space-3)" }}>
        <ProductForm mode="edit" product={product} error={error} />
      </div>
    </div>
  );
}