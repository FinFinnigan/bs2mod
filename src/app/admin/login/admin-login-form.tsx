"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Sign-in form for the admin area (ADM-001). Uses the existing API route
// POST /api/auth/login (cookie-based session); on success it replaces the URL
// with /admin and refreshes so the server-side gate (session.ts + gate.ts)
// evaluates the new session on the next render.
export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fieldStyle: React.CSSProperties = {
    width: "100%",
    padding: "var(--space-2)",
    borderRadius: "var(--radius-input)",
    border: "1px solid var(--color-ink-muted)",
    background: "var(--color-surface)",
    color: "var(--color-ink)",
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(body?.error ?? "Sign-in failed. Check your details and try again.");
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card-surface"
      style={{
        maxWidth: 400,
        margin: "0 auto",
        padding: "var(--space-4)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
      }}
    >
      <h1 style={{ margin: 0 }}>Admin sign in</h1>
      <p style={{ margin: 0, color: "var(--color-ink-muted)" }}>
        Restricted area — BoyShop staff with the admin role only.
      </p>

      <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        Email
        <input
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={fieldStyle}
        />
      </label>

      <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        Password
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={fieldStyle}
        />
      </label>

      {error && (
        <p role="alert" style={{ margin: 0, color: "var(--color-error)" }}>
          {error}
        </p>
      )}

      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}