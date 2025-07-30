/** Convert a nominal annual rate (r_n) compounded m times per year
    into an effective annual rate (r_eff).                        */
export function nominalToEffective(
  nominalAnnual: number,          // e.g. 0.12  for 12 %
  compPerYear = 12                // e.g. 12 = monthly compounding
): number {
  if (compPerYear <= 0) throw new Error("compPerYear must be > 0");
  return Math.pow(1 + nominalAnnual / compPerYear, compPerYear) - 1;
}

/** Convert an effective annual rate (r_eff) to an equivalent
    nominal annual rate compounded m times per year.             */
export function effectiveToNominal(
  effectiveAnnual: number,
  compPerYear = 12
): number {
  if (compPerYear <= 0) throw new Error("compPerYear must be > 0");
  return compPerYear * (Math.pow(1 + effectiveAnnual, 1 / compPerYear) - 1);
}

/** Single-period interest factor for any (possibly fractional) period length. */
export function periodicFactor(
  annualRate: number,      // effective annual rate
  months: number           // e.g. 1 = monthly, 0.5 = half-month
): number {
  return Math.pow(1 + annualRate, months / 12);
}
