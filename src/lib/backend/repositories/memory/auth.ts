// In-memory auth stores for tests and local development (same boundary as the
// Drizzle stores). Not for production.

import type {
  SessionRecord,
  SessionStore,
  UserRecord,
  UserStore,
} from "../../auth/interfaces";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export class MemoryUserStore implements UserStore {
  private users = new Map<string, UserRecord>();

  async create(user: UserRecord): Promise<void> {
    this.users.set(user.id, { ...user, email: normalizeEmail(user.email) });
  }

  async getByEmail(email: string): Promise<UserRecord | null> {
    const normalized = normalizeEmail(email);
    for (const u of this.users.values()) {
      if (u.email === normalized) return u;
    }
    return null;
  }

  async getById(id: string): Promise<UserRecord | null> {
    return this.users.get(id) ?? null;
  }
}

export class MemorySessionStore implements SessionStore {
  private sessions = new Map<string, SessionRecord>();

  async create(session: SessionRecord): Promise<void> {
    this.sessions.set(session.id, session);
  }

  async get(id: string): Promise<SessionRecord | null> {
    const s = this.sessions.get(id);
    if (!s) return null;
    if (s.revokedAt) return null;
    if (new Date(s.expiresAt).getTime() <= Date.now()) return null;
    return s;
  }

  async revoke(id: string): Promise<void> {
    const s = this.sessions.get(id);
    if (s) this.sessions.set(id, { ...s, revokedAt: new Date().toISOString() });
  }
}