import Link from "next/link";
import { productsByCollection } from "@/lib/backend/catalog-facade";
import { AGE_BANDS, getActiveSeason, STORY_BAND, VALUE_PROPS } from "@/lib/data/site";
import { ProductGrid } from "@/components/product/ProductGrid";
import { IconReturn, IconShield, IconTruck } from "@/components/ui/icons";

export default async function HomePage() {
  const season = getActiveSeason();
  const featured = (await productsByCollection(season.productMix.collection)).slice(0, 6);

  return (
    <div>
      {/* Hero ÔÇö renders from the active season campaign (D-4) */}
      <section style={{ position: "relative", overflow: "hidden", background: season.palette.background, color: season.palette.text }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: -80, right: -60, width: 320, height: 320, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
        <div style={{ position: "absolute", bottom: -40, left: "30%", width: 200, height: 200, borderRadius: "50%", background: "color-mix(in srgb, var(--color-accent) 15%, transparent)" }} />
        <div style={{ position: "absolute", top: 20, left: "60%", width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div className="container" style={{ position: "relative", zIndex: 1, paddingTop: "var(--space-16)", paddingBottom: "var(--space-16)" }}>
          <p className="eyebrow" style={{ color: season.palette.textMuted, letterSpacing: "0.15em" }}>
            {season.eyebrow}
          </p>
          <h1 className="display-xl" style={{ maxWidth: 560, marginTop: 16, textShadow: "0 2px 20px rgba(0,0,0,0.15)" }}>
            {season.headline}
          </h1>
          <p style={{ maxWidth: 440, margin: "20px 0 32px", fontSize: "var(--fs-body-lg)", lineHeight: 1.6, color: season.palette.textMuted }}>
            {season.subcopy}
          </p>
          <Link href={season.ctaHref} className="btn" style={{ background: "var(--color-surface)", color: "var(--color-primary)", fontWeight: 800, padding: "0 32px", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>
            {season.ctaLabel} <span style={{ fontSize: 18 }}>ÔåÆ</span>
          </Link>
          <p style={{ margin: "32px 0 0", fontStyle: "italic", color: season.palette.textMuted, fontSize: "var(--fs-caption)", letterSpacing: "0.02em" }}>
            &ldquo;{season.overlay}&rdquo;
          </p>
        </div>
      </section>

      {/* Chip rail ÔÇö from the active campaign (┬º12.1) */}
      <div className="container" style={{ paddingTop: "var(--space-4)" }}>
        <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
          {season.chipRail.map((chip) => (
            <Link
              key={chip.href}
              href={chip.href}
              className="chip"
              style={chip.hot ? { background: season.palette.accent, color: "var(--color-surface)", whiteSpace: "nowrap" } : { whiteSpace: "nowrap" }}
            >
              {chip.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Featured grid ÔÇö product mix from the active campaign */}
      <section className="container" style={{ paddingTop: "var(--space-8)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>{season.productMix.heading}</h2>
          <Link href={season.productMix.ctaHref} className="size-guide-link">
            {season.productMix.ctaLabel} ÔåÆ
          </Link>
        </div>
        <div style={{ marginTop: "var(--space-4)" }}>
          <ProductGrid products={featured} />
        </div>
      </section>

      {/* Story band ÔÇö split editorial layout (D-4b) */}
      <section className="container" style={{ paddingTop: "var(--space-16)" }}>
        <div className="story-band">
          <div style={{ position: "relative", zIndex: 1 }}>
            <p className="eyebrow" style={{ color: "rgba(255,255,255,0.5)" }}>
              {STORY_BAND.eyebrow}
            </p>
            <h2 className="display" style={{ marginTop: 8 }}>
              {STORY_BAND.headline}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.8)", maxWidth: 460, margin: "16px 0 24px", lineHeight: 1.6 }}>
              {STORY_BAND.body}
            </p>
            <Link href={STORY_BAND.ctaHref} className="btn btn-primary">
              {STORY_BAND.ctaLabel} <span style={{ fontSize: 18 }}>ÔåÆ</span>
            </Link>
          </div>
          <blockquote className="story-band__quote">
            &ldquo;{STORY_BAND.pullQuote}&rdquo;
          </blockquote>
          {/* Image slot ÔÇö token-gradient placeholder (ADAPTED: refs uninspectable) */}
          <div className="story-band__media" role="img" aria-label={STORY_BAND.image.alt}>
            {STORY_BAND.image.label}
          </div>
        </div>
      </section>

      {/* Shop by Age ÔÇö token palettes from AGE_BANDS (G11) */}
      <section className="container" style={{ paddingTop: "var(--space-16)" }}>
        <h2>Shop by Age</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--space-4)", marginTop: "var(--space-4)" }}>
          {AGE_BANDS.map((a) => (
            <Link
              key={a.slug}
              href={`/collection/${a.slug}`}
              style={{
                background: a.palette.background,
                borderRadius: "var(--radius-card)",
                padding: "var(--space-6)",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                minHeight: 160,
                justifyContent: "flex-end",
                color: "var(--color-surface)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                transition: "transform 200ms ease, box-shadow 200ms ease",
              }}
            >
              <span style={{ fontSize: "var(--fs-h2)", fontWeight: 800, lineHeight: 1.1 }}>
                {a.label}
              </span>
              <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "var(--fs-caption)" }}>{a.blurb}</span>
              <span style={{ fontSize: "var(--fs-caption)", fontWeight: 700, marginTop: 4 }}>Shop now ÔåÆ</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Value props */}
      <section className="container" style={{ paddingTop: "var(--space-16)", paddingBottom: "var(--space-8)" }}>
        <div className="value-trio">
          {VALUE_PROPS.map((v) => (
            <div key={v.title} className="card-surface" style={{ padding: "var(--space-6)", display: "flex", flexDirection: "column", gap: 8, textAlign: "center", alignItems: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--color-primary)", color: "#fff", display: "grid", placeItems: "center", marginBottom: 4 }}>
                {v.icon === "truck" && <IconTruck size={28} />}
                {v.icon === "return" && <IconReturn size={28} />}
                {v.icon === "shield" && <IconShield size={28} />}
              </div>
              <strong style={{ fontSize: "var(--fs-body)" }}>{v.title}</strong>
              <span style={{ color: "var(--color-ink-muted)", fontSize: "var(--fs-caption)", lineHeight: 1.5 }}>{v.body}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
