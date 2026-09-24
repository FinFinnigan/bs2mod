// In-memory settings repository — used when no DATABASE_URL is present so the
// storefront template switch still works in static/mock builds. Not persisted.

import type { SettingsRepository } from "../interfaces";

export class MemorySettingsRepository implements SettingsRepository {
  private store = new Map<string, unknown>();

  async get(key: string): Promise<unknown | undefined> {
    return this.store.get(key);
  }

  async set(key: string, value: unknown): Promise<void> {
    this.store.set(key, value);
  }
}