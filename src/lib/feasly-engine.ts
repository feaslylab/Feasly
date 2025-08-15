// Temporary implementation of feasly-engine functionality
// This replaces the missing packages/feasly-engine dependency

export interface ConstructionItem {
  baseCost: number;
  startPeriod: number;
  endPeriod: number;
  escalationRate?: number;
  retentionPercent?: number;
  retentionReleaseLag?: number;
}

export interface SaleLine {
  units: number;
  pricePerUnit: number;
  startPeriod: number;
  endPeriod: number;
  escalation?: number;
  velocityPercent?: number;
}

export interface RentalLine {
  rooms: number;
  adr: number;
  occupancyRate: number;
  startPeriod: number;
  endPeriod: number;
  annualEscalation?: number;
}

export interface LoanFacility {
  maxAmount: number;
  interestRate: number;
  termMonths: number;
  limit?: number;
  rate?: number;
  ltcPercent?: number;
  annualRate?: number;
  startPeriod?: number;
  maturityPeriod?: number;
  interestOnly?: boolean;
  drawPeriods?: number[];
  repaymentStart?: number;
}

export interface KPIResults {
  npv: number;
  projectIRR: number;
  profit: number;
  totalRevenue?: number;
  totalCosts?: number;
  paybackPeriod?: number;
}

export interface LoanRows {
  draw: number[];
  repay: number[];
  interest: number[];
  balance: number[];
}

// Simple construction cost spread function
export function buildConstructionRow(item: ConstructionItem, horizon: number): number[] {
  const row = Array(horizon).fill(0);
  if (!item || item.startPeriod < 0 || item.endPeriod >= horizon) return row;
  
  const periodLength = Math.max(1, item.endPeriod - item.startPeriod + 1);
  const costPerPeriod = item.baseCost / periodLength;
  
  for (let i = item.startPeriod; i <= item.endPeriod && i < horizon; i++) {
    row[i] = costPerPeriod;
  }
  
  return row;
}

// Simple sales revenue function
export function buildSaleRevenue(line: SaleLine, horizon: number): number[] {
  const row = Array(horizon).fill(0);
  if (!line || line.startPeriod < 0 || line.endPeriod >= horizon) return row;
  
  const totalRevenue = line.units * line.pricePerUnit;
  const periodLength = Math.max(1, line.endPeriod - line.startPeriod + 1);
  const revenuePerPeriod = totalRevenue / periodLength;
  
  for (let i = line.startPeriod; i <= line.endPeriod && i < horizon; i++) {
    row[i] = revenuePerPeriod;
  }
  
  return row;
}

// Simple rental revenue function
export function buildRentalRevenue(line: RentalLine, horizon: number): number[] {
  const row = Array(horizon).fill(0);
  if (!line || line.startPeriod < 0 || line.endPeriod >= horizon) return row;
  
  const monthlyRevenue = line.rooms * line.adr * line.occupancyRate * 30; // Approximate monthly
  
  for (let i = line.startPeriod; i <= line.endPeriod && i < horizon; i++) {
    row[i] = monthlyRevenue;
  }
  
  return row;
}

// Simple interest calculation
export function accrueInterestRow(balances: number[], rate: number): number[] {
  const monthlyRate = rate / 12;
  return balances.map(balance => balance * monthlyRate);
}

// Simple loan schedule
export function buildLoanSchedule(facility: LoanFacility, constructionCosts: number[], horizon: number): LoanRows {
  const draw = Array(horizon).fill(0);
  const repay = Array(horizon).fill(0);
  const interest = Array(horizon).fill(0);
  const balance = Array(horizon).fill(0);
  
  let currentBalance = 0;
  const monthlyRate = facility.interestRate / 12;
  
  // Draw based on construction costs
  for (let i = 0; i < horizon; i++) {
    if (constructionCosts[i] > 0 && currentBalance + constructionCosts[i] <= facility.maxAmount) {
      draw[i] = constructionCosts[i];
      currentBalance += constructionCosts[i];
    }
    
    balance[i] = currentBalance;
    interest[i] = currentBalance * monthlyRate;
    
    // Simple repayment logic - start after construction
    if (i > 24 && currentBalance > 0) {
      const monthlyRepayment = Math.min(currentBalance / 12, currentBalance);
      repay[i] = monthlyRepayment;
      currentBalance -= monthlyRepayment;
    }
  }
  
  return { draw, repay, interest, balance };
}

// Simple NPV and IRR calculation
export function computeKPIs(cash: number[], options: { discountRate: number }): KPIResults {
  if (!Array.isArray(cash) || cash.length === 0) {
    return { npv: 0, projectIRR: 0, profit: 0 };
  }

  const { discountRate } = options;
  
  // Calculate NPV
  let npv = 0;
  for (let i = 0; i < cash.length; i++) {
    npv += cash[i] / Math.pow(1 + discountRate / 12, i);
  }
  
  // Calculate total profit (sum of cash flows)
  const profit = cash.reduce((sum, value) => sum + value, 0);
  
  // Simple IRR approximation (this would normally use iterative methods)
  let irr = 0;
  if (profit > 0) {
    irr = Math.max(0, discountRate + (npv / Math.abs(profit)) * 0.1);
  }
  
  return {
    npv: Math.round(npv),
    projectIRR: Math.round(irr * 10000) / 100, // Convert to percentage
    profit: Math.round(profit),
    totalRevenue: Math.round(cash.filter(c => c > 0).reduce((sum, c) => sum + c, 0)),
    totalCosts: Math.round(Math.abs(cash.filter(c => c < 0).reduce((sum, c) => sum + c, 0))),
  };
}