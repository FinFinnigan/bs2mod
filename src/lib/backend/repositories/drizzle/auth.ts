// Drizzle auth stores — persist users and sessions in Postgres. Passwords are
// stored as scrypt hashes; session ids are SHA-256 hashes of the bearer tokens.

import { and, eq, gt, isNull } from "drizzle-orm";
import { getDb } from "../../db/client";
import { sessions, users } from "../../db/schema";
import type {
  SessionRecord,
  SessionStore,
  UserRecord,
  UserStore,
} from "../../auth/interfaces";

export class DrizzleUserStore implements UserStore {
  async create(user: UserRecord): Promise<void> {
    const db = getDb();
    await db.insert(users).values({
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
    });
  }

  async getByEmail(email: string): Promise<UserRecord | null> {
    const db = getDb();
    const [row] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!row) return null;
    return this.toRecord(row);
  }

  async getById(id: string): Promise<UserRecord | null> {
    const db = getDb();
    const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!row) return null;
    return this.toRecord(row);
  }

  private toRecord(row: typeof users.$inferSelect): UserRecord {
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.passwordHash,
      role: row.role,
      createdAt: row.createdAt.toISOString(),
    };
  }
}

export class DrizzleSessionStore implements SessionStore {
  async create(session: SessionRecord): Promise<void> {
    const db = getDb();
    await db.insert(sessions).values({
      id: session.id,
      userId: session.userId,
      expiresAt: new Date(session.expiresAt),
      revokedAt: session.revokedAt ? new Date(session.revokedAt) : null,
    });
  }

  async get(id: string): Promise<SessionRecord | null> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.id, id),
          isNull(sessions.revokedAt),
          gt(sessions.expiresAt, new Date()),
        ),
      )
      .limit(1);
    if (!row) return null;
    return this.toRecord(row);
  }

  async revoke(id: string): Promise<void> {
    const db = getDb();
    await db
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(eq(sessions.id, id));
  }

  private toRecord(row: typeof sessions.$inferSelect): SessionRecord {
    return {
      id: row.id,
      userId: row.userId,
      createdAt: row.createdAt.toISOString(),
      expiresAt: row.expiresAt.toISOString(),
      revokedAt: row.revokedAt ? row.revokedAt.toISOString() : null,
    };
  }
}