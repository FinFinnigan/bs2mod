import Link from "next/link";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" style={{ padding: "var(--space-3) 0" }}>
      <ol style={{ display: "flex", flexWrap: "wrap", gap: 6, fontSize: "var(--fs-caption)", color: "var(--color-ink-muted)" }}>
        {items.map((c, i) => (
          <li key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {c.href ? (
              <Link
                href={c.href}
                style={{ color: "var(--color-ink-muted)", padding: "14px 8px", margin: "-14px -8px" }}
              >
                {c.label}
              </Link>
            ) : (
              <span style={{ color: "var(--color-ink)", fontWeight: 600 }}>{c.label}</span>
            )}
            {i < items.length - 1 && <span aria-hidden="true">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
