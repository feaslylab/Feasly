import Decimal from "decimal.js";

export type CorpTaxBlock = {
  ebit: Decimal[];           // revenue - opex - depreciation (no financing)
  pbt: Decimal[];            // ebit - interest (before taxes)
  taxable_income: Decimal[]; // after adjustments / NOL
  nol_carry: Decimal[];      // accumulated loss carried forward
  tax: Decimal[];            // corporation tax this period
  detail: Record<string, unknown>;
};

function zeros(T:number){ return Array.from({length:T}, () => new Decimal(0)); }

/**
 * Phase-1 tax policy (explicit/tunable later):
 * - EBIT = (recognized_sales + rent) - opex - depreciation_total
 * - PBT  = EBIT - interest
 * - Adjustments:
 *    - Interest cap: disallow interest above cap_pct * EBIT (excess becomes add-back)
 *    - No timing of tax payments vs accruals (cash == accrual this phase)
 * - NOL carryforward if enabled
 */
export function computeCorpTax(params: {
  revenue_sales: Decimal[];
  revenue_rent:  Decimal[];
  opex: Decimal[];
  depreciation_total: Decimal[];
  interest: Decimal[];
  corp_tax_rate: number;
  interest_cap_pct_ebitda: number; // if 1.0 = full allowed
  allow_nol_carryforward: boolean;
}): CorpTaxBlock {
  const T = params.revenue_sales.length;
  const ebit = zeros(T);
  const pbt  = zeros(T);
  const taxable = zeros(T);
  const nol = zeros(T);
  const tax = zeros(T);

  let nol_cf = new Decimal(0);

  for (let t=0;t<T;t++){
    const revenue = params.revenue_sales[t].add(params.revenue_rent[t]);
    const ebit_t = revenue.minus(params.opex[t]).minus(params.depreciation_total[t]);
    ebit[t] = ebit_t;

    // interest limitation: cap as % of EBITDA (approx: use EBIT here for simplicity)
    const cap = ebit_t.mul(params.interest_cap_pct_ebitda);
    const allowedInterest = Decimal.min(params.interest[t], Decimal.max(cap, new Decimal(0)));
    const disallowedAddBack = Decimal.max(params.interest[t].minus(allowedInterest), new Decimal(0));

    const pbt_t = ebit_t.minus(allowedInterest); // add-back is in taxable adjustment below
    pbt[t] = pbt_t;

    // taxable income = PBT + disallowed interest + other adj(0)
    let taxBase = pbt_t.add(disallowedAddBack);

    // apply NOL carryforward
    if (params.allow_nol_carryforward) {
      const afterNOL = taxBase.minus(nol_cf);
      if (afterNOL.isNegative()) {
        // all offset; increase NOL
        nol_cf = afterNOL.abs();
        taxBase = new Decimal(0);
      } else {
        // partially/fully consumed NOL
        taxBase = afterNOL;
        nol_cf = new Decimal(0);
      }
    } else {
      // reset nol if disabled
      nol_cf = new Decimal(0);
    }

    taxable[t] = taxBase;
    nol[t] = nol_cf;

    const tax_t = taxBase.mul(params.corp_tax_rate);
    tax[t] = Decimal.max(tax_t, new Decimal(0));
  }

  return {
    ebit, pbt, taxable_income: taxable, nol_carry: nol, tax,
    detail: { policy: "Phase1_EBIT_interestCap_NOL" }
  };
}