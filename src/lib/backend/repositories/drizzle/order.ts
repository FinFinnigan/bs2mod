// Drizzle order repository — persists orders + order items + shipping addresses.
// Money converted to minor units at this boundary. The order is created
// server-authoritatively (totals computed by the checkout service, never from the
// browser).

import { eq, and, desc, sql, gte } from "drizzle-orm";
import type {
  OrderRepository,
  CreateOrderInput,
  OrderRow,
  OrderTransitionRow,
  OrderListQuery,
  OrderStatus,
  OrderAddressRow,
} from "../interfaces";
import { StockUnavailableError } from "../interfaces";
import { getDb } from "../../db/client";
import { orders, orderItems, addresses, orderTransitions, variants } from "../../db/schema";
import { toMinor } from "../../money";

export class DrizzleOrderRepository implements OrderRepository {
  async create(input: CreateOrderInput, order: OrderRow): Promise<void> {
    const db = getDb();
    // One all-or-nothing operation: stock decrements, order, items, and address
    // commit together or not at all. A failure at any step (including a
    // unique-key violation from a concurrent duplicate idempotency request)
    // aborts the transaction, so nothing is persisted.
    await db.transaction(async (tx) => {
      // (1) Re-check the idempotency key inside the transaction. The service's
      // early return handles sequential retries; this covers the race where two
      // same-key requests both pass it. The unique key on orders.idempotency_key
      // is the backstop for true concurrency.
      const [existing] = await tx
        .select()
        .from(orders)
        .where(eq(orders.idempotencyKey, input.idempotencyKey))
        .limit(1);
      if (existing) return;

      // (2) Pre-check stock for every line before writing anything, so a
      // sold-out or oversold order fails fast without partial writes.
      const known = new Set<string>();
      for (const item of order.items) {
        const [variant] = await tx
          .select()
          .from(variants)
          .where(eq(variants.id, item.variantId))
          .limit(1);
        if (!variant) continue;
        known.add(item.variantId);
        if (variant.stock < item.quantity) {
          throw new StockUnavailableError(
            variant.stock <= 0
              ? `"${item.variantId}" is sold out`
              : `Only ${variant.stock} left in stock`
          );
        }
      }

      // (3) Conditional decrement per line. The WHERE clause re-checks stock, so
      // a lost race affects zero rows and aborts the whole transaction — no
      // manual compensation needed, the rollback is atomic.
      for (const item of order.items) {
        if (!known.has(item.variantId)) continue;
        const [updated] = await tx
          .update(variants)
          .set({ stock: sql`${variants.stock} - ${item.quantity}` })
          .where(and(eq(variants.id, item.variantId), gte(variants.stock, item.quantity)))
          .returning({ id: variants.id });
        if (!updated) throw new StockUnavailableError("Stock changed while placing the order");
      }

      await tx.insert(orders).values({
        id: order.id,
        cartId: order.cartId,
        email: order.email,
        userId: order.userId,
        publicToken: order.publicToken,
        idempotencyKey: input.idempotencyKey,
        status: order.status,
        subtotal: toMinor(order.subtotal),
        total: toMinor(order.total),
        currency: order.currency,
        shippingAmount: toMinor(order.shippingAmount),
      });

      for (const item of order.items) {
        await tx.insert(orderItems).values({
          id: `oi_${order.id}_${item.variantId}`,
          orderId: order.id,
          variantId: item.variantId,
          productId: item.productId,
          sku: item.sku,
          name: item.name,
          size: item.size,
          colour: item.colour,
          unitPrice: toMinor(item.unitPrice),
          quantity: item.quantity,
          lineTotal: toMinor(item.lineTotal),
        });
      }

      await tx.insert(addresses).values({
        id: `addr_${order.id}_shipping`,
        orderId: order.id,
        kind: "shipping",
        fullName: input.shippingAddress.fullName,
        line1: input.shippingAddress.line1,
        line2: input.shippingAddress.line2,
        city: input.shippingAddress.city,
        postcode: input.shippingAddress.postcode,
        country: input.shippingAddress.country,
      });
    });
  }

