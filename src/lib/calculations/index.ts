// Main exports for the Feasly Calculation Engine

// Types
export type {
  MonthlyCashflow,
  CashflowGrid,
  ScenarioMultipliers,
  LoanSchedule,
  Phase
} from "./types";

export type { ScenarioSummary } from "./summaryMetrics";

// Core engine functions
export {
  generateCashflowGrid,
  saveCashflowToDatabase,
  loadCashflowFromDatabase,
  getProjectVersions
} from "./cashflowEngine";

// Scenario building
export {
  buildScenarioGrid,
  getScenarioMultipliers
} from "./scenarioBuilder";

// Loan calculations
export {
  calculateLoanSchedule
} from "./loanCalculations";

// Zakat and VAT
export {
  calculateZakat,
  calculateVATOnCosts,
  calculateRecoverableVAT
} from "./zakatAndVAT";

// Summary metrics
export {
  getScenarioSummary,
  compareScenarios
} from "./summaryMetrics";

// Utility functions
export {
  generateTimelineGrid,
  allocateCostOverMonths,
  calculateRevenueOverMonths,
  allocatePhasedCosts,
  allocatePhasedEquity
} from "./utils";

// Legacy compatibility exports (same API as original feaslyCalculationEngine.ts)
// All functions are already exported above, so no need to re-export them