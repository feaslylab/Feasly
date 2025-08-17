import Decimal from "decimal.js";
import { ProjectInputs, ReturnsBlock } from "./types";

const z = (T: number) => Array.from({ length: T }, () => new Decimal(0));

// IRR computation using Newton-Raphson
function computeIRR(cashFlows: Decimal[], periodsPerYear = 12): number | null {
  if (cashFlows.length < 2) return null;
  
  const flows = cashFlows.map(cf => cf.toNumber());
  let guess = 0.1; // 10% initial guess
  
  for (let i = 0; i < 100; i++) {
    let npv = 0;
    let dnpv = 0;
    const monthlyRate = guess / periodsPerYear;
    
    for (let t = 0; t < flows.length; t++) {
      const factor = Math.pow(1 + monthlyRate, t);
      npv += flows[t] / factor;
      dnpv -= flows[t] * t / (factor * (1 + monthlyRate));
    }
    
    if (Math.abs(npv) < 1e-6) return guess;
    if (Math.abs(dnpv) < 1e-10) break;
    
    const newGuess = guess - npv / dnpv;
    if (Math.abs(newGuess - guess) < 1e-8) return newGuess;
    guess = newGuess;
  }
  
  return null; // Failed to converge
}

export function computeWaterfall(params: {
  T: number;
  inputs: ProjectInputs;
  equity_cf: Decimal[]; // from output.cash.equity_cf
}): ReturnsBlock {
  const { T, inputs, equity_cf } = params;
  
  const equity = inputs.equity_tranches || [];
  const config = inputs.waterfall_config || { mode: "european", hurdles: [], accrual_lot_level: true };
  
  if (equity.length === 0) {
    // No equity tranches defined, return empty structure
    return {
      lp_distributions: Array(T).fill(0),
      gp_distributions: Array(T).fill(0),
      carry_paid: Array(T).fill(0),
      lp: { irr_pa: null, moic: null, dpi: null, tvpi: null },
      gp: { irr_pa: null, moic: null, dpi: null, tvpi: null },
      capital_accounts: {},
      audit: { tiers: [] },
      detail: {}
    };
  }
  
  // Initialize capital accounts for each tranche
  const capitalAccounts: Record<string, any> = {};
  for (const tranche of equity) {
    capitalAccounts[tranche.key] = {
      contributed: Array(T).fill(0),
      returned_capital: Array(T).fill(0),
      pr_accrued: Array(T).fill(0),
      pr_paid: Array(T).fill(0),
      profit_distributions: Array(T).fill(0),
      ending_unreturned_capital: Array(T).fill(0),
      unreturned_balance: new Decimal(0),
      pr_balance: new Decimal(0),
    };
  }
  
  // Period-by-period processing
  const lpDistributions = Array(T).fill(0);
  const gpDistributions = Array(T).fill(0);
  const carryPaid = Array(T).fill(0);
  const auditTiers: any[] = [];
  
  for (let t = 0; t < T; t++) {
    const equityFlow = equity_cf[t] || new Decimal(0);
    
    if (equityFlow.lt(0)) {
      // Capital call - allocate negative flow across tranches by commitment ratio
      const totalCommitment = equity.reduce((sum, tr) => sum + tr.commitment, 0);
      if (totalCommitment > 0) {
        const callAmount = equityFlow.abs();
        for (const tranche of equity) {
          const share = tranche.commitment / totalCommitment;
          const contribution = callAmount.mul(share);
          capitalAccounts[tranche.key].contributed[t] = contribution.toNumber();
          capitalAccounts[tranche.key].unreturned_balance = 
            capitalAccounts[tranche.key].unreturned_balance.add(contribution);
        }
      }
    } else if (equityFlow.gt(0)) {
      // Distributable cash - run through waterfall
      let remainingDCE = equityFlow;
      
      // Step 1: Return of Capital (ROC) - pro-rata by unreturned capital
      const totalUnreturned = equity.reduce((sum, tr) => 
        sum.add(capitalAccounts[tr.key].unreturned_balance), new Decimal(0));
      
      if (totalUnreturned.gt(0) && remainingDCE.gt(0)) {
        for (const tranche of equity) {
          const unreturnedBalance = capitalAccounts[tranche.key].unreturned_balance;
          if (unreturnedBalance.gt(0)) {
            const share = unreturnedBalance.div(totalUnreturned);
            const rocPayment = Decimal.min(remainingDCE.mul(share), unreturnedBalance);
            
            capitalAccounts[tranche.key].returned_capital[t] = rocPayment.toNumber();
            capitalAccounts[tranche.key].unreturned_balance = 
              capitalAccounts[tranche.key].unreturned_balance.sub(rocPayment);
            
            if (tranche.role === "lp") {
              lpDistributions[t] += rocPayment.toNumber();
            } else {
              gpDistributions[t] += rocPayment.toNumber();
            }
            
            remainingDCE = remainingDCE.sub(rocPayment);
          }
        }
      }
      
      // Step 2: Preferred Return - accrue and pay
      for (const tranche of equity) {
        const prConfig = tranche.pr || { type: "rate_pa", rate_pa: 0, compounding: "monthly" };
        if (prConfig.rate_pa > 0) {
          const unreturnedBalance = capitalAccounts[tranche.key].unreturned_balance;
          const monthlyRate = prConfig.rate_pa / 12; // Assume monthly compounding for simplicity
          const prAccrual = unreturnedBalance.mul(monthlyRate);
          
          capitalAccounts[tranche.key].pr_balance = 
            capitalAccounts[tranche.key].pr_balance.add(prAccrual);
          capitalAccounts[tranche.key].pr_accrued[t] = prAccrual.toNumber();
        }
      }
      
      // Pay accrued PR pro-rata
      const totalPRBalance = equity.reduce((sum, tr) => 
        sum.add(capitalAccounts[tr.key].pr_balance), new Decimal(0));
      
      if (totalPRBalance.gt(0) && remainingDCE.gt(0)) {
        for (const tranche of equity) {
          const prBalance = capitalAccounts[tranche.key].pr_balance;
          if (prBalance.gt(0)) {
            const share = prBalance.div(totalPRBalance);
            const prPayment = Decimal.min(remainingDCE.mul(share), prBalance);
            
            capitalAccounts[tranche.key].pr_paid[t] = prPayment.toNumber();
            capitalAccounts[tranche.key].pr_balance = 
              capitalAccounts[tranche.key].pr_balance.sub(prPayment);
            
            if (tranche.role === "lp") {
              lpDistributions[t] += prPayment.toNumber();
            } else {
              gpDistributions[t] += prPayment.toNumber();
            }
            
            remainingDCE = remainingDCE.sub(prPayment);
          }
        }
      }
      
      // Step 3: Promote splits on remaining profits
      if (remainingDCE.gt(0)) {
        const hurdles = config.hurdles || [];
        const activeHurdle = hurdles[0] || { 
          key: "default", 
          split_after_catchup: { lp: 0.8, gp: 0.2 },
          catchup: { enabled: false, gp_target_share_of_profits: 0.2 }
        };
        
        // For now, simple split without catch-up logic
        const lpShare = remainingDCE.mul(activeHurdle.split_after_catchup.lp);
        const gpShare = remainingDCE.mul(activeHurdle.split_after_catchup.gp);
        
        // Allocate to tranches by role
        const lpTranches = equity.filter(tr => tr.role === "lp");
        const gpTranches = equity.filter(tr => tr.role === "gp");
        
        if (lpTranches.length > 0) {
          const lpPerTranche = lpShare.div(lpTranches.length);
          for (const tranche of lpTranches) {
            capitalAccounts[tranche.key].profit_distributions[t] = lpPerTranche.toNumber();
          }
          lpDistributions[t] += lpShare.toNumber();
        }
        
        if (gpTranches.length > 0) {
          const gpPerTranche = gpShare.div(gpTranches.length);
          for (const tranche of gpTranches) {
            capitalAccounts[tranche.key].profit_distributions[t] = gpPerTranche.toNumber();
          }
          gpDistributions[t] += gpShare.toNumber();
          carryPaid[t] = gpShare.toNumber();
        }
      }
    }
    
    // Accrue PR for next period (if not already done above)
    for (const tranche of equity) {
      const prConfig = tranche.pr || { type: "rate_pa", rate_pa: 0, compounding: "monthly" };
      if (prConfig.rate_pa > 0) {
        const unreturnedBalance = capitalAccounts[tranche.key].unreturned_balance;
        if (equityFlow.lte(0)) { // Only accrue if we didn't process above
          const monthlyRate = prConfig.rate_pa / 12;
          const prAccrual = unreturnedBalance.mul(monthlyRate);
          
          capitalAccounts[tranche.key].pr_balance = 
            capitalAccounts[tranche.key].pr_balance.add(prAccrual);
          capitalAccounts[tranche.key].pr_accrued[t] = prAccrual.toNumber();
        }
      }
      
      // Update ending unreturned capital
      capitalAccounts[tranche.key].ending_unreturned_capital[t] = 
        capitalAccounts[tranche.key].unreturned_balance.toNumber();
    }
  }
  
  // Compute metrics
  const lpCashFlows: Decimal[] = [];
  const gpCashFlows: Decimal[] = [];
  
  for (let t = 0; t < T; t++) {
    let lpFlow = new Decimal(0);
    let gpFlow = new Decimal(0);
    
    for (const tranche of equity) {
      const account = capitalAccounts[tranche.key];
      const contribution = -account.contributed[t]; // Negative for outflow
      const distribution = account.returned_capital[t] + account.pr_paid[t] + account.profit_distributions[t];
      const netFlow = contribution + distribution;
      
      if (tranche.role === "lp") {
        lpFlow = lpFlow.add(netFlow);
      } else {
        gpFlow = gpFlow.add(netFlow);
      }
    }
    
    lpCashFlows.push(lpFlow);
    gpCashFlows.push(gpFlow);
  }
  
  // Compute LP metrics
  const lpContributions = lpCashFlows.map(cf => cf.lt(0) ? cf.abs() : new Decimal(0));
  const lpDistributionsDecimal = lpCashFlows.map(cf => cf.gt(0) ? cf : new Decimal(0));
  const totalLpContributions = lpContributions.reduce((sum, c) => sum.add(c), new Decimal(0));
  const totalLpDistributions = lpDistributionsDecimal.reduce((sum, d) => sum.add(d), new Decimal(0));
  
  const lpIRR = computeIRR(lpCashFlows);
  const lpMOIC = totalLpContributions.gt(0) ? totalLpDistributions.div(totalLpContributions).toNumber() : null;
  const lpDPI = totalLpContributions.gt(0) ? totalLpDistributions.div(totalLpContributions).toNumber() : null;
  const lpTVPI = lpDPI; // Simplified - no NAV component for now
  
  // Compute GP metrics
  const gpContributions = gpCashFlows.map(cf => cf.lt(0) ? cf.abs() : new Decimal(0));
  const gpDistributionsDecimal = gpCashFlows.map(cf => cf.gt(0) ? cf : new Decimal(0));
  const totalGpContributions = gpContributions.reduce((sum, c) => sum.add(c), new Decimal(0));
  const totalGpDistributions = gpDistributionsDecimal.reduce((sum, d) => sum.add(d), new Decimal(0));
  
  const gpIRR = computeIRR(gpCashFlows);
  const gpMOIC = totalGpContributions.gt(0) ? totalGpDistributions.div(totalGpContributions).toNumber() : null;
  const gpDPI = totalGpContributions.gt(0) ? totalGpDistributions.div(totalGpContributions).toNumber() : null;
  const gpTVPI = gpDPI;
  
  // Convert capital accounts to final format
  const finalCapitalAccounts: Record<string, any> = {};
  for (const [key, account] of Object.entries(capitalAccounts)) {
    finalCapitalAccounts[key] = {
      contributed: account.contributed,
      returned_capital: account.returned_capital,
      pr_accrued: account.pr_accrued,
      pr_paid: account.pr_paid,
      profit_distributions: account.profit_distributions,
      ending_unreturned_capital: account.ending_unreturned_capital,
    };
  }
  
  return {
    lp_distributions: lpDistributions,
    gp_distributions: gpDistributions,
    carry_paid: carryPaid,
    lp: { 
      irr_pa: lpIRR, 
      moic: lpMOIC, 
      dpi: lpDPI, 
      tvpi: lpTVPI 
    },
    gp: { 
      irr_pa: gpIRR, 
      moic: gpMOIC, 
      dpi: gpDPI, 
      tvpi: gpTVPI 
    },
    capital_accounts: finalCapitalAccounts,
    audit: { tiers: auditTiers },
    detail: {
      mode: config.mode,
      total_lp_contributions: totalLpContributions.toNumber(),
      total_gp_contributions: totalGpContributions.toNumber(),
      total_lp_distributions: totalLpDistributions.toNumber(),
      total_gp_distributions: totalGpDistributions.toNumber(),
    }
  };
}