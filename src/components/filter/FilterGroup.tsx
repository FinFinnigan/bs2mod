"use client";

import type { FilterOption } from "@/lib/types";

export function FilterGroup({
  option,
  values,
  onChange,
}: {
  option: FilterOption;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const isSwatch = option.options.some((o) => o.hex);
  const isMulti = option.type === "multi";

  function toggle(value: string) {
    if (isMulti) {
      onChange(values.includes(value) ? values.filter((v) => v !== value) : [...values, value]);
    } else {
      onChange(values[0] === value ? [] : [value]);
    }
  }

  return (
    <div className="filter-group">
      <div className="variant-label">{option.label}</div>
      {isSwatch ? (
        <div className="swatch-row" style={{ marginTop: 8 }}>
          {option.options.map((o) => (
            <button
              key={o.value}
              type="button"
              className="swatch"
              aria-pressed={values.includes(o.value)}
              aria-label={o.label}
              onClick={() => toggle(o.value)}
              style={{ background: o.hex ?? "var(--color-well)" }}
            />
          ))}
        </div>
      ) : (
        <div className="pill-row" style={{ marginTop: 8 }}>
          {option.options.map((o) => (
            <button
              key={o.value}
              type="button"
              className="pill"
              aria-pressed={values.includes(o.value)}
              onClick={() => toggle(o.value)}
            >
              {o.label}
              {typeof o.count === "number" && (
                <span style={{ marginLeft: 6, color: values.includes(o.value) ? "inherit" : "var(--color-ink-muted)", fontWeight: 500, fontSize: "var(--fs-caption)" }}>
                  {o.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
