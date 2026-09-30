import { afterEach, describe, expect, it } from "vitest";
import { getDb } from "../client";

const originalDatabaseUrl = process.env.DATABASE_URL;

afterEach(() => {
  if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = originalDatabaseUrl;
});

describe("getDb", () => {
  it("creates a request-scoped client when a database URL is configured", () => {
    process.env.DATABASE_URL = "postgres://test:test@localhost:5432/boyshop_test";

    const firstClient = getDb();
    const secondClient = getDb();

    expect(secondClient).not.toBe(firstClient);
  });
});
