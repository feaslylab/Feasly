import { periodicFactor } from "./interest";

/** Build a monthly interest-expense row for a loan balance array.
    • balanceRow[t] = loan balance **at BEGINNING** of period t
    • annualRate    = effective annual rate (e.g. 0.08 = 8 %)
    Returns new array interestRow[length = balanceRow.length]            */
export function accrueInterestRow(
  balanceRow: number[],
  annualRate: number
): number[] {
  return balanceRow.map((bal) =>
    +(bal * (periodicFactor(annualRate, 1) - 1)).toFixed(2)
  );
}

