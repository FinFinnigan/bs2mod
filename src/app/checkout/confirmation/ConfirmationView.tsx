"use client";

// Order confirmation view — reads the opaque orderToken from the URL and asks the
// storefront API for the order's REAL, freshly-reconciled status. It never renders
// a success state of its own accord: every state below maps 1:1 to data returned by
// GET /api/orders/{token} (or to a documented failure of that request).

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Money } from "@/lib/types";
import { formatMoney } from "@/lib/currency";
import { Icon } from "@/components/ui/icons";

// ---- View model -----------------------------------------------------------
// Deliberately local + backend-agnostic: we validate the JSON payload at the
// boundary instead of importing backend types, so the UI stays decoupled from
// whichever commerce backend is wired up later.

interface OrderItemView {
  variantId: string;
  name: string;
  size?: string;
  colour?: string;
  quantity: number;
  lineTotal: Money;
}

interface OrderView {
  id: string;
  status: string;
  total: Money;
  subtotal: Money;
  shippingAmount: Money;
  items: OrderItemView[];
  email?: string;
  createdAt?: string;
}

type FetchState =
  | { kind: "loading" }
  | { kind: "loaded"; order: OrderView }
  | { kind: "missing-token" }
  | { kind: "not-found" }
  | { kind: "forbidden" }
  | { kind: "error" };

// ---- Payload parsing ------------------------------------------------------

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseMoney(value: unknown): Money | null {
  if (!isRecord(value)) return null;
  const { amount, currency } = value;
  if (typeof amount !== "number" || !Number.isFinite(amount)) return null;
  return { amount, currency: typeof currency === "string" ? currency : "EUR" };
}

function parseItem(value: unknown): OrderItemView | null {
  if (!isRecord(value)) return null;
  const { name, quantity, lineTotal } = value;
  const money = parseMoney(lineTotal);
  if (typeof name !== "string" || typeof quantity !== "number" || !money) return null;
  return {
    variantId: typeof value.variantId === "string" ? value.variantId : name,
    name,
    quantity,
    lineTotal: money,
    size: typeof value.size === "string" ? value.size : undefined,
    colour: typeof value.colour === "string" ? value.colour : undefined,
  };
}

function parseOrder(payload: unknown): OrderView | null {
  if (!isRecord(payload) || !isRecord(payload.order)) return null;
  const raw = payload.order;
  const total = parseMoney(raw.total);
  if (typeof raw.id !== "string" || typeof raw.status !== "string" || !total) return null;

  const items = Array.isArray(raw.items)
    ? raw.items.map(parseItem).filter((item): item is OrderItemView => item !== null)
    : [];

  return {
    id: raw.id,
    status: raw.status,
    total,
    subtotal: parseMoney(raw.subtotal) ?? total,
    shippingAmount: parseMoney(raw.shippingAmount) ?? { amount: 0, currency: total.currency },
    items,
    email: typeof raw.email === "string" && raw.email.length > 0 ? raw.email : undefined,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : undefined,
  };
}

// ---- Status presentation --------------------------------------------------
// Honest mapping of the order state machine. `placed` (and `draft`) mean the
// payment session exists but has NOT settled — async methods such as bank
// transfer legitimately sit here — so they get "pending" copy, never "confirmed".

type Tone = "positive" | "pending" | "negative" | "neutral";

interface Presentation {
  tone: Tone;
  eyebrow: string;
  title: string;
  body: string;
  live: string;
}

function presentOrder(status: string): Presentation {
  switch (status) {
    case "confirmed":
      return {
        tone: "positive",
        eyebrow: "Payment received",
        title: "Your order is confirmed",
        body: "Thank you! We've received your payment and started preparing your order. We'll email you the moment it's on its way.",
        live: "Order confirmed. Payment received.",
      };
    case "fulfilled":
      return {
        tone: "positive",
        eyebrow: "On its way",
        title: "Your order is complete",
        body: "This order has been fulfilled and sent out. If you haven't seen tracking details yet, check your inbox.",
        live: "Order fulfilled.",
      };
    case "placed":
      return {
        tone: "pending",
        eyebrow: "Payment pending",
        title: "We're waiting on your payment",
        body: "Your order is placed and reserved, but your payment hasn't settled yet. We'll confirm it and email you as soon as it does — there's no need to order again.",
        live: "Payment pending. Order placed.",
      };
    case "draft":
      return {
        tone: "pending",
        eyebrow: "Order in progress",
        title: "Your order is being set up",
        body: "We've created your order but haven't recorded a completed payment yet. This page will update once your payment is confirmed.",
        live: "Order is being set up. Payment not yet recorded.",
      };
    case "cancelled":
      return {
        tone: "negative",
        eyebrow: "Order cancelled",
        title: "This order was cancelled",
        body: "This order was cancelled and no payment is due. If that doesn't look right, please get in touch with us.",
        live: "Order cancelled.",
      };
    case "failed":
      return {
        tone: "negative",
        eyebrow: "Payment unsuccessful",
        title: "Your payment didn't go through",
        body: "We couldn't complete the payment for this order, so it wasn't confirmed. Nothing will be shipped and you haven't been charged.",
        live: "Payment failed. Order not confirmed.",
      };
    default:
      // Unknown status: never imply success. Show the raw value truthfully.
      return {
        tone: "neutral",
        eyebrow: "Order status",
        title: "We couldn't confirm this order's status",
        body: `This order is currently marked "${status}". Refresh the page to check again, or contact us if you need a hand.`,
        live: "Order status could not be determined.",
      };
  }
}

