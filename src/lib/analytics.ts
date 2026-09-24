// Consent-first analytics contract (design-direction.md §9).
// NO tag loads and NO events fire before explicit consent. Event names are
// frozen; wiring the measurement provider is a later, disposable Team 4 step.

export type AnalyticsEvent =
  | "view_item_list"
  | "select_item"
  | "view_item"
  | "add_to_cart"
  | "remove_from_cart"
  | "view_cart"
  | "begin_checkout"
  | "add_payment_info"
  | "purchase"
  | "search"
  | "view_search_results"
  | "filter_applied"
  | "view_promotion"
  | "select_promotion"
  | "generate_lead"
  | "signup"
  | "login"
  | "wishlist_add"
  | "wishlist_remove";

export interface AnalyticsPayload {
  item_id?: string;
  item_name?: string;
  item_brand?: string;
  item_category_hierarchy?: string;
  price?: number;
  quantity?: number;
  variant?: { size?: string; colour?: string };
  currency?: string;
  value?: number;
}

const CONSENT_KEY = "boyshop.consent.v1";

export function hasConsent(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(CONSENT_KEY) === "granted";
}

export function grantConsent(): void {
  localStorage.setItem(CONSENT_KEY, "granted");
}

export function revokeConsent(): void {
  localStorage.removeItem(CONSENT_KEY);
}

// Gated: does nothing unless consent is present. Team 4 replaces the body with
// the real tag dispatcher without touching call sites.
export function track(event: AnalyticsEvent, payload: AnalyticsPayload = {}): void {
  if (!hasConsent()) return;
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.debug("[analytics]", event, payload);
  }
}
