import Link from "next/link";
import { hasDatabase } from "@/lib/backend/db/client";
import { getApp } from "@/lib/backend/container";
import { AdminOrdersService } from "@/lib/backend/services/admin-orders";
import type { OrderStatus } from "@/lib/backend/repositories/interfaces";
import { formatMoney } from "@/lib/currency";
import { AdminUnavailable } from "../admin-unavailable";
import { OrdersFilter } from "./orders-filter";
import { StatusChip } from "./status-chip";

export const dynamic = "force-dynamic";
export const metadata = { title: "Orders · BoyShop Admin" };

const VALID_STATUSES: readonly string[] = [
  "draft",
  "placed",
  "confirmed",
  "fulfilled",
  "cancelled",
  "failed",
  "refunded",
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const statusFilter = VALID_STATUSES.includes(status ?? "")
    ? (status as OrderStatus)
    : undefined;

  if (!hasDatabase()) return <AdminUnavailable />;
  const app = getApp();
  if (!app.ordersService) return <AdminUnavailable />;
  const service = new AdminOrdersService({
    orderRepo: app.orders,
    ordersService: app.ordersService,
    payments: app.payments,
  });
  const { rows, total } = await service.list({ status: statusFilter, limit: 100, offset: 0 });

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
        <div>
          <h1>Orders</h1>
          <p style={{ margin: 0, color: "var(--color-ink-muted)" }}>
            {total} order{total === 1 ? "" : "s"}
            {statusFilter ? ` in “${statusFilter}”` : ""}.
          </p>
        </div>
        <OrdersFilter current={statusFilter} />
      </div>

      {rows.length === 0 ? (
        <div className="card-surface" style={{ marginTop: "var(--space-4)", padding: "var(--space-6)" }}>
          <p style={{ margin: 0, color: "var(--color-ink-muted)" }}>
            No orders{statusFilter ? ` with status “${statusFilter}”` : ""} yet.
          </p>
        </div>
      ) : (
        <div className="card-surface" style={{ marginTop: "var(--space-4)", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--color-ink-muted)", fontSize: "var(--fs-caption)" }}>
                <th style={{ padding: "var(--space-3)" }}>Order</th>
                <th style={{ padding: "var(--space-3)" }}>Customer</th>
                <th style={{ padding: "var(--space-3)" }}>Status</th>
                <th style={{ padding: "var(--space-3)" }}>Total</th>
                <th style={{ padding: "var(--space-3)" }}>Placed</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id} style={{ borderTop: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "var(--space-3)" }}>
                    <Link
                      href={`/admin/orders/${o.id}`}
                      style={{ color: "var(--color-primary)", fontWeight: 700, textDecoration: "none" }}
                    >
                      {o.id}
                    </Link>
                  </td>
                  <td style={{ padding: "var(--space-3)" }}>{o.email ?? "Guest"}</td>
                  <td style={{ padding: "var(--space-3)" }}>
                    <StatusChip status={o.status} />
                  </td>
                  <td style={{ padding: "var(--space-3)" }} className="tabular">
                    {formatMoney(o.total)}
                  </td>
                  <td style={{ padding: "var(--space-3)" }} className="tabular">
                    {new Date(o.createdAt).toLocaleString("en-IE", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}