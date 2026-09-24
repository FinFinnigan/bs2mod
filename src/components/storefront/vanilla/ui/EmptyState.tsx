import type { ReactNode } from "react";

export function EmptyState({
  title,
  body,
  actions,
}: {
  title: string;
  body?: string;
  actions?: ReactNode;
}) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "var(--space-16) var(--space-6)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: "var(--color-well)",
          display: "grid",
          placeItems: "center",
          fontSize: 32,
        }}
      >
        ­ƒº║
      </div>
      <h2 style={{ fontSize: "var(--fs-h2)" }}>{title}</h2>
      {body && <p style={{ color: "var(--color-ink-muted)", maxWidth: 360, margin: 0 }}>{body}</p>}
      {actions && <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>{actions}</div>}
    </div>
  );
}
