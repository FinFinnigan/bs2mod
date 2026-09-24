import { CATEGORIES, SIZE_GUIDE } from "@/lib/data/site";
import { Breadcrumb } from "@/components/product/Breadcrumb";

export default async function SizeGuidePage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const category = CATEGORIES.find((c) => c.slug === cat);

  return (
    <div className="container" style={{ paddingTop: "var(--space-3)" }}>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Size guide" }]} />
      <h1>Size guide</h1>
      <p style={{ maxWidth: 560, color: "var(--color-ink-muted)", marginTop: 8 }}>
        {SIZE_GUIDE.intro}
      </p>
      {category && (
        <p className="chip" style={{ marginTop: 12 }}>
          Showing fit for: {category.label}
        </p>
      )}

      <div className="card-surface" style={{ marginTop: "var(--space-6)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--color-well)" }}>
              <th style={{ padding: 12, textAlign: "left" }}>Size</th>
              <th style={{ padding: 12, textAlign: "left" }}>Height</th>
              <th style={{ padding: 12, textAlign: "left" }}>Chest</th>
            </tr>
          </thead>
          <tbody>
            {SIZE_GUIDE.measurements.map((m) => (
              <tr key={m.size} style={{ borderBottom: "1px solid var(--color-border)" }}>
                <td style={{ padding: 12, fontWeight: 700 }}>{m.size}</td>
                <td style={{ padding: 12 }}>{m.height}</td>
                <td style={{ padding: 12 }}>{m.chest}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