// ---- Small presentational helpers ----------------------------------------

function toneColor(tone: Tone): string {
  switch (tone) {
    case "positive":
      return "var(--color-ok)";
    case "pending":
      return "var(--color-warn)";
    case "negative":
      return "var(--color-error)";
    default:
      return "var(--color-ink-muted)";
  }
}

function StatusIcon({ tone }: { tone: Tone }) {
  switch (tone) {
    case "positive":
      return (
        <Icon size={32} strokeWidth={2.4}>
          <path d="M20 6 9 17l-5-5" />
        </Icon>
      );
    case "pending":
      return (
        <Icon size={32} strokeWidth={2.2}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </Icon>
      );
    case "negative":
      return (
        <Icon size={32} strokeWidth={2.2}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5" />
          <path d="M12 16h.01" />
        </Icon>
      );
    default:
      return (
        <Icon size={32} strokeWidth={2.2}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 16v-5" />
          <path d="M12 8h.01" />
        </Icon>
      );
  }
}

function StatusBadge({ tone }: { tone: Tone }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: 64,
        height: 64,
        borderRadius: "50%",
        background: toneColor(tone),
        color: "var(--color-ink-on-dark)",
        display: "grid",
        placeItems: "center",
      }}
    >
      <StatusIcon tone={tone} />
    </span>
  );
}

function formatPlacedAt(iso?: string): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("en-IE", { dateStyle: "medium", timeStyle: "short" });
}

function variantText(item: OrderItemView): string {
  return [item.size, item.colour].filter(Boolean).join(" · ");
}

// ---- Notice (honest non-success states) -----------------------------------

function Notice({
  tone,
  title,
  body,
  children,
}: {
  tone: Tone;
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        maxWidth: 640,
        margin: "0 auto",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        padding: "var(--space-12) var(--space-4)",
      }}
    >
      <StatusBadge tone={tone} />
      <h1 style={{ maxWidth: 480 }}>{title}</h1>
      <p style={{ color: "var(--color-ink-muted)", margin: 0, maxWidth: 440 }}>{body}</p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>{children}</div>
      <span role="status" aria-live="polite" className="visually-hidden">
        {title}
      </span>
    </section>
  );
}

// ---- Loaded order ---------------------------------------------------------

function OrderDetails({ order }: { order: OrderView }) {
  const placedAt = formatPlacedAt(order.createdAt);
  const freeShipping = order.shippingAmount.amount === 0;

  return (
    <section
      aria-label="Order details"
      className="card-surface"
      style={{ padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: 12, marginTop: "var(--space-6)", textAlign: "left" }}
    >
      <h2 style={{ fontSize: "var(--fs-h3)" }}>Order details</h2>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <span style={{ color: "var(--color-ink-muted)" }}>Order reference</span>
        <span className="tabular" style={{ fontWeight: 700, textAlign: "right", wordBreak: "break-all" }}>
          {order.id}
        </span>
      </div>
      {placedAt && (
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <span style={{ color: "var(--color-ink-muted)" }}>Placed</span>
          <span className="tabular">{placedAt}</span>
        </div>
      )}
      {order.email && (
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <span style={{ color: "var(--color-ink-muted)" }}>Email</span>
          <span style={{ wordBreak: "break-all", textAlign: "right" }}>{order.email}</span>
        </div>
      )}

      {order.items.length > 0 && (
        <ul style={{ display: "flex", flexDirection: "column", gap: 8, borderTop: "1px solid var(--color-border)", paddingTop: 12 }}>
          {order.items.map((item, index) => {
            const meta = variantText(item);
            return (
              <li key={`${item.variantId}-${index}`} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <span style={{ color: "var(--color-ink-muted)" }}>
                  {item.name}
                  {meta ? ` · ${meta}` : ""} × {item.quantity}
                </span>
                <span className="tabular">{formatMoney(item.lineTotal)}</span>
              </li>
            );
          })}
        </ul>
      )}

      <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Subtotal</span>
          <span className="tabular">{formatMoney(order.subtotal)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Shipping</span>
          <span className="tabular">{freeShipping ? "Free" : formatMoney(order.shippingAmount)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "var(--fs-body-lg)" }}>
          <span>Total</span>
          <span className="tabular">{formatMoney(order.total)}</span>
        </div>
      </div>
    </section>
  );
}

