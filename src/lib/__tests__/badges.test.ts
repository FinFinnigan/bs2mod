import { describe, it, expect } from "vitest";
import { BADGE_PRIORITY, pickPrimaryBadge } from "../badges";

describe("pickPrimaryBadge", () => {
  it("returns undefined when no badges apply", () => {
    expect(pickPrimaryBadge([])).toBeUndefined();
  });

  it("returns the single badge when one applies", () => {
    expect(pickPrimaryBadge(["sale"])).toBe("sale");
  });

  it("picks the highest-priority badge when several apply", () => {
    expect(pickPrimaryBadge(["bestseller", "sale"])).toBe("sale");
    expect(pickPrimaryBadge(["limited", "new"])).toBe("new");
    expect(pickPrimaryBadge(["bestseller", "new", "sale"])).toBe("new");
  });

  it("declares the priority order from design-direction §6.3", () => {
    expect(BADGE_PRIORITY).toEqual(["new", "sale", "bestseller", "limited"]);
  });
});