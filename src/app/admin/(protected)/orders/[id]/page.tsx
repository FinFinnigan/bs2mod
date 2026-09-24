import { notFound } from "next/navigation";
import { hasDatabase } from "@/lib/backend/db/client";
import { getApp } from "@/lib/backend/container";
import {
  AdminOrdersService,
  AdminOrderNotFoundError,
} from "@/lib/backend/services/admin-orders";
import { formatMoney } from "@/lib/currency";
import { AdminUnavailable } from "../../admin-unavailable";
import { OrdersActions } from "../../orders/orders-actions";
import { StatusChip } from "../../orders/status-chip";

export const dynamic = "force-dynamic";
export const metadata = { title: "Order · BoyShop Admin" };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-IE", { dateStyle: "medium", timeStyle: "short" });
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!hasDatabase()) return <AdminUnavailable />;
  const app = getApp();
  if (!app.ordersService) return <AdminUnavailable />;
  const service = new AdminOrdersService({
    orderRepo: app.orders,
    ordersService: app.ordersService,
    payments: app.payments,
  });

  let detail;
  try {
    detail = await service.get(id);
  } catch (err) {
    if (err instanceof AdminOrderNotFoundError) notFound();
    throw err;
  }

  const { order, transitions, payments, addresses } = detail;
  const shipping = addresses.find((a) => a.kind === "shipping");
  const billing = addresses.find((a) => a.kind === "billing");

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "var(--space-4)" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-3)",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
          <h1 style={{ margin: 0 }}>Order {order.id}</h1>
          <StatusChip status={order.status} />
        </div>
        <OrdersActions orderId={order.id} status={order.status} />
      </div>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "var(--space-4)",
          marginTop: "var(--space-4)",
        }}
      >
        <div className="card-surface" style={{ padding: "var(--space-4)" }}>
          <h2 style={{ fontSize: "var(--fs-h3)", marginTop: 0 }}>Customer</h2>
          <p style={{ margin: 0, color: "var(--color-ink-muted)" }}>
            {order.email ?? "Guest order"}
          </p>
          <p style={{ margin: "var(--space-2) 0 0", color: "var(--color-ink-muted)" }}>
            Placed {formatDate(order.createdAt)}
          </p>
        </div>

        {shipping && (
          <div className="card-surface" style={{ padding: "var(--space-4)" }}>
            <h2 style={{ fontSize: "var(--fs-h3)", marginTop: 0 }}>Shipping address</h2>
            <p style={{ margin: 0 }}>{shipping.fullName}</p>
            <p style={{ margin: 0 }}>{shipping.line1}</p>
            {shipping.line2 && <p style={{ margin: 0 }}>{shipping.line2}</p>}
            <p style={{ margin: 0 }}>
              {shipping.city}, {shipping.postcode}
            </p>
            <p style={{ margin: 0 }}>{shipping.country}</p>
          </div>
        )}

        {billing && (
          <div className="card-surface" style={{ padding: "var(--space-4)" }}>
            <h2 style={{ fontSize: "var(--fs-h3)", marginTop: 0 }}>Billing address</h2>
            <p style={{ margin: 0 }}>{billing.fullName}</p>
            <p style={{ margin: 0 }}>{billing.line1}</p>
            {billing.line2 && <p style={{ margin: 0 }}>{billing.line2}</p>}
            <p style={{ margin: 0 }}>
              {billing.city}, {billing.postcode}
            </p>
            <p style={{ margin: 0 }}>{billing.country}</p>
          </div>
        )}
      </section>

      <section className="card-surface" style={{ marginTop: "var(--space-4)", overflowX: "auto" }}>
        <div style={{ padding: "var(--space-4) var(--space-4) 0" }}>
          <h2 style={{ fontSize: "var(--fs-h3)", marginTop: 0 }}>Items</h2>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
          <thead>
            <tr style={{ textAlign: "left", color: "var(--color-ink-muted)", fontSize: "var(--fs-caption)" }}>
              <th style={{ padding: "var(--space-3)" }}>Item</th>
              <th style={{ padding: "var(--space-3)" }}>Variant</th>
              <th style={{ padding: "var(--space-3)" }}>Qty</th>
              <th style={{ padding: "var(--space-3)" }}>Unit price</th>
              <th style={{ padding: "var(--space-3)" }}>Line total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.variantId} style={{ borderTop: "1px solid var(--color-border)" }}>
                <td style={{ padding: "var(--space-3)" }}>{item.name}</td>
                <td style={{ padding: "var(--space-3)" }}>
                  {[item.size, item.colour].filter(Boolean).join(" · ") || "—"}
                </td>
                <td style={{ padding: "var(--space-3)" }} className="tabular">
                  {item.quantity}
                </td>
                <td style={{ padding: "var(--space-3)" }} className="tabular">
                  {formatMoney(item.unitPrice)}
                </td>
                <td style={{ padding: "var(--space-3)" }} className="tabular">
                  {formatMoney(item.lineTotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div
          style={{
            padding: "var(--space-3) var(--space-4)",
            borderTop: "1px solid var(--color-border)",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 4,
          }}
        >
          <p style={{ margin: 0, color: "var(--color-ink-muted)" }}>
            Subtotal {formatMoney(order.subtotal)}
          </p>
          <p style={{ margin: 0, color: "var(--color-ink-muted)" }}>
            Shipping {formatMoney(order.shippingAmount)}
          </p>
          <p style={{ margin: 0, fontWeight: 700 }}>Total {formatMoney(order.total)}</p>
        </div>
      </section>

      <section className="card-surface" style={{ marginTop: "var(--space-4)", overflowX: "auto" }}>
        <div style={{ padding: "var(--space-4) var(--space-4) 0" }}>
          <h2 style={{ fontSize: "var(--fs-h3)", marginTop: 0 }}>Payments</h2>
        </div>
        {payments.length === 0 ? (
          <p style={{ margin: 0, padding: "var(--space-4)", color: "var(--color-ink-muted)" }}>
            No payment records for this order.
          </p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--color-ink-muted)", fontSize: "var(--fs-caption)" }}>
                <th style={{ padding: "var(--space-3)" }}>Payment</th>
                <th style={{ padding: "var(--space-3)" }}>Provider</th>
                <th style={{ padding: "var(--space-3)" }}>Status</th>
                <th style={{ padding: "var(--space-3)" }}>Amount</th>
                <th style={{ padding: "var(--space-3)" }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} style={{ borderTop: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "var(--space-3)" }}>{p.id}</td>
                  <td style={{ padding: "var(--space-3)" }}>{p.providerId}</td>
                  <td style={{ padding: "var(--space-3)" }}>{p.status}</td>
                  <td style={{ padding: "var(--space-3)" }} className="tabular">
                    {formatMoney(p.amount)}
                  </td>
                  <td style={{ padding: "var(--space-3)" }} className="tabular">
                    {formatDate(p.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="card-surface" style={{ marginTop: "var(--space-4)", padding: "var(--space-4)" }}>
        <h2 style={{ fontSize: "var(--fs-h3)", marginTop: 0 }}>Timeline</h2>
        {transitions.length === 0 ? (
          <p style={{ margin: 0, color: "var(--color-ink-muted)" }}>
            No status changes recorded yet.
          </p>
        ) : (
          <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            {transitions.map((t) => (
              <li key={t.id} style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-3)", flexWrap: "wrap" }}>
                <span>
                  <span className="chip">{t.fromState}</span>
                  <span style={{ margin: "0 8px", color: "var(--color-ink-muted)" }}>→</span>
                  <span className="chip">{t.toState}</span>
                </span>
                <span style={{ color: "var(--color-ink-muted)", fontSize: "var(--fs-caption)" }}>
                  {formatDate(t.occurredAt)}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}