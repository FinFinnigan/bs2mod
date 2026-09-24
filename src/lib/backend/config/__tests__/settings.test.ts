import { describe, it, expect } from "vitest";
import { loadConfig, DEFAULT_CONFIG, featureEnabled } from "../settings";
import { bootstrapProviders } from "../bootstrap";
import { paymentRegistry } from "../../payments/registry";
import { UnknownProviderError } from "../../payments/types";

describe("config / feature flags", () => {
  it("returns safe defaults with no env", () => {
    const cfg = loadConfig({});
    expect(cfg.payment.provider).toBe("mock");
    expect(cfg.payment.providers).toEqual(["mock"]);
    expect(cfg.shipping.freeThreshold).toBe(50);
  });

  it("merges env vars over defaults", () => {
    const cfg = loadConfig({
      PAYMENT_PROVIDER: "stripe",
      PAYMENT_PROVIDERS: "stripe,mock",
      FEATURE_REVIEWS: "true",
      FEATURE_ACCOUNT: "false",
      SHIPPING_FREE_THRESHOLD: "60",
    });
    expect(cfg.payment.provider).toBe("stripe");
    expect(cfg.payment.providers).toEqual(["stripe", "mock"]);
    expect(featureEnabled(cfg, "reviews")).toBe(true);
    expect(featureEnabled(cfg, "account")).toBe(false);
    expect(cfg.shipping.freeThreshold).toBe(60);
  });

  it("parses booleans and numbers defensively", () => {
    const cfg = loadConfig({
      FEATURE_WISHLIST: "not-a-bool",
      SHIPPING_FREE_THRESHOLD: "not-a-number",
    });
    expect(cfg.features.wishlist).toBe(DEFAULT_CONFIG.features.wishlist);
    expect(cfg.shipping.freeThreshold).toBe(DEFAULT_CONFIG.shipping.freeThreshold);
  });

  it("reads PUBLIC_URL into publicUrl (undefined when absent)", () => {
    expect(loadConfig({}).publicUrl).toBeUndefined();
    expect(loadConfig({ PUBLIC_URL: "https://boyshop-test.i-janajoe.workers.dev" }).publicUrl).toBe(
      "https://boyshop-test.i-janajoe.workers.dev"
    );
  });
});

// S15 — provider bootstrap. Order matters: the registry is a singleton with no
// clear(), so the no-key case must run before the keyed case.
describe("S15 provider bootstrap / mollie", () => {
  it("does not register mollie without MOLLIE_API_KEY and leaves defaults unchanged", () => {
    const cfg = bootstrapProviders({ PAYMENT_PROVIDERS: "mollie" });
    expect(cfg.payment.providers).toEqual(["mollie"]);
    expect(paymentRegistry.has("mollie")).toBe(false);
    expect(() => paymentRegistry.get("mollie")).toThrow(UnknownProviderError);
    expect(DEFAULT_CONFIG.payment.provider).toBe("mock");
    expect(DEFAULT_CONFIG.payment.providers).toEqual(["mock"]);
  });

  it("does not register mollie with a live_ key unless MOLLIE_ALLOW_LIVE=true", () => {
    const cfg = bootstrapProviders({
      PAYMENT_PROVIDERS: "mollie",
      MOLLIE_API_KEY: "live_abc",
    });
    expect(cfg.payment.providers).toEqual(["mollie"]);
    expect(paymentRegistry.has("mollie")).toBe(false);
    expect(() => paymentRegistry.get("mollie")).toThrow(UnknownProviderError);
  });

  it("registers mollie with a live_ key only when MOLLIE_ALLOW_LIVE=true", () => {
    const cfg = bootstrapProviders({
      PAYMENT_PROVIDERS: "mollie",
      MOLLIE_API_KEY: "live_abc",
      MOLLIE_ALLOW_LIVE: "true",
    });
    expect(cfg.payment.providers).toEqual(["mollie"]);
    expect(paymentRegistry.has("mollie")).toBe(true);
    expect(paymentRegistry.get("mollie").id).toBe("mollie");
  });

  it("registers mollie when MOLLIE_API_KEY is present", () => {
    const cfg = bootstrapProviders({
      PAYMENT_PROVIDERS: "mollie",
      MOLLIE_API_KEY: "test_abc",
    });
    expect(cfg.payment.providers).toEqual(["mollie"]);
    expect(paymentRegistry.has("mollie")).toBe(true);
    expect(paymentRegistry.get("mollie").id).toBe("mollie");
  });
});