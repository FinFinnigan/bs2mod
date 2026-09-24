import { AdminLoginForm } from "./admin-login-form";

export const metadata = { title: "Admin Sign In · BoyShop" };

export default function AdminLoginPage() {
  return (
    <div
      className="container"
      style={{
        paddingTop: "var(--space-12)",
        paddingBottom: "var(--space-12)",
      }}
    >
      <AdminLoginForm />
    </div>
  );
}