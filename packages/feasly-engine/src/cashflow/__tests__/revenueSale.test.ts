import { describe, test, expect } from "vitest";
import { buildSaleRevenue } from "../revenueSale";

describe("Revenue Sale", () => {
  test("80 units @1.6 M P24-36 no escalation", () => {
    const row = buildSaleRevenue(
      { units:80, pricePerUnit:1_600_000, startPeriod:24, endPeriod:36, escalation:0 },
      60
    );
    const sum = row.reduce((a,b)=>a+b,0);
    expect(sum).toBe(128_000_000);
  });

  test("compound escalation 4 %", () => {
    const row = buildSaleRevenue(
      { units:80, pricePerUnit:1_600_000, startPeriod:24, endPeriod:36, escalation:0.04 },
      60
    );
    const sum = +row.reduce((a,b)=>a+b,0).toFixed(0);
    expect(sum).toBe(133_120_000);   // 128 M ×1.04
  });
});