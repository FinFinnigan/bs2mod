"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/CartProvider";
import { formatPrice } from "@/lib/currency";
import { FreeShippingBar } from "@/components/cart/FreeShippingBar";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { EmptyState } from "@/components/storefront/vanilla/ui/EmptyState";
import { Breadcrumb } from "@/components/storefront/vanilla/product/Breadcrumb";

export default function CartPage() {
  const { cart, updateQty, removeItem } = useCart();

  return (
    <div className="container" style={{ paddingTop: "var(--space-3)" }}>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Cart" }]} />
      <h1>Cart</h1>

      {cart.itemCount === 0 ? (
        <EmptyState
          title="Your cart is empty"
          body="Add something they'll love."
          actions={
            <>
              <Link href="/collection/new-arrivals" className="btn btn-primary">
                Shop new
              </Link>
              <Link href="/collection/sale" className="btn btn-secondary">
                Shop sale
              </Link>
            </>
          }
        />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "var(--space-8)", marginTop: "var(--space-4)" }} className="cart-layout">
          <div>
            <FreeShippingBar amountToFreeShipping={cart.amountToFreeShipping} threshold={cart.freeShippingThreshold} />
            <div style={{ borderTop: "1px solid var(--color-border)" }}>
              {cart.items.map((item) => (
                <CartLineItem
                  key={item.variant.id}
                  item={item}
                  onUpdate={(q) => updateQty(item.variant.id, q)}
                  onRemove={() => removeItem(item.variant.id)}
                />
              ))}
            </div>
          </div>

          <div className="card-surface" style={{ padding: "var(--space-4)", alignSelf: "start", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Subtotal</span>
              <span className="tabular">{formatPrice(cart.subtotal)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "var(--fs-body-lg)" }}>
              <span>Total</span>
              <span className="tabular">{formatPrice(cart.total)}</span>
            </div>
            <p style={{ margin: 0, fontSize: "var(--fs-caption)", color: "var(--color-ink-muted)" }}>
              Taxes calculated at checkout.
            </p>
            <Link href="/checkout" className="btn btn-primary btn-block">
              Go to checkout ÔåÆ
            </Link>
            <Link href="/shop" className="btn btn-ghost btn-block">
              Continue shopping
            </Link>
          </div>
        </div>
      )}

      <style jsx>{`
        @media (min-width: 1024px) {
          .cart-layout {
            grid-template-columns: 1.6fr 1fr;
          }
        }
      `}</style>
    </div>
  );
}
