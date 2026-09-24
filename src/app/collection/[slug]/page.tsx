import { notFound } from "next/navigation";
import { productsByCollection } from "@/lib/backend/catalog-facade";
import { AGE_BANDS, COLLECTIONS } from "@/lib/data/site";
import { getActiveStorefrontTemplate } from "@/lib/storefront/registry";
import { PlpView as MiskiPlpView } from "@/components/plp/PlpView";
import { Breadcrumb as MiskiBreadcrumb } from "@/components/product/Breadcrumb";
import { PlpView as VanillaPlpView } from "@/components/storefront/vanilla/plp/PlpView";
import { Breadcrumb as VanillaBreadcrumb } from "@/components/storefront/vanilla/product/Breadcrumb";

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = COLLECTIONS.find((c) => c.slug === slug);
  if (!collection) notFound();

  const age = AGE_BANDS.find((a) => a.slug === slug);
  const list = await productsByCollection(slug);
  const template = await getActiveStorefrontTemplate();
  const PlpView = template === "vanilla" ? VanillaPlpView : MiskiPlpView;
  const Breadcrumb = template === "vanilla" ? VanillaBreadcrumb : MiskiBreadcrumb;

  return (
    <div className="container" style={{ paddingTop: "var(--space-3)" }}>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: collection.label }]} />
      <PlpView
        title={collection.label}
        products={list}
        preSelectAge={age?.short}
        preSelectSale={slug === "sale"}
      />
    </div>
  );
}