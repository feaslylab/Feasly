import Decimal from "decimal.js";
import { ProjectInputs, EquityBlock, EquityClass, EquityInvestor } from "./types";

const z = (T: number) => Array.from({ length: T }, () => new Decimal(0));

interface EquityParams {
  T: number;
  inputs: ProjectInputs;
  balance_sheet: { nbv: Decimal[] };
  cash: { project: Decimal[] };
}

// Utility: monthly rate from annual
function rateMonthlyFromAnnual(pa: Decimal): Decimal {
  return Decimal.pow(new Decimal(1).add(pa), new Decimal(1).div(12)).minus(1);
}

// IRR solver (returns monthly IRR as number or null)
function solveIRR(cfs: Decimal[]): number | null {
  if (cfs.length === 0) return null;
  
  // Check if all cashflows are zero or same sign
  const nonZero = cfs.filter(cf => !cf.isZero());
  if (nonZero.length === 0) return null;
  
  const hasPositive = nonZero.some(cf => cf.gt(0));
  const hasNegative = nonZero.some(cf => cf.lt(0));
  if (!hasPositive || !hasNegative) return null;

  // NPV function
  const npv = (rate: number): number => {
    let sum = new Decimal(0);
    for (let t = 0; t < cfs.length; t++) {
      const discountFactor = new Decimal(1 + rate).pow(-t);
      sum = sum.add(cfs[t].mul(discountFactor));
    }
    return sum.toNumber();
  };

  // NPV derivative function
  const npvDerivative = (rate: number): number => {
    let sum = new Decimal(0);
    for (let t = 1; t < cfs.length; t++) {
      const factor = new Decimal(-t).mul(cfs[t]).div(new Decimal(1 + rate).pow(t + 1));
      sum = sum.add(factor);
    }
    return sum.toNumber();
  };

  // Newton-Raphson method
  let rate = 0.1; // Initial guess: 10% monthly
  for (let iter = 0; iter < 8; iter++) {
    const f = npv(rate);
    const df = npvDerivative(rate);
    
    if (Math.abs(f) < 1e-8) return rate;
    if (Math.abs(df) < 1e-12) break; // Derivative too small, switch to bisection
    
    const newRate = rate - f / df;
    if (Math.abs(newRate - rate) < 1e-10) return newRate;
    if (newRate < -0.9999 || newRate > 10) break; // Out of bounds, switch to bisection
    
    rate = newRate;
  }

  // Fallback to bisection method
  let lo = -0.9999, hi = 10;
  const npvLo = npv(lo);
  const npvHi = npv(hi);
  
  if (npvLo * npvHi > 0) return null; // No sign change

  for (let iter = 0; iter < 64; iter++) {
    const mid = (lo + hi) / 2;
    const npvMid = npv(mid);
    
    if (Math.abs(npvMid) < 1e-8 || Math.abs(hi - lo) < 1e-10) return mid;
    
    if (npvMid * npvLo < 0) {
      hi = mid;
    } else {
      lo = mid;
    }
  }

  return null;
}

// Try IRR with a hypothetical LP tier allocation x in month t
function lpIrrWithTierX(lpCash: Decimal[], t: number, xLP: Decimal): number | null {
  const cfs = lpCash.map(d => d); // clone
  cfs[t] = cfs[t].add(xLP);
  return solveIRR(cfs);
}

