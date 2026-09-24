import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumb } from "@/components/storefront/vanilla/product/Breadcrumb";
import { ConfirmationView, ConfirmationLoading } from "../checkout/ConfirmationView";

export const metadata: Metadata = {
  title: "Order confirmation ÔÇö BoyShop",
  description: "Check the latest status of your BoyShop order.",
};

// Server shell. The data layer lives in <ConfirmationView />, a client component
// that reads `orderToken` via useSearchParams and calls the relative order API
// (so no backend is hard-wired into the UI). useSearchParams opts the subtree into
// client rendering, so it MUST sit under a <Suspense> boundary or `next build`
// fails ÔÇö the boundary below is that requirement, not decoration.
export default function CheckoutConfirmationPage() {
  return (
    <div className="container" style={{ paddingTop: "var(--space-3)", paddingBottom: "var(--space-12)" }}>
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "Checkout", href: "/checkout" }, { label: "Confirmation" }]}
      />
      <Suspense fallback={<ConfirmationLoading />}>
        <ConfirmationView />
      </Suspense>
    </div>
  );
}
