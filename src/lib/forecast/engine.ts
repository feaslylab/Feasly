import { FeaslyModelFormData } from "@/components/FeaslyModel/types";

export interface ForecastDelta {
  revenue_delta_percent: number;
  cost_delta_percent: number;
  delay_months: number;
}

export interface KPIResult {
  total_cost: number;
  total_revenue: number;
  profit: number;
  profit_margin: number;
  roi: number;
  irr: number;
  payback_period: number;
  zakat_due: number;
}

export interface ForecastResult extends KPIResult {
  scenario_name: string;
  delta_applied: ForecastDelta;
}

/**
 * Calculates base KPIs from form data
 */
export function calculateBaseKPIs(formData: FeaslyModelFormData): KPIResult {
  const total_cost = 
    (formData.land_cost || 0) + 
    (formData.construction_cost || 0) + 
    (formData.soft_costs || 0);
  
  // Calculate total revenue from segmented approach or average sale price
  let total_revenue = 0;
  if (formData.use_segmented_revenue) {
    total_revenue = 
      ((formData.gfa_residential || 0) * (formData.sale_price_residential || 0)) +
      ((formData.gfa_retail || 0) * (formData.sale_price_retail || 0)) +
      ((formData.gfa_office || 0) * (formData.sale_price_office || 0));
  } else {
    total_revenue = (formData.total_gfa_sqm || 0) * (formData.average_sale_price || 0);
  }
  
  const profit = total_revenue - total_cost;
  const profit_margin = total_revenue > 0 ? (profit / total_revenue) * 100 : 0;
  
  // ROI calculation
  const roi = total_cost > 0 ? (profit / total_cost) * 100 : 0;
  
  // Simple IRR approximation (for demo purposes)
  const duration_years = (formData.duration_months || 12) / 12;
  const irr = duration_years > 0 && total_cost > 0 
    ? ((Math.pow(total_revenue / total_cost, 1/duration_years) - 1) * 100)
    : 0;
  
  // Payback period in months
  const monthly_cashflow = profit > 0 ? profit / (formData.duration_months || 12) : 0;
  const payback_period = monthly_cashflow > 0 ? Math.ceil(total_cost / monthly_cashflow) : 999;
  
  // Zakat calculation
  const zakat_rate = formData.zakat_rate_percent || 2.5;
  const zakat_due = formData.zakat_applicable ? (profit * zakat_rate) / 100 : 0;

  return {
    total_cost,
    total_revenue,
    profit,
    profit_margin,
    roi,
    irr,
    payback_period,
    zakat_due
  };
}

/**
 * Applies forecast delta to base KPIs and recalculates
 */
export function runForecastDelta(baseKPIs: KPIResult, delta: ForecastDelta, formData: FeaslyModelFormData): ForecastResult {
  // Apply deltas
  const adjusted_revenue = baseKPIs.total_revenue * (1 + delta.revenue_delta_percent / 100);
  const adjusted_cost = baseKPIs.total_cost * (1 + delta.cost_delta_percent / 100);
  const adjusted_timeline = (formData.duration_months || 12) + delta.delay_months;
  
  // Recalculate KPIs with adjustments
  const profit = adjusted_revenue - adjusted_cost;
  const profit_margin = adjusted_revenue > 0 ? (profit / adjusted_revenue) * 100 : 0;
  const roi = adjusted_cost > 0 ? (profit / adjusted_cost) * 100 : 0;
  
  // Adjusted IRR with timeline consideration
  const duration_years = adjusted_timeline / 12;
  const irr = duration_years > 0 && adjusted_cost > 0 
    ? ((Math.pow(adjusted_revenue / adjusted_cost, 1/duration_years) - 1) * 100)
    : 0;
  
  // Adjusted payback period
  const monthly_cashflow = profit > 0 ? profit / adjusted_timeline : 0;
  const payback_period = monthly_cashflow > 0 ? Math.ceil(adjusted_cost / monthly_cashflow) : 999;
  
  // Zakat on adjusted profit
  const zakat_rate = formData.zakat_rate_percent || 2.5;
  const zakat_due = formData.zakat_applicable ? (profit * zakat_rate) / 100 : 0;

  return {
    total_cost: adjusted_cost,
    total_revenue: adjusted_revenue,
    profit,
    profit_margin,
    roi,
    irr,
    payback_period,
    zakat_due,
    scenario_name: `${delta.revenue_delta_percent > 0 ? '+' : ''}${delta.revenue_delta_percent}% Rev, ${delta.cost_delta_percent > 0 ? '+' : ''}${delta.cost_delta_percent}% Cost, ${delta.delay_months > 0 ? '+' : ''}${delta.delay_months}mo`,
    delta_applied: delta
  };
}

/**
 * Generate multiple forecast scenarios
 */
export function generateForecastScenarios(baseKPIs: KPIResult, formData: FeaslyModelFormData): ForecastResult[] {
  const scenarios: ForecastDelta[] = [
    { revenue_delta_percent: 10, cost_delta_percent: 0, delay_months: 0 }, // Optimistic revenue
    { revenue_delta_percent: -10, cost_delta_percent: 0, delay_months: 0 }, // Pessimistic revenue
    { revenue_delta_percent: 0, cost_delta_percent: 15, delay_months: 3 }, // Cost overrun + delay
    { revenue_delta_percent: 5, cost_delta_percent: 10, delay_months: 2 }, // Mixed scenario
    { revenue_delta_percent: -5, cost_delta_percent: 20, delay_months: 6 }, // Worst case
  ];

  return scenarios.map(delta => runForecastDelta(baseKPIs, delta, formData));
}

/**
 * Compare forecast result with benchmarks
 */
export function compareToBenchmarks(result: ForecastResult | KPIResult, assetType: string = 'mixed') {
  // Industry benchmarks (these would come from feasly_benchmarks table in real implementation)
  const benchmarks = {
    mixed: { min_irr: 12, target_irr: 18, min_roi: 15, target_roi: 25 },
    residential: { min_irr: 10, target_irr: 15, min_roi: 12, target_roi: 20 },
    commercial: { min_irr: 8, target_irr: 12, min_roi: 10, target_roi: 18 },
    retail: { min_irr: 15, target_irr: 22, min_roi: 18, target_roi: 30 }
  };

  const benchmark = benchmarks[assetType as keyof typeof benchmarks] || benchmarks.mixed;
  
  return {
    irr_status: result.irr >= benchmark.target_irr ? 'excellent' : 
                result.irr >= benchmark.min_irr ? 'good' : 'poor',
    roi_status: result.roi >= benchmark.target_roi ? 'excellent' : 
                result.roi >= benchmark.min_roi ? 'good' : 'poor',
    overall_rating: result.irr >= benchmark.min_irr && result.roi >= benchmark.min_roi ? 
                   (result.irr >= benchmark.target_irr && result.roi >= benchmark.target_roi ? 'excellent' : 'good') : 'poor'
  };
}