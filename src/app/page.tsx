import { getActiveStorefrontTemplate } from "@/lib/storefront/registry";
import MiskiHomePage from "@/components/storefront/miski/pages/HomePage";
import VanillaHomePage from "@/components/storefront/vanilla/pages/HomePage";

export default async function HomeRoute() {
  const template = await getActiveStorefrontTemplate();
  return template === "vanilla" ? <VanillaHomePage /> : <MiskiHomePage />;
}