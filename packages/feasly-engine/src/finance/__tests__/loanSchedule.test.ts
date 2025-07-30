import { describe, test, expect } from "vitest";
import { buildLoanSchedule } from "../loanSchedule";

describe("Loan Schedule", () => {
  test("70 % LTC draw vs cost", () => {
    const cost = Array(10).fill(0); cost[0] = 1_000_000; cost[1] = 2_000_000;
    const rows = buildLoanSchedule(
      { limit:10_000_000, ltcPercent:0.70, annualRate:0.12,
        startPeriod:0, maturityPeriod:9, interestOnly:true },
      cost, 10
    );
    // after P1 cumulative cost = 3 M → 70 % = 2.1 M balance
    expect(rows.balance[1]).toBeCloseTo(2_100_000,0);
    // balloon repay at P9
    expect(rows.repay[9]).toBeCloseTo(rows.balance[8],0);
  });
});