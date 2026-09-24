// Drizzle Kit configuration. Migrations are generated as code with
// `npm run db:generate` and applied explicitly with `npm run db:migrate` — never run
// automatically and never without the CEO's authorization (no irreversible
// infrastructure changes).

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/backend/db/schema.ts",
  out: "./src/lib/backend/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://localhost:5432/boyshop",
  },
  verbose: true,
  strict: true,
});
