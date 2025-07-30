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
    expect(result.current.slice(1,4)).toEqual([-400000,-400000,-400000]);
  });
});