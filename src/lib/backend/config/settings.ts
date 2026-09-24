// Configuration & feature-flag layer. Reads admin/environment-controlled settings
// so behaviour can change WITHOUT editing business logic or source code
// (ARCHITECTURE.md §6.2, §6.3). Safe, non-executable knobs are configurable;
// auth, schema, promo-calculation rules, secrets and executable code remain
// developer-controlled per no-code-scope.md.

export interface FeatureFlags {
  wishlist: boolean;
  reviews: boolean;
  account: boolean;
  promotions: boolean;
  recommendations: boolean;
}

export interface PaymentConfig {
  provider: string; // active provider id (e.g. "mock" | "stripe")
  providers: string[]; // enabled provider ids
}

export interface ShippingConfig {
  freeThreshold: number; // €50
  flatRate: number; // charged below the threshold
}

export interface BackendConfig {
  features: FeatureFlags;
  payment: PaymentConfig;
  shipping: ShippingConfig;
  publicUrl?: string; // absolute base URL of the deployed instance (PUBLIC_URL); absent in local dev
}

// Defaults match the frozen §3/§11 contract and the safe, credential-free state.
export const DEFAULT_CONFIG: BackendConfig = {
  features: {
    wishlist: true,
    reviews: false,
    account: false,
    promotions: false,
    recommendations: false,
  },
  payment: {
    provider: "mock",
    providers: ["mock"],
  },
  shipping: {
    freeThreshold: 50,
    flatRate: 4.95,
  },
};

function bool(v: string | undefined, fallback: boolean): boolean {
  if (v === undefined) return fallback;
  if (v === "true" || v === "1") return true;
  if (v === "false" || v === "0") return false;
  return fallback; // unrecognized → keep the safe default
}

function int(v: string | undefined, fallback: number): number {
  if (v === undefined) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

// Merge env vars over the defaults. Provider-specific credentials are NOT read here;
// each adapter reads only its own keys (isolated per adapter/environment).
export function loadConfig(
  env: Record<string, string | undefined> = process.env
): BackendConfig {
  return {
    features: {
      wishlist: bool(env.FEATURE_WISHLIST, DEFAULT_CONFIG.features.wishlist),
      reviews: bool(env.FEATURE_REVIEWS, DEFAULT_CONFIG.features.reviews),
      account: bool(env.FEATURE_ACCOUNT, DEFAULT_CONFIG.features.account),
      promotions: bool(env.FEATURE_PROMOTIONS, DEFAULT_CONFIG.features.promotions),
      recommendations: bool(env.FEATURE_RECOMMENDATIONS, DEFAULT_CONFIG.features.recommendations),
    },
    payment: {
      provider: env.PAYMENT_PROVIDER ?? DEFAULT_CONFIG.payment.provider,
      providers: env.PAYMENT_PROVIDERS
        ? env.PAYMENT_PROVIDERS.split(",").map((s) => s.trim()).filter(Boolean)
        : DEFAULT_CONFIG.payment.providers,
    },
    shipping: {
      freeThreshold: int(env.SHIPPING_FREE_THRESHOLD, DEFAULT_CONFIG.shipping.freeThreshold),
      flatRate: int(env.SHIPPING_FLAT_RATE, DEFAULT_CONFIG.shipping.flatRate * 100) / 100,
    },
    publicUrl: env.PUBLIC_URL || undefined,
  };
}

// Feature-flag helper: read a single feature flag (server-safe, no client leak).
export function featureEnabled(cfg: BackendConfig, flag: keyof FeatureFlags): boolean {
  return cfg.features[flag];
}
