import { supabase } from "@/integrations/supabase/client";
import type { FeaslyModelFormData } from "@/components/FeaslyModel/types";

// Core Types
export type MonthlyCashflow = {
  month: string; // e.g. "Mar 2026"
  constructionCost: number;
  landCost: number;
  softCosts: number;
  loanDrawn: number;
  loanInterest: number;
  loanRepayment: number;
  equityInjected: number;
  revenue: number;
  profit: number;
  netCashflow: number;
  cashBalance: number;
  zakatDue: number;
  vatOnCosts: number;
  vatRecoverable: number;
  escrowReserved: number;
  escrowReleased: number;
};

export type CashflowGrid = {
  base: MonthlyCashflow[];
  optimistic: MonthlyCashflow[];
  pessimistic: MonthlyCashflow[];
  custom: MonthlyCashflow[];
  version_label?: string;
};

export type ScenarioMultipliers = {
  constructionCostMultiplier: number;
  salePriceMultiplier: number;
  irrMultiplier: number;
};

// Scenario multipliers configuration
const SCENARIO_MULTIPLIERS: Record<string, ScenarioMultipliers> = {
  base: { constructionCostMultiplier: 1.0, salePriceMultiplier: 1.0, irrMultiplier: 1.0 },
  optimistic: { constructionCostMultiplier: 0.9, salePriceMultiplier: 1.15, irrMultiplier: 1.2 },
  pessimistic: { constructionCostMultiplier: 1.2, salePriceMultiplier: 0.9, irrMultiplier: 0.8 },
  custom: { constructionCostMultiplier: 1.05, salePriceMultiplier: 0.95, irrMultiplier: 1.0 }, // Light adjustments
};

// Utility Functions

/**
 * Generate monthly timeline grid from start to end date
 */
export function generateTimelineGrid(startDate: Date, endDate: Date): string[] {
  const months: string[] = [];
  const current = new Date(startDate);
  current.setDate(1); // Start from first day of month
  
  while (current <= endDate) {
    const monthName = current.toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
    months.push(monthName);
    current.setMonth(current.getMonth() + 1);
  }
  
  return months;
}

/**
 * Allocate total cost evenly over specified months
 */
