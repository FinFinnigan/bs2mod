import type { Badge } from "@/lib/types";

const LABEL: Record<Badge, string> = {
  new: "New",
  sale: "Sale",
  bestseller: "Bestseller",
  limited: "Limited",
};

export function BadgePill({ badge }: { badge: Badge }) {
  const style: React.CSSProperties =
    badge === "sale"
      ? { background: "var(--color-accent)", color: "#fff" }
      : badge === "new"
        ? { background: "var(--color-primary)", color: "#fff" }
        : { background: "var(--color-ink)", color: "#fff" };
  return (
    <span
      style={{
        ...style,
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 10px",
        borderRadius: "var(--radius-pill)",
        fontSize: "var(--fs-caption)",
        fontWeight: 700,
        lineHeight: 1,
      }}
    >
      {LABEL[badge]}
    </span>
  );
}

export function BadgeRow({ badges }: { badges: Badge[] }) {
  if (!badges.length) return null;
  return (
    <span style={{ display: "inline-flex", gap: 6 }}>
      {badges.map((b) => (
        <BadgePill key={b} badge={b} />
      ))}
    </span>
  );
}
