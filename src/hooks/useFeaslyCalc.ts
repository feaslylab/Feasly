import { useMemo } from "react";
import { ConstructionItem, buildConstructionRow, computeKPIs, accrueInterestRow, SaleLine, buildSaleRevenue } from "../../packages/feasly-engine/src";

/** Accepts an array of ConstructionItem objects and returns a
    consolidated monthly cash-outflow row (negative numbers).      */
export function useFeaslyCalc(
  items: ConstructionItem[], 
  horizon = 60, 
  discountRate = 0.10, 
  revenueLines: SaleLine[] = []
) {
  const { cash, interestRow } = useMemo(() => {
    const row = Array(horizon).fill(0);
    
    // Add construction costs (negative)
    for (const it of items) {
      const r = buildConstructionRow(it, horizon);
      for (let i = 0; i < horizon; i++) row[i] -= r[i];   // cost = outflow
    }
    
    // Add dummy 1M loan balance and interest expense (negative)
    const loanBalance = Array(horizon).fill(1_000_000);
    const interestExpense = accrueInterestRow(loanBalance, 0.08);
    for (let i = 0; i < horizon; i++) row[i] -= interestExpense[i];  // interest = outflow
    
    // Add revenue lines (positive)
    for (const line of revenueLines) {
      const r = buildSaleRevenue(line, horizon);
      for (let i = 0; i < horizon; i++) row[i] += r[i];   // revenue = inflow
    }
    
    return { cash: row, interestRow: interestExpense };
  }, [JSON.stringify(items), horizon, JSON.stringify(revenueLines)]);
  
  const kpi = useMemo(() => computeKPIs(cash, { discountRate }), [cash, discountRate]);
  
  return { cash, kpi, interestRow };
}