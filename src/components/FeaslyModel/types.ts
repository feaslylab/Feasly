import { z } from "zod";

// Form schema for the Feasly Model with enhanced validation - Sprint 12 Update
export const feaslyModelSchema = z.object({
  // Project Metadata
  project_name: z.string().min(1, "Project name is required").max(100, "Project name too long"),
  description: z.string().optional(),
  location: z.string().optional(),
  sponsor_name: z.string().optional(),
  land_owner: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  planning_stage: z.string().optional(),
  currency_code: z.string().optional(),
  language: z.string().optional(),
  
  // Timeline & Phases (with validation)
  start_date: z.date({ required_error: "Start date is required" }).optional(),
  duration_months: z.number().min(0, "Duration must be positive").max(240, "Duration too long").optional(),
  construction_start_date: z.date().optional(),
  completion_date: z.date().optional(),
  stabilization_period_months: z.number().min(0, "Stabilization period must be positive").optional(),
  phasing_enabled: z.boolean().default(false),
  
  // Site & Area Metrics (with validation)
  site_area_sqm: z.number().min(0, "Site area must be positive").optional(),
  total_gfa_sqm: z.number().min(0, "GFA must be positive").optional(),
  efficiency_ratio: z.number().min(0, "Efficiency ratio must be positive").max(100, "Efficiency ratio cannot exceed 100%").optional(),
  far_ratio: z.number().min(0, "FAR ratio must be positive").optional(),
  height_stories: z.number().min(0, "Height must be positive").optional(),
  plot_number: z.string().optional(),
  buildable_ratio: z.number().min(0, "Buildable ratio must be positive").max(100, "Buildable ratio cannot exceed 100%").optional(),
  
  // System Settings (Sprint 12)
  unit_system: z.enum(['sqm', 'sqft', 'units']).default('sqm'),
  use_segmented_revenue: z.boolean().default(false),
  enable_escalation: z.boolean().default(false),
  
  // Financial Inputs (with strict validation)
  land_cost: z.number().min(0, "Land cost must be positive").optional(),
  construction_cost: z.number().min(0, "Construction cost must be positive").optional(),
  soft_costs: z.number().min(0, "Soft costs must be positive").optional(),
  marketing_cost: z.number().min(0, "Marketing cost must be positive").optional(),
  contingency_percent: z.number().min(0, "Contingency must be positive").max(50, "Contingency too high").optional(),
  zakat_applicable: z.boolean().default(false),
  zakat_rate_percent: z.number().min(0, "Zakat rate must be positive").max(100, "Zakat rate cannot exceed 100%").optional(),
  vat_applicable: z.boolean().default(false),
  vat_rate: z.number().min(0, "VAT rate must be positive").max(100, "VAT rate cannot exceed 100%").optional(),
  escrow_required: z.boolean().default(false),
  escrow_percent: z.number().min(0, "Escrow percentage must be positive").max(100, "Escrow percentage cannot exceed 100%").optional(),
  
  // Segmented GFA Fields (Sprint 12)
  gfa_residential: z.number().min(0, "Residential GFA must be positive").optional(),
  gfa_retail: z.number().min(0, "Retail GFA must be positive").optional(),
  gfa_office: z.number().min(0, "Office GFA must be positive").optional(),
  sale_price_residential: z.number().min(0, "Residential price must be positive").optional(),
  sale_price_retail: z.number().min(0, "Retail price must be positive").optional(),
  sale_price_office: z.number().min(0, "Office price must be positive").optional(),
  
  // Cost Escalation (Sprint 12)
  construction_escalation_percent: z.number().min(0, "Escalation rate must be positive").max(50, "Escalation rate too high").optional(),
  escalation_start_month: z.number().min(0, "Start month must be positive").optional(),
  escalation_duration_months: z.number().min(1, "Duration must be at least 1 month").optional(),
  
  // Funding & Capital (with validation)
  funding_type: z.string().optional(),
  total_funding: z.number().min(0, "Total funding must be positive").optional(),
  equity_contribution: z.number().min(0, "Equity contribution must be positive").optional(),
  loan_amount: z.number().min(0, "Loan amount must be positive").optional(),
  interest_rate: z.number().min(0, "Interest rate must be positive").max(100, "Interest rate too high").optional(),
  loan_term_years: z.number().min(0, "Loan term must be positive").max(50, "Loan term too long").optional(),
  grace_period_months: z.number().min(0, "Grace period must be positive").optional(),
  loan_repayment_type: z.string().optional(),
  
  // Revenue Projections (with validation)
  average_sale_price: z.number().min(0, "Sale price must be positive").optional(),
  expected_sale_rate_sqm_per_month: z.number().min(0, "Sale rate must be positive").optional(),
  expected_lease_rate: z.number().min(0, "Lease rate must be positive").optional(),
  yield_estimate: z.number().min(0, "Yield must be positive").max(100, "Yield cannot exceed 100%").optional(),
  target_irr: z.number().min(0, "IRR must be positive").max(100, "IRR target too high").optional(),
  target_roi: z.number().min(0, "ROI must be positive").max(1000, "ROI target too high").optional(),
  revenue_phasing_enabled: z.boolean().default(false),
}).refine((data) => {
  // Cross-field validation: construction start should be after project start
  if (data.start_date && data.construction_start_date) {
    return data.construction_start_date >= data.start_date;
  }
  return true;
}, {
  message: "Construction start date must be after project start date",
  path: ["construction_start_date"],
}).refine((data) => {
  // Cross-field validation: funding should cover costs
  const totalCosts = (data.land_cost || 0) + (data.construction_cost || 0) + (data.soft_costs || 0);
  if (totalCosts > 0 && data.total_funding && data.total_funding > 0) {
    return data.total_funding >= totalCosts;
  }
  return true;
}, {
  message: "Total funding must cover project costs",
  path: ["total_funding"],
});

export type FeaslyModelFormData = z.infer<typeof feaslyModelSchema>;

// Phase data structure
export interface Phase {
  phase_name: string;
  phase_start: Date | null;
  phase_end: Date | null;
  gfa_percent: number;
}

// Revenue segment structure
export interface RevenueSegment {
  segment_name: string;
  share_percent: number;
  start_offset_month: number;
  amortize_months: number;
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