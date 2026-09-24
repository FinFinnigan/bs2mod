"use client";

export function QtyStepper({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (qty: number) => void;
  label: string;
}) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 4, border: "1px solid var(--color-border)", borderRadius: "var(--radius-pill)" }}>
      <button
        type="button"
        aria-label={`Decrease quantity of ${label}`}
        onClick={() => onChange(value - 1)}
        style={{ width: 36, height: 36, border: "none", background: "transparent", fontSize: 18, fontWeight: 700, color: "var(--color-ink)" }}
      >
        −
      </button>
      <span className="tabular" style={{ minWidth: 24, textAlign: "center", fontWeight: 700 }} aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        aria-label={`Increase quantity of ${label}`}
        onClick={() => onChange(value + 1)}
        style={{ width: 36, height: 36, border: "none", background: "transparent", fontSize: 18, fontWeight: 700, color: "var(--color-ink)" }}
      >
        +
      </button>
    </div>
  );
}
