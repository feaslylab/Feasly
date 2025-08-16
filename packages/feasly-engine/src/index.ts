import Decimal from "decimal.js";
import { ProjectInputs } from "./types";
import { dtYears, discountFactors } from "./time";
import { computeRevenue } from "./revenue";
import { computeCosts } from "./costs";
import { computeFinancing } from "./financing";
import { assembleCash } from "./cash";
import { buildProjectProgress, buildAllowedReleaseSeries } from "./escrow";
import { computeDepreciation } from "./depreciation";
import { computeVAT } from "./tax";

export type DecimalArray = Decimal[];

export type EngineOutput = {
  revenue: { rev_sales: DecimalArray; rev_rent: DecimalArray; vat_output: DecimalArray; billings_total: DecimalArray; recognized_sales: DecimalArray; allowed_release: DecimalArray; detail: Record<string, unknown>; };
  costs:   { capex: DecimalArray; opex: DecimalArray; vat_input: DecimalArray; detail: Record<string, unknown>; };
  financing: { draws: DecimalArray; interest: DecimalArray; principal: DecimalArray; balance: DecimalArray; detail: Record<string, unknown>; };
  tax: { vat_net: DecimalArray; corp: DecimalArray; zakat: DecimalArray; };
  depreciation: { total: DecimalArray; nbv: DecimalArray; detail: Record<string, unknown>; };
  cash: { project_before_fin: DecimalArray; project: DecimalArray; equity_cf: DecimalArray; };
  time: { df: number[]; dt: number[]; };
};

function zeros(n:number): Decimal[] { return Array.from({length:n}, () => new Decimal(0)); }

