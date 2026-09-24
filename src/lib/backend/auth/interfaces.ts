// Auth store interfaces — the DB/adapter boundary for users and sessions.
// Application services depend on THESE interfaces, never on Drizzle/Neon
// directly (same rule as the other repository interfaces).

export interface UserRecord {
  id: string;
  email: string; // normalized: trimmed + lowercase
  passwordHash: string; // scrypt$N$r$p$salt$hash
  role: string; // "admin" | "customer"
  createdAt: string;
}

export interface SessionRecord {
  id: string; // SHA-256 hex of the raw bearer token
  userId: string;
  createdAt: string;
  expiresAt: string;
  revokedAt: string | null;
}

export interface UserStore {
  create(user: UserRecord): Promise<void>;
  getByEmail(email: string): Promise<UserRecord | null>;
  getById(id: string): Promise<UserRecord | null>;
}

export interface SessionStore {
  create(session: SessionRecord): Promise<void>;
  get(id: string): Promise<SessionRecord | null>;
  revoke(id: string): Promise<void>;
}