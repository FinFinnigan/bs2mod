import type { Metadata } from "next";
import { CartProvider } from "@/lib/cart/CartProvider";
import { ToastProvider } from "@/lib/toast/ToastProvider";
import { getActiveStorefrontTemplate, type StorefrontTemplate } from "@/lib/storefront/registry";
import { getShells } from "@/lib/storefront/variants";

export const metadata: Metadata = {
  title: "BoyShop — Premium boys' clothing",
  description:
    "Premium, mobile-first boys-clothing storefront. Shop by age and type: t-shirts, hoodies, sets and more.",
};

// Theme stylesheets load in order: Miski2 reuses Miski's component styling,
// then applies its own design-token overrides. Each theme also selects its display font.
const FONT_LINKS: Record<StorefrontTemplate, string> = {
  miski: "https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600;6..72,700&display=swap",
  vanilla: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
  miski2: "https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600;6..72,700&display=swap",
};

const STYLESHEETS: Record<StorefrontTemplate, string[]> = {
  miski: ["/templates/miski.css"],
  vanilla: ["/templates/vanilla.css"],
  miski2: ["/templates/miski.css", "/templates/miski2.css"],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const template = await getActiveStorefrontTemplate();
  const { SiteChrome, SiteFooter, CartDrawer } = getShells(template);

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={FONT_LINKS[template]} rel="stylesheet" />
        {STYLESHEETS[template].map((href) => (
          <link key={href} rel="stylesheet" href={href} />
        ))}
      </head>
      <body>
        <CartProvider>
          <ToastProvider>
            <SiteChrome />
            <main id="main">{children}</main>
            <SiteFooter />
            <CartDrawer />
          </ToastProvider>
        </CartProvider>
      </body>
    </html>
  );
}
