import { useMemo } from "react";
import { ConstructionItem, buildConstructionRow, computeKPIs } from "../../packages/feasly-engine/src";

/** Accepts an array of ConstructionItem objects and returns a
    consolidated monthly cash-outflow row (negative numbers).      */
export function useFeaslyCalc(items: ConstructionItem[], horizon = 60, discountRate = 0.10) {
  const cash = useMemo(() => {
    const row = Array(horizon).fill(0);
    for (const it of items) {
      const r = buildConstructionRow(it, horizon);
      for (let i = 0; i < horizon; i++) row[i] -= r[i];   // cost = outflow
    }
    return row;
  }, [JSON.stringify(items), horizon]);
  
  const kpi = useMemo(() => computeKPIs(cash, { discountRate }), [cash, discountRate]);
  
  return { cash, kpi };
}