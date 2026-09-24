"use client";

import { useState } from "react";
import Link from "next/link";
import { FOOTER_LINKS, PAYMENT_METHODS, SITE } from "@/lib/data/site";
import { useToast } from "@/lib/toast/ToastProvider";
import { grantConsent } from "@/lib/analytics";

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const { show } = useToast();

  function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) return;
    grantConsent();
    show("Thanks for subscribing!");
    setEmail("");
    setConsent(false);
  }

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <div className="wordmark" style={{ color: "#fff", marginBottom: 12 }}>
              {SITE.name}
            </div>
            <p style={{ color: "rgba(255,255,255,0.7)", maxWidth: 320 }}>
              {SITE.tagline}. Made for the messy bits.
            </p>
            <form onSubmit={subscribe} style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12, maxWidth: 360 }}>
              <label htmlFor="newsletter-email" style={{ fontSize: "var(--fs-caption)", color: "rgba(255,255,255,0.7)" }}>
                Get 10% off your first order
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{
                    flex: 1,
                    border: "1px solid rgba(255,255,255,0.3)",
                    background: "rgba(255,255,255,0.08)",
                    color: "#fff",
                    borderRadius: "var(--radius-input)",
                    padding: "10px 14px",
                    fontSize: "var(--fs-body)",
                    outline: "none",
                  }}
                />
                <button type="submit" className="btn btn-primary" disabled={!consent}>
                  Sign up
                </button>
              </div>
              <label style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: "var(--fs-caption)", color: "rgba(255,255,255,0.7)" }}>
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  style={{ marginTop: 2 }}
                />
                <span>
                  I agree to receive marketing emails and accept the{" "}
                  <Link href="/pages/privacy" style={{ textDecoration: "underline" }}>
                    privacy policy
                  </Link>
                  .
                </span>
              </label>
            </form>
          </div>

          {FOOTER_LINKS.map((col) => (
            <div key={col.title}>
              <p className="eyebrow" style={{ color: "rgba(255,255,255,0.5)", margin: "0 0 12px" }}>
                {col.title}
              </p>
              <ul style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link href={l.href}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.15)", marginTop: "var(--space-8)", paddingTop: "var(--space-6)", display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "var(--fs-caption)" }}>
            ┬® {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </span>
          <div style={{ display: "flex", gap: 12, alignItems: "center", color: "rgba(255,255,255,0.6)", fontSize: "var(--fs-caption)" }}>
            <span>We accept:</span>
            {PAYMENT_METHODS.map((m) => (
              <span key={m} style={{ border: "1px solid rgba(255,255,255,0.3)", borderRadius: 6, padding: "2px 8px" }}>
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
