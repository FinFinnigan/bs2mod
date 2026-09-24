import type { ComponentType } from "react";
import type { StorefrontTemplate } from "@/lib/storefront/registry";

import { SiteChrome as MiskiSiteChrome } from "@/components/layout/SiteChrome";
import { SiteFooter as MiskiSiteFooter } from "@/components/layout/SiteFooter";
import { CartDrawer as MiskiCartDrawer } from "@/components/cart/CartDrawer";

import { SiteChrome as VanillaSiteChrome } from "@/components/storefront/vanilla/layout/SiteChrome";
import { SiteFooter as VanillaSiteFooter } from "@/components/storefront/vanilla/layout/SiteFooter";
import { CartDrawer as VanillaCartDrawer } from "@/components/storefront/vanilla/cart/CartDrawer";

import { SiteChrome as Miski3SiteChrome } from "@/components/storefront/miski3/Shell";
import { SiteFooter as Miski3SiteFooter } from "@/components/storefront/miski3/SiteFooter";

export interface StorefrontShells {
  SiteChrome: ComponentType;
  SiteFooter: ComponentType;
  CartDrawer: ComponentType;
}

// Per-template page chrome. The commerce layer (cart, toast, product data) is
// shared; only the shell components differ between templates.
export function getShells(template: StorefrontTemplate): StorefrontShells {
  if (template === "miski3") return { SiteChrome: Miski3SiteChrome, SiteFooter: Miski3SiteFooter, CartDrawer: MiskiCartDrawer };
  if (template === "vanilla") {
    return {
      SiteChrome: VanillaSiteChrome,
      SiteFooter: VanillaSiteFooter,
      CartDrawer: VanillaCartDrawer,
    };
  }
  return {
    SiteChrome: MiskiSiteChrome,
    SiteFooter: MiskiSiteFooter,
    CartDrawer: MiskiCartDrawer,
  };
}