  async get(id: string): Promise<OrderRow | null> {
    const db = getDb();
    const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    if (!order) return null;
    return this.hydrate(order);
  }

  async getByIdempotencyKey(key: string): Promise<OrderRow | null> {
    const db = getDb();
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.idempotencyKey, key))
      .limit(1);
    if (!order) return null;
    return this.hydrate(order);
  }

  async getByPublicToken(token: string): Promise<OrderRow | null> {
    const db = getDb();
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.publicToken, token))
      .limit(1);
    if (!order) return null;
    return this.hydrate(order);
  }

  async updateStatus(id: string, status: OrderRow["status"]): Promise<void> {
    const db = getDb();
    await db.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, id));
  }

  async appendTransition(row: OrderTransitionRow): Promise<void> {
    const db = getDb();
    await db.insert(orderTransitions).values({
      id: row.id,
      orderId: row.orderId,
      fromState: row.fromState,
      toState: row.toState,
      idempotencyKey: row.idempotencyKey,
      occurredAt: new Date(row.occurredAt),
    });
  }

  async list(query: OrderListQuery = {}): Promise<{ rows: OrderRow[]; total: number }> {
    const db = getDb();
    const where = query.status ? eq(orders.status, query.status) : undefined;
    const limit = query.limit ?? 50;
    const offset = query.offset ?? 0;

    const [rows, countRows] = await Promise.all([
      db
        .select()
        .from(orders)
        .where(where)
        .orderBy(desc(orders.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(orders).where(where),
    ]);

    const out: OrderRow[] = [];
    for (const row of rows) out.push(await this.hydrate(row));
    return { rows: out, total: Number(countRows[0]?.count ?? 0) };
  }

  async listTransitions(orderId: string): Promise<OrderTransitionRow[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(orderTransitions)
      .where(eq(orderTransitions.orderId, orderId))
      .orderBy(desc(orderTransitions.occurredAt));
    return rows.map((r) => ({
      id: r.id,
      orderId: r.orderId,
      fromState: r.fromState as OrderStatus,
      toState: r.toState as OrderStatus,
      idempotencyKey: r.idempotencyKey,
      occurredAt: r.occurredAt.toISOString(),
    }));
  }

  async getAddresses(orderId: string): Promise<OrderAddressRow[]> {
    const db = getDb();
    const rows = await db.select().from(addresses).where(eq(addresses.orderId, orderId));
    return rows.map((r) => ({
      id: r.id,
      orderId: r.orderId,
      kind: r.kind as OrderAddressRow["kind"],
      fullName: r.fullName,
      line1: r.line1,
      line2: r.line2 ?? undefined,
      city: r.city,
      postcode: r.postcode,
      country: r.country,
    }));
  }

  private async hydrate(order: typeof orders.$inferSelect): Promise<OrderRow> {
    const db = getDb();
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    return {
      id: order.id,
      cartId: order.cartId ?? undefined,
      email: order.email ?? undefined,
      userId: order.userId ?? undefined,
      publicToken: order.publicToken,
      status: order.status as OrderRow["status"],
      subtotal: { amount: order.subtotal / 100, currency: order.currency },
      shippingAmount: { amount: order.shippingAmount / 100, currency: order.currency },
      total: { amount: order.total / 100, currency: order.currency },
      currency: order.currency,
      items: items.map((i) => ({
        variantId: i.variantId,
        productId: i.productId,
        sku: i.sku,
        name: i.name,
        size: i.size ?? undefined,
        colour: i.colour ?? undefined,
        unitPrice: { amount: i.unitPrice / 100, currency: order.currency },
        quantity: i.quantity,
        lineTotal: { amount: i.lineTotal / 100, currency: order.currency },
      })),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }
}
