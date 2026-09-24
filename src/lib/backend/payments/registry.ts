// Config-driven provider registry. Providers are registered by id and selected
// through configuration — NEVER by importing a concrete adapter in business logic
// (ARCHITECTURE.md §6.1). Adding Mollie/Adyen/PayPal = implement its adapter and
// register it; no checkout/order/UI/domain-logic change.

import type { PaymentProvider } from "./provider";
import type { PaymentCapabilities } from "./capabilities";
import { UnknownProviderError } from "./types";

export interface ProviderRegistration {
  id: string;
  adapter: PaymentProvider;
  enabled: boolean;
}

export class PaymentProviderRegistry {
  private providers = new Map<string, ProviderRegistration>();

  register(adapter: PaymentProvider, enabled = true): void {
    this.providers.set(adapter.id, { id: adapter.id, adapter, enabled });
  }

  get(id: string): PaymentProvider {
    const reg = this.providers.get(id);
    if (!reg || !reg.enabled) throw new UnknownProviderError(id);
    return reg.adapter;
  }

  // Resolve the adapter that produced a providerRef. In production the provider id
  // is stored alongside the payment row; this helper exists for stateless routing.
  byIdOrThrow(id: string): PaymentProvider {
    return this.get(id);
  }

  list(): { id: string; capabilities: PaymentCapabilities }[] {
    return [...this.providers.values()]
      .filter((r) => r.enabled)
      .map((r) => ({ id: r.id, capabilities: r.adapter.capabilities }));
  }

  has(id: string): boolean {
    const r = this.providers.get(id);
    return !!r && r.enabled;
  }
}

// A single default registry instance for the app. Providers are registered at
// startup from configuration (see config/bootstrap.ts), not hardcoded in services.
// The storefront footer card-brand labels in "@/lib/data/site" (PAYMENT_METHODS)
// are a presentation-only list and are kept in sync with this registry by hand.
export const paymentRegistry = new PaymentProviderRegistry();
