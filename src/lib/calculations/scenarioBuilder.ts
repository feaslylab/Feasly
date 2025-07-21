import type { FeaslyModelFormData } from "@/components/FeaslyModel/types";
import type { MonthlyCashflow, ScenarioMultipliers } from "./types";
import { generateTimelineGrid, allocateCostOverMonths, calculateRevenueOverMonths, allocatePhasedCosts, allocatePhasedEquity } from "./utils";
import { calculateLoanSchedule } from "./loanCalculations";
import { calculateZakat } from "./zakatAndVAT";
import { SCENARIO_MULTIPLIERS } from "@/lib/constants/finance";

/**
 * Get scenario multipliers for a given scenario
 */
export function getScenarioMultipliers(scenario: string): ScenarioMultipliers {
  return SCENARIO_MULTIPLIERS[scenario as keyof typeof SCENARIO_MULTIPLIERS] || SCENARIO_MULTIPLIERS.base;
}

/**
 * Build scenario-specific cashflow grid with optional phasing support
 */
export function buildScenarioGrid(
  input: FeaslyModelFormData,
  multipliers: ScenarioMultipliers,
  projectId: string
): MonthlyCashflow[] {
  // Parse dates - use fallback if dates not provided
  const startDate = input.start_date || new Date();
  const endDate = input.completion_date || new Date(Date.now() + 24 * 30 * 24 * 60 * 60 * 1000); // 24 months default
  
  // Generate timeline
  const months = generateTimelineGrid(startDate, endDate);
  
  // Apply scenario multipliers to costs and revenue
  const adjustedConstructionCost = (input.construction_cost || 0) * multipliers.constructionCostMultiplier;
  const adjustedLandCost = input.land_cost || 0;
  const adjustedSoftCosts = (input.soft_costs || 0) * multipliers.constructionCostMultiplier;
  
  // Calculate total revenue from price and area
  const totalGfa = input.total_gfa_sqm || 0;
  const avgSalePrice = input.average_sale_price || 0;
  const totalRevenue = totalGfa * avgSalePrice;
  const adjustedRevenue = totalRevenue * multipliers.salePriceMultiplier;

  // Handle phased allocation if enabled
  let constructionCostAllocation: Record<string, number>;
  let softCostAllocation: Record<string, number>;
  let revenueAllocation: Record<string, number>;

  if (input.phasing_enabled && months.length > 6) {
    // Implement phased cost and revenue allocation
    constructionCostAllocation = allocatePhasedCosts(adjustedConstructionCost, months, [
      { phase: "Foundation", startMonth: 0, duration: Math.ceil(months.length * 0.25), costPercent: 30 },
      { phase: "Structure", startMonth: Math.ceil(months.length * 0.2), duration: Math.ceil(months.length * 0.4), costPercent: 45 },
      { phase: "Finishing", startMonth: Math.ceil(months.length * 0.6), duration: Math.ceil(months.length * 0.35), costPercent: 25 },
    ]);

    softCostAllocation = allocatePhasedCosts(adjustedSoftCosts, months, [
      { phase: "Design", startMonth: 0, duration: Math.ceil(months.length * 0.3), costPercent: 40 },
      { phase: "Permits", startMonth: Math.ceil(months.length * 0.1), duration: Math.ceil(months.length * 0.2), costPercent: 20 },
      { phase: "Management", startMonth: 0, duration: months.length, costPercent: 40 },
    ]);

    // Revenue starts after 75% completion for phased projects
    const revenueStartIndex = Math.ceil(months.length * 0.75);
    revenueAllocation = calculateRevenueOverMonths(
      adjustedRevenue, 
      months[revenueStartIndex] || months[months.length - 1], 
      months, 
      Math.max(3, months.length - revenueStartIndex)
    );
  } else {
    // Standard even allocation
    constructionCostAllocation = allocateCostOverMonths(adjustedConstructionCost, months);
    softCostAllocation = allocateCostOverMonths(adjustedSoftCosts, months);
    
    // Revenue starts after completion
    const completionMonth = months[months.length - 1];
    revenueAllocation = calculateRevenueOverMonths(adjustedRevenue, completionMonth, months);
  }

  // Land cost allocation (always in first month)
  const landCostAllocation: Record<string, number> = {};
  if (months.length > 0) {
    landCostAllocation[months[0]] = adjustedLandCost;
  }

  // Calculate loan schedule
  const loanAmount = input.loan_amount || 0;
  const interestRate = (input.interest_rate || 0) / 100;
  const repaymentType = (input.loan_repayment_type || 'bullet') as 'bullet' | 'equal' | 'interest_only';
  const gracePeriod = input.grace_period_months || 2;
  const loanSchedule = calculateLoanSchedule(
    loanAmount,
    interestRate,
    months.length,
    repaymentType,
    gracePeriod,
    months
  );

  // Calculate equity injection (remaining funding needed)
  const totalCost = adjustedConstructionCost + adjustedLandCost + adjustedSoftCosts;
  const equityNeeded = Math.max(0, totalCost - loanAmount);
  const equityAllocation = input.phasing_enabled ? 
    allocatePhasedEquity(equityNeeded, months, constructionCostAllocation, landCostAllocation, softCostAllocation) :
    allocateCostOverMonths(equityNeeded, months);

  // Calculate escrow reserves if required
  const escrowReserveAllocation: Record<string, number> = {};
  const escrowReleaseAllocation: Record<string, number> = {};
  
  if (input.escrow_required && (input.escrow_percent || 0) > 0) {
    const escrowReserve = totalCost * ((input.escrow_percent || 0) / 100);
    
    // Reserve escrow in first month
    if (months.length > 0) {
      escrowReserveAllocation[months[0]] = escrowReserve;
    }
    
    // Release escrow in final month
    if (months.length > 0) {
      escrowReleaseAllocation[months[months.length - 1]] = escrowReserve;
    }
  }

  // Build monthly cashflow
  let cumulativeCashBalance = 0;
  
  return months.map(month => {
    const constructionCost = constructionCostAllocation[month] || 0;
    const landCost = landCostAllocation[month] || 0;
    const softCosts = softCostAllocation[month] || 0;
    const loanDrawn = loanSchedule.loanDrawn[month] || 0;
    const loanInterest = loanSchedule.loanInterest[month] || 0;
    const loanRepayment = loanSchedule.loanRepayment[month] || 0;
    const equityInjected = equityAllocation[month] || 0;
    const revenue = revenueAllocation[month] || 0;
    const escrowReserved = escrowReserveAllocation[month] || 0;
    const escrowReleased = escrowReleaseAllocation[month] || 0;
    
    // Calculate VAT
    const vatOnCosts = input.vat_applicable ? 
      ((constructionCost + landCost + softCosts) * (input.vat_rate || 0)) / 100 : 0;
    const vatRecoverable = vatOnCosts; // Assuming VAT can be fully recovered
    
    // Calculate profit and zakat
    const totalCosts = constructionCost + landCost + softCosts + loanInterest;
    const profit = revenue - totalCosts;
    const zakatDue = input.zakat_applicable ? 
      calculateZakat(profit, input.zakat_rate_percent || 0) : 0;
    
    // Calculate net cashflow (including escrow)
    const cashIn = loanDrawn + equityInjected + revenue + vatRecoverable + escrowReleased;
    const cashOut = constructionCost + landCost + softCosts + loanInterest + loanRepayment + zakatDue + vatOnCosts + escrowReserved;
    const netCashflow = cashIn - cashOut;
    
    // Update cumulative cash balance
    cumulativeCashBalance += netCashflow;
    
    return {
      month,
      constructionCost,
      landCost,
      softCosts,
      loanDrawn,
      loanInterest,
      loanRepayment,
      equityInjected,
      revenue,
      profit,
      netCashflow,
      cashBalance: cumulativeCashBalance,
      zakatDue,
      vatOnCosts,
      vatRecoverable,
      escrowReserved,
      escrowReleased,
      // Revenue breakdown by segment (will be populated by revenue phasing logic)
      revenueResidential: 0,
      revenueRetail: 0,
      revenueOffice: 0,
    };
  });
}