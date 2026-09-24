import { notFound } from "next/navigation";
import { getPDP } from "@/lib/backend/catalog-facade";
import { getActiveStorefrontTemplate } from "@/lib/storefront/registry";
import { PdpView as MiskiPdpView } from "@/components/pdp/PdpView";
import { PdpView as VanillaPdpView } from "@/components/storefront/vanilla/pdp/PdpView";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pdp = await getPDP(slug);
  if (!pdp) notFound();

  const template = await getActiveStorefrontTemplate();
  const PdpView = template === "vanilla" ? VanillaPdpView : MiskiPdpView;

  return <PdpView pdp={pdp} />;
}