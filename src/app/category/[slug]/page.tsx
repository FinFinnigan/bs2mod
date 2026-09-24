import { notFound } from "next/navigation";
import { productsByCategory } from "@/lib/backend/catalog-facade";
import { CATEGORIES } from "@/lib/data/site";
import { getActiveStorefrontTemplate } from "@/lib/storefront/registry";
import { PlpView } from "@/components/plp/PlpView";
import { Breadcrumb } from "@/components/product/Breadcrumb";
import { PlpView as VanillaPlpView } from "@/components/storefront/vanilla/plp/PlpView";
import { Breadcrumb as VanillaBreadcrumb } from "@/components/storefront/vanilla/product/Breadcrumb";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = CATEGORIES.find((c) => c.slug === slug);
  if (!category) notFound();

  const list = await productsByCategory(slug);
  const template = await getActiveStorefrontTemplate();
  const View = template === "vanilla" ? VanillaPlpView : PlpView;
  const Crumb = template === "vanilla" ? VanillaBreadcrumb : Breadcrumb;
  return (
    <div className="container" style={{ paddingTop: "var(--space-3)" }}>
      <Crumb items={[{ label: "Home", href: "/" }, { label: category.label }]} />
      <View title={category.label} products={list} />
    </div>
  );
}
