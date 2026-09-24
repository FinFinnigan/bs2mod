// Mollie adapter tests — S1..S7 + handleWebhook. Every HTTP path is covered by an
// injected fetch stub; no real network calls ever reach Mollie.

import { describe, it, expect } from "vitest";
import { createHmac } from "node:crypto";
import {
  MolliePaymentProvider,
  moneyToMollieAmount,
  mollieAmountToMoney,
  verifyMollieSignature,
  mollieKeyIssue,
  MOLLIE_CAPABILITIES,
  MOLLIE_TO_STATUS,
  MOLLIE_STATUS_TO_EVENT,
} from "../adapters/mollie";
import type { PaymentInitiation } from "../types";

const BASE = "https://api.mollie.com/v2";
const API_KEY = "test_abc";

type FetchHandler = (url: string, init?: RequestInit) => Response | Promise<Response>;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function stubFetch(handler?: FetchHandler) {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const fetchImpl: typeof fetch = async (input, init) => {
    const url = String(input);
    calls.push({ url, init });
    return handler ? await handler(url, init) : jsonResponse({});
  };
  return { fetchImpl, calls };
}

function makeAdapter(fetchImpl: typeof fetch, webhookSecret?: string) {
  return new MolliePaymentProvider({ apiKey: API_KEY, webhookSecret, fetchImpl });
}

