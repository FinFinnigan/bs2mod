import type { Badge } from "./types";

// Single-badge priority for the PDP, per design-direction §6.3
// ("Max one badge: 'New' · 'Sale' · 'Bestseller' · 'Limited'").
export const BADGE_PRIORITY: Badge[] = ["new", "sale", "bestseller", "limited"];

/** Returns the single highest-priority badge, or undefined when none apply. */
export function pickPrimaryBadge(badges: Badge[]): Badge | undefined {
  for (const badge of BADGE_PRIORITY) {
    if (badges.includes(badge)) return badge;
  }
  return undefined;
}