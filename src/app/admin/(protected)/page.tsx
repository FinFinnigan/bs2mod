import Link from "next/link";
import { getAdminSession } from "../session";

export const metadata = { title: "Dashboard · BoyShop Admin" };

// Dashboard landing page at /admin (ADM-001). Cards link into the product and
// order management sections (ADM-002 / ADM-004).
export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  const email = session?.email ?? "Administrator";
  const role = session?.role ?? "admin";

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "var(--space-4)" }}>
      <h1>Dashboard</h1>
      <p style={{ color: "var(--color-ink-muted)" }}>
        Signed in as {email} ({role}).
      </p>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "var(--space-4)",
          marginTop: "var(--space-4)",
        }}
      >
        <Link
          href="/admin/products"
          className="card-surface"
          style={{
            padding: "var(--space-4)",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <strong>Product management</strong>
          <p style={{ margin: 0, color: "var(--color-ink-muted)" }}>
            Create, edit, archive and merchandise products.
          </p>
          <span style={{ color: "var(--color-primary)", fontWeight: 700 }}>
            Open products →
          </span>
        </Link>
        <Link
          href="/admin/orders"
          className="card-surface"
          style={{
            padding: "var(--space-4)",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <strong>Order management</strong>
          <p style={{ margin: 0, color: "var(--color-ink-muted)" }}>
            View, progress, cancel and refund orders per the order state machine.
          </p>
          <span style={{ color: "var(--color-primary)", fontWeight: 700 }}>
            Open orders →
          </span>
        </Link>
        <Link
          href="/admin/storefront"
          className="card-surface"
          style={{
            padding: "var(--space-4)",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <strong>Storefront</strong>
          <p style={{ margin: 0, color: "var(--color-ink-muted)" }}>
            Switch between the live storefront templates (Miski / Vanilla).
          </p>
          <span style={{ color: "var(--color-primary)", fontWeight: 700 }}>
            Open storefront →
          </span>
        </Link>
      </section>
    </div>
  );
}