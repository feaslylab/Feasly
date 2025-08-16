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
import { computeBalanceSheet } from "./balanceSheet";
import { computePnL } from "./pnl";

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
  tax: { 
    vat_output: DecimalArray; vat_input: DecimalArray; vat_net: DecimalArray; carry_vat: DecimalArray; 
    corp: DecimalArray; zakat: DecimalArray; detail: Record<string, unknown>; 
  };
  depreciation: { total: DecimalArray; nbv: DecimalArray; detail: Record<string, unknown>; };
  cash: { project_before_fin: DecimalArray; project: DecimalArray; equity_cf: DecimalArray; };
  balance_sheet: {
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
    retained_earnings: DecimalArray;   // plug so Assets = Liab + Equity
    // Diagnostics
    assets_total: DecimalArray;
    liab_equity_total: DecimalArray;
    imbalance: DecimalArray;           // assets_total - liab_equity_total
    detail: Record<string, unknown>;
  };
  profit_and_loss: {
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
  const { allowed_release: allowed_release_series } = buildAllowedReleaseSeries(inputs, progress, contractValueTotal);

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
  let collectionsClampingOccurred = false;
  for (let t=0;t<T;t++){
    const allowed = allowed_release_series[t];
    cumAllow = cumAllow.add(allowed);
    const room = Decimal.max(new Decimal(0), cumAllow.minus(cumColl));
    const originalCollection = revenue.collections[t];
    const take = Decimal.min(room, originalCollection);
    
    if (take.lt(originalCollection)) {
      collectionsClampingOccurred = true;
    }
    
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

  // VAT (based on timing and VAT classes, includes CAM)
  const vat = computeVAT(inputs, revenue.billings_total, revenue.collections, revenue.rev_rent, cam.cam_revenue, costs.capex, costs.opex, costs.detail.items);

  // Depreciation (simple total-capex proxy for Phase 1 VAT/Dep)
  const dep = computeDepreciation(inputs, costs.capex, costs.detail.items);

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

  // P&L computation
  const pnl = computePnL({
    T,
    recognized_sales: revenue.recognized_sales,
    rev_rent: revenue.rev_rent,
    rev_cam: cam.cam_revenue,
    opex_net_of_cam: cam.opex_net_of_cam,
    depreciation: dep.total,
    interest: fin.interest,
    corp_tax: corp.tax,
    zakat: zak.zakat
  });

  // Balance Sheet computation
  const bs = computeBalanceSheet({
    T,
    revenue: { accounts_receivable: revenue.accounts_receivable ?? zeros(T) },
    depreciation: { nbv: dep.nbv },
    financing: { balance: fin.balance, dsra_balance: fin.dsra_balance },
    tax: { 
      vat_output: vat.output ?? zeros(T),
      vat_input:  vat.input  ?? zeros(T),
      vat_net:    vat.net,
      vat_carry:  vat.carry,
      carry_vat:  vat.carry
    },
    cash,
    pnl
  });

  // Basic tie-out diagnostic
  const tieOK = bs.imbalance.every(x => x.abs().lt(0.01));
  console.log(`🧮 Balance Sheet ties: ${tieOK}`);

  return {
    revenue: {
      ...revenue,
      rev_cam: cam.cam_revenue,
      collections: revenue.collections,
      accounts_receivable: revenue.accounts_receivable,
      detail: {
        ...revenue.detail,
        collections_clamping_occurred: collectionsClampingOccurred
      }
    },
    costs: {
      ...costs,
      opex_net_of_cam: cam.opex_net_of_cam,
      vat_input: vat.input
    },
    financing: fin,
    tax: { 
      vat_output: vat.output,
      vat_input: vat.input,
      vat_net: vat.net, 
      carry_vat: vat.carry,
      corp: corp.tax, 
      zakat: zak.zakat,
      detail: vat.detail
    },
    depreciation: {
      total: dep.total,
      nbv: dep.nbv,
      detail: {} // (optional) expose perItem later if you want; we keep output lean now
    },
    cash,
    balance_sheet: bs,
    profit_and_loss: pnl,
    time: { df, dt }
  };
}

export { ProjectInputs } from "./types";