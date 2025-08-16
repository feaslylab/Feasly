import Decimal from "decimal.js";
import { ProjectInputs } from "./types";

export type FinancingBlock = {
  draws: Decimal[];          // +ve cash in (portfolio total)
  interest: Decimal[];       // cash interest paid (portfolio total)
  principal: Decimal[];      // repayments (portfolio total)
  balance: Decimal[];        // end-of-period outstanding (portfolio total)
  fees_upfront: Decimal[];   // upfront fees on draws (portfolio total)
  fees_ongoing: Decimal[];   // ongoing fees on undrawn commitment (portfolio total)
  dsra_balance: Decimal[];   // DSRA balance (portfolio total)
  dsra_funding: Decimal[];   // cash to fund DSRA (portfolio total)
  dsra_release: Decimal[];   // cash released from DSRA (portfolio total)
  detail: Record<string, unknown>;
};

function zeros(T: number) { return Array.from({ length: T }, () => new Decimal(0)); }

/** PMT-style annuity payment per month: rate_m, tenor_m, principal */
function pmtMonthly(rate_m: Decimal, n: number, pv: Decimal): Decimal {
  if (rate_m.eq(0)) return pv.div(n);
  const one = new Decimal(1);
  const num = rate_m.mul(pv);
  const den = one.minus(one.plus(rate_m).pow(-n));
  return num.div(den);
}

/** Allocate funding need across tranches by priority, respecting availability and limits */
function allocateDraws(
  fundingNeed: Decimal[], 
  tranches: any[], 
  totalCapex: Decimal
): Record<string, Decimal[]> {
  const T = fundingNeed.length;
  const allocation: Record<string, Decimal[]> = {};
  
  // Initialize allocations
  for (const tranche of tranches) {
    allocation[tranche.key] = zeros(T);
  }
  
  // Sort by priority
  const sortedTranches = [...tranches].sort((a, b) => a.draw_priority - b.draw_priority);
  
  for (let t = 0; t < T; t++) {
    let remaining = fundingNeed[t];
    
    for (const tranche of sortedTranches) {
      if (remaining.lte(0)) break;
      
      // Check availability window
      const start = tranche.availability_start_m ?? 0;
      const end = tranche.availability_end_m ?? T - 1;
      if (t < start || t > end) continue;
      
      // Calculate capacity (simplified LTC check)
      const ltc = tranche.limit_ltc ?? 0;
      const capacity = totalCapex.mul(ltc);
      
      // Get cumulative drawn so far for this tranche
      let cumDrawn = new Decimal(0);
      for (let i = 0; i < t; i++) {
        cumDrawn = cumDrawn.add(allocation[tranche.key][i]);
      }
      
      const available = Decimal.max(capacity.minus(cumDrawn), new Decimal(0));
      const draw = Decimal.min(remaining, available);
      
      allocation[tranche.key][t] = draw;
      remaining = remaining.minus(draw);
    }
  }
  
  return allocation;
}

