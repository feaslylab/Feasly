import { z } from "zod";
import Decimal from "decimal.js";

export const Periodicity = z.enum(["monthly"]);
export type Periodicity = z.infer<typeof Periodicity>;

export const RevenuePolicy = z.enum(["handover","poc_cost","poc_physical","billings_capped"]);
export type RevenuePolicy = z.infer<typeof RevenuePolicy>;

export const CurveMeaning = z.enum(["sell_through","occupancy"]);
export type CurveMeaning = z.infer<typeof CurveMeaning>;

export const VATClass = z.enum(["standard","zero","exempt","out_of_scope"]);
export type VATClass = z.infer<typeof VATClass>;

export const AmortType = z.enum(["bullet","annuity","custom"]);
export type AmortType = z.infer<typeof AmortType>;

export const IndexBucket = z.object({
  key: z.string(),
  rate_nominal_pa: z.number().default(0),
  frequency: z.enum(["annual"]).default("annual"),
  cap_pct: z.number().optional(),
  floor_pct: z.number().optional()
});
export type IndexBucket = z.infer<typeof IndexBucket>;

export const Curve = z.object({
  meaning: CurveMeaning,
  values: z.array(z.number())
});
export type Curve = z.infer<typeof Curve>;

export const UnitType = z.object({
  key: z.string(),
  category: z.enum(["residential","retail","office","land","other"]).default("other"),
  count: z.number().int().nonnegative().default(0),
  sellable_area_sqm: z.number().nonnegative().optional(),
  delivery_month: z.number().int().nonnegative().optional(),
  initial_price_sqm_sale: z.number().nonnegative().optional(),
  initial_rent_sqm_m: z.number().nonnegative().optional(),
  index_bucket_price: z.string().optional(),
  index_bucket_rent: z.string().optional(),
  revenue_policy: RevenuePolicy.default("handover"),
  curve: Curve.optional(),
  vat_class_output: VATClass.default("out_of_scope"),
  plot_key: z.string().optional(),
  collection_curve: Curve.optional()
});
export type UnitType = z.infer<typeof UnitType>;

export const DepreciationPolicy = z.object({
  method: z.enum(["none","straight_line"]).default("none"),
  useful_life_months: z.number().int().positive().optional(),
  start_month: z.number().int().nonnegative().optional(),
  salvage_value: z.number().nonnegative().optional()
});
export type DepreciationPolicy = z.infer<typeof DepreciationPolicy>;

export const CostItem = z.object({
  key: z.string(),
  base_amount: z.number().nonnegative(),
  phasing: z.array(z.number()),
  is_opex: z.boolean().default(false),
  index_bucket: z.string().optional(),
  vat_input_eligible: z.boolean().default(false),
  depreciation: DepreciationPolicy.optional(),
  plot_key: z.string().optional(),
  recoverable: z.boolean().default(false)
});
export type CostItem = z.infer<typeof CostItem>;

export const DebtTranche = z.object({
  key: z.string(),
  limit_ltc: z.number().nonnegative().optional(),
  limit_ltv: z.number().nonnegative().optional(),
  tenor_months: z.number().int().positive(),
  amort_type: z.enum(["bullet", "annuity"]).default("bullet"),
  fee_commitment_pct_pa: z.number().nonnegative().default(0),
  nominal_rate_pa: z.number().nonnegative().default(0.08), // required explicit rate
  availability_start_m: z.number().int().nonnegative().default(0),
  availability_end_m: z.number().int().nonnegative().default(0), // inclusive window
  upfront_fee_pct: z.number().nonnegative().default(0),           // on drawn
  ongoing_fee_pct_pa: z.number().nonnegative().default(0),        // commitment/line fee on undrawn
  dsra_months: z.number().int().nonnegative().default(0),
  dsra_on: z.enum(["interest","interest_plus_fees"]).default("interest"),
  draw_priority: z.number().int().default(1), // order tranches for funding
});
export type DebtTranche = z.infer<typeof DebtTranche>;

export const TaxBlock = z.object({
  vat_enabled: z.boolean().default(false),
  vat_rate: z.number().nonnegative().default(0),
  vat_timing: z.enum(["invoice","cash"]).default("invoice"),
  input_recovery_method: z.enum(["fixed_share", "proportional_to_taxable_outputs"]).default("fixed_share"),
  input_recovery_fixed_share: z.number().min(0).max(1).default(0.5),
  rounding: z.enum(["none", "period", "invoice"]).default("period"),
  decimals: z.number().int().min(0).max(6).default(2),
  corp_tax_enabled: z.boolean().default(false),
  corp_tax_rate: z.number().nonnegative().default(0),
  zakat_enabled: z.boolean().default(false),
  interest_cap_pct_ebitda: z.number().nonnegative().default(1),
  allow_nol_carryforward: z.boolean().default(true),
  vat_ruleset: z.string().default("UAE_2025")
});
export type TaxBlock = z.infer<typeof TaxBlock>;

