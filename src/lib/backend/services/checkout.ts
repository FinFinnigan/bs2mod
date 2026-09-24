// Checkout service — server-authoritative totals and guest checkout orchestration.
//
// The browser NEVER supplies a total. The service resolves the cart from the
// repository, recomputes line totals + subtotal + shipping from database prices,
// creates the order, and then begins a payment through the provider-neutral
// PaymentService. Idempotency keys prevent duplicate orders.

import type { CartRepository, OrderRepository, CreateOrderInput, OrderRow } from "../repositories/interfaces";
import type { Money, CartState } from "@/lib/types";
import type { PaymentService } from "../payments/service";
import type { PaymentSession } from "../payments/types";
import type { PaymentRecord } from "../payments/store";
import { randomBytes } from "node:crypto";
import { money } from "../money";
import { eventBus } from "../events/bus";

export interface ShippingConfig {
  freeThreshold: number;
  flatRate: number;
}

export interface CheckoutDeps {
  cartRepo: CartRepository;
  orderRepo: OrderRepository;
  payments: PaymentService;
  shipping: ShippingConfig;
  id?: () => string;
  publicUrl?: string;
}

export interface CheckoutResult {
  order: OrderRow;
  paymentId: string;
  session: PaymentSession;
}

export class CheckoutService {
  private deps: CheckoutDeps;

  constructor(deps: CheckoutDeps) {
    this.deps = deps;
  }

  /**
   * Create an order from a cart and begin its payment.
   * Idempotent on `idempotencyKey`: a retry returns the existing order instead of
   * creating a duplicate.
   */
  async checkout(
    cartId: string,
    input: {
      email?: string;
      shippingAddress: CreateOrderInput["shippingAddress"];
      idempotencyKey: string;
      providerId: string;
      userId?: string;
    }
  ): Promise<CheckoutResult> {
    // Idempotency: return the existing order if this key was already processed.
    const existing = await this.deps.orderRepo.getByIdempotencyKey(input.idempotencyKey);
    if (existing) {
      return this.resume(existing, input.providerId);
    }

    const cart = await this.deps.cartRepo.getCart(cartId);
    if (!cart || cart.itemCount === 0) {
      throw new Error("Cart is empty or not found");
    }

    // Server-authoritative totals (never trust the browser).
    const subtotal = money(cart.subtotal, "EUR");
    const shippingAmount = this.shippingFor(cart);
    const total = money(subtotal.amount + shippingAmount.amount, "EUR");

    // Internal id is server-generated (never derived from client input); the
    // public token is opaque 192-bit entropy, also server-generated.
    const orderId = this.deps.id ? this.deps.id() : `ord_${randomBytes(16).toString("hex")}`;
    const publicToken = randomBytes(24).toString("base64url");
    const order: OrderRow = {
      id: orderId,
      cartId,
      email: input.email,
      userId: input.userId,
      publicToken,
      status: "placed",
      subtotal,
      shippingAmount,
      total,
      currency: "EUR",
      items: cart.items.map((i) => ({
        variantId: i.variant.id,
        productId: i.product.id,
        sku: i.variant.sku,
        name: i.product.name,
        size: i.variant.size,
        colour: i.variant.colour,
        unitPrice: i.variant.price ?? i.product.price,
        quantity: i.quantity,
        lineTotal: money(i.lineTotal, "EUR"),
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const createInput: CreateOrderInput = {
      id: orderId,
      cartId,
      email: input.email,
      userId: input.userId,
      shippingAddress: input.shippingAddress,
      idempotencyKey: input.idempotencyKey,
    };

    await this.deps.orderRepo.create(createInput, order);

    // Begin payment through the provider-neutral service.
    const payment = await this.deps.payments.create(
      { orderId, amount: total, returnUrl: this.returnUrl(), method: this.deps.payments.defaultMethod(input.providerId) },
      { providerId: input.providerId, idempotencyKey: orderId }
    );
    const session = await this.deps.payments.begin(payment, {
      orderId,
      amount: total,
      returnUrl: this.returnUrl(),
      method: this.deps.payments.defaultMethod(input.providerId),
    });

    await eventBus.emit("order.created", { orderId, total: total.amount });

    return { order, paymentId: payment.id, session };
  }

  private shippingFor(cart: CartState): Money {
    const threshold = this.deps.shipping.freeThreshold;
    const flatRate = this.deps.shipping.flatRate;
    const amount = cart.subtotal >= threshold ? 0 : flatRate;
    return money(amount, "EUR");
  }

  // Mollie rejects relative redirect URLs, so on a deployed instance (publicUrl
  // set) the return URL must be absolute. Local dev keeps the relative path.
  private returnUrl(): string {
    const base = this.deps.publicUrl;
    if (!base) return "/checkout/confirmation";
    return `${base.replace(/\/+$/, "")}/checkout/confirmation`;
  }

  private async resume(order: OrderRow, providerId: string): Promise<CheckoutResult> {
    const existing = await this.deps.payments.store.listByOrder(order.id);
    const payment =
      existing.reduce<PaymentRecord | null>((a, b) => (a === null || b.createdAt > a.createdAt ? b : a), null) ??
      // No payment row yet (interrupted before persist, or legacy double-prefix id):
      // create one idempotently on the order id.
      (await this.deps.payments.create(
        { orderId: order.id, amount: order.total, returnUrl: this.returnUrl(), method: this.deps.payments.defaultMethod(providerId) },
        { providerId, idempotencyKey: order.id }
      ));

    let session: PaymentSession;
    if (payment.providerRef) {
      // Provider session already started — reuse it. Calling begin() again would
      // create a SECOND provider session and risk a double charge.
      session = { kind: "none", providerRef: payment.providerRef, providerId: payment.providerId };
    } else {
      session = await this.deps.payments.begin(payment, {
        orderId: order.id,
        amount: order.total,
        returnUrl: this.returnUrl(),
        method: this.deps.payments.defaultMethod(providerId),
      });
    }
    return { order, paymentId: payment.id, session };
  }
}