// Allocate Return of Capital pro-rata by unreturned capital
function allocateROC(params: {
  remaining: Decimal;
  classInvestors: EquityInvestor[];
  unreturnedByInvestor: Record<string, Decimal>;
  t: number;
  distsByInvestor: Record<string, Decimal[]>;
  investorDistributed: Record<string, Decimal>;
  lpCashflows: Decimal[];
}): Decimal {
  const { remaining, classInvestors, unreturnedByInvestor, t, distsByInvestor, investorDistributed, lpCashflows } = params;
  
  const totalUnreturned = classInvestors.reduce((sum, inv) => sum.add(unreturnedByInvestor[inv.key] || new Decimal(0)), new Decimal(0));
  
  if (totalUnreturned.lte(0) || remaining.lte(0)) return remaining;
  
  const rocPayment = Decimal.min(remaining, totalUnreturned);
  
  for (const inv of classInvestors) {
    const invUnreturned = unreturnedByInvestor[inv.key] || new Decimal(0);
    if (invUnreturned.gt(0)) {
      const invShare = invUnreturned.div(totalUnreturned);
      const invROC = rocPayment.mul(invShare);
      
      distsByInvestor[inv.key][t] = distsByInvestor[inv.key][t].add(invROC);
      investorDistributed[inv.key] = investorDistributed[inv.key].add(invROC);
      unreturnedByInvestor[inv.key] = unreturnedByInvestor[inv.key].minus(invROC);
      
      // Add to LP cashflows if LP investor
      if (inv.role === "lp") {
        lpCashflows[t] = lpCashflows[t].add(invROC);
      }
    }
  }
  
  return remaining.minus(rocPayment);
}

// Allocate Preferred Return to LPs only, pro-rata by LP commitments
function allocatePref(params: {
  remaining: Decimal;
  prefBalance: Decimal;
  lpInvestors: EquityInvestor[];
  t: number;
  distsByInvestor: Record<string, Decimal[]>;
  investorDistributed: Record<string, Decimal>;
  lpCashflows: Decimal[];
}): { remaining: Decimal; prefPaid: Decimal } {
  const { remaining, prefBalance, lpInvestors, t, distsByInvestor, investorDistributed, lpCashflows } = params;
  
  if (remaining.lte(0) || prefBalance.lte(0) || lpInvestors.length === 0) {
    return { remaining, prefPaid: new Decimal(0) };
  }
  
  const prefPayment = Decimal.min(remaining, prefBalance);
  const totalLPCommitment = lpInvestors.reduce((sum, inv) => sum.add(inv.commitment), new Decimal(0));
  
  if (totalLPCommitment.gt(0)) {
    for (const inv of lpInvestors) {
      const invShare = new Decimal(inv.commitment).div(totalLPCommitment);
      const invPref = prefPayment.mul(invShare);
      
      distsByInvestor[inv.key][t] = distsByInvestor[inv.key][t].add(invPref);
      investorDistributed[inv.key] = investorDistributed[inv.key].add(invPref);
      lpCashflows[t] = lpCashflows[t].add(invPref);
    }
  }
  
  return { remaining: remaining.minus(prefPayment), prefPaid: prefPayment };
}

// Exact GP catch-up using formula: Y = (τA - G)/(1 - τ)
function allocateCatchupExact(params: {
  remaining: Decimal;
  targetGP: Decimal;
  excessA: Decimal;
  gpG: Decimal;
  gpInvestors: EquityInvestor[];
  t: number;
  distsByInvestor: Record<string, Decimal[]>;
  investorDistributed: Record<string, Decimal>;
  gpPromote: Decimal[];
}): { remaining: Decimal; catchupPaid: Decimal } {
  const { remaining, targetGP, excessA, gpG, gpInvestors, t, distsByInvestor, investorDistributed, gpPromote } = params;
  
  const one = new Decimal(1);
  if (targetGP.lte(0) || targetGP.gte(1) || remaining.lte(0) || gpInvestors.length === 0) {
    return { remaining, catchupPaid: new Decimal(0) };
  }

  const numerator = targetGP.mul(excessA).minus(gpG);
  const denom = one.minus(targetGP);
  let Y = numerator.div(denom);
  if (Y.lte(0)) return { remaining, catchupPaid: new Decimal(0) };

  const catchupPay = Decimal.min(remaining, Y);
  
  // Allocate 100% to GP(s) - split evenly among GPs
  const perGP = gpInvestors.length > 0 ? catchupPay.div(gpInvestors.length) : new Decimal(0);
  
  for (const gp of gpInvestors) {
    distsByInvestor[gp.key][t] = distsByInvestor[gp.key][t].add(perGP);
    investorDistributed[gp.key] = investorDistributed[gp.key].add(perGP);
  }
  
  gpPromote[t] = gpPromote[t].add(catchupPay);
  
  return { remaining: remaining.minus(catchupPay), catchupPaid: catchupPay };
}

