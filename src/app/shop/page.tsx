import { allProducts } from "@/lib/backend/catalog-facade";
import { PlpView } from "@/components/plp/PlpView";
import { getActiveStorefrontTemplate } from "@/lib/storefront/registry";
import { PlpView as VanillaPlpView } from "@/components/storefront/vanilla/plp/PlpView";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const list = await allProducts();
  const template = await getActiveStorefrontTemplate();
  const View = template === "vanilla" ? VanillaPlpView : PlpView;
  return <View title="All products" products={list} />;
}
