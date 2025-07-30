import { describe, test, expect } from "vitest";
import { buildRentalRevenue } from "../revenueRental";

describe("Rental Revenue", () => {
  test("Hotel 150 rooms, ADR 800, 68 % occ.", () => {
    const row = buildRentalRevenue(
      { rooms:150, adr:800, occupancyRate:0.68, startPeriod:48, endPeriod:59, annualEscalation:0 },
      60
    );
    const m0 = row[48];
    expect(+m0.toFixed(0)).toBe(2_462_000);  // 150*800*0.68*30.4167
  });

  test("5 % escalation after 1 year", () => {
    const row = buildRentalRevenue(
      { rooms:1, adr:100, occupancyRate:1, startPeriod:12, endPeriod:24, annualEscalation:0.05 },
      30
    );
    expect(row[24]).toBeCloseTo(100*1.05*30.4167, 1);
  });
});