// Exact tier allocation with IRR boundary using binary search
function allocateTierExact(params: {
  remaining: Decimal;
  splitLP: Decimal;
  splitGP: Decimal;
  rMonthly: number;
  t: number;
  lpCash: Decimal[];
  lpInvestors: EquityInvestor[];
  gpInvestors: EquityInvestor[];
  distsByInvestor: Record<string, Decimal[]>;
  investorDistributed: Record<string, Decimal>;
  gpPromote: Decimal[];
}): Decimal {
  const { remaining, splitLP, splitGP, rMonthly, t, lpCash, lpInvestors, gpInvestors, distsByInvestor, investorDistributed, gpPromote } = params;
  
  if (remaining.lte(0)) return remaining;

  // Normalize splits if they don't sum to 1
  const totalSplit = splitLP.add(splitGP);
  const normSplitLP = totalSplit.gt(0) ? splitLP.div(totalSplit) : splitLP;
  const normSplitGP = totalSplit.gt(0) ? splitGP.div(totalSplit) : splitGP;

  // Quick checks
  const irr0 = solveIRR(lpCash);
  if (irr0 != null && irr0 >= rMonthly) return remaining; // already at/over hurdle

  const allLP = remaining.mul(normSplitLP);
  const irrAll = lpIrrWithTierX(lpCash, t, allLP);
  if (irrAll == null || irrAll <= rMonthly) {
    // allocate all remaining at this tier
    allocateTierAmount(allLP, remaining.mul(normSplitGP), lpInvestors, gpInvestors, t, distsByInvestor, investorDistributed, lpCash, gpPromote);
    return new Decimal(0);
  }

  // Binary search on x in [0, remaining]
  let lo = new Decimal(0);
  let hi = remaining;
  const tol = Decimal.max(new Decimal(1e-8), remaining.mul(1e-8));
  
  for (let i = 0; i < 64; i++) {
    const mid = lo.add(hi).div(2);
    const irrMid = lpIrrWithTierX(lpCash, t, mid.mul(normSplitLP));
    if (irrMid == null || irrMid <= rMonthly) {
      lo = mid;
    } else {
      hi = mid;
    }
    if (hi.sub(lo).abs().lte(tol)) break;
  }
  
  const x = lo; // safe from the left
  if (x.gt(0)) {
    const lpAmount = x.mul(normSplitLP);
    const gpAmount = x.mul(normSplitGP);
    allocateTierAmount(lpAmount, gpAmount, lpInvestors, gpInvestors, t, distsByInvestor, investorDistributed, lpCash, gpPromote);
    return remaining.sub(x);
  }
  
  return remaining;
}

