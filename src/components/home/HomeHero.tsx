"use client";

import Link from "next/link";
import { useRef } from "react";
import { CATEGORIES } from "@/lib/data/site";
import type { Campaign } from "@/lib/data/site";
import type { ProductCard as ProductCardType } from "@/lib/types";
import { Price } from "@/components/ui/Price";
import { IconArrow } from "@/components/ui/icons";

export function HomeHero({ season, products }: { season: Campaign; products: ProductCardType[] }) {
  const railRef = useRef<HTMLDivElement>(null);
  const feature = products[0];

  const DOCK_SLUGS = ["tshirts", "hoodies", "jackets", "jeans", "sneakers"] as const;

  const dockTiles = DOCK_SLUGS.map((slug) => {
    const category = CATEGORIES.find((c) => c.slug === slug);
    const product = products.find(
      (p) => category && p.categoryLabel.toUpperCase() === category.label.toUpperCase()
    );
    return {
      slug,
      label: category?.label ?? slug,
      image: product?.image ?? null,
    };
  });

  function moveRail(direction: number) {
    if (!railRef.current) return;
    railRef.current.scrollTo({ left: railRef.current.scrollLeft + direction * 280, behavior: "smooth" });
  }

  return (
    <section className="home-hero" aria-labelledby="home-hero-title">
      <div className="container home-hero__inner">
        <div className="home-hero__copy">
          <span className="eyebrow home-hero__eyebrow">{season.eyebrow}</span>
          <h1 id="home-hero-title" className="display-xl home-hero__title">{season.headline}</h1>
          <p className="home-hero__body">{season.subcopy} Thoughtful layers, easy movement and pieces made for every small adventure.</p>
          <div className="home-hero__actions">
            <Link href={season.ctaHref} className="btn btn-primary">Shop now <span aria-hidden="true">→</span></Link>
            <Link href="/collection/new-arrivals" className="btn btn-secondary">Explore collections</Link>
          </div>
          <p className="home-hero__note">{season.overlay}</p>
        </div>

        {feature ? (
          <Link href={feature.href} className="home-hero__feature" aria-label={feature.name}>
            <span className="home-hero__feature-media">
              <img src={feature.image.src} alt={feature.image.alt} />
            </span>
            <span className="home-hero__feature-caption">
              <span>{feature.name}</span>
              <Price price={feature.price} size="sm" />
            </span>
          </Link>
        ) : null}

        <nav className="home-category-dock" aria-label="Shop by category">
          {dockTiles.map((tile) => (
            <Link key={tile.slug} href={`/category/${tile.slug}`} className="category-tile" aria-label={`Shop ${tile.label}`}>
              <span className="category-tile__media">
                {tile.image ? <img src={tile.image.src} alt={tile.image.alt} /> : null}
              </span>
              <span className="category-tile__label">{tile.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="container home-hero__rail-wrap">
        <div className="home-hero__rail-heading">
          <div>
            <span className="eyebrow">A fresh start</span>
            <h2>New in</h2>
          </div>
          <div className="carousel-controls">
            <button type="button" className="icon-button icon-button--previous" onClick={() => moveRail(-1)} aria-label="Previous hot items"><IconArrow size={18} /></button>
            <button type="button" className="icon-button" onClick={() => moveRail(1)} aria-label="Next hot items"><IconArrow size={18} /></button>
          </div>
        </div>
        <div ref={railRef} className="home-hero__rail" role="region" aria-roledescription="carousel" aria-label="Hot items">
          {products.map((product) => (
            <Link key={product.id} href={product.href} className="hot-item">
              <span className="hot-item__media"><img src={product.image.src} alt={product.image.alt} /></span>
              <span className="hot-item__name">{product.name}</span>
              <Price price={product.price} size="sm" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
