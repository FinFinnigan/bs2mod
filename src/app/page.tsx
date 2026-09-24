import { getActiveStorefrontTemplate } from "@/lib/storefront/registry";
import MiskiHomePage from "@/components/storefront/miski/pages/HomePage";
import VanillaHomePage from "@/components/storefront/vanilla/pages/HomePage";

import Miski3HomePage from "@/components/storefront/miski3/HomePage";

export default async function HomeRoute() {
  const template = await getActiveStorefrontTemplate();
  if (template === "miski3") return <Miski3HomePage />;
  return template === "vanilla" ? <VanillaHomePage /> : <MiskiHomePage />;
}