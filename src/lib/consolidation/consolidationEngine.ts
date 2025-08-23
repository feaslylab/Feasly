/**
 * Consolidation Engine - Multi-Project Aggregation Logic
 * Handles consolidation of multiple project models into a single consolidated result
 */

import { 
  ConsolidatedResult, 
  ChildProjectMetrics, 
  ConsolidationSettings, 
  Warning,
  ProjectWeight,
  AggregationInput
} from "@/types/consolidation";
import { KPIMetrics } from "@/components/results/KPIOverviewPanel";

/**
 * Calculate project weights based on the specified weighting method
 */
export function calculateProjectWeights(
  projects: AggregationInput[],
  method: ConsolidationSettings['weightingMethod']
): ProjectWeight[] {
  switch (method) {
    case 'equal':
      const equalWeight = 1 / projects.length;
      return projects.map(p => ({
        projectId: p.projectId,
        weight: equalWeight,
        basis: 'equal' as const
      }));

    case 'equity':
      const totalEquity = projects.reduce((sum, p) => sum + p.equity, 0);
      return projects.map(p => ({
        projectId: p.projectId,
        weight: totalEquity > 0 ? p.equity / totalEquity : 0,
        basis: 'equity' as const
      }));

    case 'gfa':
      const totalGFA = projects.reduce((sum, p) => sum + (p.gfa || 0), 0);
      return projects.map(p => ({
        projectId: p.projectId,
        weight: totalGFA > 0 ? (p.gfa || 0) / totalGFA : 0,
        basis: 'gfa' as const
      }));

    case 'revenue':
      const totalRevenue = projects.reduce((sum, p) => sum + p.revenue, 0);
      return projects.map(p => ({
        projectId: p.projectId,
        weight: totalRevenue > 0 ? p.revenue / totalRevenue : 0,
        basis: 'revenue' as const
      }));

    default:
      throw new Error(`Unknown weighting method: ${method}`);
  }
}

/**
 * Aggregate KPI metrics across multiple projects
 */
export function aggregateKPIs(
  projects: AggregationInput[],
  weights: ProjectWeight[],
  settings: ConsolidationSettings
): KPIMetrics {
  const weightMap = new Map(weights.map(w => [w.projectId, w.weight]));

  // Calculate totals
  const totalRevenue = projects.reduce((sum, p) => sum + p.revenue, 0);
  const totalCost = projects.reduce((sum, p) => sum + p.metrics.total_cost, 0);
  const totalEquity = projects.reduce((sum, p) => sum + p.equity, 0);

  // Calculate weighted IRR
  const weightedIRR = projects.reduce((sum, p) => {
    const weight = weightMap.get(p.projectId) || 0;
    return sum + (p.metrics.irr_pa * weight);
  }, 0);

  // Calculate weighted ROI
  const weightedROI = projects.reduce((sum, p) => {
    const weight = weightMap.get(p.projectId) || 0;
    return sum + (p.metrics.roi * weight);
  }, 0);

  // Sum NPV (always additive)
  const summedNPV = projects.reduce((sum, p) => sum + p.metrics.npv, 0);

  // Calculate weighted equity multiple
  const weightedEquityMultiple = projects.reduce((sum, p) => {
    const weight = weightMap.get(p.projectId) || 0;
    return sum + (p.metrics.equity_multiple * weight);
  }, 0);

  // Calculate weighted profit percentage
  const weightedProfitPct = totalRevenue > 0 ? 
    ((totalRevenue - totalCost) / totalRevenue) * 100 : 0;

  // Calculate project value (sum of all project values)
  const totalProjectValue = projects.reduce((sum, p) => sum + p.metrics.project_value, 0);

  // Optional metrics (weighted averages where available)
  const validDSCRProjects = projects.filter(p => p.metrics.dscr_min !== undefined);
  const weightedDSCR = validDSCRProjects.length > 0 ? 
    validDSCRProjects.reduce((sum, p, _, arr) => {
      const weight = weightMap.get(p.projectId) || 0;
      return sum + ((p.metrics.dscr_min || 0) * weight);
    }, 0) : undefined;

  const validCashOnCashProjects = projects.filter(p => p.metrics.cash_on_cash !== undefined);
  const weightedCashOnCash = validCashOnCashProjects.length > 0 ?
    validCashOnCashProjects.reduce((sum, p) => {
      const weight = weightMap.get(p.projectId) || 0;
      return sum + ((p.metrics.cash_on_cash || 0) * weight);
    }, 0) : undefined;

  return {
    npv: summedNPV,
    irr_pa: weightedIRR,
    equity_multiple: weightedEquityMultiple,
    profit_pct: weightedProfitPct,
    project_value: totalProjectValue,
    total_cost: totalCost,
    roi: weightedROI,
    dscr_min: weightedDSCR,
    cash_on_cash: weightedCashOnCash,
    payback_months: undefined // TODO: Implement consolidated payback calculation
  };
}

