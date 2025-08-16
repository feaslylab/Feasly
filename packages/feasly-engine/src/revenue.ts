import Decimal from "decimal.js";
import { ProjectInputs, clamp01 } from "./types";

/** locate an index bucket by key; returns 0% p.a. if missing */
function getBucketRatePa(inputs: ProjectInputs, key?: string): number {
  if (!key) return 0;
  const b = inputs.index_buckets.find(x => x.key === key);
  return b ? b.rate_nominal_pa : 0;
}

/** build monthly index multipliers for a named bucket (length T). simple compounding p.a./12 */
function buildIndexSeries(ratePa: number, T: number): Decimal[] {
  const r_m = ratePa / 12;
  const out: Decimal[] = [];
  let m = new Decimal(1);
  for (let t = 0; t < T; t++) {
    out.push(m);
    m = m.mul(1 + r_m);
  }
  return out;
}

/** resample/normalize a curve of any length to length T */
function normalizeCurve(values: number[] | undefined, T: number, meaning: "sell_through" | "occupancy"): Decimal[] {
  if (!values || values.length === 0) return Array.from({ length: T }, () => new Decimal(0));
  if (meaning === "sell_through") {
    // scale to sum = 1 (or 0 if all zeros)
    const sum = values.reduce((a, b) => a + (b || 0), 0);
    const scaled = sum > 0 ? values.map(v => (v || 0) / sum) : values.map(() => 0);
    // stretch/compress to T
    return resampleToT(scaled, T).map(x => new Decimal(x));
  } else {
    // occupancy -> clamp each to [0,1], then resample without sum normalization
    const clamped = values.map(v => clamp01(v || 0));
    return resampleToT(clamped, T).map(x => new Decimal(clamp01(x)));
  }
}

/** linear resample array a[] to length T */
function resampleToT(a: number[], T: number): number[] {
  if (a.length === T) return a.slice();
  const n = a.length;
  if (n === 1) return Array.from({ length: T }, () => a[0] ?? 0);
  const out = new Array(T).fill(0);
  for (let t = 0; t < T; t++) {
    const x = (t * (n - 1)) / (T - 1);
    const i = Math.floor(x);
    const frac = x - i;
    const v = (a[i] ?? 0) * (1 - frac) + (a[Math.min(i + 1, n - 1)] ?? 0) * frac;
    out[t] = v;
  }
  return out;
}

export type RevenueBlock = {
  rev_sales: Decimal[];
  rev_rent: Decimal[];
  vat_output: Decimal[];    // placeholder (0s) until VAT module
  billings_total: Decimal[]; // placeholder; we'll populate in recognition/billings phase
  detail: Record<string, unknown>;
};

/** main revenue calculator */
export function computeRevenue(inputs: ProjectInputs): RevenueBlock {
  const T = inputs.project.periods;

  const rev_sales = Array.from({ length: T }, () => new Decimal(0));
  const rev_rent  = Array.from({ length: T }, () => new Decimal(0));

  const detail: Record<string, unknown> = { unit_types: [] as any[] };

  for (const ut of inputs.unit_types) {
    // price/rent escalation series
    const priceRatePa = getBucketRatePa(inputs, ut.index_bucket_price);
    const rentRatePa  = getBucketRatePa(inputs, ut.index_bucket_rent);
    const idxPrice = buildIndexSeries(priceRatePa, T);
    const idxRent  = buildIndexSeries(rentRatePa, T);

    // base magnitudes
    const area = new Decimal(ut.sellable_area_sqm ?? 0);
    const count = new Decimal(ut.count ?? 0);
    const price0 = new Decimal(ut.initial_price_sqm_sale ?? 0);
    const rent0  = new Decimal(ut.initial_rent_sqm_m ?? 0);

    // curves
    const meaning = (ut.curve?.meaning ?? "sell_through") as "sell_through" | "occupancy";
    const curve   = normalizeCurve(ut.curve?.values, T, meaning);

    // sales recognition (for now: "handover" or "sell_through" proxy), rent via occupancy
    const ut_rev_sales: Decimal[] = [];
    const ut_rev_rent: Decimal[]  = [];

    for (let t = 0; t < T; t++) {
      // price at t
      const p_t = price0.mul(idxPrice[t]); // price/sqm escalated
      const r_t = rent0.mul(idxRent[t]);   // rent/sqm/m escalated

      if (meaning === "sell_through") {
        // sales: (units * area * price) * curve[t]
        const sales_t = area.mul(count).mul(p_t).mul(curve[t]);
        ut_rev_sales.push(sales_t);
        ut_rev_rent.push(new Decimal(0));
      } else {
        // occupancy: rent revenue per month: area * rent/sqm * occupancy
        const rent_t = area.mul(r_t).mul(curve[t]);
        ut_rev_sales.push(new Decimal(0));
        ut_rev_rent.push(rent_t);
      }
    }

    // accumulate into totals
    for (let t = 0; t < T; t++) {
      rev_sales[t] = rev_sales[t].add(ut_rev_sales[t]);
      rev_rent[t]  = rev_rent[t].add(ut_rev_rent[t]);
    }

    (detail.unit_types as any[]).push({
      key: ut.key,
      category: ut.category,
      meaning,
      series: {
        rev_sales: ut_rev_sales.map(d => d.toNumber()),
        rev_rent:  ut_rev_rent.map(d => d.toNumber())
      }
    });
  }

  // Placeholders until later phases fill these in
  const zeros = (n:number) => Array.from({length:n}, () => new Decimal(0));

  return {
    rev_sales,
    rev_rent,
    vat_output: zeros(T),
    billings_total: zeros(T),
    detail
  };
}