import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useFeaslyCalc } from "../useFeaslyCalc";

describe("useFeaslyCalc", () => {
  it("aggregates construction rows", () => {
    const { result } = renderHook(() =>
      useFeaslyCalc([{
        baseCost: 1_200_000,
        startPeriod: 1,
        endPeriod: 3,
        escalationRate: 0,
        retentionPercent: 0,
        retentionReleaseLag: 0
      }], 6)
    );
    expect(result.current.cash.slice(1,4)).toEqual([-406430,-406430,-406430]); // construction + interest
  });

  it("adds revenue lines as positive cash flow", () => {
    const { result } = renderHook(() =>
      useFeaslyCalc([], 40, 0.10, [{
        units: 10,
        pricePerUnit: 100_000,
        startPeriod: 24,
        endPeriod: 26,
        escalation: 0
      }])
    );
    // Revenue should appear as positive in periods 24-26
    expect(result.current.cash[24]).toBeGreaterThan(0);
    expect(result.current.cash[25]).toBeGreaterThan(0);
    expect(result.current.cash[26]).toBeGreaterThan(0);
    // Total revenue should equal units * pricePerUnit
    const totalRevenue = result.current.cash.reduce((sum, val) => sum + Math.max(0, val), 0);
    expect(totalRevenue).toBeCloseTo(1_000_000, -3); // 10 * 100k with interest offset
  });

  it("adds rental revenue as positive cash flow at P48", () => {
    const { result } = renderHook(() =>
      useFeaslyCalc([], 60, 0.10, [], [{
        rooms: 10,
        adr: 100,
        occupancyRate: 0.8,
        startPeriod: 48,
        endPeriod: 50,
        annualEscalation: 0
      }])
    );
    // Rental revenue should appear as positive in period 48
    expect(result.current.cash[48]).toBeGreaterThan(0);
    expect(result.current.cash[48]).toBeCloseTo(10 * 100 * 0.8 * 30.4167, 1); // rooms * adr * occ * days
  });

  it("adds loan draw as positive cash flow when loan enabled", () => {
    const { result } = renderHook(() =>
      useFeaslyCalc([{
        baseCost: 1_000_000,
        startPeriod: 0,
        endPeriod: 0,
        escalationRate: 0,
        retentionPercent: 0,
        retentionReleaseLag: 0
      }], 10, 0.10, [], [], {
        limit: 10_000_000,
        ltcPercent: 0.70,
        annualRate: 0.08,
        startPeriod: 0,
        maturityPeriod: 9,
        interestOnly: true
      })
    );
    // Loan draw should make cash flow positive in period 0
    expect(result.current.cash[0]).toBeGreaterThan(0);
    expect(result.current.loanRows?.draw[0]).toBeCloseTo(700_000, 0); // 70% of 1M cost
  });
});