import { describe, expect, it } from "vitest";
import {
  DEFAULT_STOREFRONT_TEMPLATE,
  isStorefrontTemplate,
  STOREFRONT_TEMPLATES,
} from "../registry";

describe("storefront template registry", () => {
  it("registers Miski2 and Miski3 alongside the existing templates", () => {
    expect(STOREFRONT_TEMPLATES).toEqual(["vanilla", "miski", "miski2", "miski3"]);
    expect(isStorefrontTemplate("miski2")).toBe(true);
    expect(isStorefrontTemplate("miski3")).toBe(true);
  });

  it("keeps the existing default template", () => {
    expect(DEFAULT_STOREFRONT_TEMPLATE).toBe("miski");
  });

  it("rejects unknown template identifiers", () => {
    expect(isStorefrontTemplate("unknown")).toBe(false);
  });
});
