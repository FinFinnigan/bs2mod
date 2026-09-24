// Payment webhook — receives provider webhooks, routes to the correct adapter for
// signature verification + normalization, then applies the state transition to the
// order's payment. The adapter verifies the signature; the service deduplicates and
// transitions. No raw card data is ever present.

import { NextRequest, NextResponse } from "next/server";
import { getApp } from "@/lib/backend/container";
import { webhookSchema, firstIssueMessage } from "@/lib/backend/api/validation";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const app = getApp();
  const providerId = app.config.payment.provider;

  if (!app.registry.has(providerId)) {
    return NextResponse.json(
      { received: false, error: "unknown_provider" },
      { status: 500 }
    );
  }
  const provider = app.registry.byIdOrThrow(providerId);

  const raw = await req.text();

  // Classic Mollie webhooks POST form-encoded bodies ("id=tr_..."); JSON
  // providers (Stripe, mock) send JSON objects. The adapter owns parsing and
  // signature verification, so raw text is passed through unchanged for
  // byte-exact verification. Only JSON bodies are schema-checked here.
  const contentType = req.headers.get("content-type") ?? "";
  const isFormEncoded = contentType.includes("application/x-www-form-urlencoded");
  if (!isFormEncoded) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const result = webhookSchema.safeParse(parsed);
    if (!result.success) {
      return NextResponse.json({ error: firstIssueMessage(result.error) }, { status: 400 });
    }
  }

  // Read the signature header the active adapter declares (G14); the adapter
  // owns verification, the route only extracts the header it advertises.
  const declared = provider.capabilities.signatureHeader;
  const signature = declared
    ? req.headers.get(declared)
    : req.headers.get("stripe-signature") ?? req.headers.get("x-webhook-signature");

  let event: Awaited<ReturnType<typeof provider.handleWebhook>>;
  try {
    event = await provider.handleWebhook(raw, signature);
  } catch {
    // Provider-side verification failed (e.g. the payment no longer exists at
    // the provider → provider API 404). Surface as a sanitized 500 JSON so the
    // provider does not retry an unparseable/empty body forever.
    return NextResponse.json(
      { received: false, error: "provider_webhook_failed", handled: "error" },
      { status: 500 }
    );
  }
  if (!event) {
    // Not relevant to us (e.g. an event type we ignore).
    return NextResponse.json({ received: true, handled: "ignored" });
  }

  // Locate the payment by provider reference and apply the transition.
  const record = await app.payments.store.getByProviderRef(event.providerRef);
  if (!record) {
    return NextResponse.json({ received: true, handled: "unmatched" });
  }

  try {
    const status = await app.payments.handleEvent(record, event);
    // Advance the owning order through the same path reconcileOrder uses
    // (PAYMENT_TO_ORDER). handlePaymentEvent persists and is a no-op on replay.
    if (status && app.ordersService) {
      const order = await app.orders.get(record.orderId);
      if (order) {
        await app.ordersService.handlePaymentEvent(order, status);
      }
    }
  } catch {
    return NextResponse.json(
      { received: false, error: "processing_failed", handled: "error" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true, handled: "applied" });
}
