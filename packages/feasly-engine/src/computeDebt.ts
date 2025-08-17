import Decimal from "decimal.js";
import { ProjectInputs } from "./types";

const z = (T: number) => Array.from({ length: T }, () => new Decimal(0));

export function computeDebt(params: {
  T: number;
  inputs: ProjectInputs;
  costs: { capex: Decimal[] };
}) {
  const { T, inputs, costs } = params;
  const tranches = inputs.debt ?? [];

  const draws = z(T), interest = z(T), principal = z(T), balance = z(T);
  const fees_upfront = z(T), fees_commitment = z(T), fees_ongoing = z(T);
  const dsra_balance = z(T), dsra_funding = z(T), dsra_release = z(T);

  const detailTr: any[] = [];

  // Sort tranches by draw priority
  for (const tr of tranches.sort((a, b) => a.draw_priority - b.draw_priority)) {
    const trDraws = z(T), trInt = z(T), trPrin = z(T), trBal = z(T);
    let bal = new Decimal(0);

    // Upfront fee at first draw
    let firstDrawDone = false;

    for (let t = 0; t < T; t++) {
      // Draws within availability window
      if (t >= tr.availability_start_m && t <= tr.availability_end_m) {
        const fundingNeed = costs.capex[t] || new Decimal(0);
        
        // Apply LTC limit if specified
        const allowed = tr.limit_ltc 
          ? fundingNeed.mul(tr.limit_ltc)
          : fundingNeed;
        
        if (allowed.gt(0)) {
          trDraws[t] = allowed;
          
          // Apply upfront fee on first draw
          if (!firstDrawDone && tr.upfront_fee_pct > 0) {
            fees_upfront[t] = fees_upfront[t].add(allowed.mul(tr.upfront_fee_pct));
            firstDrawDone = true;
          }
        }
      }

      // Interest calculation
      if (bal.gt(0)) {
        trInt[t] = bal.mul(tr.nominal_rate_pa / 12);
      }

      // Principal amortization
      if (tr.amort_type === "straight") {
        // Straight-line amortization over tenor
        if (t >= Math.max(0, T - tr.tenor_months) && bal.gt(0)) {
          trPrin[t] = bal.div(new Decimal(tr.tenor_months));
        }
      } else if (tr.amort_type === "bullet") {
        // Bullet payment at maturity
        if (t === T - 1 && bal.gt(0)) {
          trPrin[t] = bal;
        }
      } else if (tr.amort_type === "annuity") {
        // Annuity payment (constant debt service)
        if (bal.gt(0) && tr.tenor_months > 0) {
          const r = tr.nominal_rate_pa / 12;
          const n = tr.tenor_months;
          if (r > 0) {
            const pmt = bal.mul(r).div(new Decimal(1).minus(new Decimal(1 + r).pow(-n)));
            const intPart = bal.mul(r);
            trPrin[t] = Decimal.max(new Decimal(0), pmt.minus(intPart));
          } else {
            // Zero interest case
            trPrin[t] = bal.div(new Decimal(n));
          }
        }
      }

      // Update balance
      bal = bal.add(trDraws[t]).minus(trPrin[t]);
      trBal[t] = bal;

      // Ongoing fees on outstanding balance
      if (bal.gt(0) && tr.ongoing_fee_pct_pa > 0) {
        fees_ongoing[t] = fees_ongoing[t].add(bal.mul(tr.ongoing_fee_pct_pa / 12));
      }

      // Commitment fees on undrawn facility (simplified - assume facility equals total capex for now)
      const totalCapex = costs.capex.reduce((sum, val) => sum.add(val), new Decimal(0));
      const drawnToDate = Array.from({ length: t + 1 }, (_, i) => trDraws[i] || new Decimal(0))
        .reduce((sum, val) => sum.add(val), new Decimal(0));
      const undrawn = Decimal.max(new Decimal(0), totalCapex.minus(drawnToDate));
      
      if (undrawn.gt(0) && tr.fee_commitment_pct_pa > 0) {
        fees_commitment[t] = fees_commitment[t].add(undrawn.mul(tr.fee_commitment_pct_pa / 12));
      }

      // Aggregate to portfolio level
      draws[t] = draws[t].add(trDraws[t]);
      interest[t] = interest[t].add(trInt[t]);
      principal[t] = principal[t].add(trPrin[t]);
      balance[t] = balance[t].add(trBal[t]);
    }

    detailTr.push({
      key: tr.key,
      draws: trDraws,
      interest: trInt,
      principal: trPrin,
      balance: trBal
    });
  }

  // DSRA logic (simplified - 3 months of debt service target)
  for (let t = 0; t < T; t++) {
    const currentDebtService = interest[t].add(principal[t]);
    
    // Target DSRA: 3 months of forward-looking debt service
    const forwardPeriods = Math.min(3, T - t);
    let targetDSRA = new Decimal(0);
    for (let i = 0; i < forwardPeriods; i++) {
      if (t + i < T) {
        targetDSRA = targetDSRA.add(interest[t + i] || new Decimal(0))
          .add(principal[t + i] || new Decimal(0));
      }
    }

    const prevDSRA = t > 0 ? dsra_balance[t - 1] : new Decimal(0);
    
    if (prevDSRA.lt(targetDSRA)) {
      // Need to fund DSRA
      dsra_funding[t] = targetDSRA.minus(prevDSRA);
    } else if (prevDSRA.gt(targetDSRA)) {
      // Can release excess DSRA
      dsra_release[t] = prevDSRA.minus(targetDSRA);
    }
    
    dsra_balance[t] = prevDSRA.add(dsra_funding[t]).minus(dsra_release[t]);
  }

  return {
    draws,
    interest,
    principal,
    balance,
    fees_upfront,
    fees_commitment,
    fees_ongoing,
    dsra_balance,
    dsra_funding,
    dsra_release,
    detail: { tranches: detailTr }
  };
}