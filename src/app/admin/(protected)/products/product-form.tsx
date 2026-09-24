import Link from "next/link";
import type { CSSProperties } from "react";
import { AGE_BANDS, CATEGORIES } from "@/lib/data/site";
import type { AdminProductRecord } from "@/lib/backend/repositories/interfaces";
import { createProduct, updateProduct } from "./actions";

const labelStyle: CSSProperties = {
  display: "block",
  marginBottom: 6,
  fontWeight: 700,
  fontSize: "var(--fs-caption)",
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

const fieldStyle: CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid var(--color-ink-border)",
  background: "var(--color-bg-surface)",
  color: "var(--color-ink-strong)",
  fontSize: "var(--fs-body)",
};

type ProductFormProps = {
  mode: "create" | "edit";
  product?: AdminProductRecord;
  error?: string;
};

export default function ProductForm({ mode, product, error }: ProductFormProps) {
  return (
    <form
      action={mode === "create" ? createProduct : updateProduct}
      className="card-surface"
      style={{
        padding: "var(--space-4)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
      }}
    >
      {mode === "edit" && product && (
        <input type="hidden" name="id" value={product.id} />
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "var(--space-3)" }}>
        <div>
          <label style={labelStyle} htmlFor="pf-name">Name</label>
          <input
            id="pf-name"
            name="name"
            style={fieldStyle}
            defaultValue={product?.name ?? ""}
            required
          />
        </div>
        <div>
          <label style={labelStyle} htmlFor="pf-slug">Slug</label>
          <input
            id="pf-slug"
            name="slug"
            style={fieldStyle}
            defaultValue={product?.slug ?? ""}
            required
          />
        </div>
        <div>
          <label style={labelStyle} htmlFor="pf-category">Category</label>
          <select
            id="pf-category"
            name="categorySlug"
            style={fieldStyle}
            defaultValue={product?.categorySlug ?? CATEGORIES[0].slug}
          >
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle} htmlFor="pf-age">Age band</label>
          <select
            id="pf-age"
            name="ageBand"
            style={fieldStyle}
            defaultValue={product?.ageBand ?? AGE_BANDS[0].slug}
          >
            {AGE_BANDS.map((a) => (
              <option key={a.slug} value={a.slug}>{a.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle} htmlFor="pf-price">Price (€)</label>
          <input
            id="pf-price"
            name="price"
            style={fieldStyle}
            type="number"
            min="0"
            step="0.01"
            defaultValue={product ? (product.price / 100).toFixed(2) : ""}
            required
          />
        </div>
        <div>
          <label style={labelStyle} htmlFor="pf-compare">Compare-at price (€)</label>
          <input
            id="pf-compare"
            name="compareAtPrice"
            style={fieldStyle}
            type="number"
            min="0"
            step="0.01"
            defaultValue={product?.compareAtPrice != null ? (product.compareAtPrice / 100).toFixed(2) : ""}
          />
        </div>
        <div>
          <label style={labelStyle} htmlFor="pf-currency">Currency</label>
          <input
            id="pf-currency"
            name="currency"
            style={fieldStyle}
            defaultValue={product?.currency ?? "EUR"}
            maxLength={3}
          />
        </div>
        <div>
          <label style={labelStyle} htmlFor="pf-badges">Badges (comma-separated)</label>
          <input
            id="pf-badges"
            name="badges"
            style={fieldStyle}
            defaultValue={product?.badges.join(", ") ?? ""}
          />
        </div>
        <div>
          <label style={labelStyle} htmlFor="pf-colour">Colour (hex)</label>
          <input
            id="pf-colour"
            name="colourHex"
            style={fieldStyle}
            defaultValue={product?.colourHex ?? ""}
          />
        </div>
        <div>
          <label style={labelStyle} htmlFor="pf-material">Material</label>
          <input
            id="pf-material"
            name="material"
            style={fieldStyle}
            defaultValue={product?.material ?? ""}
          />
        </div>
        <div>
          <label style={labelStyle} htmlFor="pf-fit">Fit</label>
          <input
            id="pf-fit"
            name="fit"
            style={fieldStyle}
            defaultValue={product?.fit ?? ""}
          />
        </div>
        <div>
          <label style={labelStyle} htmlFor="pf-care">Care</label>
          <input
            id="pf-care"
            name="care"
            style={fieldStyle}
            defaultValue={product?.care ?? ""}
          />
        </div>
        <div>
          <label style={labelStyle} htmlFor="pf-origin">Origin</label>
          <input
            id="pf-origin"
            name="origin"
            style={fieldStyle}
            defaultValue={product?.origin ?? ""}
          />
        </div>
        <div>
          <label style={labelStyle} htmlFor="pf-image">Image URL</label>
          <input
            id="pf-image"
            name="imageUrl"
            style={fieldStyle}
            defaultValue={product?.imageUrl ?? ""}
          />
          <p style={{ margin: "6px 0 0", color: "var(--color-ink-muted)", fontSize: "var(--fs-caption)" }}>
            Media upload (imageUrl) is URL-text only; multipart file upload deferred to OPS-002/task 13.
          </p>
        </div>
      </div>

      <div>
        <label style={labelStyle} htmlFor="pf-description">Description</label>
        <textarea
          id="pf-description"
          name="description"
          style={{ ...fieldStyle, minHeight: 120, padding: "12px 14px", resize: "vertical" }}
          defaultValue={product?.description ?? ""}
        />
      </div>

      <div style={{ display: "flex", gap: "var(--space-4)", flexWrap: "wrap" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}>
          <input
            type="checkbox"
            name="inStock"
            defaultChecked={product?.inStock ?? true}
            disabled={mode === "edit" && (product?.variants?.length ?? 0) > 0}
          />
          {mode === "edit" && (product?.variants?.length ?? 0) > 0 && (
            <input type="hidden" name="inStockDerived" value="1" />
          )}
          In stock
          {mode === "edit" && (product?.variants?.length ?? 0) > 0 && (
            <span style={{ color: "var(--color-ink-muted)", fontSize: "var(--fs-caption)", fontWeight: 400 }}>
              (derived from variant stock)
            </span>
          )}
        </label>
        {mode === "edit" &&
          product?.variants?.map((v) => (
            <div key={v.id} style={{ width: 140 }}>
              <label style={labelStyle} htmlFor={`pf-stock-${v.id}`}>
                Stock — {v.id}
              </label>
              <input
                id={`pf-stock-${v.id}`}
                name={`variantStock-${v.id}`}
                style={fieldStyle}
                type="number"
                min="0"
                step="1"
                defaultValue={v.stock}
              />
            </div>
          ))}
        {mode === "edit" && (
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}>
            <input
              type="checkbox"
              name="archived"
              defaultChecked={product?.archived ?? false}
            />
            Archived
          </label>
        )}
      </div>

      {error && <p role="alert" style={{ margin: 0, color: "var(--color-error)" }}>{error}</p>}

      <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
        <button type="submit" className="btn btn-primary">
          {mode === "create" ? "Create product" : "Save changes"}
        </button>
        <Link href="/admin/products" className="btn btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}