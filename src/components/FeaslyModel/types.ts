import { z } from "zod";

// Form schema for the Feasly Model
export const feaslyModelSchema = z.object({
  // Project Metadata
  project_name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  location: z.string().optional(),
  sponsor_name: z.string().optional(),
  land_owner: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  planning_stage: z.string().optional(),
  currency_code: z.string().optional(),
  language: z.string().optional(),
  
  // Timeline & Phases
  start_date: z.date().optional(),
  duration_months: z.number().min(0).optional(),
  construction_start_date: z.date().optional(),
  completion_date: z.date().optional(),
  stabilization_period_months: z.number().min(0).optional(),
  phasing_enabled: z.boolean().default(false),
  
  // Site & Area Metrics
  site_area_sqm: z.number().min(0).optional(),
  total_gfa_sqm: z.number().min(0).optional(),
  efficiency_ratio: z.number().min(0).max(100).optional(),
  far_ratio: z.number().min(0).optional(),
  height_stories: z.number().min(0).optional(),
  plot_number: z.string().optional(),
  buildable_ratio: z.number().min(0).max(100).optional(),
  
  // Financial Inputs
  land_cost: z.number().min(0).optional(),
  construction_cost: z.number().min(0).optional(),
  soft_costs: z.number().min(0).optional(),
  marketing_cost: z.number().min(0).optional(),
  contingency_percent: z.number().min(0).max(100).optional(),
  zakat_applicable: z.boolean().default(false),
  zakat_rate_percent: z.number().min(0).max(100).optional(),
  vat_applicable: z.boolean().default(false),
  vat_rate: z.number().min(0).max(100).optional(),
  escrow_required: z.boolean().default(false),
  
  // Funding & Capital
  funding_type: z.string().optional(),
  total_funding: z.number().min(0).optional(),
  equity_contribution: z.number().min(0).optional(),
  loan_amount: z.number().min(0).optional(),
  interest_rate: z.number().min(0).max(100).optional(),
  loan_term_years: z.number().min(0).optional(),
  grace_period_months: z.number().min(0).optional(),
  loan_repayment_type: z.string().optional(),
  
  // Revenue Projections
  average_sale_price: z.number().min(0).optional(),
  expected_sale_rate_sqm_per_month: z.number().min(0).optional(),
  expected_lease_rate: z.number().min(0).optional(),
  yield_estimate: z.number().min(0).max(100).optional(),
  target_irr: z.number().min(0).max(100).optional(),
  target_roi: z.number().min(0).max(100).optional(),
});

export type FeaslyModelFormData = z.infer<typeof feaslyModelSchema>;

// Phase data structure
export interface Phase {
  phase_name: string;
  phase_start: Date | null;
  phase_end: Date | null;
  gfa_percent: number;
}

// Scenario types
export type ScenarioType = "base" | "optimistic" | "pessimistic" | "custom";

export interface ScenarioOverrides {
  construction_cost?: number;
  land_cost?: number;
  average_sale_price?: number;
  yield_estimate?: number;
  target_irr?: number;
  expected_lease_rate?: number;
}

// KPI calculation results
export interface KPIResults {
  total_cost: number;
  total_revenue: number;
  profit: number;
  profit_margin: number;
  roi: number;
  irr: number;
  payback_period: number;
  zakat_due?: number;
}