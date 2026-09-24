// Provider bootstrap — registers payment adapters into the registry from
// configuration. This is the ONLY place concrete adapters are wired to ids; business
// logic calls the registry, never imports an adapter (ARCHITECTURE.md §6.1).

import { paymentRegistry } from "../payments/registry";
import { MockPaymentProvider } from "../payments/adapters/mock";
import { StripePaymentProvider } from "../payments/adapters/stripe";
import { MolliePaymentProvider, mollieKeyIssue } from "../payments/adapters/mollie";
import { loadConfig, type BackendConfig } from "./settings";

export type { BackendConfig };

export function bootstrapProviders(
  env: Record<string, string | undefined> = process.env
): BackendConfig {
  const cfg = loadConfig(env);

  // The mock adapter is always registered as a safe fallback (credentials-free).
  if (cfg.payment.providers.includes("mock")) {
    paymentRegistry.register(new MockPaymentProvider());
  }

  // Stripe is registered only when configured with a secret key, and it is the
  // caller's responsibility to keep it test-mode until live is authorized.
  if (cfg.payment.providers.includes("stripe")) {
    const secretKey = env.STRIPE_SECRET_KEY;
    if (secretKey) {
      paymentRegistry.register(
        new StripePaymentProvider({
          secretKey,
          webhookSecret: env.STRIPE_WEBHOOK_SECRET,
        })
      );
    }
  }

  // Mollie is registered only when configured with a usable API key. Keys must
  // be test-mode (test_*) unless live mode is explicitly authorized; a bad or
  // unapproved key skips registration (safe degradation, mock stays as fallback)
  // instead of crashing the bootstrap.
  if (cfg.payment.providers.includes("mollie")) {
    const apiKey = env.MOLLIE_API_KEY;
    if (apiKey) {
      const issue = mollieKeyIssue(apiKey, env.MOLLIE_ALLOW_LIVE === "true");
      if (issue) {
        console.warn(`[bootstrap] Mollie disabled: ${issue}`);
      } else {
        paymentRegistry.register(
          new MolliePaymentProvider({
            apiKey,
            webhookSecret: env.MOLLIE_WEBHOOK_SECRET,
            allowLive: env.MOLLIE_ALLOW_LIVE === "true",
          })
        );
      }
    }
  }

  return cfg;
}
