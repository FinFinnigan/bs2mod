// Role-based access control — pure role/ability model. No next/server, no
// container, no database imports: this module is unit-testable in isolation and
// safe to import from anywhere (including Edge contexts).

export const ROLES = ["admin", "staff", "customer"] as const;
export type Role = (typeof ROLES)[number];

// The anonymous pseudo-role. Guests are not a stored role; they are the absence
// of a session. Granting an ability to GUEST makes it available to anonymous
// callers (and to every authenticated role).
export const GUEST = "guest";
export type PrincipalRole = Role | typeof GUEST;

export const ABILITIES = {
  cartWrite: "cart:write",
  checkoutCreate: "checkout:create",
  staffMutate: "staff:mutate",
  adminMutate: "admin:mutate",
  orderRead: "orders:read",
} as const;
export type Ability = (typeof ABILITIES)[keyof typeof ABILITIES];

// Which principals may perform each ability. GUEST entries make the ability
// available to anonymous callers; every authenticated role is also granted the
// guest abilities (a logged-in shopper can still use the cart and checkout).
const ABILITY_GRANTS: Record<Ability, readonly string[]> = {
  "cart:write": [GUEST, "admin", "staff", "customer"],
  "checkout:create": [GUEST, "admin", "staff", "customer"],
  "staff:mutate": ["admin", "staff"],
  "admin:mutate": ["admin"],
  "orders:read": ["admin", "staff"],
};

// Explicit ability list so abilitiesFor() needs no key casts.
const ABILITY_LIST: readonly Ability[] = [
  ABILITIES.cartWrite,
  ABILITIES.checkoutCreate,
  ABILITIES.staffMutate,
  ABILITIES.adminMutate,
  ABILITIES.orderRead,
];

// Lower rank = more privileged. admin(0) ⊃ staff(1) ⊃ customer(2).
const ROLE_RANK: Record<Role, number> = { admin: 0, staff: 1, customer: 2 };

export function isRole(value: string): value is Role {
  return ROLES.some((r) => r === value);
}

export function roleRank(role: string): number | null {
  return isRole(role) ? ROLE_RANK[role] : null;
}

export function can(role: string, ability: Ability): boolean {
  return ABILITY_GRANTS[ability].includes(role);
}

export function abilitiesFor(role: string): Ability[] {
  if (!isRole(role) && role !== GUEST) return [];
  return ABILITY_LIST.filter((a) => can(role, a));
}