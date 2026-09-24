// Request-body validation for the API routes (G13). The schemas mirror the
// payload shapes the routes already accepted, so previously-valid requests are
// accepted unchanged (unknown extra fields pass through). Malformed payloads are
// rejected with a 400 and a descriptive first-issue message.
//
// This module is intentionally free of `@/` imports so it can be unit-tested
// directly under vitest (which does not resolve the Next.js path alias).

import { z } from "zod";

// POST /api/checkout — cart token + shipping address + idempotency key. The
// browser never supplies a total; the server recomputes it. `.passthrough()`
// keeps unknown extra fields from breaking previously-valid requests.
export const checkoutSchema = z
  .object({
    email: z.string().optional(),
    shippingAddress: z.object({
      fullName: z.string(),
      line1: z.string(),
      line2: z.string().optional(),
      city: z.string(),
      postcode: z.string(),
      country: z.string(),
    }),
    idempotencyKey: z.string(),
  })
  .passthrough();

// POST /api/webhooks/payment — any JSON object. The adapter owns signature
// verification and normalization (ARCHITECTURE.md §9); this layer only rejects
// bodies that are not a JSON object (invalid JSON, arrays, scalars, null).
export const webhookSchema = z.record(z.string(), z.unknown());

// POST /api/auth/login — email + password. `.passthrough()` keeps unknown extra
// fields from breaking previously-valid requests.
export const loginSchema = z
  .object({
    email: z.string(),
    password: z.string(),
  })
  .passthrough();

// POST /api/admin/products — create payload. Prices are integer minor units
// (cents), matching AdminProductInput. `.passthrough()` keeps unknown extra
// fields from breaking previously-valid requests.
export const adminProductSchema = z
  .object({
    id: z.string().optional(),
    slug: z.string(),
    name: z.string(),
    categorySlug: z.string(),
    ageBand: z.string(),
    price: z.number().int().nonnegative(),
    compareAtPrice: z.number().int().nonnegative().nullable().optional(),
    currency: z.string().length(3).optional(),
    badges: z.array(z.string()).optional(),
    inStock: z.boolean().optional(),
    colourHex: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    material: z.string().nullable().optional(),
    fit: z.string().nullable().optional(),
    care: z.string().nullable().optional(),
    origin: z.string().nullable().optional(),
    imageUrl: z.string().nullable().optional(),
    archived: z.boolean().optional(),
    variants: z
      .array(z.object({ id: z.string(), stock: z.number().int().nonnegative() }))
      .optional(),
  })
  .passthrough();

// PATCH /api/admin/products/[id] — any subset of the create payload; the
// service treats absent fields as "leave unchanged".
export const adminProductPatchSchema = adminProductSchema.partial().passthrough();

// POST /api/admin/orders/[id]/actions — which state-machine action to apply.
export const adminOrderActionSchema = z.object({
  action: z.enum(["confirm", "fulfill", "cancel", "refund"]),
});

// Format the first zod issue as a descriptive, path-prefixed message, e.g.
// "shippingAddress.line1: Expected string, received undefined".
export function firstIssueMessage(error: z.ZodError): string {
  const issue = error.issues[0];
  const path = issue.path.join(".");
  return path ? `${path}: ${issue.message}` : issue.message;
}