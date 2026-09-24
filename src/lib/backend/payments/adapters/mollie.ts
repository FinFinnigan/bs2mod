// Mollie payment adapter — fetch-based, no SDK dependency.
//
// Provider-specific everything lives HERE and nowhere else: the Mollie REST API
// paths, Mollie status names, amount formatting, and the webhook signature check.
// The rest of the app never sees a Mollie type (ARCHITECTURE.md §11).
//
// It is NOT activated unless configuration supplies a Mollie API key, and it is
// test-mode only until the CEO separately authorizes live credentials.

import { createHmac, timingSafeEqual } from "node:crypto";
import type { PaymentProvider } from "../provider";
import type { PaymentCapabilities } from "../capabilities";
import type {
  PaymentEvent,
  PaymentInitiation,
  PaymentResult,
  PaymentSession,
  Money,
  PaymentStatus,
} from "../types";

export interface MollieAdapterConfig {
  apiKey: string;
  webhookSecret?: string;
  /** Allow a live_* key. Defaults to false — live payments are fail-closed until separately authorized. */
  allowLive?: boolean;
  /** Overridable for tests; defaults to the Mollie v2 API root. */
  baseUrl?: string;
  /** Injectable fetch for tests; defaults to the global fetch. */
  fetchImpl?: typeof fetch;
}

export const MOLLIE_CAPABILITIES: PaymentCapabilities = {
  authCapture: "automatic",
  refund: true,
  partialRefund: true,
  voidBeforeCapture: false,
  hostedRedirect: true, // Mollie Checkout hosts the payment page
  clientToken: false,
  offSession: false,
  webhooks: true,
  asyncSettlement: true, // e.g. bank transfer settles asynchronously
  statusPolling: true,
  signatureHeader: "X-Mollie-Signature",
};

// Mollie's own status names, mapped into OUR neutral PaymentStatus. This is the
// only place Mollie status vocabulary is allowed to appear.
export const MOLLIE_TO_STATUS: Record<string, PaymentStatus> = {
  open: "action_required",
  pending: "action_required",
  authorized: "authorized",
  paid: "paid",
  canceled: "cancelled",
  expired: "expired",
  failed: "failed",
  refunded: "refunded",
  partially_refunded: "partially_refunded",
};

// Mollie status -> provider-agnostic event type (PaymentEventType).
export const MOLLIE_STATUS_TO_EVENT: Record<string, string> = {
  open: "payment.action_required",
  pending: "payment.action_required",
  authorized: "payment.authorized",
  paid: "payment.paid",
  canceled: "payment.cancelled",
  expired: "payment.expired",
  failed: "payment.failed",
  refunded: "payment.refunded",
  partially_refunded: "payment.partially_refunded",
};

// --- Amount helpers -----------------------------------------------------------

// Mollie amounts are decimal strings with two digits after the point ("22.95").
// We round via Math.round on minor units (cents) to avoid float drift, then
// format the integer minor value as a string — no toFixed.
export function moneyToMollieAmount(m: Money): { currency: string; value: string } {
  return { currency: m.currency, value: formatMinor(Math.round(m.amount * 100)) };
}

function formatMinor(minor: number): string {
  const sign = minor < 0 ? "-" : "";
  const abs = Math.abs(minor);
  const whole = Math.floor(abs / 100);
  const frac = String(abs % 100).padStart(2, "0");
  return `${sign}${whole}.${frac}`;
}

export function mollieAmountToMoney(value: string, currency = "EUR"): Money {
  return { amount: Math.round(parseFloat(value) * 100) / 100, currency };
}

// Parse a Mollie decimal string into integer minor units ("22.95" -> 2295).
function minorFromString(value: string): number {
  const [whole = "0", frac = "0"] = value.split(".");
  return parseInt(whole, 10) * 100 + parseInt(frac.padEnd(2, "0").slice(0, 2), 10);
}

// --- Signature verification ---------------------------------------------------

