"use client";

const OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

export function SortControl({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "var(--fs-body)" }}>
      <span style={{ color: "var(--color-ink-muted)" }}>Sort</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          appearance: "none",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-pill)",
          padding: "8px 32px 8px 14px",
          background: "var(--color-surface)",
          fontSize: "var(--fs-body)",
          fontWeight: 600,
          color: "var(--color-ink)",
        }}
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
