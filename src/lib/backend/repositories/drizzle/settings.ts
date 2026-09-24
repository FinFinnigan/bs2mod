// Drizzle settings repository — key/value store persisted in the `settings`
// table. Values are JSONB, so any JSON-serializable payload can be stored.

import { eq } from "drizzle-orm";
import type { SettingsRepository } from "../interfaces";
import { getDb } from "../../db/client";
import { settings } from "../../db/schema";

export class DrizzleSettingsRepository implements SettingsRepository {
  async get(key: string): Promise<unknown | undefined> {
    const db = getDb();
    const [row] = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
    return row?.value;
  }

  async set(key: string, value: unknown): Promise<void> {
    const db = getDb();
    await db
      .insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value, updatedAt: new Date() },
      });
  }
}