// Mollie's Next-gen webhooks sign the raw body with HMAC-SHA256, delivered in
// the "X-Mollie-Signature" header as "sha256=<hex>". Classic webhooks carry no
// signature at all (the authenticated GET is the security control), so this
// check is only applied when a signature is actually present. Compare in
// constant time.
export function verifyMollieSignature(
  rawBody: string | Buffer,
  signature: string | undefined,
  secret: string | undefined
): boolean {
  if (!secret || !signature) return false;
  // Mollie prefixes the digest with "sha256="; accept both that form and a
  // bare hex digest for robustness.
  const value = signature.startsWith("sha256=") ? signature.slice("sha256=".length) : signature;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(value, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

// --- REST shapes (adapter-internal only) --------------------------------------

interface MollieAmount {
  currency?: string;
  value?: string;
  refunded?: MollieAmount;
}

interface MolliePayment {
  id?: string;
  status?: string;
  method?: string;
  amount?: MollieAmount;
  createdAt?: string;
  paidAt?: string;
  _links?: { checkout?: { href?: string } };
}

// --- Adapter ------------------------------------------------------------------

// Fail-closed key guard: only test_* keys are usable out of the box. A live_* key
// requires explicit opt-in (allowLive) so live payment processing can never be
// enabled by accident. Returns a human-readable issue, or null when the key is OK.
export function mollieKeyIssue(apiKey: string, allowLive = false): string | null {
  if (apiKey.startsWith("test_")) return null;
  if (apiKey.startsWith("live_")) {
    return allowLive
      ? null
      : "Mollie API key has a live_* prefix but live mode is not authorized (MOLLIE_ALLOW_LIVE=true)";
  }
  return "Mollie API key must start with test_ or live_";
}

export class MolliePaymentProvider implements PaymentProvider {
  readonly id = "mollie";
  readonly capabilities = MOLLIE_CAPABILITIES;

  private readonly apiKey: string;
  private readonly webhookSecret?: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(config: MollieAdapterConfig) {
    // Fail closed: refuse to construct from an unusable key (test_* only unless
    // live mode is explicitly authorized). Bootstrap pre-checks too, so a bad key
    // degrades to a skipped registration instead of a runtime crash.
    const issue = mollieKeyIssue(config.apiKey, config.allowLive);
    if (issue) throw new Error(issue);
    this.apiKey = config.apiKey;
    this.webhookSecret = config.webhookSecret;
    this.baseUrl = config.baseUrl ?? "https://api.mollie.com/v2";
    this.fetchImpl = config.fetchImpl ?? fetch;
  }

  async createSession(init: PaymentInitiation): Promise<PaymentSession> {
    const body: Record<string, unknown> = {
      amount: moneyToMollieAmount(init.amount),
      description: `Order ${init.orderId}`,
      redirectUrl: init.returnUrl,
    };
    if (init.method) body.method = init.method;

    const payment = await this.request<MolliePayment>("/payments", {
      method: "POST",
      body,
    });

    if (!payment.id || !payment._links?.checkout?.href) {
      throw new Error("Mollie createSession: response missing id or checkout URL");
    }

    return {
      kind: "redirect",
      url: payment._links.checkout.href,
      providerRef: payment.id,
      providerId: this.id,
    };
  }

  async getStatus(providerRef: string): Promise<PaymentResult> {
    const payment = await this.request<MolliePayment>(
      `/payments/${encodeURIComponent(providerRef)}`
    );
    const status = mapMollieStatus(payment.status ?? "");
    if (!status) throw new Error(`Mollie getStatus: unknown status "${payment.status}"`);
    return { status, providerRef: payment.id ?? providerRef };
  }

  async refund(providerRef: string, amount?: Money): Promise<PaymentResult> {
    const body = amount ? { amount: moneyToMollieAmount(amount) } : undefined;
    await this.request(`/payments/${encodeURIComponent(providerRef)}/refunds`, {
      method: "POST",
      body,
    });

    // Authoritative state: compare refunded vs original amount on the payment.
    const payment = await this.request<MolliePayment>(
      `/payments/${encodeURIComponent(providerRef)}`
    );
    const refunded = minorFromString(payment.amount?.refunded?.value ?? "0");
    const total = minorFromString(payment.amount?.value ?? "0");
    const status: PaymentStatus = refunded < total ? "partially_refunded" : "refunded";
    return { status, providerRef: payment.id ?? providerRef };
  }

  async handleWebhook(raw: unknown, signature: unknown): Promise<PaymentEvent | null> {
    if (typeof raw !== "string" && !Buffer.isBuffer(raw)) return null;
    // Classic Mollie webhooks carry no signature header — the authenticated GET
    // below is the security control. A signature is verified only when present,
    // and a signed request we cannot verify is rejected (never accepted).
    if (typeof signature === "string") {
      if (!this.webhookSecret) return null;
      if (!verifyMollieSignature(raw, signature, this.webhookSecret)) return null;
    }

    const body = parseWebhookBody(raw);
    if (!body?.id) return null;

    // Never trust the webhook body status alone — fetch the authoritative state.
    const payment = await this.request<MolliePayment>(
      `/payments/${encodeURIComponent(body.id)}`
    );
    const status = mapMollieStatus(payment.status ?? "");
    const type = mapMollieStatusToEvent(payment.status ?? "");
    if (!status || !type) return null;

    return {
      type,
      providerRef: payment.id ?? body.id,
      amount:
        payment.amount?.value !== undefined
          ? mollieAmountToMoney(payment.amount.value, payment.amount.currency)
          : undefined,
      status,
      occurredAt: payment.paidAt ?? payment.createdAt ?? new Date().toISOString(),
      idempotencyKey: `mollie_${payment.id ?? body.id}`,
    };
  }

  private async request<T>(
    path: string,
    opts?: { method?: string; body?: unknown }
  ): Promise<T> {
    const headers: Record<string, string> = { Authorization: `Bearer ${this.apiKey}` };
    let body: string | undefined;
    if (opts?.body !== undefined) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(opts.body);
    }

    let res: Response;
    try {
      res = await this.fetchImpl(`${this.baseUrl}${path}`, {
        method: opts?.method ?? "GET",
        headers,
        body,
      });
    } catch (err) {
      throw new Error(`Mollie request failed: ${(err as Error).message}`);
    }
    if (!res.ok) {
      throw new Error(`Mollie request failed: ${res.status} ${res.statusText}`);
    }
    return parseJson<T>(res);
  }
}

function mapMollieStatus(status: string): PaymentStatus | null {
  return MOLLIE_TO_STATUS[status] ?? null;
}

function mapMollieStatusToEvent(status: string): string | null {
  return MOLLIE_STATUS_TO_EVENT[status] ?? null;
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Mollie request failed: invalid JSON response");
  }
}

function parseWebhookBody(raw: string | Buffer): { id?: string } | null {
  const text = raw.toString();
  // Classic Mollie webhooks POST a form-encoded body with a single "id" field
  // (e.g. "id=tr_abc123"). Next-gen webhooks POST JSON events whose "id" is the
  // event id ("evt_...") and whose changed-entity reference lives in "entityId"
  // ("tr_..." for payment events). Accept all three shapes.
  const formMatch = /(?:^|&)id=([^&]+)/.exec(text);
  if (formMatch) {
    return { id: decodeURIComponent(formMatch[1]) };
  }
  try {
    const parsed: unknown = JSON.parse(text);
    if (typeof parsed !== "object" || parsed === null) return null;
    const record = parsed as Record<string, unknown>;
    // Next-gen event: the entity reference is entityId, not the event id.
    if (typeof record.entityId === "string" && record.entityId) {
      return { id: record.entityId };
    }
    return typeof record.id === "string" ? { id: record.id } : null;
  } catch {
    return null;
  }
}