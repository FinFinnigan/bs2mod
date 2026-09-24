// Lazy Neon/Postgres client. The connection is created only when a DATABASE_URL is
// present, so the static/mock storefront builds and runs with no database at all.
// The live adapters use this; the mock adapters never touch it.

import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb(): ReturnType<typeof drizzle<typeof schema>> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set — the live data layer is unavailable. Use the mock adapter."
    );
  }
  if (!_db) {
    _db = drizzle(new Pool({ connectionString: url }), { schema });
  }
  return _db;
}

export function hasDatabase(): boolean {
  return !!process.env.DATABASE_URL;
}
