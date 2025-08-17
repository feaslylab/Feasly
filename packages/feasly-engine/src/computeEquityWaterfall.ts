import Decimal from "decimal.js";
import { ProjectInputs, EquityBlock, EquityClass, EquityInvestor } from "./types";
import { computeIRR } from "./computeWaterfall";

const z = (T: number) => Array.from({ length: T }, () => new Decimal(0));

interface EquityParams {
  T: number;
  inputs: ProjectInputs;
  balance_sheet: { nbv: Decimal[] };
  cash: { project: Decimal[] };
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

  // Track cumulative amounts for KPIs
  const investor_contributed: Record<string, Decimal> = {};
  const investor_distributed: Record<string, Decimal> = {};
  const class_contributed: Record<string, Decimal> = {};
  const class_pref_balance: Record<string, Decimal> = {};

  for (const inv of equity.investors) {
    investor_contributed[inv.key] = new Decimal(0);
    investor_distributed[inv.key] = new Decimal(0);
  }

  for (const cls of equity.classes) {
    class_contributed[cls.key] = new Decimal(0);
    class_pref_balance[cls.key] = new Decimal(0);
  }

  // Distribution accumulator for quarterly frequency
  let dist_accumulator = new Decimal(0);

  // Process each period
  for (let t = 0; t < T; t++) {
    // 1. Capital calls
    const need = cash.project[t].negated().max(0); // Need if project cash is negative
    
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

        calls_by_investor[inv.key][t] = call_amount;
        calls_total[t] = calls_total[t].add(call_amount);
        investor_contributed[inv.key] = investor_contributed[inv.key].add(call_amount);
        
        // Add to class contributed
        const cls = equity.classes.find(c => c.key === inv.class_key);
        if (cls) {
          class_contributed[cls.key] = (class_contributed[cls.key] || new Decimal(0)).add(call_amount);
        }
      }
    }

    // 2. Pref accrual
    for (const cls of equity.classes) {
      const unreturned = class_contributed[cls.key] || new Decimal(0);
      const rate_m = cls.pref_compounding === "compounded" 
        ? new Decimal(1 + cls.pref_rate_pa).pow(1/12).minus(1)
        : new Decimal(cls.pref_rate_pa).div(12);
      
      const accrual = unreturned.mul(rate_m);
      class_pref_balance[cls.key] = class_pref_balance[cls.key].add(accrual);
      pref_accrued[cls.key][t] = class_pref_balance[cls.key];
    }

    // 3. Distributions
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
      for (const cls of equity.classes) {
        if (remaining_cash.lte(0)) break;

        const class_investors = equity.investors.filter(inv => inv.class_key === cls.key);
        const lp_investors = class_investors.filter(inv => !inv.key.includes("GP"));
        const gp_investors = class_investors.filter(inv => inv.key.includes("GP"));

        // Step A: Return of Capital
        const total_class_commitment = class_investors.reduce((sum, inv) => 
          sum.add(investor_contributed[inv.key]), new Decimal(0));
        
        if (total_class_commitment.gt(0)) {
          const roc_payment = remaining_cash.min(total_class_commitment);
          
          for (const inv of class_investors) {
            const inv_share = investor_contributed[inv.key].div(total_class_commitment);
            const inv_roc = roc_payment.mul(inv_share);
            
            dists_by_investor[inv.key][t] = dists_by_investor[inv.key][t].add(inv_roc);
            dists_total[t] = dists_total[t].add(inv_roc);
            investor_distributed[inv.key] = investor_distributed[inv.key].add(inv_roc);
            investor_contributed[inv.key] = investor_contributed[inv.key].minus(inv_roc);
          }
          
          remaining_cash = remaining_cash.minus(roc_payment);
          class_contributed[cls.key] = class_contributed[cls.key].minus(roc_payment);
        }

        // Step B: Pay Pref
        if (remaining_cash.gt(0) && class_pref_balance[cls.key].gt(0)) {
          const pref_payment = remaining_cash.min(class_pref_balance[cls.key]);
          
          // Distribute pref to LP investors pro-rata
          if (lp_investors.length > 0) {
            const total_lp_commitment = lp_investors.reduce((sum, inv) => 
              sum.add(inv.commitment), new Decimal(0));
            
            if (total_lp_commitment.gt(0)) {
              for (const inv of lp_investors) {
                const inv_share = new Decimal(inv.commitment).div(total_lp_commitment);
                const inv_pref = pref_payment.mul(inv_share);
                
                dists_by_investor[inv.key][t] = dists_by_investor[inv.key][t].add(inv_pref);
                dists_total[t] = dists_total[t].add(inv_pref);
                investor_distributed[inv.key] = investor_distributed[inv.key].add(inv_pref);
              }
            }
          }
          
          remaining_cash = remaining_cash.minus(pref_payment);
          class_pref_balance[cls.key] = class_pref_balance[cls.key].minus(pref_payment);
        }

        // Step C: GP Catch-up (simplified)
        if (remaining_cash.gt(0) && cls.catchup?.enabled && gp_investors.length > 0) {
          // Allocate to GP until target share reached (simplified implementation)
          const catchup_amount = remaining_cash.mul(0.5).min(remaining_cash); // Simplified
          
          for (const gp_inv of gp_investors) {
            const gp_share = new Decimal(1).div(gp_investors.length);
            const gp_catchup = catchup_amount.mul(gp_share);
            
            dists_by_investor[gp_inv.key][t] = dists_by_investor[gp_inv.key][t].add(gp_catchup);
            dists_total[t] = dists_total[t].add(gp_catchup);
            investor_distributed[gp_inv.key] = investor_distributed[gp_inv.key].add(gp_catchup);
            gp_promote[t] = gp_promote[t].add(gp_catchup);
          }
          
          remaining_cash = remaining_cash.minus(catchup_amount);
        }

        // Step D: Tier splits (simplified - first tier only)
        if (remaining_cash.gt(0) && cls.tiers.length > 0) {
          const tier = cls.tiers[0];
          const lp_amount = remaining_cash.mul(tier.split_lp);
          const gp_amount = remaining_cash.mul(tier.split_gp);

          // LP side
          if (lp_investors.length > 0) {
            const total_lp_commitment = lp_investors.reduce((sum, inv) => 
              sum.add(inv.commitment), new Decimal(0));
            
            if (total_lp_commitment.gt(0)) {
              for (const inv of lp_investors) {
                const inv_share = new Decimal(inv.commitment).div(total_lp_commitment);
                const inv_dist = lp_amount.mul(inv_share);
                
                dists_by_investor[inv.key][t] = dists_by_investor[inv.key][t].add(inv_dist);
                dists_total[t] = dists_total[t].add(inv_dist);
                investor_distributed[inv.key] = investor_distributed[inv.key].add(inv_dist);
              }
            }
          }

          // GP side
          if (gp_investors.length > 0) {
            for (const gp_inv of gp_investors) {
              const gp_share = new Decimal(1).div(gp_investors.length);
              const gp_dist = gp_amount.mul(gp_share);
              
              dists_by_investor[gp_inv.key][t] = dists_by_investor[gp_inv.key][t].add(gp_dist);
              dists_total[t] = dists_total[t].add(gp_dist);
              investor_distributed[gp_inv.key] = investor_distributed[gp_inv.key].add(gp_dist);
              gp_promote[t] = gp_promote[t].add(gp_dist);
            }
          }
          
          remaining_cash = new Decimal(0);
        }
      }

      if (equity.distribution_frequency === "quarterly") {
        dist_accumulator = new Decimal(0);
      }
    }
  }

  // Calculate KPIs
  const portfolio_calls = calls_total.reduce((sum, call) => sum.add(call), new Decimal(0));
  const portfolio_dists = dists_total.reduce((sum, dist) => sum.add(dist), new Decimal(0));
  const portfolio_nav = balance_sheet.nbv[T-1] || new Decimal(0);

  const kpis = {
    irr_pa: computePortfolioIRR(calls_total, dists_total),
    tvpi: portfolio_calls.gt(0) ? portfolio_dists.add(portfolio_nav).div(portfolio_calls).toNumber() : 0,
    dpi: portfolio_calls.gt(0) ? portfolio_dists.div(portfolio_calls).toNumber() : 0,
    rvpi: portfolio_calls.gt(0) ? portfolio_nav.div(portfolio_calls).toNumber() : 0,
    moic: portfolio_calls.gt(0) ? portfolio_dists.add(portfolio_nav).div(portfolio_calls).toNumber() : 0,
    by_investor: {} as Record<string, any>
  };

  // Calculate per-investor KPIs
  for (const inv of equity.investors) {
    const contributed = investor_contributed[inv.key];
    const distributed = investor_distributed[inv.key];
    const nav_share = portfolio_nav.mul(0.1); // Simplified NAV allocation

    kpis.by_investor[inv.key] = {
      irr_pa: computeInvestorIRR(calls_by_investor[inv.key], dists_by_investor[inv.key]),
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
      class_ledgers: {},
      investor_ledgers: {},
      fees: {},
      tier_solutions: {},
      clawback: {}
    }
  };
}

function computePortfolioIRR(calls: Decimal[], dists: Decimal[]): number | null {
  const cashflows: Decimal[] = [];
  for (let t = 0; t < calls.length; t++) {
    cashflows.push(calls[t].negated().add(dists[t]));
  }
  return computeIRR(cashflows);
}

function computeInvestorIRR(calls: Decimal[], dists: Decimal[]): number | null {
  const cashflows: Decimal[] = [];
  for (let t = 0; t < calls.length; t++) {
    cashflows.push(calls[t].negated().add(dists[t]));
  }
  return computeIRR(cashflows);
}