/**
 * Financial constants and default values for Feasly platform
 * Centralized location for all financial defaults and multipliers
 */

// Default rates and percentages
export const DEFAULT_RATES = {
  VAT_RATE: 5.0, // 5% VAT (UAE standard)
  ZAKAT_RATE: 2.5, // 2.5% Zakat (Islamic standard)
  LOAN_INTEREST_RATE: 6.0, // 6% default loan interest rate
  CONTINGENCY_RATE: 10.0, // 10% default contingency
  ESCROW_RATE: 5.0, // 5% default escrow percentage
} as const;

// Scenario multipliers for different market conditions
export const SCENARIO_MULTIPLIERS = {
  base: {
    constructionCostMultiplier: 1.0,
    salePriceMultiplier: 1.0,
    irrMultiplier: 1.0,
  },
  optimistic: {
    constructionCostMultiplier: 0.9, // 10% cost reduction
    salePriceMultiplier: 1.15, // 15% price increase
    irrMultiplier: 1.2, // 20% IRR improvement
  },
  pessimistic: {
    constructionCostMultiplier: 1.2, // 20% cost increase
    salePriceMultiplier: 0.9, // 10% price reduction
    irrMultiplier: 0.8, // 20% IRR reduction
  },
  custom: {
    constructionCostMultiplier: 1.05, // 5% cost increase (conservative)
    salePriceMultiplier: 0.95, // 5% price reduction (conservative)
    irrMultiplier: 1.0, // No IRR adjustment
  },
} as const;

// Loan repayment types
export const LOAN_REPAYMENT_TYPES = {
  BULLET: 'bullet',
  EQUAL: 'equal',
  INTEREST_ONLY: 'interest_only',
} as const;

// Default project timelines and phases
export const DEFAULT_TIMELINES = {
  DEFAULT_PROJECT_DURATION_MONTHS: 24,
  DEFAULT_CONSTRUCTION_DURATION_MONTHS: 18,
  DEFAULT_STABILIZATION_PERIOD_MONTHS: 6,
  DEFAULT_GRACE_PERIOD_MONTHS: 2,
} as const;

// Currency and localization defaults
export const DEFAULT_CURRENCY = {
  CODE: 'AED',
  SYMBOL: 'د.إ',
  DECIMAL_PLACES: 2,
} as const;

// Phase distribution for phased projects
export const PHASED_CONSTRUCTION = {
  FOUNDATION: {
    DURATION_PERCENT: 0.25, // 25% of total duration
    COST_PERCENT: 30, // 30% of construction cost
  },
  STRUCTURE: {
    START_PERCENT: 0.2, // Starts at 20% of timeline
    DURATION_PERCENT: 0.4, // 40% of total duration
    COST_PERCENT: 45, // 45% of construction cost
  },
  FINISHING: {
    START_PERCENT: 0.6, // Starts at 60% of timeline
    DURATION_PERCENT: 0.35, // 35% of total duration
    COST_PERCENT: 25, // 25% of construction cost
  },
} as const;

export const PHASED_SOFT_COSTS = {
  DESIGN: {
    DURATION_PERCENT: 0.3, // 30% of total duration
    COST_PERCENT: 40, // 40% of soft costs
  },
  PERMITS: {
    START_PERCENT: 0.1, // Starts at 10% of timeline
    DURATION_PERCENT: 0.2, // 20% of total duration
    COST_PERCENT: 20, // 20% of soft costs
  },
  MANAGEMENT: {
    START_PERCENT: 0, // Starts from beginning
    DURATION_PERCENT: 1.0, // 100% of total duration
    COST_PERCENT: 40, // 40% of soft costs
  },
} as const;

// Revenue recognition patterns
export const REVENUE_PATTERNS = {
  COMPLETION_START_PERCENT: 0.75, // Revenue starts after 75% completion for phased projects
  DEFAULT_AMORTIZATION_MONTHS: 6, // Default revenue amortization period
  MINIMUM_AMORTIZATION_MONTHS: 3, // Minimum revenue amortization period
} as const;

// Risk assessment thresholds
export const RISK_THRESHOLDS = {
  HIGH_RISK_IRR: 15, // IRR below 15% is considered high risk
  MEDIUM_RISK_IRR: 20, // IRR below 20% is considered medium risk
  HIGH_RISK_PROFIT_MARGIN: 15, // Profit margin below 15% is high risk
  MEDIUM_RISK_PROFIT_MARGIN: 25, // Profit margin below 25% is medium risk
  LOW_ROI_THRESHOLD: 5, // ROI below 5% is considered low
  NEGATIVE_PROFIT_THRESHOLD: 0, // Negative profit is a major red flag
} as const;

// KPI benchmarks for comparison
export const KPI_BENCHMARKS = {
  EXCELLENT_IRR: 25, // IRR above 25% is excellent
  GOOD_IRR: 20, // IRR above 20% is good
  EXCELLENT_ROI: 40, // ROI above 40% is excellent
  GOOD_ROI: 25, // ROI above 25% is good
  EXCELLENT_PROFIT_MARGIN: 35, // Profit margin above 35% is excellent
  GOOD_PROFIT_MARGIN: 25, // Profit margin above 25% is good
} as const;

// Future enhancement: Regional overrides
// These could be loaded from database or configuration files
export const REGIONAL_OVERRIDES = {
  UAE: {
    VAT_RATE: 5.0,
    ZAKAT_RATE: 2.5,
    DEFAULT_CURRENCY: 'AED',
  },
  KSA: {
    VAT_RATE: 15.0,
    ZAKAT_RATE: 2.5,
    DEFAULT_CURRENCY: 'SAR',
  },
  // Add more regions as needed
} as const;

// Future enhancement: Client-specific overrides
// These could be stored in user preferences or project settings
export interface ClientOverrides {
  vatRate?: number;
  zakatRate?: number;
  defaultInterestRate?: number;
  contingencyRate?: number;
  escrowRate?: number;
  currency?: string;
  customMultipliers?: typeof SCENARIO_MULTIPLIERS;
}

/**
 * Get financial constants for a specific region
 * @param region - Region code (e.g., 'UAE', 'KSA')
 * @returns Regional financial constants
 */
export function getRegionalConstants(region: keyof typeof REGIONAL_OVERRIDES = 'UAE') {
  const regional = REGIONAL_OVERRIDES[region];
  return {
    ...DEFAULT_RATES,
    VAT_RATE: regional.VAT_RATE,
    ZAKAT_RATE: regional.ZAKAT_RATE,
    DEFAULT_CURRENCY: regional.DEFAULT_CURRENCY,
  };
}

/**
 * Apply client-specific overrides to default constants
 * @param overrides - Client-specific overrides
 * @returns Customized financial constants
 */
export function applyClientOverrides(overrides: ClientOverrides = {}) {
  return {
    ...DEFAULT_RATES,
    VAT_RATE: overrides.vatRate ?? DEFAULT_RATES.VAT_RATE,
    ZAKAT_RATE: overrides.zakatRate ?? DEFAULT_RATES.ZAKAT_RATE,
    LOAN_INTEREST_RATE: overrides.defaultInterestRate ?? DEFAULT_RATES.LOAN_INTEREST_RATE,
    CONTINGENCY_RATE: overrides.contingencyRate ?? DEFAULT_RATES.CONTINGENCY_RATE,
    ESCROW_RATE: overrides.escrowRate ?? DEFAULT_RATES.ESCROW_RATE,
  };
}