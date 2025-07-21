// Financial calculation utilities

export interface FinancialMetrics {
  totalConstructionCost: number;
  totalRevenue: number;
  totalOperatingCost: number;
  profitMargin: number;
  irr: number;
  paybackPeriod: number;
}

export interface Asset {
  id: string;
  gfa_sqm: number;
  construction_cost_aed: number;
  annual_operating_cost_aed: number;
  annual_revenue_potential_aed: number;
  occupancy_rate_percent: number;
  cap_rate_percent: number;
  development_timeline_months: number;
  stabilization_period_months: number;
}

export interface ScenarioOverride {
  asset_id: string;
  field_name: string;
  override_value: number;
}

// Get the effective value for a field (override if exists, otherwise base value)
export const getEffectiveValue = (
  asset: Asset,
  fieldName: keyof Asset,
  overrides: ScenarioOverride[]
): number => {
  const override = overrides.find(
    o => o.asset_id === asset.id && o.field_name === fieldName
  );
  return override ? override.override_value : Number(asset[fieldName]);
};

// NPV calculation helper
const calculateNPV = (cashFlows: number[], discountRate: number): number => {
  return cashFlows.reduce((npv, cashFlow, year) => {
    return npv + cashFlow / Math.pow(1 + discountRate, year);
  }, 0);
};

// IRR calculation using binary search
const calculateIRR = (cashFlows: number[]): number => {
  let low = -0.99;
  let high = 10.0;
  let tolerance = 0.0001;
  let maxIterations = 1000;
  
  for (let i = 0; i < maxIterations; i++) {
    const rate = (low + high) / 2;
    const npv = calculateNPV(cashFlows, rate);
    
    if (Math.abs(npv) < tolerance) {
      return rate;
    }
    
    if (npv > 0) {
      low = rate;
    } else {
      high = rate;
    }
  }
  
  return (low + high) / 2;
};

// Calculate payback period
const calculatePaybackPeriod = (cashFlows: number[]): number => {
  let cumulativeCashFlow = 0;
  
  for (let year = 0; year < cashFlows.length; year++) {
    cumulativeCashFlow += cashFlows[year];
    if (cumulativeCashFlow > 0) {
      // Linear interpolation for more precise payback period
      const previousCumulative = cumulativeCashFlow - cashFlows[year];
      const fraction = Math.abs(previousCumulative) / cashFlows[year];
      return year + fraction;
    }
  }
  
  return -1; // No payback within the period
};

export const calculateFinancialMetrics = (
  assets: Asset[],
  overrides: ScenarioOverride[] = []
): FinancialMetrics => {
  if (!assets || assets.length === 0) {
    return {
      totalConstructionCost: 0,
      totalRevenue: 0,
      totalOperatingCost: 0,
      profitMargin: 0,
      irr: 0,
      paybackPeriod: -1,
    };
  }

  // Calculate totals using effective values
  const totalConstructionCost = assets.reduce((sum, asset) => {
    return sum + getEffectiveValue(asset, 'construction_cost_aed', overrides);
  }, 0);

  const totalAnnualRevenue = assets.reduce((sum, asset) => {
    const revenue = getEffectiveValue(asset, 'annual_revenue_potential_aed', overrides);
    const occupancy = getEffectiveValue(asset, 'occupancy_rate_percent', overrides);
    return sum + (revenue * occupancy / 100);
  }, 0);

  const totalAnnualOperatingCost = assets.reduce((sum, asset) => {
    return sum + getEffectiveValue(asset, 'annual_operating_cost_aed', overrides);
  }, 0);

  // Calculate profit margin
  const profitMargin = totalAnnualRevenue > 0 
    ? ((totalAnnualRevenue - totalAnnualOperatingCost) / totalAnnualRevenue) * 100 
    : 0;

  // Calculate 10-year cash flows for IRR and payback
  const annualNetCashFlow = totalAnnualRevenue - totalAnnualOperatingCost;
  const cashFlows = [
    -totalConstructionCost, // Year 0: Initial investment
    ...Array(10).fill(annualNetCashFlow) // Years 1-10: Annual net cash flow
  ];

  // Calculate IRR
  let irr = 0;
  try {
    irr = calculateIRR(cashFlows) * 100; // Convert to percentage
    // Cap IRR at reasonable bounds
    if (irr > 1000 || irr < -100 || isNaN(irr)) {
      irr = 0;
    }
  } catch (error) {
    console.warn("IRR calculation failed:", error);
    irr = 0;
  }

  // Calculate payback period
  const paybackPeriod = calculatePaybackPeriod(cashFlows);

  return {
    totalConstructionCost,
    totalRevenue: totalAnnualRevenue,
    totalOperatingCost: totalAnnualOperatingCost,
    profitMargin,
    irr,
    paybackPeriod,
  };
};