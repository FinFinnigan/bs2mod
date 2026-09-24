import { describe, it, expect } from "vitest";
import {
  canTransition,
  transition,
  isTerminal,
  isMoneyConfirmed,
} from "../state-machine";
import { InvalidOrderTransitionError } from "../types";

describe("order state machine", () => {
  it("allows the happy path placed → confirmed → fulfilled", () => {
    expect(canTransition("placed", "confirmed")).toBe(true);
    expect(canTransition("confirmed", "fulfilled")).toBe(true);
  });

  it("allows draft → placed", () => {
    expect(canTransition("draft", "placed")).toBe(true);
  });

  it("allows cancel from placed and confirmed", () => {
    expect(canTransition("placed", "cancelled")).toBe(true);
    expect(canTransition("confirmed", "cancelled")).toBe(true);
  });

  it("allows failure from placed", () => {
    expect(canTransition("placed", "failed")).toBe(true);
  });

  it("rejects illegal transitions", () => {
    expect(() => transition("placed", "fulfilled")).toThrow(InvalidOrderTransitionError);
    expect(() => transition("confirmed", "failed")).toThrow(InvalidOrderTransitionError);
    expect(() => transition("failed", "placed")).toThrow(InvalidOrderTransitionError);
    expect(() => transition("cancelled", "placed")).toThrow(InvalidOrderTransitionError);
    expect(() => transition("fulfilled", "cancelled")).toThrow(InvalidOrderTransitionError);
  });

  it("marks terminal and money-confirmed states correctly", () => {
    expect(isTerminal("placed")).toBe(false);
    expect(isTerminal("confirmed")).toBe(false);
    expect(isTerminal("fulfilled")).toBe(true);
    expect(isTerminal("cancelled")).toBe(true);
    expect(isTerminal("failed")).toBe(true);

    expect(isMoneyConfirmed("confirmed")).toBe(true);
    expect(isMoneyConfirmed("placed")).toBe(false);
    expect(isMoneyConfirmed("fulfilled")).toBe(false);
  });
});

describe("order state machine — refunds (ADM-004)", () => {
  it("allows confirmed → refunded", () => {
    expect(canTransition("confirmed", "refunded")).toBe(true);
  });

  it("marks refunded as terminal", () => {
    expect(isTerminal("refunded")).toBe(true);
  });

  it("rejects every transition out of refunded", () => {
    expect(() => transition("refunded", "placed")).toThrow(InvalidOrderTransitionError);
    expect(() => transition("refunded", "confirmed")).toThrow(InvalidOrderTransitionError);
    expect(() => transition("refunded", "fulfilled")).toThrow(InvalidOrderTransitionError);
    expect(() => transition("refunded", "cancelled")).toThrow(InvalidOrderTransitionError);
    expect(() => transition("refunded", "failed")).toThrow(InvalidOrderTransitionError);
  });

  it("does not treat refunded as money confirmed", () => {
    expect(isMoneyConfirmed("refunded")).toBe(false);
  });
});