import { describe, test, expect } from "vitest";
import { accrueInterestRow } from "../interestAccrual";

describe("Interest Accrual", () => {
  test("8 % eff → 0.643 % monthly", () => {
    const row = accrueInterestRow([1_000_000], 0.08);
    expect(+row[0].toFixed(0)).toBe(6430);   // 1,000,000 ×(1+0.08)^(1/12)-1
  });
});