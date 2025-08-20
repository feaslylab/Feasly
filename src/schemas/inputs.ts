import { z } from "zod";

export const ProjectSchema = z.object({
  start_date: z.string().min(1, "Start date is required"),
  periods: z.number().int().positive("Periods must be a positive integer"),
  periodicity: z.enum(["monthly", "quarterly", "yearly"]).default("monthly"),
  project_type: z.enum(["Residential", "Mixed-Use", "Retail", "Hospitality", "Industrial", "Master Plan"]).default("Residential"),
  developer_name: z.string().optional(),
  project_location: z.string().optional(),
  currency: z.string().default("AED"),
  duration_months: z.number().int().positive("Duration must be positive").optional(),
  masterplan_mode: z.boolean().default(false),
});
export type ProjectInput = z.infer<typeof ProjectSchema>;

export const UnitTypeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Name is required"),
  asset_subtype: z.string().min(1, "Asset subtype is required"),
  revenue_mode: z.enum(["sale", "rent"]),
  units: z.number().int().positive("Units must be > 0"),
  unit_area_sqm: z.number().positive("Unit area must be positive"),
  price_per_sqm: z.number().nonnegative("Price per sqm cannot be negative").optional(),
  rent_per_month: z.number().nonnegative("Rent cannot be negative").optional(),
  occupancy_rate: z.number().min(0, "Occupancy rate cannot be negative").max(1, "Occupancy rate cannot exceed 100%").optional(),
  lease_term_months: z.number().int().positive("Lease term must be positive").optional(),
  start_month: z.number().int().nonnegative().default(0),
  duration_months: z.number().int().positive().default(1),
}).refine(
  (data) => {
    if (data.revenue_mode === "sale") {
      return data.price_per_sqm !== undefined && data.price_per_sqm >= 0;
    }
    if (data.revenue_mode === "rent") {
      return data.rent_per_month !== undefined && 
             data.occupancy_rate !== undefined && 
             data.lease_term_months !== undefined &&
             data.rent_per_month >= 0 &&
             data.occupancy_rate >= 0 && data.occupancy_rate <= 1 &&
             data.lease_term_months > 0;
    }
    return true;
  },
  {
    message: "Required fields missing for selected revenue mode",
    path: ["revenue_mode"]
  }
);
export type UnitTypeInput = z.infer<typeof UnitTypeSchema>;

export const CostItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1, "Label is required"),
  amount: z.number().nonnegative("Amount must be positive"),
  category: z.enum(["construction", "land", "soft", "infra", "marketing", "other"]),
  cost_code: z.string().optional(),
  vat_input_eligible: z.boolean().default(false),
  is_capex: z.boolean().default(true),
  start_month: z.number().int().nonnegative().default(0),
  duration_months: z.number().int().positive().default(1),
});
export type CostItemInput = z.infer<typeof CostItemSchema>;

export const FinancingSliceSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["equity", "senior_debt", "mezzanine_debt"]),
  label: z.string().min(1, "Label is required"),
  amount: z.number().positive("Amount is required"),
  interest_rate: z.number().min(0).max(1).optional(),
  tenor_months: z.number().int().positive().optional(),
  dscr_min: z.number().min(0).max(5).optional(),
  is_interest_only: z.boolean().optional(),
  start_month: z.number().int().nonnegative().default(0),
});
export type FinancingSliceInput = z.infer<typeof FinancingSliceSchema>;

export const DebtItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Name is required"),
  type: z.enum(['senior', 'mezzanine', 'bridge']).default('senior'),
  amount: z.number().positive("Amount must be positive"),
  interest_rate: z.number().min(0, "Interest rate cannot be negative").max(100, "Interest rate cannot exceed 100%"),
  payment_type: z.enum(['paid', 'capitalized', 'bullet']).default('paid'),
  amortization: z.enum(['linear', 'bullet']).default('linear'),
  drawdown_start: z.number().int().nonnegative("Drawdown start cannot be negative").default(0),
  drawdown_end: z.number().int().nonnegative("Drawdown end cannot be negative").default(12),
  fees: z.number().nonnegative("Fees cannot be negative").default(0),
  // Legacy fields for backward compatibility
  start_month: z.number().int().nonnegative().optional(),
  term_months: z.number().int().positive().optional(),
}).refine(
  (data) => data.drawdown_end > data.drawdown_start,
  {
    message: "Drawdown end must be after drawdown start",
    path: ["drawdown_end"]
  }
);
export type DebtItemInput = z.infer<typeof DebtItemSchema>;