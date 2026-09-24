// Provider capability declaration. Each adapter advertises what it can do; the
// PaymentService adapts its flow from these flags. Capabilities are OPTIONAL — a
// provider that cannot do something simply omits/negates it; no provider is forced
// to fake an unsupported capability (ARCHITECTURE.md §7).

export interface PaymentCapabilities {
  // Manual = authorize then capture; automatic = single capture; none = no auth step.
  authCapture: "manual" | "automatic" | "none";
  refund: boolean;
  partialRefund: boolean;
  voidBeforeCapture: boolean;
  hostedRedirect: boolean; // provider-hosted payment page (redirect flow)
  clientToken: boolean; // JS SDK / drop-in tokenization (client_token flow)
  offSession: boolean; // saved-method / recurring (future)
  webhooks: boolean;
  asyncSettlement: boolean; // e.g. bank transfer, delayed confirmation
  statusPolling: boolean; // fallback when no webhook
  // Provider-agnostic default method hint ("card", …); omitted when none declared.
  // Checkout passes it to PaymentInitiation.method instead of hardcoding provider ids.
  defaultMethod?: string;
  // HTTP header the provider uses to carry its webhook signature. The route reads
  // this header and hands it to the adapter, which owns verification (§9).
  signatureHeader?: string;
}

// A capability set that forces the service into the safest, most conservative flow.
// Used by the Mock adapter and as a safe default when a provider advertises nothing.
export const MINIMAL_CAPABILITIES: PaymentCapabilities = {
  authCapture: "automatic",
  refund: false,
  partialRefund: false,
  voidBeforeCapture: false,
  hostedRedirect: false,
  clientToken: false,
  offSession: false,
  webhooks: false,
  asyncSettlement: false,
  statusPolling: true,
};

export function supports(p: PaymentCapabilities, key: keyof PaymentCapabilities): boolean {
  const v = p[key];
  if (typeof v === "boolean") return v;
  return v !== "none";
}