export function allocateCostOverMonths(
  total: number, 
  months: string[]
): Record<string, number> {
  const monthlyAmount = total / months.length;
  return months.reduce((acc, month) => {
    acc[month] = monthlyAmount;
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Calculate revenue allocation over months (lump sum or amortized)
 */
export function calculateRevenueOverMonths(
  totalRevenue: number,
  completionMonth: string,
  allMonths: string[],
  amortizePeriodMonths: number = 6
): Record<string, number> {
  const revenue: Record<string, number> = {};
  
  // Initialize all months to 0
  allMonths.forEach(month => revenue[month] = 0);
  
  const completionIndex = allMonths.indexOf(completionMonth);
  if (completionIndex === -1) return revenue;
  
  // Amortize revenue over specified period starting from completion
  const monthlyRevenue = totalRevenue / amortizePeriodMonths;
  
  for (let i = 0; i < amortizePeriodMonths && (completionIndex + i) < allMonths.length; i++) {
    const monthIndex = completionIndex + i;
    revenue[allMonths[monthIndex]] = monthlyRevenue;
  }
  
  return revenue;
}

/**
 * Calculate loan schedule with interest and repayments
 */
export function calculateLoanSchedule(
  loanAmount: number,
  interestRate: number, // annual rate as decimal
  termMonths: number,
  repaymentType: 'bullet' | 'equal' | 'interest_only',
  gracePeriodMonths: number,
  allMonths: string[]
): {
  loanDrawn: Record<string, number>;
  loanInterest: Record<string, number>;
  loanRepayment: Record<string, number>;
} {
  const monthlyInterestRate = interestRate / 12;
  const loanDrawn: Record<string, number> = {};
  const loanInterest: Record<string, number> = {};
  const loanRepayment: Record<string, number> = {};
  
  // Initialize all months
  allMonths.forEach(month => {
    loanDrawn[month] = 0;
    loanInterest[month] = 0;
    loanRepayment[month] = 0;
  });
  
  // Draw loan in first month
  if (allMonths.length > 0) {
    loanDrawn[allMonths[0]] = loanAmount;
  }
  
  let outstandingBalance = loanAmount;
  
  allMonths.forEach((month, index) => {
    // Calculate monthly interest
    if (outstandingBalance > 0) {
      loanInterest[month] = outstandingBalance * monthlyInterestRate;
    }
    
    // Calculate repayments after grace period
    if (index >= gracePeriodMonths && outstandingBalance > 0) {
      switch (repaymentType) {
        case 'bullet':
          // Pay all principal at the end
          if (index === allMonths.length - 1) {
            loanRepayment[month] = outstandingBalance;
            outstandingBalance = 0;
          }
          break;
          
        case 'equal':
          // Equal monthly payments
          const remainingMonths = allMonths.length - index;
          const monthlyPayment = outstandingBalance / remainingMonths;
          loanRepayment[month] = monthlyPayment;
          outstandingBalance -= monthlyPayment;
          break;
          
        case 'interest_only':
          // Only interest payments, principal at end
          if (index === allMonths.length - 1) {
            loanRepayment[month] = outstandingBalance;
            outstandingBalance = 0;
          }
          break;
      }
    }
  });
  
  return { loanDrawn, loanInterest, loanRepayment };
}

/**
 * Calculate zakat on profit
 */
export function calculateZakat(profit: number, zakatRatePercent: number): number {
  return profit > 0 ? (profit * zakatRatePercent) / 100 : 0;
}

/**
 * Allocate costs over phases with specific timing and percentages
 */
export function allocatePhasedCosts(
  totalCost: number,
  months: string[],
  phases: Array<{ phase: string; startMonth: number; duration: number; costPercent: number }>
): Record<string, number> {
  const allocation: Record<string, number> = {};
  
  // Initialize all months to 0
  months.forEach(month => allocation[month] = 0);
  
  phases.forEach(phase => {
    const phaseCost = (totalCost * phase.costPercent) / 100;
    const monthlyAmount = phaseCost / phase.duration;
    
    for (let i = 0; i < phase.duration; i++) {
      const monthIndex = phase.startMonth + i;
      if (monthIndex < months.length) {
        allocation[months[monthIndex]] += monthlyAmount;
      }
    }
  });
  
  return allocation;
}

/**
 * Allocate equity based on actual cost timing in phased projects
 */
export function allocatePhasedEquity(
  totalEquity: number,
  months: string[],
  constructionCosts: Record<string, number>,
  landCosts: Record<string, number>,
  softCosts: Record<string, number>
): Record<string, number> {
  const allocation: Record<string, number> = {};
  
  // Calculate total monthly costs
  const monthlyCosts: Record<string, number> = {};
  months.forEach(month => {
    monthlyCosts[month] = 
      (constructionCosts[month] || 0) + 
      (landCosts[month] || 0) + 
      (softCosts[month] || 0);
  });
  
  const totalCosts = Object.values(monthlyCosts).reduce((sum, cost) => sum + cost, 0);
  
  // Allocate equity proportionally to costs
  months.forEach(month => {
    if (totalCosts > 0) {
      allocation[month] = (monthlyCosts[month] / totalCosts) * totalEquity;
    } else {
      allocation[month] = 0;
    }
  });
  
  return allocation;
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
    };
  });
}

/**
 * Main function to generate complete cashflow grid for all scenarios
 */
export async function generateCashflowGrid(
  input: FeaslyModelFormData,
  projectId: string,
  versionLabel?: string
): Promise<CashflowGrid> {
  const scenarios = ['base', 'optimistic', 'pessimistic', 'custom'] as const;
  const grid: CashflowGrid = {
    base: [],
    optimistic: [],
    pessimistic: [],
    custom: [],
    version_label: versionLabel || `v${Date.now()}`,
  };
  
  // Generate cashflow for each scenario
  for (const scenario of scenarios) {
    const multipliers = SCENARIO_MULTIPLIERS[scenario];
    grid[scenario] = buildScenarioGrid(input, multipliers, projectId);
  }
  
  // Store in database
  await saveCashflowToDatabase(projectId, grid);
  
  return grid;
}

/**
 * Save cashflow grid to Supabase database
 */
