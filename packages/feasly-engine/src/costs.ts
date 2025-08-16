import Decimal from "decimal.js";
import { ProjectInputs, normalizePhasing } from "./types";

/** find a bucket's p.a. rate; 0 if missing */
function bucketRatePa(inputs: ProjectInputs, key?: string): number {
  if (!key) return 0;
  const b = inputs.index_buckets.find(x => x.key === key);
  return b ? b.rate_nominal_pa : 0;
}

/** monthly index factors (length T), compounded p.a./12 */
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

/** linear resample array a[] to length T */
function resampleToT(a: number[], T: number): number[] {
  if (!a?.length) return Array.from({ length: T }, () => 0);
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

export type CostsBlock = {
  capex: Decimal[];
  opex:  Decimal[];
  vat_input: Decimal[]; // placeholder zeros (VAT later)
  detail: {
    items: Array<{
      key: string;
      is_opex: boolean;
      base_amount: number;
      series: number[]; // escalated monthly series
      index_bucket?: string;
    }>
  };
};

/** main cost calculator */
export function computeCosts(inputs: ProjectInputs): CostsBlock {
  const T = inputs.project.periods;

  const capex = Array.from({ length: T }, () => new Decimal(0));
  const opex  = Array.from({ length: T }, () => new Decimal(0));
  const details: CostsBlock["detail"]["items"] = [];

  for (const item of inputs.cost_items) {
    const base = new Decimal(item.base_amount ?? 0);

    // normalize phasing → sum = 1, then resample to T
    const ph = normalizePhasing(item.phasing ?? []);
    const ph_T = resampleToT(ph, T);

    // raw monthly before index
    const raw = ph_T.map(p => base.mul(p));

    // apply index if provided
    const ratePa = bucketRatePa(inputs, item.index_bucket);
    const idx = buildIndexSeries(ratePa, T);
    const escalated: Decimal[] = raw.map((v, t) => v.mul(idx[t]));

    // accumulate
    for (let t = 0; t < T; t++) {
      if (item.is_opex) {
        opex[t] = opex[t].add(escalated[t]);
      } else {
        capex[t] = capex[t].add(escalated[t]);
      }
    }

    details.push({
      key: item.key,
      is_opex: !!item.is_opex,
      base_amount: base.toNumber(),
      series: escalated.map(d => d.toNumber()),
      index_bucket: item.index_bucket
    });
  }

  const zeros = (n:number) => Array.from({length:n}, () => new Decimal(0));

  return {
    capex, opex,
    vat_input: zeros(T), // filled in when VAT module lands
    detail: { items: details }
  };
}