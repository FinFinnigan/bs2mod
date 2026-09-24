import Link from "next/link";

export const metadata = { title: "Access Denied · BoyShop Admin" };

// Shown when an authenticated non-admin role (staff, customer) reaches the
// admin surface. The (protected) layout redirects here before any admin
// content renders (§27 server-side authorization).
export default function AdminForbiddenPage() {
  return (
    <div className="container" style={{ paddingTop: "var(--space-12)" }}>
      <div
        className="card-surface"
        style={{ padding: "var(--space-4)", maxWidth: 480 }}
      >
        <h1>Access denied</h1>
        <p style={{ color: "var(--color-ink-muted)" }}>
          Your account does not have permission to use the admin area. The
          admin role is required.
        </p>
        <Link href="/" className="btn btn-primary">
          Back to the store
        </Link>
      </div>
    </div>
  );
}