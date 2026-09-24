"use client";

export function AddToCartButton({
  label,
  priceLabel,
  disabled = false,
  onClick,
}: {
  label: string;
  priceLabel?: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button className="btn btn-primary btn-block" type="button" onClick={onClick} disabled={disabled}>
      {label}
      {priceLabel ? ` — ${priceLabel}` : ""}
    </button>
  );
}
