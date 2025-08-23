/**
 * Types for Consolidation Mode - Multi-Project Support
 * Enables modeling multiple developments under a single parent model
 */

import { KPIMetrics } from "@/components/results/KPIOverviewPanel";

export type ProjectType = 'normal' | 'consolidation';

export interface ConsolidationSettings {
  weightingMethod: 'equal' | 'equity' | 'gfa' | 'revenue';
  aggregationRules: {
    irr: 'weighted' | 'average';
    npv: 'sum' | 'weighted';
    roi: 'weighted' | 'average';
  };
  riskAdjustments?: {
    correlationFactor: number; // 0-1, accounts for project correlation
    diversificationDiscount: number; // percentage reduction in overall risk
  };
}

export interface ChildProjectMetrics {
  projectId: string;
  name: string;
  metrics: KPIMetrics;
  warnings: Warning[];
  weight?: number; // Calculated based on weighting method
  contribution: {
    revenue: number;
    cost: number;
    equity: number;
    gfa?: number;
  };
}

export interface ConsolidatedResult {
  isConsolidated: true;
  children: ChildProjectMetrics[];
  totals: KPIMetrics;
  warnings: Warning[];
  consolidationSettings: ConsolidationSettings;
  aggregationBreakdown: {
    totalRevenue: number;
    totalCost: number;
    totalEquity: number;
    totalGFA?: number;
    weightedIRR: number;
    weightedROI: number;
    summedNPV: number;
  };
}

export interface Warning {
  type: 'warning' | 'error' | 'info';
  message: string;
  source?: string;
  projectId?: string;
}

// Extended project input interface for consolidation
export interface ConsolidatedProjectInputs {
  id?: string;
  name: string;
  projectType: ProjectType;
  parentProjectId?: string;
  children?: ConsolidatedProjectInputs[];
  consolidationSettings?: ConsolidationSettings;
  // ... other project fields
}

// Helper types for aggregation calculations
export interface ProjectWeight {
  projectId: string;
  weight: number;
  basis: 'equity' | 'gfa' | 'revenue' | 'equal';
}

export interface AggregationInput {
  projectId: string;
  metrics: KPIMetrics;
  equity: number;
  gfa?: number;
  revenue: number;
}