function sign(body: string, secret: string): string {
  // Next-gen webhooks deliver the digest as "sha256=<hex>".
  return `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
}

const init: PaymentInitiation = {
  orderId: "ord_1",
  amount: { amount: 22.95, currency: "EUR" },
  returnUrl: "https://shop.example/return",
};

describe("S1 moneyToMollieAmount", () => {
  it("formats major units to Mollie's two-decimal string", () => {
    expect(moneyToMollieAmount({ amount: 22.95, currency: "EUR" })).toEqual({
      currency: "EUR",
      value: "22.95",
    });
    expect(moneyToMollieAmount({ amount: 68, currency: "EUR" })).toEqual({
      currency: "EUR",
      value: "68.00",
    });
  });

  it("rounds half-cents via Math.round on minor units (documented)", () => {
    expect(moneyToMollieAmount({ amount: 1000.005, currency: "EUR" })).toEqual({
      currency: "EUR",
      value: "1000.01",
    });
  });
});

describe("S2 mollieAmountToMoney", () => {
  it("parses Mollie decimal strings into major-unit Money", () => {
    expect(mollieAmountToMoney("22.95")).toEqual({ amount: 22.95, currency: "EUR" });
    expect(mollieAmountToMoney("22.3")).toEqual({ amount: 22.3, currency: "EUR" });
    expect(mollieAmountToMoney("22.999")).toEqual({ amount: 23, currency: "EUR" });
    expect(mollieAmountToMoney("0")).toEqual({ amount: 0, currency: "EUR" });
  });

  it("honors an explicit currency", () => {
    expect(mollieAmountToMoney("22.95", "USD")).toEqual({ amount: 22.95, currency: "USD" });
  });
});

describe("S3 status maps", () => {
  it("maps Mollie statuses into our PaymentStatus names", () => {
    expect(MOLLIE_TO_STATUS.open).toBe("action_required");
    expect(MOLLIE_TO_STATUS.pending).toBe("action_required");
    expect(MOLLIE_TO_STATUS.authorized).toBe("authorized");
    expect(MOLLIE_TO_STATUS.paid).toBe("paid");
    expect(MOLLIE_TO_STATUS.canceled).toBe("cancelled");
    expect(MOLLIE_TO_STATUS.expired).toBe("expired");
    expect(MOLLIE_TO_STATUS.failed).toBe("failed");
    expect(MOLLIE_TO_STATUS.refunded).toBe("refunded");
    expect(MOLLIE_TO_STATUS.partially_refunded).toBe("partially_refunded");
  });

  it("maps Mollie statuses into provider-agnostic event types", () => {
    expect(MOLLIE_STATUS_TO_EVENT.paid).toBe("payment.paid");
    expect(MOLLIE_STATUS_TO_EVENT.failed).toBe("payment.failed");
    expect(MOLLIE_STATUS_TO_EVENT.canceled).toBe("payment.cancelled");
    expect(MOLLIE_STATUS_TO_EVENT.expired).toBe("payment.expired");
    expect(MOLLIE_STATUS_TO_EVENT.authorized).toBe("payment.authorized");
    expect(MOLLIE_STATUS_TO_EVENT.open).toBe("payment.action_required");
    expect(MOLLIE_STATUS_TO_EVENT.pending).toBe("payment.action_required");
    expect(MOLLIE_STATUS_TO_EVENT.refunded).toBe("payment.refunded");
    expect(MOLLIE_STATUS_TO_EVENT.partially_refunded).toBe("payment.partially_refunded");
  });

  it("returns null for unknown statuses", () => {
    expect(MOLLIE_TO_STATUS.unknown).toBeUndefined();
    expect(MOLLIE_STATUS_TO_EVENT.unknown).toBeUndefined();
  });
});

describe("S4 verifyMollieSignature", () => {
  const body = '{"id":"tr_1"}';
  const secret = "whsec_test";

  it("accepts a correct HMAC-SHA256 signature", () => {
    expect(verifyMollieSignature(body, sign(body, secret), secret)).toBe(true);
  });

  it("accepts a bare hex digest (backward compatible)", () => {
    const bare = createHmac("sha256", secret).update(body).digest("hex");
    expect(verifyMollieSignature(body, bare, secret)).toBe(true);
  });

  it("rejects a wrong signature", () => {
    expect(verifyMollieSignature(body, sign(body, "other"), secret)).toBe(false);
  });

  it("returns false (never throws) when secret or signature is missing", () => {
    expect(verifyMollieSignature(body, sign(body, secret), undefined)).toBe(false);
    expect(verifyMollieSignature(body, undefined, secret)).toBe(false);
  });
});

describe("S5 createSession", () => {
  it("POSTs to /payments with Bearer auth and returns a redirect session", async () => {
    const { fetchImpl, calls } = stubFetch(() =>
      jsonResponse({
        id: "tr_abc123",
        status: "open",
        amount: { currency: "EUR", value: "22.95" },
        _links: { checkout: { href: "https://www.mollie.com/checkout/abc123" } },
      })
    );
    const provider = makeAdapter(fetchImpl);

    const session = await provider.createSession(init);

    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe(`${BASE}/payments`);
    expect(calls[0].init?.method).toBe("POST");
    const headers = calls[0].init?.headers as Record<string, string>;
    expect(headers.Authorization).toBe(`Bearer ${API_KEY}`);
    expect(headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(calls[0].init?.body as string)).toEqual({
      amount: { currency: "EUR", value: "22.95" },
      description: "Order ord_1",
      redirectUrl: "https://shop.example/return",
    });
    expect(session).toEqual({
      kind: "redirect",
      url: "https://www.mollie.com/checkout/abc123",
      providerRef: "tr_abc123",
      providerId: "mollie",
    });
  });

  it("includes method in the body only when init.method is set", async () => {
    const { fetchImpl, calls } = stubFetch(() =>
      jsonResponse({
        id: "tr_ideal",
        status: "open",
        _links: { checkout: { href: "https://www.mollie.com/checkout/ideal" } },
      })
    );
    const provider = makeAdapter(fetchImpl);

    await provider.createSession({ ...init, method: "ideal" });

    const body = JSON.parse(calls[0].init?.body as string);
    expect(body.method).toBe("ideal");
  });

  it("throws when the response lacks a checkout URL", async () => {
    const { fetchImpl } = stubFetch(() => jsonResponse({ id: "tr_1", status: "open" }));
    const provider = makeAdapter(fetchImpl);
    await expect(provider.createSession(init)).rejects.toThrow(/checkout/i);
  });
});

describe("S6 getStatus", () => {
  it("GETs the payment and maps its status", async () => {
    const { fetchImpl, calls } = stubFetch(() =>
      jsonResponse({ id: "tr_abc123", status: "paid" })
    );
    const provider = makeAdapter(fetchImpl);

    const result = await provider.getStatus("tr_abc123");

    expect(calls[0].url).toBe(`${BASE}/payments/tr_abc123`);
    expect(calls[0].init?.method).toBe("GET");
    expect(result).toEqual({ status: "paid", providerRef: "tr_abc123" });
  });

  it("maps an async banktransfer 'open' to action_required (never paid)", async () => {
    const { fetchImpl } = stubFetch(() =>
      jsonResponse({ id: "tr_bt", status: "open", method: "banktransfer" })
    );
    const provider = makeAdapter(fetchImpl);
    await expect(provider.getStatus("tr_bt")).resolves.toEqual({
      status: "action_required",
      providerRef: "tr_bt",
    });
  });

  it("throws a typed error on non-2xx responses", async () => {
    const { fetchImpl } = stubFetch(() => jsonResponse({}, 500));
    const provider = makeAdapter(fetchImpl);
    await expect(provider.getStatus("tr_1")).rejects.toThrow(/Mollie request failed/);
  });

  it("throws a typed error when the network rejects", async () => {
    const { fetchImpl } = stubFetch(() => {
      throw new Error("network down");
    });
    const provider = makeAdapter(fetchImpl);
    await expect(provider.getStatus("tr_1")).rejects.toThrow(/Mollie request failed/);
  });
});

describe("S7 refund", () => {
  const paymentWithRefund = (refunded: string) =>
    jsonResponse({
      id: "tr_abc123",
      status: "paid",
      amount: { currency: "EUR", value: "22.95", refunded: { currency: "EUR", value: refunded } },
    });

  it("POSTs a partial refund and reports partially_refunded", async () => {
    const { fetchImpl, calls } = stubFetch((url) =>
      url.endsWith("/refunds")
        ? jsonResponse({ id: "re_1", amount: { currency: "EUR", value: "5.00" } })
        : paymentWithRefund("5.00")
    );
    const provider = makeAdapter(fetchImpl);

    const result = await provider.refund("tr_abc123", { amount: 5, currency: "EUR" });

    expect(calls[0].url).toBe(`${BASE}/payments/tr_abc123/refunds`);
    expect(calls[0].init?.method).toBe("POST");
    expect(JSON.parse(calls[0].init?.body as string)).toEqual({
      amount: { currency: "EUR", value: "5.00" },
    });
    expect(result).toEqual({ status: "partially_refunded", providerRef: "tr_abc123" });
  });

  it("reports refunded when the full amount is refunded", async () => {
    const { fetchImpl } = stubFetch((url) =>
      url.endsWith("/refunds")
        ? jsonResponse({ id: "re_1", amount: { currency: "EUR", value: "22.95" } })
        : paymentWithRefund("22.95")
    );
    const provider = makeAdapter(fetchImpl);

    await expect(provider.refund("tr_abc123")).resolves.toEqual({
      status: "refunded",
      providerRef: "tr_abc123",
    });
  });

  it("omits the amount body when no amount is given", async () => {
    const { fetchImpl, calls } = stubFetch((url) =>
      url.endsWith("/refunds")
        ? jsonResponse({ id: "re_1", amount: { currency: "EUR", value: "22.95" } })
        : paymentWithRefund("22.95")
    );
    const provider = makeAdapter(fetchImpl);

    await provider.refund("tr_abc123");

    expect(calls[0].init?.body).toBeUndefined();
  });
});

describe("mollieKeyIssue / key guard", () => {
  it("accepts a test_ key", () => {
    expect(mollieKeyIssue("test_abc")).toBeNull();
    expect(mollieKeyIssue("test_abc", false)).toBeNull();
  });

  it("rejects a live_ key unless explicitly allowed", () => {
    expect(mollieKeyIssue("live_abc")).not.toBeNull();
    expect(mollieKeyIssue("live_abc", false)).not.toBeNull();
  });

  it("accepts a live_ key when allowLive is true", () => {
    expect(mollieKeyIssue("live_abc", true)).toBeNull();
  });

  it("rejects missing and unrecognized keys", () => {
    expect(mollieKeyIssue("")).not.toBeNull();
    expect(mollieKeyIssue("prod_xyz")).not.toBeNull();
  });

  it("constructor throws on a live_ key without allowLive", () => {
    expect(() => new MolliePaymentProvider({ apiKey: "live_abc" })).toThrow(/live/i);
  });

  it("constructor accepts a test_ key and a live_ key with allowLive", () => {
    expect(() => new MolliePaymentProvider({ apiKey: "test_abc" })).not.toThrow();
    expect(
      () => new MolliePaymentProvider({ apiKey: "live_abc", allowLive: true })
    ).not.toThrow();
  });
});

describe("handleWebhook", () => {
  const secret = "whsec_test";
  const body = JSON.stringify({ id: "tr_1", status: "paid" });
  const formBody = "id=tr_1";

  it("accepts an unsigned classic webhook when no secret is configured", async () => {
    const { fetchImpl, calls } = stubFetch(() =>
      jsonResponse({ id: "tr_1", status: "paid", paidAt: "2026-01-01T00:00:00Z" })
    );
    const provider = makeAdapter(fetchImpl);
    const event = await provider.handleWebhook(formBody, undefined);
    expect(calls[0].url).toBe(`${BASE}/payments/tr_1`);
    expect(event?.type).toBe("payment.paid");
  });

  it("accepts an unsigned classic webhook when a secret IS configured", async () => {
    const { fetchImpl, calls } = stubFetch(() =>
      jsonResponse({ id: "tr_1", status: "paid", paidAt: "2026-01-01T00:00:00Z" })
    );
    const provider = makeAdapter(fetchImpl, secret);
    const event = await provider.handleWebhook(formBody, undefined);
    expect(calls[0].url).toBe(`${BASE}/payments/tr_1`);
    expect(event?.type).toBe("payment.paid");
  });

  it("parses a form-encoded classic webhook body", async () => {
    const { fetchImpl, calls } = stubFetch(() =>
      jsonResponse({ id: "tr_1", status: "paid", paidAt: "2026-01-01T00:00:00Z" })
    );
    const provider = makeAdapter(fetchImpl);
    const event = await provider.handleWebhook("id=tr_1", undefined);
    expect(calls[0].url).toBe(`${BASE}/payments/tr_1`);
    expect(event?.providerRef).toBe("tr_1");
  });

  it("rejects a signed webhook when no secret is configured", async () => {
    const { fetchImpl } = stubFetch();
    const provider = makeAdapter(fetchImpl);
    await expect(provider.handleWebhook(body, sign(body, secret))).resolves.toBeNull();
  });

  it("returns null when the signature is invalid", async () => {
    const { fetchImpl } = stubFetch();
    const provider = makeAdapter(fetchImpl, secret);
    await expect(provider.handleWebhook(body, sign(body, "wrong"))).resolves.toBeNull();
  });

  it("returns null on malformed JSON", async () => {
    const { fetchImpl } = stubFetch();
    const provider = makeAdapter(fetchImpl, secret);
    const malformed = "not-json";
    await expect(provider.handleWebhook(malformed, sign(malformed, secret))).resolves.toBeNull();
  });

  it("returns null when the body has no id", async () => {
    const { fetchImpl } = stubFetch();
    const provider = makeAdapter(fetchImpl, secret);
    await expect(provider.handleWebhook("status=paid", undefined)).resolves.toBeNull();
    await expect(
      provider.handleWebhook(JSON.stringify({ status: "paid" }), undefined)
    ).resolves.toBeNull();
  });

  it("uses entityId from a signed Next-gen event, not the event id", async () => {
    // Next-gen events carry the changed entity's reference in "entityId"; "id"
    // is the event id ("evt_...") and must never be treated as the payment id.
    const { fetchImpl, calls } = stubFetch(() =>
      jsonResponse({
        id: "tr_1",
        status: "paid",
        amount: { currency: "EUR", value: "42.05" },
        paidAt: "2026-01-01T00:00:00Z",
      })
    );
    const provider = makeAdapter(fetchImpl, secret);
    const nextGenBody = JSON.stringify({
      resource: "event",
      id: "evt_1",
      type: "payment.paid",
      entityId: "tr_1",
      createdAt: "2026-01-01T00:00:00Z",
    });

    const event = await provider.handleWebhook(nextGenBody, sign(nextGenBody, secret));

    expect(calls[0].url).toBe(`${BASE}/payments/tr_1`);
    expect(event?.providerRef).toBe("tr_1");
    expect(event?.type).toBe("payment.paid");
    expect(event?.idempotencyKey).toBe("mollie_tr_1");
  });

  it("verifies the signature, fetches authoritative state, and emits a normalized event", async () => {
    const { fetchImpl, calls } = stubFetch(() =>
      jsonResponse({
        id: "tr_1",
        status: "paid",
        amount: { currency: "EUR", value: "22.95" },
        paidAt: "2026-01-01T00:00:00Z",
      })
    );
    const provider = makeAdapter(fetchImpl, secret);

    const event = await provider.handleWebhook(body, sign(body, secret));

    expect(calls[0].url).toBe(`${BASE}/payments/tr_1`);
    expect(event).toEqual({
      type: "payment.paid",
      providerRef: "tr_1",
      amount: { amount: 22.95, currency: "EUR" },
      status: "paid",
      occurredAt: "2026-01-01T00:00:00Z",
      idempotencyKey: "mollie_tr_1",
    });
  });

  it("trusts the authoritative GET over the webhook body status", async () => {
    const { fetchImpl } = stubFetch(() =>
      jsonResponse({ id: "tr_1", status: "paid", paidAt: "2026-01-01T00:00:00Z" })
    );
    const provider = makeAdapter(fetchImpl, secret);
    const staleBody = JSON.stringify({ id: "tr_1", status: "open" });

    const event = await provider.handleWebhook(staleBody, sign(staleBody, secret));

    expect(event?.type).toBe("payment.paid");
    expect(event?.status).toBe("paid");
  });

  it("emits payment.cancelled for a canceled payment", async () => {
    const { fetchImpl } = stubFetch(() => jsonResponse({ id: "tr_1", status: "canceled" }));
    const provider = makeAdapter(fetchImpl);
    const event = await provider.handleWebhook("id=tr_1", undefined);
    expect(event?.type).toBe("payment.cancelled");
    expect(event?.status).toBe("cancelled");
  });

  it("emits payment.failed for a failed payment", async () => {
    const { fetchImpl } = stubFetch(() => jsonResponse({ id: "tr_1", status: "failed" }));
    const provider = makeAdapter(fetchImpl);
    const event = await provider.handleWebhook("id=tr_1", undefined);
    expect(event?.type).toBe("payment.failed");
    expect(event?.status).toBe("failed");
  });
});

describe("capabilities", () => {
  it("advertises the Mollie capability set", () => {
    expect(MOLLIE_CAPABILITIES).toEqual({
      authCapture: "automatic",
      refund: true,
      partialRefund: true,
      voidBeforeCapture: false,
      hostedRedirect: true,
      clientToken: false,
      offSession: false,
      webhooks: true,
      asyncSettlement: true,
      statusPolling: true,
      signatureHeader: "X-Mollie-Signature",
    });
    expect(MOLLIE_CAPABILITIES.defaultMethod).toBeUndefined();
  });
});