export async function saveCashflowToDatabase(
  projectId: string,
  grid: CashflowGrid
): Promise<void> {
  try {
    const versionLabel = grid.version_label || `v${Date.now()}`;
    
    // Mark all previous versions as not latest
    await supabase
      .from('feasly_cashflows')
      .update({ is_latest: false })
      .eq('project_id', projectId);
    
    // Prepare data for insertion
    const records: any[] = [];
    
    Object.entries(grid).forEach(([scenario, cashflows]) => {
      if (scenario === 'version_label') return; // Skip version_label property
      
      const cashflowArray = cashflows as MonthlyCashflow[];
      cashflowArray.forEach(cashflow => {
        records.push({
          project_id: projectId,
          scenario,
          month: cashflow.month,
          construction_cost: cashflow.constructionCost,
          land_cost: cashflow.landCost,
          soft_costs: cashflow.softCosts,
          loan_drawn: cashflow.loanDrawn,
          loan_interest: cashflow.loanInterest,
          loan_repayment: cashflow.loanRepayment,
          equity_injected: cashflow.equityInjected,
          revenue: cashflow.revenue,
          profit: cashflow.profit,
          net_cashflow: cashflow.netCashflow,
          cash_balance: cashflow.cashBalance,
          zakat_due: cashflow.zakatDue,
          vat_on_costs: cashflow.vatOnCosts,
          vat_recoverable: cashflow.vatRecoverable,
          escrow_reserved: cashflow.escrowReserved,
          escrow_released: cashflow.escrowReleased,
          version_label: versionLabel,
          is_latest: true,
        });
      });
    });
    
    // Insert new data
    const { error } = await supabase
      .from('feasly_cashflows')
      .insert(records);
    
    if (error) {
      console.error('Error saving cashflow data:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to save cashflow data:', error);
    throw error;
  }
}

/**
 * Load cashflow grid from database
 */
export async function loadCashflowFromDatabase(
  projectId: string,
  versionLabel?: string
): Promise<CashflowGrid | null> {
  try {
    let query = supabase
      .from('feasly_cashflows')
      .select('*')
      .eq('project_id', projectId);
    
    if (versionLabel) {
      query = query.eq('version_label', versionLabel);
    } else {
      query = query.eq('is_latest', true);
    }
    
    const { data, error } = await query.order('month');
    
    if (error) {
      console.error('Error loading cashflow data:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      return null;
    }
    
    // Group by scenario
    const grid: CashflowGrid = {
      base: [],
      optimistic: [],
      pessimistic: [],
      custom: [],
      version_label: data[0]?.version_label || undefined,
    };
    
    data.forEach(record => {
      const cashflow: MonthlyCashflow = {
        month: record.month,
        constructionCost: Number(record.construction_cost),
        landCost: Number(record.land_cost),
        softCosts: Number(record.soft_costs),
        loanDrawn: Number(record.loan_drawn),
        loanInterest: Number(record.loan_interest),
        loanRepayment: Number(record.loan_repayment),
        equityInjected: Number(record.equity_injected),
        revenue: Number(record.revenue),
        profit: Number(record.profit),
        netCashflow: Number(record.net_cashflow),
        cashBalance: Number(record.cash_balance),
        zakatDue: Number(record.zakat_due),
        vatOnCosts: Number(record.vat_on_costs || 0),
        vatRecoverable: Number(record.vat_recoverable || 0),
        escrowReserved: Number(record.escrow_reserved || 0),
        escrowReleased: Number(record.escrow_released || 0),
      };
      
      const scenarioKey = record.scenario as 'base' | 'optimistic' | 'pessimistic' | 'custom';
      if (scenarioKey in grid && Array.isArray(grid[scenarioKey])) {
        (grid[scenarioKey] as MonthlyCashflow[]).push(cashflow);
      }
    });
    
    return grid;
  } catch (error) {
    console.error('Failed to load cashflow data:', error);
    return null;
  }
}

/**
 * Get list of available versions for a project
 */
export async function getProjectVersions(projectId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('feasly_cashflows')
      .select('version_label')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading project versions:', error);
      return [];
    }
    
    // Get unique version labels
    const versions = [...new Set(data?.map(row => row.version_label).filter(Boolean) || [])];
    return versions;
  } catch (error) {
    console.error('Failed to load project versions:', error);
    return [];
  }
}