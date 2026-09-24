"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/storefront", label: "Storefront" },
];

export function AdminHeader({ email, role }: { email: string; role: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  function isActive(href: string): boolean {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  async function signOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Best-effort logout: on network failure we still leave the admin area
      // rather than trap the user on a page they can no longer use.
    }
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <header
      style={{
        borderBottom: "1px solid var(--color-border)",
        padding: "var(--space-3) var(--space-4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "var(--space-3)",
        flexWrap: "wrap",
      }}
    >
      <strong>BoyShop Admin</strong>
      <nav style={{ display: "flex", gap: "var(--space-1)", flexWrap: "wrap" }}>
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              padding: "8px 14px",
              borderRadius: "var(--radius-pill)",
              fontSize: "var(--fs-body)",
              fontWeight: 700,
              textDecoration: "none",
              color: isActive(item.href) ? "var(--color-primary)" : "var(--color-ink-muted)",
              background: isActive(item.href) ? "var(--color-well)" : "transparent",
            }}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
        <span style={{ color: "var(--color-ink-muted)", fontSize: "var(--fs-caption)" }}>
          {email} · {role}
        </span>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={signOut}
          disabled={signingOut}
          style={{ minHeight: 40, padding: "0 18px" }}
        >
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </header>
  );
}