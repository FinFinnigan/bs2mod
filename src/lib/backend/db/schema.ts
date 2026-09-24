// Database schema (Drizzle ORM, Neon Postgres). Defines the data layer behind the
// live adapters. Money is stored as integer minor units + currency string to avoid
// floating-point. No provider-specific fields leak into shared domain/UI contracts;
// external provider ids are adapter metadata only.

import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  varchar,
  jsonb,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  label: text("label").notNull(),
  position: integer("position").notNull().default(0),
});

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  categorySlug: text("category_slug").notNull(),
  ageBand: text("age_band").notNull(), // "3-5Y" | "6-8Y" | "9-12Y" | "13-14Y"
  price: integer("price").notNull(), // minor units (cents)
  compareAtPrice: integer("compare_at_price"),
  currency: varchar("currency", { length: 3 }).notNull().default("EUR"),
  badges: jsonb("badges").$type<string[]>().notNull().default([]),
  inStock: boolean("in_stock").notNull().default(true),
  colourHex: text("colour_hex"),
  description: text("description"),
  material: text("material"),
  fit: text("fit"),
  care: text("care"),
  origin: text("origin"),
  archived: boolean("archived").notNull().default(false),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const variants = pgTable(
  "variants",
  {
    id: text("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id),
    sku: text("sku").notNull().unique(),
    size: text("size"),
    colour: text("colour"),
    colourHex: text("colour_hex"),
    stock: integer("stock").notNull().default(0),
    priceOverride: integer("price_override"), // minor units; null = use product price
  },
  (table) => [
    check(
      "variants_stock_nonnegative",
      sql`${table.stock} >= 0`
    ),
  ]
);

export const carts = pgTable("carts", {
  id: text("id").primaryKey(), // opaque token (guest cart)
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const cartItems = pgTable("cart_items", {
  id: text("id").primaryKey(),
  cartId: text("cart_id")
    .notNull()
    .references(() => carts.id),
  variantId: text("variant_id")
    .notNull()
    .references(() => variants.id),
  quantity: integer("quantity").notNull().default(1),
});

export const orders = pgTable(
  "orders",
  {
    id: text("id").primaryKey(), // our internal order id
    cartId: text("cart_id"),
    email: text("email"),
    userId: text("user_id").references(() => users.id), // owner; null for guest orders
    publicToken: text("public_token").notNull().unique(), // opaque public lookup token
    idempotencyKey: text("idempotency_key").notNull().unique(),
    status: text("status").notNull().default("draft"), // draft | placed | confirmed | fulfilled | cancelled | failed | refunded
    subtotal: integer("subtotal").notNull().default(0),
    total: integer("total").notNull().default(0),
    currency: varchar("currency", { length: 3 }).notNull().default("EUR"),
    shippingAmount: integer("shipping_amount").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check(
      "orders_status_check",
      sql`${table.status} IN ('draft', 'placed', 'confirmed', 'fulfilled', 'cancelled', 'failed', 'refunded')`
    ),
  ]
);

export const orderItems = pgTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id),
  variantId: text("variant_id").notNull(),
  productId: text("product_id").notNull(),
  sku: text("sku").notNull(),
  name: text("name").notNull(),
  size: text("size"),
  colour: text("colour"),
  unitPrice: integer("unit_price").notNull(),
  quantity: integer("quantity").notNull().default(1),
  lineTotal: integer("line_total").notNull(),
});

export const addresses = pgTable("addresses", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id),
  kind: text("kind").notNull(), // "shipping" | "billing"
  fullName: text("full_name").notNull(),
  line1: text("line1").notNull(),
  line2: text("line2"),
  city: text("city").notNull(),
  postcode: text("postcode").notNull(),
  country: text("country").notNull().default("IE"),
});

export const payments = pgTable("payments", {
  id: text("id").primaryKey(), // our internal payment id
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id),
  providerId: text("provider_id").notNull(), // "mock" | "stripe" | ...
  providerRef: text("provider_ref"), // external id — adapter metadata only
  status: text("status").notNull().default("created"),
  amount: integer("amount").notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("EUR"),
  idempotencyKey: text("idempotency_key").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const paymentTransitions = pgTable("payment_transitions", {
  id: text("id").primaryKey(),
  paymentId: text("payment_id")
    .notNull()
    .references(() => payments.id),
  fromState: text("from_state").notNull(),
  toState: text("to_state").notNull(),
  providerRef: text("provider_ref"),
  idempotencyKey: text("idempotency_key").notNull(),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orderTransitions = pgTable("order_transitions", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id),
  fromState: text("from_state").notNull(),
  toState: text("to_state").notNull(),
  idempotencyKey: text("idempotency_key").notNull(),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Auth (AUDIT 04 §11). Passwords are stored as scrypt hashes only — never plain
// text. Sessions store the SHA-256 hash of the opaque bearer token, so a leaked
// sessions table does not expose usable credentials.
export const users = pgTable("users", {
  id: text("id").primaryKey(), // "usr_" + random hex
  email: text("email").notNull().unique(), // normalized: trimmed + lowercase
  passwordHash: text("password_hash").notNull(), // scrypt$N$r$p$salt$hash
  role: text("role").notNull().default("customer"), // "admin" | "customer"
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(), // SHA-256 hex of the raw bearer token
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }), // set on logout
});

// Row types for the live repositories.
export type ProductRow = typeof products.$inferSelect;
export type VariantRow = typeof variants.$inferSelect;
export type CartRow = typeof carts.$inferSelect;
export type OrderRow = typeof orders.$inferSelect;
export type OrderTransitionRow = typeof orderTransitions.$inferSelect;
export type PaymentRow = typeof payments.$inferSelect;
export type SettingsRow = typeof settings.$inferSelect;
export type UserRow = typeof users.$inferSelect;
export type SessionRow = typeof sessions.$inferSelect;
