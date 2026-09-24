"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart/CartProvider";
import { useToast } from "@/lib/toast/ToastProvider";
import { PAYMENT_METHODS } from "@/lib/data/site";
import { CheckoutSummary } from "@/components/cart/CheckoutSummary";
import { EmptyState } from "@/components/storefront/vanilla/ui/EmptyState";
import { Breadcrumb } from "@/components/storefront/vanilla/product/Breadcrumb";

export default function CheckoutPage() {
  const { cart } = useCart();
  const { show } = useToast();
  const [mode, setMode] = useState<"guest" | "login">("guest");

  if (cart.itemCount === 0) {
    return (
      <div className="container" style={{ paddingTop: "var(--space-3)" }}>
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Checkout" }]} />
        <EmptyState
          title="Your cart is empty"
          body="Add something before checking out."
          actions={
            <Link href="/collection/new-arrivals" className="btn btn-primary">
              Shop new
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: "var(--space-3)" }}>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
      <h1>Checkout</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "var(--space-8)", marginTop: "var(--space-4)" }} className="checkout-layout">
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <fieldset className="card-surface" style={{ padding: "var(--space-4)", border: "none", display: "flex", flexDirection: "column", gap: 12 }}>
            <legend style={{ fontWeight: 800, padding: "0 var(--space-2)" }}>How would you like to continue?</legend>
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="radio" name="mode" checked={mode === "guest"} onChange={() => setMode("guest")} />
              <span>
                <strong>Continue as guest</strong> ÔÇö no account needed.
              </span>
            </label>
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="radio" name="mode" checked={mode === "login"} onChange={() => setMode("login")} />
              <span>
                <strong>Log in / Create account</strong> ÔÇö faster next time.
              </span>
            </label>
            {mode === "login" && (
              <Link href="/account" className="btn btn-secondary">
                Log in or create account
              </Link>
            )}
          </fieldset>

          <div className="card-surface" style={{ padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontWeight: 800 }}>Payment</span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {PAYMENT_METHODS.map((m) => (
                <span key={m} style={{ border: "1px solid var(--color-border)", borderRadius: 6, padding: "4px 10px", fontSize: "var(--fs-caption)" }}>
                  {m}
                </span>
              ))}
            </div>
            <p style={{ margin: 0, fontSize: "var(--fs-caption)", color: "var(--color-ink-muted)" }}>
              Payment processing is not part of this demo build ÔÇö no card details are collected.
            </p>
          </div>

          <button type="button" className="btn btn-primary btn-block" onClick={() => show("This is a demo build ÔÇö no payment is processed.")}>
            Place order
          </button>
          <Link href="/cart" className="btn btn-ghost btn-block">
            ÔåÉ Back to cart
          </Link>
        </div>

        <CheckoutSummary cart={cart} />
      </div>

      <style jsx>{`
        @media (min-width: 1024px) {
          .checkout-layout {
            grid-template-columns: 1.2fr 1fr;
          }
        }
      `}</style>
    </div>
  );
}
