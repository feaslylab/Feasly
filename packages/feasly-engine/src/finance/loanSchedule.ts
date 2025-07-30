import { accrueInterestRow } from "./interestAccrual";

export interface LoanFacility {
  limit:            number;   // 40_000_000
  ltcPercent:       number;   // 0.70  (max draw = 70 % of cumulative cost)
  annualRate:       number;   // effective, e.g. 0.08
  startPeriod:      number;   // first draw
  maturityPeriod:   number;   // final repayment period
  interestOnly:     boolean;  // true = bullet repay at maturity
}

export interface LoanRows {
  balance: number[];
  draw:    number[];
  repay:   number[];
  interest:number[];
}

/** Build balance & cash rows given netCostRow (positive numbers). */
export function buildLoanSchedule(
  facility: LoanFacility,
  netCostRow: number[],        // positive construction outflow only
  timeline: number
): LoanRows {
  const bal   = Array(timeline).fill(0);
  const draw  = Array(timeline).fill(0);
  const repay = Array(timeline).fill(0);

  let cumCost = 0;
  for (let p = facility.startPeriod; p < timeline; p++) {
    cumCost += netCostRow[p] || 0;

    // draw formula: min(needed, limit, ltc cap)
    const ltcCap   = cumCost * facility.ltcPercent;
    const need     = ltcCap - bal[p];
    const availLim = facility.limit - bal[p];
    const toDraw   = Math.max(0, Math.min(need, availLim));

    draw[p]   = +toDraw.toFixed(2);
    bal[p]    = (bal[p-1] || 0) + draw[p];

    // balloon repayment at maturity
    if (p === facility.maturityPeriod) {
      repay[p] = bal[p];
      bal[p]   = 0;
    }

    // carry balance forward to next month
    if (p < timeline-1) bal[p+1] = bal[p];
  }

  const interest = accrueInterestRow(bal, facility.annualRate);
  return { balance: bal, draw, repay, interest };
}