// ---- Main view ------------------------------------------------------------

export function ConfirmationView() {
  const searchParams = useSearchParams();
  const orderToken = searchParams.get("orderToken");
  const [state, setState] = useState<FetchState>({ kind: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!orderToken) {
      setState({ kind: "missing-token" });
      return;
    }

    const controller = new AbortController();
    let active = true;
    setState({ kind: "loading" });

    (async () => {
      try {
        const response = await fetch(`/api/orders/${encodeURIComponent(orderToken)}`, {
          cache: "no-store",
          signal: controller.signal,
          headers: { accept: "application/json" },
        });
        if (!active) return;

        if (response.status === 404) {
          setState({ kind: "not-found" });
          return;
        }
        if (response.status === 401 || response.status === 403) {
          setState({ kind: "forbidden" });
          return;
        }
        if (!response.ok) {
          setState({ kind: "error" });
          return;
        }

        const payload: unknown = await response.json();
        const order = parseOrder(payload);
        if (!order) {
          setState({ kind: "error" });
          return;
        }
        setState({ kind: "loaded", order });
      } catch (err) {
        // An aborted request is not an error worth surfacing.
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (!active) return;
        setState({ kind: "error" });
      }
    })();

    return () => {
      active = false;
      controller.abort();
    };
  }, [orderToken, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  if (state.kind === "loading") {
    return <ConfirmationLoading />;
  }

  if (state.kind === "missing-token") {
    return (
      <Notice
        tone="negative"
        title="We couldn't find your order"
        body="This page needs an order reference, and none was provided. If you've just placed an order, open the link from your confirmation email — or head back to checkout."
      >
        <Link href="/checkout" className="btn btn-primary">
          Back to checkout
        </Link>
        <Link href="/shop" className="btn btn-secondary">
          Continue shopping
        </Link>
      </Notice>
    );
  }

  if (state.kind === "not-found") {
    return (
      <Notice
        tone="negative"
        title="That order reference doesn't match anything"
        body="The link may be incomplete, or the order reference may have expired. Check the link in your confirmation email, or start again from checkout."
      >
        <Link href="/checkout" className="btn btn-primary">
          Back to checkout
        </Link>
        <button type="button" className="btn btn-secondary" onClick={retry}>
          Try again
        </button>
      </Notice>
    );
  }

  if (state.kind === "forbidden") {
    return (
      <Notice
        tone="negative"
        title="We couldn't open this order"
        body="This order is linked to an account. Sign in with the account you used at checkout to see its details."
      >
        <Link href="/account" className="btn btn-primary">
          Log in
        </Link>
        <Link href="/checkout" className="btn btn-secondary">
          Back to checkout
        </Link>
      </Notice>
    );
  }

  if (state.kind === "error") {
    return (
      <Notice
        tone="negative"
        title="We couldn't load your order"
        body="Something went wrong while loading this order's latest status. Your order is safe — please try again in a moment."
      >
        <button type="button" className="btn btn-primary" onClick={retry}>
          Retry
        </button>
        <Link href="/checkout" className="btn btn-secondary">
          Back to checkout
        </Link>
      </Notice>
    );
  }

  const { order } = state;
  const presentation = presentOrder(order.status);

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <section
        style={{
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          paddingTop: "var(--space-6)",
        }}
      >
        <StatusBadge tone={presentation.tone} />
        <p className="eyebrow" style={{ margin: 0 }}>
          {presentation.eyebrow}
        </p>
        <h1 style={{ maxWidth: 520 }}>{presentation.title}</h1>
        <p style={{ color: "var(--color-ink-muted)", margin: 0, maxWidth: 480 }}>{presentation.body}</p>
      </section>

      <OrderDetails order={order} />

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: "var(--space-6)" }}>
        <Link href="/shop" className="btn btn-primary btn-block">
          Continue shopping
        </Link>
        <Link href="/" className="btn btn-ghost btn-block">
          Back to home
        </Link>
      </div>

      <span role="status" aria-live="polite" className="visually-hidden">
        {presentation.live}
      </span>
    </div>
  );
}

export function ConfirmationLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      style={{ maxWidth: 640, margin: "0 auto", paddingTop: "var(--space-6)" }}
    >
      <h1 className="visually-hidden">Loading your order</h1>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <span className="skeleton" style={{ width: 64, height: 64, borderRadius: "50%" }} aria-hidden="true" />
        <span className="skeleton" style={{ width: 140, height: 12 }} aria-hidden="true" />
        <span className="skeleton" style={{ width: 280, height: 26 }} aria-hidden="true" />
        <span className="skeleton" style={{ width: 320, height: 14 }} aria-hidden="true" />
      </div>
      <div className="skeleton" style={{ height: 220, marginTop: "var(--space-6)" }} aria-hidden="true" />
      <span className="visually-hidden">Loading your order details…</span>
    </div>
  );
}