/** Build schedule for a single tranche */
function trancheSchedule(
  tranche: any,
  draws: Decimal[],
  T: number
): {
  interest: Decimal[];
  principal: Decimal[];
  balance: Decimal[];
  fees_upfront: Decimal[];
  fees_ongoing: Decimal[];
  dsra_balance: Decimal[];
  dsra_funding: Decimal[];
  dsra_release: Decimal[];
} {
  const interest = zeros(T);
  const principal = zeros(T);
  const balance = zeros(T);
  const fees_upfront = zeros(T);
  const fees_ongoing = zeros(T);
  const dsra_balance = zeros(T);
  const dsra_funding = zeros(T);
  const dsra_release = zeros(T);

  const rate_m = new Decimal(tranche.nominal_rate_pa).div(12);
  const upfront_pct = new Decimal(tranche.upfront_fee_pct ?? 0);
  const ongoing_pct = new Decimal(tranche.ongoing_fee_pct_pa ?? 0).div(12);
  const dsra_months = tranche.dsra_months ?? 0;
  
  let bal = new Decimal(0);
  let dsra_bal = new Decimal(0);
  let cumDrawn = new Decimal(0);

  // Find last draw for amortization start
  const lastDrawIdx = (() => {
    let idx = -1;
    for (let t = 0; t < T; t++) if (!draws[t].isZero()) idx = t;
    return idx;
  })();

  for (let t = 0; t < T; t++) {
    // Process draw
    const draw = draws[t];
    bal = bal.add(draw);
    cumDrawn = cumDrawn.add(draw);
    
    // Upfront fees on draws
    fees_upfront[t] = draw.mul(upfront_pct);
    
    // Ongoing fees on undrawn commitment during availability
    const start = tranche.availability_start_m ?? 0;
    const end = tranche.availability_end_m ?? T - 1;
    if (t >= start && t <= end) {
      const ltc = tranche.limit_ltc ?? 0;
      const capacity = new Decimal(ltc); // Simplified - should use project value
      const undrawn = Decimal.max(capacity.minus(cumDrawn), new Decimal(0));
      fees_ongoing[t] = undrawn.mul(ongoing_pct);
    }
    
    // Interest on opening balance
    const int_t = bal.mul(rate_m);
    interest[t] = int_t;
    bal = bal.add(int_t);
    
    // DSRA logic
    if (dsra_months > 0 && !bal.isZero()) {
      const monthlyCharge = tranche.dsra_on === "interest_plus_fees" 
        ? int_t.add(fees_ongoing[t])
        : int_t;
      const target = monthlyCharge.mul(dsra_months);
      
      if (dsra_bal.lt(target)) {
        const funding = target.minus(dsra_bal);
        dsra_funding[t] = funding;
        dsra_bal = dsra_bal.add(funding);
      }
    }
    
    // Principal repayments
    if (tranche.amort_type === "bullet") {
      const mat = Math.min(lastDrawIdx + (tranche.tenor_months ?? 0), T - 1);
      if (t === mat) {
        principal[t] = bal;
        bal = new Decimal(0);
        // Release DSRA at maturity
        dsra_release[t] = dsra_bal;
        dsra_bal = new Decimal(0);
      }
    } else {
      // Annuity
      const t0 = lastDrawIdx + 1;
      if (t >= t0 && t < t0 + (tranche.tenor_months ?? 0)) {
        const payment = pmtMonthly(rate_m, tranche.tenor_months ?? 0, bal);
        const principalPortion = Decimal.max(payment.minus(int_t), new Decimal(0));
        principal[t] = principalPortion;
        bal = bal.minus(principalPortion);
      }
    }
    
    balance[t] = Decimal.max(bal, new Decimal(0));
    dsra_balance[t] = dsra_bal;
  }

  return {
    interest, principal, balance, fees_upfront, fees_ongoing,
    dsra_balance, dsra_funding, dsra_release
  };
}

export function computeFinancing(inputs: ProjectInputs, capex: Decimal[]): FinancingBlock {
  const T = inputs.project.periods;
  const totalCapex = capex.reduce((a, b) => a.add(b), new Decimal(0));
  
  // Initialize portfolio arrays
  const draws = zeros(T);
  const interest = zeros(T);
  const principal = zeros(T);
  const balance = zeros(T);
  const fees_upfront = zeros(T);
  const fees_ongoing = zeros(T);
  const dsra_balance = zeros(T);
  const dsra_funding = zeros(T);
  const dsra_release = zeros(T);
  
  const detail: Record<string, unknown> = { tranches: [] };

  if (!inputs.debt?.length) {
    return { 
      draws, interest, principal, balance, 
      fees_upfront, fees_ongoing, dsra_balance, dsra_funding, dsra_release, 
      detail 
    };
  }

  // Plan funding need (simple LTC approach for now)
  const fundingNeed = zeros(T);
  for (let t = 0; t < T; t++) {
    // Sum all tranches' LTC to get total funding ratio
    const totalLTC = inputs.debt.reduce((sum, tr) => sum + (tr.limit_ltc ?? 0), 0);
    fundingNeed[t] = capex[t].mul(totalLTC);
  }

  // Allocate draws across tranches
  const drawAllocation = allocateDraws(fundingNeed, inputs.debt, totalCapex);

  // Process each tranche
  const trancheResults: any[] = [];
  for (const tranche of inputs.debt) {
    const trancheDraws = drawAllocation[tranche.key];
    const schedule = trancheSchedule(tranche, trancheDraws, T);
    
    // Aggregate to portfolio level
    for (let t = 0; t < T; t++) {
      draws[t] = draws[t].add(trancheDraws[t]);
      interest[t] = interest[t].add(schedule.interest[t]);
      principal[t] = principal[t].add(schedule.principal[t]);
      balance[t] = balance[t].add(schedule.balance[t]);
      fees_upfront[t] = fees_upfront[t].add(schedule.fees_upfront[t]);
      fees_ongoing[t] = fees_ongoing[t].add(schedule.fees_ongoing[t]);
      dsra_balance[t] = dsra_balance[t].add(schedule.dsra_balance[t]);
      dsra_funding[t] = dsra_funding[t].add(schedule.dsra_funding[t]);
      dsra_release[t] = dsra_release[t].add(schedule.dsra_release[t]);
    }

    trancheResults.push({
      key: tranche.key,
      draws: trancheDraws.map(d => d.toNumber()),
      ...Object.fromEntries(
        Object.entries(schedule).map(([k, v]) => [k, (v as Decimal[]).map(x => x.toNumber())])
      )
    });
  }

  detail.tranches = trancheResults;

  return { 
    draws, interest, principal, balance, 
    fees_upfront, fees_ongoing, dsra_balance, dsra_funding, dsra_release, 
    detail 
  };
}