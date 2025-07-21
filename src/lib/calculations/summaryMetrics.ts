import type { MonthlyCashflow } from "./types";

export interface ScenarioSummary {
  totalRevenue: number;
  totalCosts: number;
  netProfit: number;
  profitMargin: number;
  finalCashBalance: number;
  irr: number;
  roi: number;
  paybackPeriod: number;
}

/**
 * Calculate summary metrics for a scenario
 */
export function getScenarioSummary(cashflows: MonthlyCashflow[]): ScenarioSummary {
  if (!cashflows || cashflows.length === 0) {
    return {
      totalRevenue: 0,
      totalCosts: 0,
      netProfit: 0,
      profitMargin: 0,
      finalCashBalance: 0,
      irr: 0,
      roi: 0,
      paybackPeriod: 0,
    };
  }

  const totalRevenue = cashflows.reduce((sum, cf) => sum + cf.revenue, 0);
  const totalCosts = cashflows.reduce((sum, cf) => 
    sum + cf.constructionCost + cf.landCost + cf.softCosts + cf.loanInterest, 0
  );
  const netProfit = totalRevenue - totalCosts;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const finalCashBalance = cashflows[cashflows.length - 1]?.cashBalance || 0;

  // Calculate IRR (simplified approximation)
  const irr = calculateIRR(cashflows);
  
  // Calculate ROI
  const totalInvestment = cashflows.reduce((sum, cf) => sum + cf.equityInjected, 0);
  const roi = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;

  // Calculate payback period (months to break even)
  const paybackPeriod = calculatePaybackPeriod(cashflows);

  return {
    totalRevenue,
    totalCosts,
    netProfit,
    profitMargin,
    finalCashBalance,
    irr,
    roi,
    paybackPeriod,
  };
}

/**
 * Calculate Internal Rate of Return (IRR) - simplified approximation
 */
function calculateIRR(cashflows: MonthlyCashflow[]): number {
  if (!cashflows || cashflows.length === 0) return 0;

  // Get net cash flows (negative for outflows, positive for inflows)
  const netCashFlows = cashflows.map(cf => cf.netCashflow);
  
  // Simple approximation for IRR - actual calculation would require Newton-Raphson method
  // This is a simplified version that gives a reasonable estimate
  const totalInvestment = Math.abs(netCashFlows.filter(cf => cf < 0).reduce((sum, cf) => sum + cf, 0));
  const totalReturns = netCashFlows.filter(cf => cf > 0).reduce((sum, cf) => sum + cf, 0);
  
  if (totalInvestment === 0) return 0;
  
  const periodReturn = totalReturns / totalInvestment;
  const periods = cashflows.length / 12; // Convert months to years
  
  if (periods <= 0) return 0;
  
  const annualReturn = Math.pow(periodReturn, 1 / periods) - 1;
  return annualReturn * 100;
}

/**
 * Calculate payback period in months
 */
function calculatePaybackPeriod(cashflows: MonthlyCashflow[]): number {
  let cumulativeCashflow = 0;
  
  for (let i = 0; i < cashflows.length; i++) {
    cumulativeCashflow += cashflows[i].netCashflow;
    
    // Return when we first break even
    if (cumulativeCashflow >= 0) {
      return i + 1;
    }
  }
  
  return cashflows.length; // Return total period if never breaks even
}

/**
 * Compare scenarios and return difference metrics
 */
export function compareScenarios(
  baseScenario: MonthlyCashflow[],
  comparisonScenario: MonthlyCashflow[]
): {
  revenueDifference: number;
  profitDifference: number;
  irrDifference: number;
  roiDifference: number;
} {
  const baseSummary = getScenarioSummary(baseScenario);
  const comparisonSummary = getScenarioSummary(comparisonScenario);

  return {
    revenueDifference: comparisonSummary.totalRevenue - baseSummary.totalRevenue,
    profitDifference: comparisonSummary.netProfit - baseSummary.netProfit,
    irrDifference: comparisonSummary.irr - baseSummary.irr,
    roiDifference: comparisonSummary.roi - baseSummary.roi,
  };
}