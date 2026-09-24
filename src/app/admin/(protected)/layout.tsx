import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { adminGateDecision } from "../gate";
import { getAdminSession } from "../session";
import { AdminHeader } from "./admin-header";

// Server-side gate for every route inside the protected admin group (ADM-001).
// Runs on each request and never trusts client state — authorization is
// enforced on the server (§27 of the no-code webshop standard). The outer
// admin layout is unauthenticated on purpose so /admin/login and
// /admin/forbidden still render for visitors without a session.
export default async function ProtectedAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getAdminSession();
  const decision = adminGateDecision(session?.role);

  if (decision === "login") redirect("/admin/login");
  if (decision === "forbidden") redirect("/admin/forbidden");
  // Fail-closed: keep the type level honest even though the decision above
  // already proves a session exists for the remaining "allow" branch.
  if (!session) redirect("/admin/login");

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AdminHeader email={session.email} role={session.role} />
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}