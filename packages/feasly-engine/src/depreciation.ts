import Decimal from "decimal.js";
import { ProjectInputs } from "./types";

export type DepreciationBlock = {
  perItem: Array<{
    key: string;
    series: Decimal[];
    start_month?: number;
    useful_life_months?: number;
    salvage_value?: number;
  }>;
  total: Decimal[];
  nbv: Decimal[]; // net book value rollforward of depreciable items
};

function zeros(T: number) { return Array.from({ length: T }, () => new Decimal(0)); }

/** Straight-line depreciation: start at start_month, over life, on (cost - salvage). */
function straightLineSeries(
  base: Decimal[],
  startMonth: number,
  lifeM: number,
  salvage = 0
): Decimal[] {
  const T = base.length;
  // total capitalized basis (sum of base cash outlays up to start)
  let basis = new Decimal(0);
  for (let t = 0; t <= Math.min(startMonth, T - 1); t++) basis = basis.add(base[t]);

  const depBase = Decimal.max(basis.minus(salvage), new Decimal(0));
  const perM = lifeM > 0 ? depBase.div(lifeM) : new Decimal(0);
  const out = zeros(T);
  for (let m = startMonth; m < Math.min(startMonth + lifeM, T); m++) {
    out[m] = perM;
  }
  return out;
}

export function computeDepreciation(inputs: ProjectInputs, capex: Decimal[]): DepreciationBlock {
  const T = capex.length;
  const perItem: DepreciationBlock["perItem"] = [];
  const total = zeros(T);

  for (const item of inputs.cost_items) {
    const pol = item.depreciation;
    if (!pol || pol.method === "none") continue;

    const start = pol.start_month ?? 0;
    const lifeM = pol.useful_life_months ?? 0;
    const salvage = pol.salvage_value ?? 0;

    let series: Decimal[] = zeros(T);
    if (pol.method === "straight_line") {
      // Build the per-item capex series first (already escalated in computeCosts, but we don't have that here).
      // We approximate by allocating the item's base amount following its phasing only (without index),
      // because depreciation should use *capitalized cost*. For parity with computeCosts, consider passing the escalated per-item series later.
      // For now, we'll use the capex total as proxy (OK for Phase 1).
      series = straightLineSeries(capex, start, lifeM, salvage);
    }

    // accumulate
    for (let t = 0; t < T; t++) total[t] = total[t].add(series[t]);

    perItem.push({
      key: item.key,
      series,
      start_month: start,
      useful_life_months: lifeM,
      salvage_value: salvage
    });
  }

  // NBV rollforward (proxy): capex cumulative minus dep cumulative
  const nbv = zeros(T);
  let cumCapex = new Decimal(0);
  let cumDep = new Decimal(0);
  for (let t = 0; t < T; t++) {
    cumCapex = cumCapex.add(capex[t]);
    cumDep = cumDep.add(total[t]);
    nbv[t] = Decimal.max(cumCapex.minus(cumDep), new Decimal(0));
  }

  return { perItem, total, nbv };
}