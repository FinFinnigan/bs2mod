// Storefront template registry — the single source of truth for which
// storefront stylesheet/component set is active. "vanilla" is the legacy HEAD
// storefront (preserved verbatim); "miski" is the current redesign, with
// "miski2" and "miski3" as its variants. The active template is persisted in
// the settings table and read through the backend container, so a missing
// database falls back to the default without crashing.

export const STOREFRONT_TEMPLATES = ["vanilla", "miski", "miski2", "miski3"] as const;
export type StorefrontTemplate = (typeof STOREFRONT_TEMPLATES)[number];
export const DEFAULT_STOREFRONT_TEMPLATE: StorefrontTemplate = "miski";
export const STOREFRONT_SETTINGS_KEY = "storefront.template";

export function isStorefrontTemplate(value: unknown): value is StorefrontTemplate {
  return (
    typeof value === "string" &&
    (STOREFRONT_TEMPLATES as readonly string[]).includes(value)
  );
}

export async function getActiveStorefrontTemplate(): Promise<StorefrontTemplate> {
  const { cookies } = await import("next/headers");
  const preview = (await cookies()).get("storefront-preview")?.value;
  if (preview && isStorefrontTemplate(preview)) {
    const { getAdminSession } = await import("@/app/admin/session");
    const { adminGateDecision } = await import("@/app/admin/gate");
    if (adminGateDecision((await getAdminSession())?.role) === "allow") {
      return preview;
    }
  }
  const configuredDefault = process.env.STOREFRONT_DEFAULT_TEMPLATE;
  if (isStorefrontTemplate(configuredDefault)) {
    return configuredDefault;
  }
  const { hasDatabase } = await import("@/lib/backend/db/client");
  if (!hasDatabase()) return DEFAULT_STOREFRONT_TEMPLATE;
  try {
    const { getApp } = await import("@/lib/backend/container");
    const value = await getApp().settings.get(STOREFRONT_SETTINGS_KEY);
    if (isStorefrontTemplate(value)) return value;
  } catch (error) {
    console.warn("Storefront template lookup failed; using default.", error);
  }
  return DEFAULT_STOREFRONT_TEMPLATE;
}