export function runModel(rawInputs: unknown): EngineOutput {
  const inputs = ProjectInputs.parse(rawInputs);
  const T = inputs.project.periods;

  const dt = dtYears(T);
  const df = discountFactors(T);

  // blocks
  const revenue = computeRevenue(inputs);
  const costs   = computeCosts(inputs);

  // 1) Build project progress from capex (proxy for % complete)
  const progress = buildProjectProgress(costs.capex);

  // 2) Allowed release series (per-period) from escrow settings
  const contractValueTotal = revenue.billings_total.reduce((a,b)=>a.add(b), new Decimal(0));
  const allowed_release_series = buildAllowedReleaseSeries(inputs, progress, contractValueTotal);

  // 3) Recognition policies per product → combine into recognized_sales_raw
  const recognized_raw = zeros(T);

  // Sum per-unit-type recognition (simple approach)
  for (const ut of inputs.unit_types) {
    const meaning = (ut.curve?.meaning ?? "sell_through") as "sell_through" | "occupancy";
    if (meaning !== "sell_through") continue; // rent isn't in sales recognition

    // Recreate its billings series to get contract value time-shape
    const idx = inputs.index_buckets.find(b => b.key === ut.index_bucket_price)?.rate_nominal_pa ?? 0;
    const idxSeries: Decimal[] = (() => {
      const r_m = idx/12; let m = new Decimal(1);
      return Array.from({length:T}, (_,t)=>{ const cur=m; m=m.mul(1+r_m); return cur; });
    })();

    const area = new Decimal(ut.sellable_area_sqm ?? 0);
    const count= new Decimal(ut.count ?? 0);
    const price0=new Decimal(ut.initial_price_sqm_sale ?? 0);

    // normalized sell-through curve
    const curveVals = ut.curve?.values ?? [];
    const sum = curveVals.reduce((a,b)=>a+(b||0),0);
    const norm = sum>0 ? curveVals.map(v=>(v||0)/sum) : curveVals.map(()=>0);
    const curveT = ((): number[] => {
      if (norm.length === T) return norm;
      if (norm.length <= 1) return Array.from({length:T},()=>norm[0]??0);
      const out=new Array(T).fill(0);
      for(let t=0;t<T;t++){
        const x=t*(norm.length-1)/(T-1); const i=Math.floor(x); const f=x-i;
        const v=(norm[i]??0)*(1-f)+(norm[Math.min(i+1,norm.length-1)]??0)*f;
        out[t]=v;
      }
      return out;
    })();

    const billings = Array.from({length:T}, (_,t)=>{
      return area.mul(count).mul(price0).mul(idxSeries[t]).mul(curveT[t]);
    });

    // pick policy
    const pol = ut.revenue_policy ?? "handover";

    if (pol === "handover") {
      // recognize all at delivery_month (if provided), else follow billings (fallback)
      const dm = ut.delivery_month ?? -1;
      if (dm >= 0 && dm < T) {
        const total = billings.reduce((a,b)=>a.add(b), new Decimal(0));
        recognized_raw[dm] = recognized_raw[dm].add(total);
      } else {
        for (let t=0;t<T;t++) recognized_raw[t]=recognized_raw[t].add(billings[t]);
      }
    } else if (pol === "poc_cost") {
      // recognize by Δ progress * total contract value for this UT
      const total = billings.reduce((a,b)=>a.add(b), new Decimal(0));
      let prev = 0;
      for (let t=0;t<T;t++){
        const inc = Math.max(0, progress[t]-prev);
        recognized_raw[t] = recognized_raw[t].add(total.mul(inc));
        prev = progress[t];
      }
    } else if (pol === "poc_physical") {
      // use sell-through curve as physical proxy (already normalized)
      for (let t=0;t<T;t++) {
        recognized_raw[t] = recognized_raw[t].add(area.mul(count).mul(price0).mul(idxSeries[t]).mul(curveT[t]));
      }
    } else if (pol === "billings_capped") {
      // start as billings; cap later by allowed_release
      for (let t=0;t<T;t++) recognized_raw[t] = recognized_raw[t].add(billings[t]);
    }
  }

  // 4) Apply escrow cap: cumulative recognized ≤ cumulative allowed_release
  const recognized_sales = zeros(T);
  let cumRec = new Decimal(0);
  let cumAllow = new Decimal(0);
  for (let t=0;t<T;t++){
    const allowed = allowed_release_series[t];
    cumAllow = cumAllow.add(allowed);
    const room = Decimal.max(new Decimal(0), cumAllow.minus(cumRec));
    const take = Decimal.min(room, recognized_raw[t]);
    recognized_sales[t] = take;
    cumRec = cumRec.add(take);
  }

  // write back into revenue block
  revenue.allowed_release = allowed_release_series;
  revenue.recognized_sales = recognized_sales;
  revenue.rev_sales = recognized_sales; // keep legacy field equal to recognized

  // VAT (based on recognized sales & rent, and input eligibility proxy)
  const vat = computeVAT(inputs, revenue.recognized_sales, revenue.rev_rent, costs.capex, costs.opex);

  // Depreciation (simple total-capex proxy for Phase 1 VAT/Dep)
  const dep = computeDepreciation(inputs, costs.capex);

  // continue with financing & cash
  const fin  = computeFinancing(inputs, costs.capex);
  const cashBase = assembleCash(
    revenue.recognized_sales, // use recognized sales in cash now
    revenue.rev_rent,
    costs.capex,
    costs.opex,
    fin
  );

  const cash = {
    project_before_fin: cashBase.project_before_fin,
    project: cashBase.project.map((v, t) => v.minus(vat.net[t])), // pay VAT net
    equity_cf: cashBase.equity_cf.map((v, t) => v.minus(vat.net[t])) // placeholder until waterfall
  };

  return {
    revenue,
    costs,
    financing: fin,
    tax: { vat_net: vat.net, corp: zeros(T), zakat: zeros(T) },
    depreciation: {
      total: dep.total,
      nbv: dep.nbv,
      detail: {} // (optional) expose perItem later if you want; we keep output lean now
    },
    cash,
    time: { df, dt }
  };
}

export { ProjectInputs } from "./types";