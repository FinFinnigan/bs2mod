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
          color: "var(--color-ink-muted)",
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8h12l-1.2 11a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 8Z" />
          <path d="M9 8V6a3 3 0 0 1 6 0v2" />
        </svg>
      </div>
      <h2 style={{ fontSize: "var(--fs-h2)" }}>{title}</h2>
      {body && <p style={{ color: "var(--color-ink-muted)", maxWidth: 360, margin: 0 }}>{body}</p>}
      {actions && <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>{actions}</div>}
    </div>
  );
}