// Helper to allocate tier amounts to investors
function allocateTierAmount(
  lpAmount: Decimal,
  gpAmount: Decimal,
  lpInvestors: EquityInvestor[],
  gpInvestors: EquityInvestor[],
  t: number,
  distsByInvestor: Record<string, Decimal[]>,
  investorDistributed: Record<string, Decimal>,
  lpCash: Decimal[],
  gpPromote: Decimal[]
) {
  // LP side - pro-rata by commitments
  if (lpInvestors.length > 0 && lpAmount.gt(0)) {
    const totalLPCommitment = lpInvestors.reduce((sum, inv) => sum.add(inv.commitment), new Decimal(0));
    
    if (totalLPCommitment.gt(0)) {
      for (const inv of lpInvestors) {
        const invShare = new Decimal(inv.commitment).div(totalLPCommitment);
        const invDist = lpAmount.mul(invShare);
        
        distsByInvestor[inv.key][t] = distsByInvestor[inv.key][t].add(invDist);
        investorDistributed[inv.key] = investorDistributed[inv.key].add(invDist);
        lpCash[t] = lpCash[t].add(invDist);
      }
    }
  }

  // GP side - split evenly among GPs
  if (gpInvestors.length > 0 && gpAmount.gt(0)) {
    const perGP = gpAmount.div(gpInvestors.length);
    
    for (const gp of gpInvestors) {
      distsByInvestor[gp.key][t] = distsByInvestor[gp.key][t].add(perGP);
      investorDistributed[gp.key] = investorDistributed[gp.key].add(perGP);
    }
    
    gpPromote[t] = gpPromote[t].add(gpAmount);
  }
}

