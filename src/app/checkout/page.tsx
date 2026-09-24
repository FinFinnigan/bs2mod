import { getActiveStorefrontTemplate } from "@/lib/storefront/registry";
import MiskiCheckoutPage from "@/components/storefront/miski/pages/CheckoutPage";
import VanillaCheckoutPage from "@/components/storefront/vanilla/pages/CheckoutPage";

export default async function CheckoutRoute() {
  const template = await getActiveStorefrontTemplate();
  return template === "vanilla" ? <VanillaCheckoutPage /> : <MiskiCheckoutPage />;
}