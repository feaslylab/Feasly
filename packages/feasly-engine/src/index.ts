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
import { computeCorpTax } from "./corpTax";
import { computeZakat } from "./zakat";
import { computeCAM } from "./cam";

export type DecimalArray = Decimal[];

export type EngineOutput = {
  revenue: { 
    rev_sales: DecimalArray; rev_rent: DecimalArray; rev_cam: DecimalArray; 
    vat_output: DecimalArray; billings_total: DecimalArray; recognized_sales: DecimalArray; 
    allowed_release: DecimalArray; collections: DecimalArray; accounts_receivable: DecimalArray;
    detail: Record<string, unknown>; 
  };
  costs:   { capex: DecimalArray; opex: DecimalArray; opex_net_of_cam: DecimalArray; vat_input: DecimalArray; detail: Record<string, unknown>; };
  financing: { 
    draws: DecimalArray; interest: DecimalArray; principal: DecimalArray; balance: DecimalArray; 
    fees_upfront: DecimalArray; fees_ongoing: DecimalArray; 
    dsra_balance: DecimalArray; dsra_funding: DecimalArray; dsra_release: DecimalArray;
    detail: Record<string, unknown>; 
  };
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

  // 4) Apply escrow cap to collections: cumulative collections ≤ cumulative allowed_release
  let cumColl = new Decimal(0);
  let cumAllow = new Decimal(0);
  for (let t=0;t<T;t++){
    const allowed = allowed_release_series[t];
    cumAllow = cumAllow.add(allowed);
    const room = Decimal.max(new Decimal(0), cumAllow.minus(cumColl));
    const take = Decimal.min(room, revenue.collections[t]);
    revenue.collections[t] = take;
    cumColl = cumColl.add(take);
  }

  // 5) Apply escrow cap to recognition: cumulative recognized ≤ cumulative allowed_release
  const recognized_sales = zeros(T);
  let cumRec = new Decimal(0);
  cumAllow = new Decimal(0); // reset
  for (let t=0;t<T;t++){
    const allowed = allowed_release_series[t];
    cumAllow = cumAllow.add(allowed);
    const room = Decimal.max(new Decimal(0), cumAllow.minus(cumRec));
    const take = Decimal.min(room, recognized_raw[t]);
    recognized_sales[t] = take;
    cumRec = cumRec.add(take);
  }

  // CAM (Common Area Maintenance) recoveries - compute before updating revenue
  const utOcc = inputs.unit_types
    .filter(ut => (ut.curve?.meaning ?? "sell_through") === "occupancy")
    .map(ut => ({
      key: ut.key, 
      plot_key: ut.plot_key, 
      category: ut.category ?? "",
      area_sqm: ut.sellable_area_sqm ?? 0,
      occupancy: (ut.curve?.values ?? Array(T).fill(0)).slice(0, T)
    }));

  const cam = computeCAM({
    inputs, T,
    opexSeries: costs.opex,
    costItemsDetail: (costs.detail.items as any[]) ?? [],
    unitTypes: utOcc
  });

  // write back into revenue block
  revenue.allowed_release = allowed_release_series;
  revenue.recognized_sales = recognized_sales;
  revenue.rev_sales = recognized_sales; // keep legacy field equal to recognized
  (revenue as any).rev_cam = cam.cam_revenue;

  // VAT (based on timing and VAT classes)
  const vat = computeVAT(inputs, revenue.billings_total, revenue.collections, revenue.rev_rent, costs.capex, costs.opex);

  // Depreciation (simple total-capex proxy for Phase 1 VAT/Dep)
  const dep = computeDepreciation(inputs, costs.capex);

  // Financing (needed for corp tax interest calculation)
  const fin = computeFinancing(inputs, costs.capex);

  // Corporate Tax
  const corp = computeCorpTax({
    revenue_sales: revenue.recognized_sales,
    revenue_rent:  revenue.rev_rent,
    opex: costs.opex,
    depreciation_total: dep.total,
    interest: fin.interest,
    corp_tax_rate: inputs.tax?.corp_tax_enabled ? (inputs.tax?.corp_tax_rate ?? 0) : 0,
    interest_cap_pct_ebitda: inputs.tax?.interest_cap_pct_ebitda ?? 1,
    allow_nol_carryforward: inputs.tax?.allow_nol_carryforward ?? true
  });

  // Zakat
  const zak = computeZakat({
    method: "nbv",
    rate_annual: inputs.tax?.zakat_enabled ? 0.025 : 0, // 2.5% standard zakat rate
    nbv: dep.nbv
  });

  // Update costs with CAM net
  (costs as any).opex_net_of_cam = cam.opex_net_of_cam;

  // Cash flow assembly - use collections for sales cash, not recognized revenue
  const project_before_fin = zeros(T);
  
  // Calculate project_before_fin = cash revenue - costs
  for (let t = 0; t < T; t++) {
    const salesCash = revenue.collections[t];      // collections from sales (cash)
    const rentCash = revenue.rev_rent[t];          // rent is immediate cash
    const camCash = cam.cam_revenue[t];            // CAM is cash
    const totalCashRevenue = salesCash.add(rentCash).add(camCash);
    const totalCosts = costs.capex[t].add(costs.opex[t]);
    project_before_fin[t] = totalCashRevenue.minus(totalCosts);
  }

  // Project cash flow: project_before_fin + draws - interest - principal - fees - DSRA + VAT/taxes
  const project = zeros(T);
  const equity_cf = zeros(T);
  
  for (let t = 0; t < T; t++) {
    const projectFlow = project_before_fin[t]
      .add(fin.draws[t])
      .minus(fin.interest[t])
      .minus(fin.principal[t])
      .minus(fin.fees_upfront[t])
      .minus(fin.fees_ongoing[t])
      .minus(fin.dsra_funding[t])
      .add(fin.dsra_release[t])
      .minus(vat.net[t])
      .minus(corp.tax[t])
      .minus(zak.zakat[t]);
    
    project[t] = projectFlow;
    equity_cf[t] = projectFlow.minus(fin.draws[t]); // equity perspective
  }

  const cash = {
    project_before_fin,
    project,
    equity_cf
  };

  return {
    revenue: {
      ...revenue,
      rev_cam: cam.cam_revenue,
      collections: revenue.collections,
      accounts_receivable: revenue.accounts_receivable
    },
    costs: {
      ...costs,
      opex_net_of_cam: cam.opex_net_of_cam
    },
    financing: fin,
    tax: { vat_net: vat.net, corp: corp.tax, zakat: zak.zakat },
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