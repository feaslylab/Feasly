// Core Types for Feasly Calculation Engine

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
  // Revenue breakdown by segment
  revenueResidential: number;
  revenueRetail: number;
  revenueOffice: number;
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

export type LoanSchedule = {
  loanDrawn: Record<string, number>;
  loanInterest: Record<string, number>;
  loanRepayment: Record<string, number>;
};

export type Phase = {
  phase: string;
  startMonth: number;
  duration: number;
  costPercent: number;
};