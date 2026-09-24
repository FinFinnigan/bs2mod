import { describe, it, expect } from "vitest";
import { ACTIVE_SEASON_ID, CAMPAIGNS, getActiveSeason } from "../site";

describe("site / active season", () => {
  it("covers exactly the four campaign seasons", () => {
    expect(CAMPAIGNS.map((c) => c.id).sort()).toEqual(["autumn", "spring", "summer", "winter"]);
  });

  it("resolves the active season deterministically", () => {
    const season = getActiveSeason();
    expect(season.id).toBe(ACTIVE_SEASON_ID);
    expect(CAMPAIGNS.some((c) => c.id === ACTIVE_SEASON_ID)).toBe(true);
  });

  it("every campaign is fully copywritten", () => {
    for (const c of CAMPAIGNS) {
      expect(c.headline.length).toBeGreaterThan(0);
      expect(c.eyebrow.length).toBeGreaterThan(0);
      expect(c.subcopy.length).toBeGreaterThan(0);
      expect(c.ctaLabel.length).toBeGreaterThan(0);
      expect(c.ctaHref.startsWith("/")).toBe(true);
      expect(c.overlay.length).toBeGreaterThan(0);
      expect(c.chipRail.length).toBeGreaterThan(0);
      expect(c.productMix.collection.length).toBeGreaterThan(0);
      expect(c.productMix.heading.length).toBeGreaterThan(0);
      expect(c.productMix.ctaLabel.length).toBeGreaterThan(0);
      expect(c.productMix.ctaHref.startsWith("/")).toBe(true);
    }
  });
});