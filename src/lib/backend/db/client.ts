// The database client is created for each request so Cloudflare Worker isolates
// never reuse a request-bound Neon WebSocket connection.

import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

export function getDb(): ReturnType<typeof drizzle<typeof schema>> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set — the live data layer is unavailable. Use the mock adapter."
    );
  }
  return drizzle(new Pool({ connectionString: url }), { schema });
}

export function hasDatabase(): boolean {
  return !!process.env.DATABASE_URL;
}
