import { getActiveStorefrontTemplate } from "@/lib/storefront/registry";
import MiskiCartPage from "@/components/storefront/miski/pages/CartPage";
import VanillaCartPage from "@/components/storefront/vanilla/pages/CartPage";

export default async function CartRoute() {
  const template = await getActiveStorefrontTemplate();
  return template === "vanilla" ? <VanillaCartPage /> : <MiskiCartPage />;
}