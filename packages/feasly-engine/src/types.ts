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
  amort_type: z.enum(["bullet", "annuity", "straight"]).default("bullet"),
  fee_commitment_pct_pa: z.number().nonnegative().default(0),
  upfront_fee_pct: z.number().nonnegative().default(0),
  ongoing_fee_pct_pa: z.number().nonnegative().default(0),
  commitment_fee_pct_pa: z.number().nonnegative().default(0),
  nominal_rate_pa: z.number().nonnegative().default(0.08),
  availability_start_m: z.number().int().nonnegative().default(0),
  availability_end_m: z.number().int().nonnegative().default(999),
  draw_priority: z.number().int().default(1),
  dsra_months: z.number().nonnegative().default(0),
  prepayment_allowed: z.boolean().default(false),
  covenants: z.object({
    dscr_min: z.number().nonnegative().optional(), // e.g., 1.05
    icr_min:  z.number().nonnegative().optional(), // e.g., 2.00
    /** Which basis to test portfolio breach on */
    test_basis: z.enum(["point","ltm","both"]).default("point").optional(),
    /** Grace periods (months) before we call a breach persistent */
    grace_period_m: z.number().int().nonnegative().default(0).optional(),
    /** Whether "Strict DSCR" should include ongoing fees in Debt Service */
    strict_dscr: z.boolean().default(false).optional()
  }).optional()
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

export const PreferredReturn = z.object({
  type: z.enum(["rate_pa", "irr_clock"]).default("rate_pa"),
  rate_pa: z.number().nonnegative().default(0), // used if type="rate_pa"
  compounding: z.enum(["monthly","quarterly","annual"]).default("monthly"),
});
export type PreferredReturn = z.infer<typeof PreferredReturn>;

export const HurdleStep = z.object({
  key: z.string(),
  trigger: z.object({
    // either an IRR trigger or MOIC trigger (choose one per step)
    irr_threshold: z.number().nonnegative().optional(),
    moic_threshold: z.number().nonnegative().optional(),
  }),
  split_after_catchup: z.object({
    lp: z.number().min(0).max(1),
    gp: z.number().min(0).max(1),
  }),
  // optional full catch-up tier before split begins
  catchup: z.object({
    enabled: z.boolean().default(false),
    gp_target_share_of_profits: z.number().min(0).max(1).default(0.2),
  }).default({ enabled: false, gp_target_share_of_profits: 0.2 }),
});
export type HurdleStep = z.infer<typeof HurdleStep>;

export const EquityClass = z.object({
  key: z.string(),
  seniority: z.number().int().default(1), // Lower = more senior
  pref_rate_pa: z.number().nonnegative().default(0.08),
  pref_compounding: z.enum(["simple", "compound"]).default("simple"),
  distribution_frequency: z.enum(["monthly", "quarterly"]).default("monthly"),
  
  // Catch-up configuration (exact formula implementation)
  catchup: z.object({
    enabled: z.boolean().default(false),
    // Target GP share of the "excess pool" once catch-up is completed (e.g., 0.20 for 20%)
    target_gp_share: z.number().min(0).max(1).default(0.20),
    // Defines what counts toward the excess pool baseline
    //  - "over_roc"               => excess starts after ROC only
    //  - "over_roc_and_pref"      => excess starts after ROC + Pref (default)
    basis: z.enum(["over_roc", "over_roc_and_pref"]).default("over_roc_and_pref")
  }).optional(),

  // Tier configuration with IRR hurdles
  tiers: z.array(z.object({
    // Annual hurdle; convert to monthly internally
    irr_hurdle_pa: z.number().nonnegative(),
    split_lp: z.number().min(0).max(1),
    split_gp: z.number().min(0).max(1),
    // Hurdle basis kept simple: LP class-level IRR
    hurdle_basis: z.enum(["lp_class_irr"]).default("lp_class_irr"),
  })).default([]),
});
export type EquityClass = z.infer<typeof EquityClass>;

export const EquityInvestor = z.object({
  key: z.string(),
  class_key: z.string(),
  role: z.enum(["lp", "gp"]).default("lp"),
  commitment: z.number().nonnegative().default(0),
  fixed_share: z.number().min(0).max(1).optional(), // For fixed_shares call order
});
export type EquityInvestor = z.infer<typeof EquityInvestor>;

export const EquityBlock = z.object({
  enabled: z.boolean().default(false),
  call_order: z.enum(["pro_rata_commitment", "fixed_shares"]).default("pro_rata_commitment"),
  distribution_frequency: z.enum(["monthly", "quarterly"]).default("monthly"),
  classes: z.array(EquityClass).default([]),
  investors: z.array(EquityInvestor).default([]),
});
export type EquityBlock = z.infer<typeof EquityBlock>;

export const EquityTranche = z.object({
  key: z.string(),
  role: z.enum(["lp","gp"]).default("lp"),
  commitment: z.number().nonnegative().default(0),
  pr: PreferredReturn.default({}),
  // Optional overrides per tranche for tiers (otherwise use global waterfall)
  overrides: z.object({
    hurdles: z.array(HurdleStep).optional(),
  }).optional(),
});
export type EquityTranche = z.infer<typeof EquityTranche>;