export const EscrowBlock = z.object({
  wafi_enabled: z.boolean().default(false),
  collection_cap: z.object({
    alpha: z.number().nonnegative().default(1),
    beta: z.number().nonnegative().default(1)
  }).default({ alpha:1, beta:1 }),
  release_rules: z.enum(["alpha_beta","milestones"]).default("alpha_beta"),
  milestones: z.array(z.object({
    month: z.number().int().nonnegative(),
    pct_cum_release: z.number().min(0).max(1)
  })).default([])
});
export type EscrowBlock = z.infer<typeof EscrowBlock>;

export const ValuationBlock = z.object({
  selling_cost_pct: z.number().min(0).default(0),
  cap_rate_pa_income: z.number().min(0).default(0),
  stabilize_month: z.number().int().nonnegative().default(24)
});
export type ValuationBlock = z.infer<typeof ValuationBlock>;

export const WaterfallBlock = z.object({
  enabled: z.boolean().default(false),
  pref_rate_pa: z.number().min(0).default(0.08),
  promote_split: z.object({ lp: z.number(), gp: z.number() }).default({ lp:0.8, gp:0.2 }),
  mode: z.enum(["pref_rate"]).default("pref_rate")
});
export type WaterfallBlock = z.infer<typeof WaterfallBlock>;

export const Plot = z.object({
  key: z.string(),
  name: z.string().optional(),
  land_cost_base: z.number().nonnegative().default(0),
  land_phasing: z.array(z.number()).optional(),
});
export type Plot = z.infer<typeof Plot>;

export const CAMConfig = z.object({
  enabled: z.boolean().default(false),
  basis: z.enum(["recoverable_opex_share","per_sqm"]).default("recoverable_opex_share"),
  admin_fee_pct: z.number().nonnegative().default(0),
  gross_up_threshold: z.number().min(0).max(1).default(0.95),
  billable_categories: z.array(z.string()).default(["retail","office","industrial"]),
});
export type CAMConfig = z.infer<typeof CAMConfig>;

export const ProjectInputs = z.object({
  project: z.object({
    start_date: z.string(),
    periods: z.number().int().positive(),
    periodicity: Periodicity.default("monthly")
  }),
  engineMode: z.enum(["excel_parity","feasly_enhanced"]).default("excel_parity"),
  index_buckets: z.array(IndexBucket).default([]),
  unit_types: z.array(UnitType).default([]),
  cost_items: z.array(CostItem).default([]),
  debt: z.array(DebtTranche).default([]),
  tax: TaxBlock.default({}),
  escrow: EscrowBlock.default({}),
  valuation: ValuationBlock.default({}),
  waterfall: WaterfallBlock.default({}),
  plots: z.array(Plot).default([]),
  cam: CAMConfig.default({}),
  collections_default: Curve.optional()
});
export type ProjectInputs = z.infer<typeof ProjectInputs>;

export type DecimalArray = Decimal[];

export type BalanceSheetBlock = {
  // Assets
  cash: DecimalArray;                // running cash balance
  accounts_receivable: DecimalArray; // from revenue.accounts_receivable
  dsra_cash: DecimalArray;           // from financing.dsra_balance
  nbv: DecimalArray;                 // from depreciation.nbv
  vat_asset: DecimalArray;           // VAT receivable (carry < 0)
  // Liabilities
  debt: DecimalArray;                // financing.balance
  vat_liability: DecimalArray;       // VAT payable (net after carry > 0)
  // Equity
  paid_in_equity: DecimalArray;      // cumulative equity injections (+)
  retained_earnings: DecimalArray;   // computed rollforward of PATMI
  // Totals
  assets_total: DecimalArray;
  liab_equity_total: DecimalArray;
  imbalance: DecimalArray;           // diagnostic only
  detail: {
    tie_out_ok: boolean;
    retained_earnings_rollforward: boolean;
  };
};

export type ProfitAndLossBlock = {
  revenue: DecimalArray;       // recognized_sales + rev_rent + rev_cam
  opex: DecimalArray;          // use opex_net_of_cam to avoid double counting
  depreciation: DecimalArray;
  ebit: DecimalArray;
  interest: DecimalArray;
  pbt: DecimalArray;
  corp_tax: DecimalArray;
  zakat: DecimalArray;
  patmi: DecimalArray;         // profit after tax & zakat
  detail: Record<string, unknown>;
};

// Small helpers used later
export function normalizePhasing(phasing: number[]): number[] {
  if (!phasing?.length) return [];
  const sum = phasing.reduce((a,b)=>a+(b||0),0);
  if (sum === 0) return phasing.map(()=>0);
  return phasing.map(x => (x||0)/sum);
}
export const clamp01 = (x:number) => Math.max(0, Math.min(1, x));