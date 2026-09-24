import {
  getActiveStorefrontTemplate,
  STOREFRONT_TEMPLATES,
} from "@/lib/storefront/registry";
import { setStorefrontTemplate } from "./actions";

export const metadata = { title: "Storefront · BoyShop Admin" };

const TEMPLATE_META: Record<(typeof STOREFRONT_TEMPLATES)[number], { name: string; blurb: string }> = {
  miski: {
    name: "Miski",
    blurb: "The current redesign with the full Miski design system.",
  },
  vanilla: {
    name: "Vanilla",
    blurb: "The legacy storefront, preserved verbatim from the original build.",
  },
  miski2: {
    name: "Miski2",
    blurb: "A fresh, cool-neutral Miski variant with its own palette and shared commerce flows.",
  },
};

// Storefront template switcher (ADM-005). Two cards, each a plain form POST;
// the active template is read from the settings table and shown as disabled.
export default async function StorefrontAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const active = await getActiveStorefrontTemplate();

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "var(--space-4)" }}>
      <h1>Storefront</h1>
      <p style={{ color: "var(--color-ink-muted)" }}>
        Choose which storefront template is live on the site. The change applies immediately.
      </p>

      {error === "invalid" && (
        <p style={{ color: "var(--color-error)", fontWeight: 700 }}>
          Invalid template selection.
        </p>
      )}

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "var(--space-4)",
          marginTop: "var(--space-4)",
        }}
      >
        {STOREFRONT_TEMPLATES.map((template) => {
          const meta = TEMPLATE_META[template];
          const isActive = template === active;
          return (
            <form
              key={template}
              action={setStorefrontTemplate}
              className="card-surface"
              style={{
                padding: "var(--space-4)",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <input type="hidden" name="template" value={template} />
              <strong>{meta.name}</strong>
              <p style={{ margin: 0, color: "var(--color-ink-muted)" }}>{meta.blurb}</p>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isActive}
                style={{ alignSelf: "flex-start" }}
              >
                {isActive ? "Active" : `Switch to ${meta.name}`}
              </button>
            </form>
          );
        })}
      </section>
    </div>
  );
}