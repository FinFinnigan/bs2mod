"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/CartProvider";
import { formatPrice } from "@/lib/currency";
import { IconClose } from "@/components/ui/icons";
import { FreeShippingBar } from "@/components/cart/FreeShippingBar";
import { CartLineItem } from "@/components/cart/CartLineItem";

export function CartDrawer() {
  const { cart, isOpen, closeCart, updateQty, removeItem } = useCart();
  if (!isOpen) return null;

  return (
    <>
      <div className="sheet-backdrop" onClick={closeCart} aria-hidden="true" />
      <aside
        className="sheet sheet-right"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        style={{ animation: "drawer-in var(--motion-slow) ease-out" }}
      >
        <style jsx>{`
          @keyframes drawer-in {
            from {
              transform: translateY(100%);
            }
            to {
              transform: translateY(0);
            }
          }
          @media (min-width: 768px) {
            @keyframes drawer-in {
              from {
                transform: translateX(100%);
              }
              to {
                transform: translateX(0);
              }
            }
          }
        `}</style>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--space-4)", borderBottom: "1px solid var(--color-border)" }}>
          <h2 style={{ fontSize: "var(--fs-h3)" }}>Cart ({cart.itemCount})</h2>
          <button type="button" onClick={closeCart} aria-label="Close cart" className="header__icon">
            <IconClose />
          </button>
        </div>

        <div style={{ padding: "var(--space-4)", flex: 1, overflowY: "auto" }}>
          {cart.itemCount === 0 ? (
            <div style={{ textAlign: "center", padding: "var(--space-12) 0", display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
              <div style={{ fontSize: 40 }} aria-hidden="true">
                ­ƒº║
              </div>
              <h3>Your cart is empty</h3>
              <p style={{ color: "var(--color-ink-muted)", margin: 0 }}>Add something they&apos;ll love.</p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
                <Link href="/collection/new-arrivals" className="btn btn-primary" onClick={closeCart}>
                  Shop new
                </Link>
                <Link href="/collection/sale" className="btn btn-secondary" onClick={closeCart}>
                  Shop sale
                </Link>
              </div>
            </div>
          ) : (
            <>
              <FreeShippingBar
                amountToFreeShipping={cart.amountToFreeShipping}
                threshold={cart.freeShippingThreshold}
              />
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
            </>
          )}
        </div>

        {cart.itemCount > 0 && (
          <div style={{ padding: "var(--space-4)", borderTop: "1px solid var(--color-border)", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--fs-body)" }}>
              <span>Subtotal</span>
              <span className="tabular" style={{ fontWeight: 700 }}>
                {formatPrice(cart.subtotal)}
              </span>
            </div>
            {cart.discounts?.map((d) => (
              <div key={d.label} style={{ display: "flex", justifyContent: "space-between", color: "var(--color-accent)" }}>
                <span>{d.label}</span>
                <span className="tabular">ÔêÆ{formatPrice(d.amount)}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "var(--fs-body-lg)" }}>
              <span>Total</span>
              <span className="tabular">{formatPrice(cart.total)}</span>
            </div>
            <p style={{ margin: 0, fontSize: "var(--fs-caption)", color: "var(--color-ink-muted)" }}>
              Taxes calculated at checkout.
            </p>
            <Link href="/checkout" className="btn btn-primary btn-block" onClick={closeCart}>
              Go to checkout ÔåÆ
            </Link>
            <button type="button" className="btn btn-ghost" onClick={closeCart} style={{ textDecoration: "underline" }}>
              Continue shopping
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
