import Decimal from "decimal.js";
import { ProjectInputs } from "./types";

const z = (T:number)=>Array.from({length:T},()=>new Decimal(0));
const one = new Decimal(1);

export type CAMBlock = {
  cam_revenue: Decimal[];
  cam_detail_by_plot: Record<string, Decimal[]>;
  opex_net_of_cam: Decimal[];
};

export function computeCAM(params:{
  inputs: ProjectInputs; T:number;
  opexSeries: Decimal[];
  costItemsDetail: Array<{ key:string; is_opex:boolean; recoverable:boolean; series:number[]; plot_key?:string; }>;
  unitTypes: Array<{ key:string; plot_key?:string; category?:string; area_sqm:number; occupancy:number[]; }>;
}): CAMBlock {
  const { inputs, T } = params;
  if (!inputs.cam?.enabled) return { cam_revenue: z(T), cam_detail_by_plot:{}, opex_net_of_cam: params.opexSeries.slice() as any };

  const thr = new Decimal(inputs.cam.gross_up_threshold ?? 0.95);
  const admin = new Decimal(inputs.cam.admin_fee_pct ?? 0);
  const billableCats = new Set(inputs.cam.billable_categories ?? []);

  // Recoverable opex (sum)
  const rec = z(T); const recByPlot = new Map<string, Decimal[]>();
  const ez = (k:string)=>{ if(!recByPlot.has(k)) recByPlot.set(k, z(T)); return recByPlot.get(k)!; };
  for (const it of params.costItemsDetail) {
    if (!it.is_opex || !it.recoverable) continue;
    for (let t=0;t<T;t++){ const v=new Decimal(it.series[t]||0); rec[t]=rec[t].add(v); if (it.plot_key) ez(it.plot_key)[t]=ez(it.plot_key)[t].add(v); }
  }

  // Occupied area by plot
  const occByPlot = new Map<string, Decimal[]>(); const totOcc=z(T), totGFA=z(T);
  const oz = (k:string)=>{ if(!occByPlot.has(k)) occByPlot.set(k,z(T)); return occByPlot.get(k)!; };
  for (const ut of params.unitTypes) {
    if (ut.category && !billableCats.has(ut.category)) continue;
    const area = new Decimal(ut.area_sqm||0); const pk = ut.plot_key ?? "_unassigned";
    const arr = oz(pk);
    for (let t=0;t<T;t++){ const occ = new Decimal(ut.occupancy[t]||0).clamp(0,1); const occArea=area.mul(occ); arr[t]=arr[t].add(occArea); totOcc[t]=totOcc[t].add(occArea); totGFA[t]=totGFA[t].add(area); }
  }

  // Bill CAM with gross-up & admin fee
  const cam=z(T); const camByPlot=new Map<string, Decimal[]>(); const cz=(k:string)=>{ if(!camByPlot.has(k)) camByPlot.set(k,z(T)); return camByPlot.get(k)!; };
  for (let t=0;t<T;t++){
    const occPct = totGFA[t].isZero()? new Decimal(0): totOcc[t].div(totGFA[t]);
    const occAdj = Decimal.max(occPct, thr);
    let bill = new Decimal(0);
    if (inputs.cam.basis==="recoverable_opex_share") bill = occAdj.isZero()? new Decimal(0) : rec[t].div(occAdj);
    // per_sqm basis can be added later
    bill = bill.mul(one.add(admin));
    cam[t]=bill;
    for (const [pk,arr] of occByPlot.entries()){
      const share = totOcc[t].isZero()? new Decimal(0): arr[t].div(totOcc[t]);
      cz(pk)[t]=bill.mul(share);
    }
  }

  const opexNet=z(T); for(let t=0;t<T;t++) opexNet[t]=params.opexSeries[t].minus(cam[t]);
  const cam_detail_by_plot: Record<string, Decimal[]> = {}; for (const [k,v] of camByPlot.entries()) cam_detail_by_plot[k]=v;
  return { cam_revenue: cam, cam_detail_by_plot, opex_net_of_cam: opexNet };
}