// AuthService — issues, validates and revokes opaque bearer-token sessions.
// The raw token is returned to the client once; only its SHA-256 hash is stored,
// so a leaked sessions table yields no usable credentials.

import { createHash, randomBytes } from "node:crypto";
import { verifyPassword } from "./password";
import type { SessionStore, UserStore } from "./interfaces";

export const DEFAULT_SESSION_TTL_MS = 24 * 60 * 60 * 1000;

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export interface AuthSession {
  id: string;
  userId: string;
  email: string;
  role: string;
}

export interface AuthServiceOptions {
  users: UserStore;
  sessions: SessionStore;
  now?: () => Date;
}

export class AuthService {
  private readonly users: UserStore;
  private readonly sessions: SessionStore;
  private readonly now: () => Date;

  constructor(options: AuthServiceOptions) {
    this.users = options.users;
    this.sessions = options.sessions;
    this.now = options.now ?? (() => new Date());
  }

  async authenticate(
    email: string,
    password: string,
  ): Promise<{ token: string; user: AuthUser } | null> {
    const normalized = email.trim().toLowerCase();
    const user = await this.users.getByEmail(normalized);
    if (!user || !verifyPassword(password, user.passwordHash)) return null;

    const token = `ses_${randomBytes(32).toString("hex")}`;
    const now = this.now();
    await this.sessions.create({
      id: hashToken(token),
      userId: user.id,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + DEFAULT_SESSION_TTL_MS).toISOString(),
      revokedAt: null,
    });

    return { token, user: { id: user.id, email: user.email, role: user.role } };
  }

  async validateSession(token: string): Promise<AuthSession | null> {
    const session = await this.sessions.get(hashToken(token));
    if (!session) return null;
    if (session.revokedAt) return null;
    if (new Date(session.expiresAt).getTime() <= this.now().getTime()) return null;

    const user = await this.users.getById(session.userId);
    if (!user) return null;

    return {
      id: session.id,
      userId: user.id,
      email: user.email,
      role: user.role,
    };
  }

  async revokeSession(token: string): Promise<void> {
    await this.sessions.revoke(hashToken(token));
  }
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}