/**
 * Consolidate warnings from multiple projects
 */
export function consolidateWarnings(
  childMetrics: ChildProjectMetrics[],
  aggregatedKPIs: KPIMetrics
): Warning[] {
  const warnings: Warning[] = [];

  // Collect all child warnings
  childMetrics.forEach(child => {
    child.warnings.forEach(warning => {
      warnings.push({
        ...warning,
        projectId: child.projectId,
        source: `${child.name}: ${warning.source || 'Project'}`
      });
    });
  });

  // Add consolidation-specific warnings
  if (childMetrics.length < 2) {
    warnings.push({
      type: 'warning',
      message: 'Consolidation mode requires at least 2 child projects for meaningful analysis',
      source: 'Consolidation Engine'
    });
  }

  // Check for extreme variance in IRRs
  const irrs = childMetrics.map(c => c.metrics.irr_pa);
  const irrVariance = Math.max(...irrs) - Math.min(...irrs);
  if (irrVariance > 20) { // 20% variance
    warnings.push({
      type: 'warning',
      message: `High IRR variance detected across projects (${irrVariance.toFixed(1)}%). Consider risk correlation adjustments.`,
      source: 'Consolidation Engine'
    });
  }

  // Check for negative NPV in consolidation
  if (aggregatedKPIs.npv < 0) {
    warnings.push({
      type: 'error',
      message: 'Consolidated NPV is negative. Review individual project performance.',
      source: 'Consolidation Engine'
    });
  }

  return warnings;
}

/**
 * Main consolidation function - aggregates multiple project results
 */
export function consolidateProjects(
  childProjects: ChildProjectMetrics[],
  settings: ConsolidationSettings
): ConsolidatedResult {
  // Prepare aggregation inputs
  const aggregationInputs: AggregationInput[] = childProjects.map(child => ({
    projectId: child.projectId,
    metrics: child.metrics,
    equity: child.contribution.equity,
    gfa: child.contribution.gfa,
    revenue: child.contribution.revenue
  }));

  // Calculate weights
  const weights = calculateProjectWeights(aggregationInputs, settings.weightingMethod);

  // Apply weights to child metrics
  const weightedChildren = childProjects.map(child => {
    const weight = weights.find(w => w.projectId === child.projectId)?.weight || 0;
    return {
      ...child,
      weight
    };
  });

  // Aggregate KPIs
  const aggregatedKPIs = aggregateKPIs(aggregationInputs, weights, settings);

  // Calculate breakdown totals
  const aggregationBreakdown = {
    totalRevenue: aggregationInputs.reduce((sum, p) => sum + p.revenue, 0),
    totalCost: aggregationInputs.reduce((sum, p) => sum + p.metrics.total_cost, 0),
    totalEquity: aggregationInputs.reduce((sum, p) => sum + p.equity, 0),
    totalGFA: aggregationInputs.reduce((sum, p) => sum + (p.gfa || 0), 0),
    weightedIRR: aggregatedKPIs.irr_pa,
    weightedROI: aggregatedKPIs.roi,
    summedNPV: aggregatedKPIs.npv
  };

  // Consolidate warnings
  const consolidatedWarnings = consolidateWarnings(weightedChildren, aggregatedKPIs);

  return {
    isConsolidated: true,
    children: weightedChildren,
    totals: aggregatedKPIs,
    warnings: consolidatedWarnings,
    consolidationSettings: settings,
    aggregationBreakdown
  };
}

/**
 * Default consolidation settings
 */
export const DEFAULT_CONSOLIDATION_SETTINGS: ConsolidationSettings = {
  weightingMethod: 'equity',
  aggregationRules: {
    irr: 'weighted',
    npv: 'sum',
    roi: 'weighted'
  },
  riskAdjustments: {
    correlationFactor: 0.7, // Assume 70% correlation between projects
    diversificationDiscount: 0.05 // 5% risk reduction from diversification
  }
};