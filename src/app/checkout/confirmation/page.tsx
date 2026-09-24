import type { Metadata } from "next";
import { getActiveStorefrontTemplate } from "@/lib/storefront/registry";
import MiskiConfirmationPage from "@/components/storefront/miski/pages/ConfirmationPage";
import VanillaConfirmationPage from "@/components/storefront/vanilla/pages/ConfirmationPage";

export const metadata: Metadata = {
  title: "Order confirmation — BoyShop",
  description: "Check the latest status of your BoyShop order.",
};

export default async function CheckoutConfirmationRoute() {
  const template = await getActiveStorefrontTemplate();
  return template === "vanilla" ? <VanillaConfirmationPage /> : <MiskiConfirmationPage />;
}