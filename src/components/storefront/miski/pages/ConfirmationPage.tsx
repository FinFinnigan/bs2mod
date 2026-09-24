import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumb } from "@/components/product/Breadcrumb";
import { ConfirmationView, ConfirmationLoading } from "@/app/checkout/confirmation/ConfirmationView";

export const metadata: Metadata = {
  title: "Order confirmation — BoyShop",
  description: "Check the latest status of your BoyShop order.",
};

// Server shell. The data layer lives in <ConfirmationView />, a client component
// that reads `orderToken` via useSearchParams and calls the relative order API
// (so no backend is hard-wired into the UI). useSearchParams opts the subtree into
// client rendering, so it MUST sit under a <Suspense> boundary or `next build`
// fails — the boundary below is that requirement, not decoration.
export default function ConfirmationPage() {
  return (
    <div className="container confirmation-page" style={{ paddingTop: "var(--space-3)", paddingBottom: "var(--space-12)" }}>
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "Checkout", href: "/checkout" }, { label: "Confirmation" }]}
      />
      <Suspense fallback={<ConfirmationLoading />}>
        <ConfirmationView />
      </Suspense>
    </div>
  );
}