export const WaterfallConfig = z.object({
  mode: z.enum(["european","american"]).default("european"),
  // Global waterfall (used if tranche overrides absent)
  hurdles: z.array(HurdleStep).default([
    // Default: ROC + PR (implicit) then a single 80/20 promote
    { key:"tier_80_20", trigger:{ irr_threshold: 0.0 }, split_after_catchup:{ lp:0.8, gp:0.2 }, catchup:{enabled:false, gp_target_share_of_profits:0.2} }
  ]),
  // Whether PR is accrued project-wide by tranche or strictly per-contribution lot
  accrual_lot_level: z.boolean().default(true),
});
export type WaterfallConfig = z.infer<typeof WaterfallConfig>;

export const ReturnsBlock = z.object({
  // Aggregates
  lp_distributions: z.array(z.number()).default([]),
  gp_distributions: z.array(z.number()).default([]),
  carry_paid: z.array(z.number()).default([]),
  // Metrics (project total)
  lp: z.object({ irr_pa: z.number().nullable(), moic: z.number().nullable(), dpi: z.number().nullable(), tvpi: z.number().nullable() }).default({irr_pa:null, moic:null, dpi:null, tvpi:null}),
  gp: z.object({ irr_pa: z.number().nullable(), moic: z.number().nullable(), dpi: z.number().nullable(), tvpi: z.number().nullable() }).default({irr_pa:null, moic:null, dpi:null, tvpi:null}),
  // Capital accounts (per tranche)
  capital_accounts: z.record(z.object({
    contributed: z.array(z.number()).default([]),
    returned_capital: z.array(z.number()).default([]),
    pr_accrued: z.array(z.number()).default([]),
    pr_paid: z.array(z.number()).default([]),
    profit_distributions: z.array(z.number()).default([]), // includes catch-up + promote
    ending_unreturned_capital: z.array(z.number()).default([]),
  })).default({}),
  // Full audit (period × tier allocations)
  audit: z.object({
    tiers: z.array(z.object({
      key: z.string(),
      allocations: z.array(z.object({
        period: z.number(),
        lp: z.number(),
        gp: z.number(),
      })).default([]),
    })).default([]),
  }).default({ tiers: [] }),
  detail: z.record(z.any()).default({}),
});
export type ReturnsBlock = z.infer<typeof ReturnsBlock>;

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
  equity: EquityBlock.default({}),
  equity_tranches: z.array(EquityTranche).default([]), // Legacy field for compatibility
  waterfall_config: WaterfallConfig.default({}),
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

export type CashFlowBlock = {
  from_operations: DecimalArray;    // PATMI + WC adjustments
  from_investing: DecimalArray;     // capex, acquisitions, disposals (capex for now)
  from_financing: DecimalArray;     // debt draws, repayments, equity, fees, DSRA flows
  net_change: DecimalArray;         // sum of above
  cash_closing: DecimalArray;       // reconcile to balance_sheet.cash
  detail: Record<string, unknown>;
};

export type CovenantSeries = {
  dscr: DecimalArray;              // Classic DSCR (CFADS / (Int+Prin))
  dscr_strict: DecimalArray;       // Strict DSCR (CFADS / (Int+Prin+Ongoing Fees))
  icr: DecimalArray;               // EBIT / Interest
  dscr_ltm: DecimalArray;          // 12M rolling DSCR (classic)
  dscr_strict_ltm: DecimalArray;   // 12M rolling DSCR (strict)
  icr_ltm: DecimalArray;           // 12M rolling ICR
  dscr_breach: boolean[];
  icr_breach: boolean[];
  dscr_headroom: DecimalArray;       // DSCR - dscr_min (classic)
  icr_headroom: DecimalArray;        // ICR - icr_min
  dscr_strict_headroom: DecimalArray;// Strict DSCR - dscr_min
  detail: Record<string, unknown>;
};

export type CovenantsBlock = {
  // Portfolio-level (all tranches aggregated)
  portfolio: CovenantSeries;
  // Per-tranche keyed series
  by_tranche: Record<string, CovenantSeries>;
  // Rollup diagnostics
  breaches_any: boolean[];  // portfolio level (basis + grace applied)
  breaches_summary: {
    total_breach_periods: number;
    first_breach_index: number | null;
  };
  detail: {
    test_basis: "point" | "ltm" | "both";
    grace_period_m: number;
    dscr_threshold?: number | null;
    icr_threshold?: number | null;
    notes?: string;
  };
};

// Small helpers used later
export function normalizePhasing(phasing: number[]): number[] {
  if (!phasing?.length) return [];
  const sum = phasing.reduce((a,b)=>a+(b||0),0);
  if (sum === 0) return phasing.map(()=>0);
  return phasing.map(x => (x||0)/sum);
}
export const clamp01 = (x:number) => Math.max(0, Math.min(1, x));