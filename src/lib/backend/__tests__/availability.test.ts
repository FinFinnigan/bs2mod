import { describe, it, expect } from "vitest";
import { isInStock } from "../availability";

describe("isInStock", () => {
  it("returns false when there are no variants", () => {
    expect(isInStock([])).toBe(false);
  });

  it("returns false when every variant has zero stock", () => {
    expect(isInStock([{ stock: 0 }, { stock: 0 }])).toBe(false);
  });

  it("returns false when every variant has negative stock", () => {
    expect(isInStock([{ stock: -1 }, { stock: -2 }])).toBe(false);
  });

  it("returns true when at least one variant has stock above zero", () => {
    expect(isInStock([{ stock: 0 }, { stock: 5 }])).toBe(true);
  });
});