export function computeEquityWaterfall(params: EquityParams) {
  const { T, inputs, balance_sheet, cash } = params;
  const equity = inputs.equity;

  if (!equity.enabled || equity.classes.length === 0) {
    return {
      calls_total: z(T),
      calls_by_investor: {},
      pref_accrued: {},
      dists_total: z(T),
      dists_by_investor: {},
      gp_promote: z(T),
      gp_clawback: z(T),
      kpis: {
        irr_pa: null,
        tvpi: 0, dpi: 0, rvpi: 0, moic: 0,
        by_investor: {}
      },
      detail: {}
    };
  }

  // Initialize tracking structures
  const calls_total = z(T);
  const calls_by_investor: Record<string, Decimal[]> = {};
  const pref_accrued: Record<string, Decimal[]> = {};
  const dists_total = z(T);
  const dists_by_investor: Record<string, Decimal[]> = {};
  const gp_promote = z(T);
  const gp_clawback = z(T);

  // Initialize per-investor tracking
  for (const inv of equity.investors) {
    calls_by_investor[inv.key] = z(T);
    dists_by_investor[inv.key] = z(T);
  }

  // Initialize per-class pref tracking
  for (const cls of equity.classes) {
    pref_accrued[cls.key] = z(T);
  }

  // Track cumulative amounts
  const investor_contributed: Record<string, Decimal> = {};
  const investor_distributed: Record<string, Decimal> = {};
  const unreturned_capital_by_investor: Record<string, Decimal> = {};
  
  // Per-class ledgers
  const class_pref_balance: Record<string, Decimal> = {};
  const class_excess_distributions_cum: Record<string, Decimal> = {};
  const class_gp_catchup_cum: Record<string, Decimal> = {};
  const class_gp_promote_cum: Record<string, Decimal> = {};
  
  // LP class cashflows for IRR calculations
  const lp_class_cashflows: Record<string, Decimal[]> = {};

  // Initialize all tracking
  for (const inv of equity.investors) {
    investor_contributed[inv.key] = new Decimal(0);
    investor_distributed[inv.key] = new Decimal(0);
    unreturned_capital_by_investor[inv.key] = new Decimal(0);
  }

  for (const cls of equity.classes) {
    class_pref_balance[cls.key] = new Decimal(0);
    class_excess_distributions_cum[cls.key] = new Decimal(0);
    class_gp_catchup_cum[cls.key] = new Decimal(0);
    class_gp_promote_cum[cls.key] = new Decimal(0);
    lp_class_cashflows[cls.key] = z(T);
  }

  // Distribution accumulator for quarterly frequency
  let dist_accumulator = new Decimal(0);

  // Sort classes by seniority (lower number = more senior)
  const sortedClasses = [...equity.classes].sort((a, b) => a.seniority - b.seniority);

  // Process each period
  for (let t = 0; t < T; t++) {
    // 1. Capital calls (if project cash < 0)
    const need = cash.project[t].negated().max(0);
    
    if (need.gt(0)) {
      const total_commitment = equity.investors.reduce((sum, inv) => 
        sum.add(inv.commitment), new Decimal(0));

      for (const inv of equity.investors) {
        let call_amount = new Decimal(0);
        
        if (equity.call_order === "pro_rata_commitment" && total_commitment.gt(0)) {
          call_amount = need.mul(inv.commitment).div(total_commitment);
        } else if (equity.call_order === "fixed_shares" && inv.fixed_share) {
          call_amount = need.mul(inv.fixed_share);
        }

        if (call_amount.gt(0)) {
          calls_by_investor[inv.key][t] = call_amount;
          calls_total[t] = calls_total[t].add(call_amount);
          investor_contributed[inv.key] = investor_contributed[inv.key].add(call_amount);
          unreturned_capital_by_investor[inv.key] = unreturned_capital_by_investor[inv.key].add(call_amount);
          
          // Add to LP class cashflows (negative for calls, LP only)
          if (inv.role === "lp") {
            const cls = sortedClasses.find(c => c.key === inv.class_key);
            if (cls) {
              lp_class_cashflows[cls.key][t] = lp_class_cashflows[cls.key][t].minus(call_amount);
            }
          }
        }
      }
    }

    // 2. Preferred return accrual (monthly for all classes)
    for (const cls of sortedClasses) {
      const classInvestors = equity.investors.filter(inv => inv.class_key === cls.key);
      const unreturned_class_capital = classInvestors.reduce((sum, inv) => 
        sum.add(unreturned_capital_by_investor[inv.key] || new Decimal(0)), new Decimal(0));
      
      if (unreturned_class_capital.gt(0)) {
        const rate_m = cls.pref_compounding === "compound" 
          ? rateMonthlyFromAnnual(new Decimal(cls.pref_rate_pa))
          : new Decimal(cls.pref_rate_pa).div(12);
        
        const accrual = unreturned_class_capital.mul(rate_m);
        class_pref_balance[cls.key] = class_pref_balance[cls.key].add(accrual);
        pref_accrued[cls.key][t] = class_pref_balance[cls.key];
      }
    }

    // 3. Distribution frequency handling
    const positive_cash = cash.project[t].max(0);
    
    if (equity.distribution_frequency === "quarterly") {
      dist_accumulator = dist_accumulator.add(positive_cash);
      if ((t + 1) % 3 !== 0 && t < T - 1) {
        continue; // Skip distribution, accumulate
      }
    }

    const available_cash = equity.distribution_frequency === "quarterly" 
      ? dist_accumulator 
      : positive_cash;

    if (available_cash.gt(0)) {
      let remaining_cash = available_cash;

      // Apply waterfall for each class (senior to junior)
      for (const cls of sortedClasses) {
        if (remaining_cash.lte(0)) break;

        const classInvestors = equity.investors.filter(inv => inv.class_key === cls.key);
        const lpInvestors = classInvestors.filter(inv => inv.role === "lp");
        const gpInvestors = classInvestors.filter(inv => inv.role === "gp");

        // Step A: Return of Capital
        remaining_cash = allocateROC({
          remaining: remaining_cash,
          classInvestors,
          unreturnedByInvestor: unreturned_capital_by_investor,
          t,
          distsByInvestor: dists_by_investor,
          investorDistributed: investor_distributed,
          lpCashflows: lp_class_cashflows[cls.key]
        });

        // Step B: Preferred Return
        const prefResult = allocatePref({
          remaining: remaining_cash,
          prefBalance: class_pref_balance[cls.key],
          lpInvestors,
          t,
          distsByInvestor: dists_by_investor,
          investorDistributed: investor_distributed,
          lpCashflows: lp_class_cashflows[cls.key]
        });
        remaining_cash = prefResult.remaining;
        class_pref_balance[cls.key] = class_pref_balance[cls.key].minus(prefResult.prefPaid);

        // Step C: GP Catch-up (exact formula)
        if (cls.catchup?.enabled && remaining_cash.gt(0) && gpInvestors.length > 0) {
          const targetGP = new Decimal(cls.catchup.target_gp_share);
          const excessA = class_excess_distributions_cum[cls.key];
          const gpG = class_gp_catchup_cum[cls.key];
          
          const catchupResult = allocateCatchupExact({
            remaining: remaining_cash,
            targetGP,
            excessA,
            gpG,
            gpInvestors,
            t,
            distsByInvestor: dists_by_investor,
            investorDistributed: investor_distributed,
            gpPromote: gp_promote
          });
          
          remaining_cash = catchupResult.remaining;
          class_gp_catchup_cum[cls.key] = class_gp_catchup_cum[cls.key].add(catchupResult.catchupPaid);
          class_excess_distributions_cum[cls.key] = class_excess_distributions_cum[cls.key].add(catchupResult.catchupPaid);
        }

        // Step D: Tiered splits with IRR hurdles
        for (const tier of cls.tiers) {
          if (remaining_cash.lte(0)) break;
          
          const rMonthly = rateMonthlyFromAnnual(new Decimal(tier.irr_hurdle_pa)).toNumber();
          
          remaining_cash = allocateTierExact({
            remaining: remaining_cash,
            splitLP: new Decimal(tier.split_lp),
            splitGP: new Decimal(tier.split_gp),
            rMonthly,
            t,
            lpCash: lp_class_cashflows[cls.key],
            lpInvestors,
            gpInvestors,
            distsByInvestor: dists_by_investor,
            investorDistributed: investor_distributed,
            gpPromote: gp_promote
          });
        }

        // If cash remains after all tiers, allocate with last tier split (or default)
        if (remaining_cash.gt(0) && cls.tiers.length > 0) {
          const lastTier = cls.tiers[cls.tiers.length - 1];
          allocateTierAmount(
            remaining_cash.mul(lastTier.split_lp),
            remaining_cash.mul(lastTier.split_gp),
            lpInvestors,
            gpInvestors,
            t,
            dists_by_investor,
            investor_distributed,
            lp_class_cashflows[cls.key],
            gp_promote
          );
          remaining_cash = new Decimal(0);
        }

        // Update class promote cumulative
        class_gp_promote_cum[cls.key] = class_gp_promote_cum[cls.key].add(gp_promote[t]);
      }

      // Update total distributions
      for (const inv of equity.investors) {
        dists_total[t] = dists_total[t].add(dists_by_investor[inv.key][t]);
      }

      if (equity.distribution_frequency === "quarterly") {
        dist_accumulator = new Decimal(0);
      }
    }
  }

  // Calculate clawback at exit (T-1)
  if (T > 0) {
    for (const cls of sortedClasses) {
      const classInvestors = equity.investors.filter(inv => inv.class_key === cls.key);
      const unreturned_class_capital_final = classInvestors.reduce((sum, inv) => 
        sum.add(unreturned_capital_by_investor[inv.key] || new Decimal(0)), new Decimal(0));
      
      const shortfall = Decimal.max(new Decimal(0), 
        unreturned_class_capital_final.add(class_pref_balance[cls.key]));
      
      if (shortfall.gt(0)) {
        const clawback = Decimal.min(shortfall, class_gp_promote_cum[cls.key]);
        gp_clawback[T-1] = gp_clawback[T-1].add(clawback);
      }
    }
  }

  // Calculate KPIs
  const portfolio_calls = calls_total.reduce((sum, call) => sum.add(call), new Decimal(0));
  const portfolio_dists = dists_total.reduce((sum, dist) => sum.add(dist), new Decimal(0));
  const portfolio_nav = balance_sheet.nbv[T-1] || new Decimal(0);

  // Portfolio IRR
  const portfolio_cashflows = calls_total.map((call, t) => call.negated().add(dists_total[t]));
  const portfolio_irr_monthly = solveIRR(portfolio_cashflows);
  const portfolio_irr_pa = portfolio_irr_monthly ? Math.pow(1 + portfolio_irr_monthly, 12) - 1 : null;

  const kpis = {
    irr_pa: portfolio_irr_pa,
    tvpi: portfolio_calls.gt(0) ? portfolio_dists.add(portfolio_nav).div(portfolio_calls).toNumber() : 0,
    dpi: portfolio_calls.gt(0) ? portfolio_dists.div(portfolio_calls).toNumber() : 0,
    rvpi: portfolio_calls.gt(0) ? portfolio_nav.div(portfolio_calls).toNumber() : 0,
    moic: portfolio_calls.gt(0) ? portfolio_dists.add(portfolio_nav).div(portfolio_calls).toNumber() : 0,
    by_investor: {} as Record<string, any>
  };

  // Calculate per-investor KPIs
  for (const inv of equity.investors) {
    const contrib_calls = calls_by_investor[inv.key];
    const contrib_dists = dists_by_investor[inv.key];
    const contributed = contrib_calls.reduce((sum, call) => sum.add(call), new Decimal(0));
    const distributed = contrib_dists.reduce((sum, dist) => sum.add(dist), new Decimal(0));
    
    // Simple NAV allocation (could be more sophisticated)
    const nav_share = contributed.gt(0) ? portfolio_nav.mul(contributed).div(portfolio_calls.gt(0) ? portfolio_calls : new Decimal(1)) : new Decimal(0);
    
    // Investor IRR
    const inv_cashflows = contrib_calls.map((call, t) => call.negated().add(contrib_dists[t]));
    const inv_irr_monthly = solveIRR(inv_cashflows);
    const inv_irr_pa = inv_irr_monthly ? Math.pow(1 + inv_irr_monthly, 12) - 1 : null;

    kpis.by_investor[inv.key] = {
      irr_pa: inv_irr_pa,
      tvpi: contributed.gt(0) ? distributed.add(nav_share).div(contributed).toNumber() : 0,
      dpi: contributed.gt(0) ? distributed.div(contributed).toNumber() : 0,
      rvpi: contributed.gt(0) ? nav_share.div(contributed).toNumber() : 0,
      moic: contributed.gt(0) ? distributed.add(nav_share).div(contributed).toNumber() : 0,
      contributed: contributed.toNumber(),
      distributed: distributed.toNumber(),
      nav: nav_share.toNumber()
    };
  }

  return {
    calls_total,
    calls_by_investor,
    pref_accrued,
    dists_total,
    dists_by_investor,
    gp_promote,
    gp_clawback,
    kpis,
    detail: {
      class_ledgers: {
        pref_balance: Object.fromEntries(Object.entries(class_pref_balance).map(([k, v]) => [k, v.toNumber()])),
        excess_distributions_cum: Object.fromEntries(Object.entries(class_excess_distributions_cum).map(([k, v]) => [k, v.toNumber()])),
        gp_catchup_cum: Object.fromEntries(Object.entries(class_gp_catchup_cum).map(([k, v]) => [k, v.toNumber()])),
        gp_promote_cum: Object.fromEntries(Object.entries(class_gp_promote_cum).map(([k, v]) => [k, v.toNumber()]))
      },
      investor_ledgers: {
        contributed: Object.fromEntries(Object.entries(investor_contributed).map(([k, v]) => [k, v.toNumber()])),
        distributed: Object.fromEntries(Object.entries(investor_distributed).map(([k, v]) => [k, v.toNumber()])),
        unreturned_capital: Object.fromEntries(Object.entries(unreturned_capital_by_investor).map(([k, v]) => [k, v.toNumber()]))
      },
      lp_class_cashflows: Object.fromEntries(Object.entries(lp_class_cashflows).map(([k, v]) => [k, v.map(cf => cf.toNumber())]))
    }
  };
}