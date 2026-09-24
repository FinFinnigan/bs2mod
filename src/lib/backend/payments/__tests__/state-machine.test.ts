import { describe, it, expect } from "vitest";
import {
  canTransition,
  transition,
  isTerminal,
  isSettled,
} from "../state-machine";
import { InvalidTransitionError } from "../types";

describe("payment state machine", () => {
  it("allows the happy-path manual auth-capture flow", () => {
    expect(canTransition("created", "action_required")).toBe(true);
    expect(canTransition("action_required", "authorized")).toBe(true);
    expect(canTransition("authorized", "captured")).toBe(true);
    expect(canTransition("captured", "refunded")).toBe(true);
  });

  it("allows one-shot automatic capture (paid)", () => {
    expect(canTransition("created", "paid")).toBe(true);
    expect(canTransition("action_required", "paid")).toBe(true);
  });

  it("allows void before capture", () => {
    expect(canTransition("authorized", "voided")).toBe(true);
  });

  it("rejects illegal transitions", () => {
    expect(() => transition("created", "refunded")).toThrow(InvalidTransitionError);
    expect(() => transition("captured", "created")).toThrow(InvalidTransitionError);
    expect(() => transition("failed", "captured")).toThrow(InvalidTransitionError);
  });

  it("marks terminal and settled states correctly", () => {
    expect(isTerminal("captured")).toBe(false);
    expect(isTerminal("refunded")).toBe(true);
    expect(isTerminal("failed")).toBe(true);
    expect(isTerminal("cancelled")).toBe(true);

    expect(isSettled("captured")).toBe(true);
    expect(isSettled("paid")).toBe(true);
    expect(isSettled("authorized")).toBe(false);
  });

  it("supports partial then full refund", () => {
    expect(canTransition("captured", "partially_refunded")).toBe(true);
    expect(canTransition("partially_refunded", "refunded")).toBe(true);
  });
});
