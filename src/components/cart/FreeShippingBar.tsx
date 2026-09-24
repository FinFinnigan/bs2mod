import { formatPrice } from "@/lib/currency";

export function FreeShippingBar({
  amountToFreeShipping,
  threshold,
}: {
  amountToFreeShipping: number;
  threshold: number;
}) {
  const unlocked = amountToFreeShipping <= 0;
  const progress = Math.min(100, ((threshold - amountToFreeShipping) / threshold) * 100);
  return (
    <div style={{ padding: "var(--space-3) 0" }}>
      <p style={{ margin: "0 0 8px", fontSize: "var(--fs-caption)", fontWeight: 600, color: unlocked ? "var(--color-ok)" : "var(--color-ink-muted)" }}>
        {unlocked
          ? "You've unlocked free delivery!"
          : `${formatPrice(amountToFreeShipping)} to free shipping`}
      </p>
      <div
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{ height: 6, borderRadius: 999, background: "var(--color-well)", overflow: "hidden" }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: unlocked ? "var(--color-ok)" : "var(--color-primary)",
            transition: "width var(--motion-base) ease-out",
          }}
        />
      </div>
    </div>
  );
}
