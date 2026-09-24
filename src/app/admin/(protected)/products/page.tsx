import Link from "next/link";
import { hasDatabase } from "@/lib/backend/db/client";
import { getApp } from "@/lib/backend/container";
import { AdminProductsService } from "@/lib/backend/services/admin-products";
import { formatMoney } from "@/lib/currency";
import { toMoney } from "@/lib/backend/money";
import { placeholder } from "@/lib/placeholder";
import { AGE_BANDS, CATEGORIES } from "@/lib/data/site";
import { AdminUnavailable } from "../admin-unavailable";
import { setArchived } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Products · BoyShop Admin" };

export default async function AdminProductsPage() {
  if (!hasDatabase()) return <AdminUnavailable />;
  const service = new AdminProductsService({ catalog: getApp().catalog });
  const products = await service.list();

  const categoryLabel = (slug: string) =>
    CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
  const ageBandLabel = (slug: string) =>
    AGE_BANDS.find((a) => a.slug === slug)?.label ?? slug;

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "var(--space-4)" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-3)",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1>Products</h1>
          <p style={{ margin: 0, color: "var(--color-ink-muted)" }}>
            {products.length} product{products.length === 1 ? "" : "s"} in the catalogue.
          </p>
        </div>
        <Link href="/admin/products/new" className="btn btn-primary" style={{ textDecoration: "none" }}>
          New product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="card-surface" style={{ marginTop: "var(--space-4)", padding: "var(--space-6)" }}>
          <p style={{ margin: 0, color: "var(--color-ink-muted)" }}>
            No products yet. Create the first one to start merchandising.
          </p>
        </div>
      ) : (
        <div className="card-surface" style={{ marginTop: "var(--space-4)", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--color-ink-muted)", fontSize: "var(--fs-caption)" }}>
                <th style={{ padding: "var(--space-3)" }}>Product</th>
                <th style={{ padding: "var(--space-3)" }}>Category</th>
                <th style={{ padding: "var(--space-3)" }}>Age band</th>
                <th style={{ padding: "var(--space-3)" }}>Price</th>
                <th style={{ padding: "var(--space-3)" }}>Stock</th>
                <th style={{ padding: "var(--space-3)" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p.id}
                  style={{
                    borderTop: "1px solid var(--color-border)",
                    ...(p.archived ? { opacity: 0.55 } : {}),
                  }}
                >
                  <td style={{ padding: "var(--space-3)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                      <img
                        src={placeholder(p.name, p.colourHex ?? undefined, undefined, 48, 64)}
                        alt=""
                        width={48}
                        height={64}
                        style={{ borderRadius: 6, display: "block" }}
                      />
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        style={{ color: "var(--color-primary)", fontWeight: 700, textDecoration: "none" }}
                      >
                        {p.name}
                      </Link>
                    </div>
                  </td>
                  <td style={{ padding: "var(--space-3)" }}>{categoryLabel(p.categorySlug)}</td>
                  <td style={{ padding: "var(--space-3)" }}>{ageBandLabel(p.ageBand)}</td>
                  <td style={{ padding: "var(--space-3)" }} className="tabular">
                    {formatMoney(toMoney(p.price, p.currency))}
                  </td>
                  <td style={{ padding: "var(--space-3)" }}>{p.inStock ? "In stock" : "Out of stock"}</td>
                  <td style={{ padding: "var(--space-3)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexWrap: "wrap" }}>
                      <span className="chip" style={{ color: p.archived ? "var(--color-ink-muted)" : "var(--color-ok)" }}>
                        {p.archived ? "archived" : "live"}
                      </span>
                      <form action={setArchived}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="archived" value={p.archived ? "false" : "true"} />
                        <button
                          type="submit"
                          className="btn btn-secondary"
                          style={{ padding: "4px 10px", fontSize: "var(--fs-caption)" }}
                        >
                          {p.archived ? "Restore" : "Archive"}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}