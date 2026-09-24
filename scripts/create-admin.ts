// Create or update the admin user from AUTH_ADMIN_EMAIL / AUTH_ADMIN_PASSWORD.
// Idempotent: re-running with the same email updates the password hash.
//
// Run with: npm run db:create-admin   (loads .env.local first)

import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/backend/auth/password";

async function main() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (existsSync(envPath)) process.loadEnvFile(envPath);

  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local before creating the admin user.",
    );
  }
  const email = process.env.AUTH_ADMIN_EMAIL;
  const password = process.env.AUTH_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "AUTH_ADMIN_EMAIL and AUTH_ADMIN_PASSWORD must be set in .env.local.",
    );
  }

  const { getDb } = await import("@/lib/backend/db/client");
  const { users } = await import("@/lib/backend/db/schema");

  const db = getDb();
  const normalized = email.trim().toLowerCase();
  const passwordHash = hashPassword(password);

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalized))
    .limit(1);

  if (existing) {
    await db
      .update(users)
      .set({ passwordHash, role: "admin", updatedAt: new Date() })
      .where(eq(users.id, existing.id));
    console.log(`Updated admin user ${normalized}.`);
  } else {
    await db.insert(users).values({
      id: `usr_${randomBytes(16).toString("hex")}`,
      email: normalized,
      passwordHash,
      role: "admin",
    });
    console.log(`Created admin user ${normalized}.`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});