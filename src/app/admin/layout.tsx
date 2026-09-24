import type { ReactNode } from "react";

// Outer admin layout. Intentionally unauthenticated: it must render the login
// and forbidden pages for visitors who have no session. Authorization happens
// one level deeper, in the (protected) group layout (see gate.ts).
export const metadata = { title: "BoyShop Admin" };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="admin-shell">{children}</div>;
}