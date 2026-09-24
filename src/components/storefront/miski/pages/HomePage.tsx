import Link from "next/link";
import { productsByCollection } from "@/lib/backend/catalog-facade";
import { AGE_BANDS, getActiveSeason, STORY_BAND, VALUE_PROPS } from "@/lib/data/site";
import { ProductGrid } from "@/components/product/ProductGrid";
import { HomeHero } from "@/components/home/HomeHero";
import { IconReturn, IconShield, IconTruck } from "@/components/ui/icons";

export default async function HomePage() {
  const season = getActiveSeason();
  const featured = (await productsByCollection(season.productMix.collection)).slice(0, 10);

  return (
    <div>
      <HomeHero season={season} products={featured} />

      <section className="container home-section home-value-section">
        <div className="value-trio">
          {VALUE_PROPS.map((v) => (
            <div key={v.title} className="value-item">
              <div className="value-item__icon">
                {v.icon === "truck" && <IconTruck size={28} />}
                {v.icon === "return" && <IconReturn size={28} />}
                {v.icon === "shield" && <IconShield size={28} />}
              </div>
              <strong>{v.title}</strong>
              <span>{v.body}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="container home-chip-rail">
        {season.chipRail.map((chip) => <Link key={chip.href} href={chip.href} className={`chip ${chip.hot ? "chip--hot" : ""}`}>{chip.label}</Link>)}
      </div>

      <section className="container home-featured" aria-labelledby="featured-heading">
        <div className="section-heading"><div><span className="eyebrow">The edit</span><h2 id="featured-heading">{season.productMix.heading}</h2></div><Link href={season.productMix.ctaHref} className="size-guide-link">{season.productMix.ctaLabel} →</Link></div>
        <ProductGrid products={featured} />
      </section>

      <section className="container home-section home-story-section">
        <div className="story-band">
          <div className="story-band__copy">
            <p className="eyebrow">{STORY_BAND.eyebrow}</p>
            <h2 className="display">{STORY_BAND.headline}</h2>
            <p className="story-band__body">{STORY_BAND.body}</p>
            <Link href={STORY_BAND.ctaHref} className="btn btn-light">
              {STORY_BAND.ctaLabel} <span aria-hidden="true">→</span>
            </Link>
          </div>
          <blockquote className="story-band__quote">
            &ldquo;{STORY_BAND.pullQuote}&rdquo;
          </blockquote>
          <div className="story-band__media" role="img" aria-label={STORY_BAND.image.alt}>
            {STORY_BAND.image.label}
          </div>
        </div>
      </section>

      <section className="container home-section">
        <h2>Shop by Age</h2>
        <div className="age-band-grid">
          {AGE_BANDS.map((a) => (
            <Link
              key={a.slug}
              href={`/collection/${a.slug}`}
              className="age-band-card"
              style={{ background: a.palette.background }}
            >
              <span className="age-band-card__label">{a.label}</span>
              <span className="age-band-card__blurb">{a.blurb}</span>
              <span className="age-band-card__cta">Shop now →</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}