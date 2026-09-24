import { describe, it, expect } from "vitest";
import {
  checkoutSchema,
  webhookSchema,
  loginSchema,
  adminProductSchema,
  firstIssueMessage,
} from "../validation";

const VALID_ADDRESS = {
  fullName: "Test Parent",
  line1: "1 Main St",
  city: "Dublin",
  postcode: "D01",
  country: "IE",
};

describe("checkoutSchema — POST /api/checkout request validation", () => {
  it("accepts a full valid payload (email + address + idempotency key)", () => {
    const r = checkoutSchema.safeParse({
      email: "a@b.c",
      shippingAddress: VALID_ADDRESS,
      idempotencyKey: "k1",
    });
    expect(r.success).toBe(true);
  });

  it("accepts the minimal payload (no email, no line2)", () => {
    const r = checkoutSchema.safeParse({
      shippingAddress: { ...VALID_ADDRESS, line2: undefined },
      idempotencyKey: "k2",
    });
    expect(r.success).toBe(true);
  });

  it("passes unknown extra fields through — previously-valid requests stay valid", () => {
    const r = checkoutSchema.safeParse({
      shippingAddress: VALID_ADDRESS,
      idempotencyKey: "k3",
      total: 9999, // client hint — must not break the request
      extra: { anything: true },
    });
    expect(r.success).toBe(true);
  });

  it("rejects a missing shippingAddress with a descriptive error", () => {
    const r = checkoutSchema.safeParse({ idempotencyKey: "k4" });
    expect(r.success).toBe(false);
    if (!r.success) expect(firstIssueMessage(r.error)).toMatch(/shippingAddress/);
  });

  it("rejects a missing idempotencyKey", () => {
    const r = checkoutSchema.safeParse({ shippingAddress: VALID_ADDRESS });
    expect(r.success).toBe(false);
    if (!r.success) expect(firstIssueMessage(r.error)).toMatch(/idempotencyKey/);
  });

  it("rejects a malformed shippingAddress (missing required fields)", () => {
    const r = checkoutSchema.safeParse({
      shippingAddress: { fullName: "Only Name" },
      idempotencyKey: "k5",
    });
    expect(r.success).toBe(false);
    if (!r.success) expect(firstIssueMessage(r.error)).toMatch(/line1/);
  });

  it("rejects a non-string email", () => {
    const r = checkoutSchema.safeParse({
      email: 123,
      shippingAddress: VALID_ADDRESS,
      idempotencyKey: "k6",
    });
    expect(r.success).toBe(false);
  });
});

describe("webhookSchema — POST /api/webhooks/payment request validation", () => {
  it("accepts any JSON object payload", () => {
    expect(
      webhookSchema.safeParse({ type: "payment_intent.succeeded", data: { id: "pi_1" } }).success
    ).toBe(true);
    expect(webhookSchema.safeParse({}).success).toBe(true);
  });

  it("rejects non-object bodies (arrays, strings, numbers, null)", () => {
    expect(webhookSchema.safeParse([1, 2]).success).toBe(false);
    expect(webhookSchema.safeParse("hello").success).toBe(false);
    expect(webhookSchema.safeParse(42).success).toBe(false);
    expect(webhookSchema.safeParse(null).success).toBe(false);
  });
});

describe("loginSchema — POST /api/auth/login request validation", () => {
  it("accepts email + password", () => {
    expect(loginSchema.safeParse({ email: "a@b.c", password: "pw" }).success).toBe(true);
  });

  it("passes unknown extra fields through — previously-valid requests stay valid", () => {
    expect(
      loginSchema.safeParse({ email: "a@b.c", password: "pw", remember: true }).success
    ).toBe(true);
  });

  it("rejects a missing email with a descriptive error", () => {
    const r = loginSchema.safeParse({ password: "pw" });
    expect(r.success).toBe(false);
    if (!r.success) expect(firstIssueMessage(r.error)).toMatch(/email/);
  });

  it("rejects a missing password with a descriptive error", () => {
    const r = loginSchema.safeParse({ email: "a@b.c" });
    expect(r.success).toBe(false);
    if (!r.success) expect(firstIssueMessage(r.error)).toMatch(/password/);
  });

  it("rejects a non-string email", () => {
    expect(loginSchema.safeParse({ email: 42, password: "pw" }).success).toBe(false);
  });

  it("rejects a non-string password", () => {
    expect(loginSchema.safeParse({ email: "a@b.c", password: 42 }).success).toBe(false);
  });
});

describe("adminProductSchema — variant stock mutation payload", () => {
  const base = {
    slug: "slate-hoodie",
    name: "Slate Hoodie",
    categorySlug: "hoodies",
    ageBand: "9-12Y",
    price: 3400,
  };

  it("accepts a variants array with id and non-negative stock", () => {
    const r = adminProductSchema.safeParse({
      ...base,
      variants: [
        { id: "v1", stock: 0 },
        { id: "v2", stock: 12 },
      ],
    });
    expect(r.success).toBe(true);
  });

  it("rejects a negative stock value", () => {
    const r = adminProductSchema.safeParse({ ...base, variants: [{ id: "v1", stock: -1 }] });
    expect(r.success).toBe(false);
  });

  it("rejects a non-integer stock value", () => {
    const r = adminProductSchema.safeParse({ ...base, variants: [{ id: "v1", stock: 2.5 }] });
    expect(r.success).toBe(false);
  });

  it("rejects a variant missing its id", () => {
    const r = adminProductSchema.safeParse({ ...base, variants: [{ stock: 3 }] });
    expect(r.success).toBe(false);
  });
});