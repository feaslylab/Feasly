import { useMemo } from "react";
import { ConstructionItem, buildConstructionRow, computeKPIs, accrueInterestRow, SaleLine, buildSaleRevenue, RentalLine, buildRentalRevenue, LoanFacility, buildLoanSchedule } from "../../packages/feasly-engine/src";

/** Accepts an array of ConstructionItem objects and returns a
    consolidated monthly cash-outflow row (negative numbers).      */
export function useFeaslyCalc(
  items: ConstructionItem[], 
  horizon = 60, 
  discountRate = 0.10, 
  revenueLines: SaleLine[] = [],
  rentalLines: RentalLine[] = [],
  loanFacility?: LoanFacility
) {
  const { cash, interestRow, loanRows } = useMemo(() => {
    const row = Array(horizon).fill(0);
    const constructionCosts = Array(horizon).fill(0);
    
    // Add construction costs (negative) and track net costs for loan
    for (const it of items) {
      const r = buildConstructionRow(it, horizon);
      for (let i = 0; i < horizon; i++) {
        row[i] -= r[i];   // cost = outflow
        constructionCosts[i] += r[i];  // positive for loan calculation
      }
    }
    
    let loanRows;
    let interestExpense;
    
    if (loanFacility) {
      // Use loan facility for financing
      loanRows = buildLoanSchedule(loanFacility, constructionCosts, horizon);
      interestExpense = loanRows.interest;
      
      // Add loan cash flows
      for (let i = 0; i < horizon; i++) {
        row[i] += loanRows.draw[i];      // draw = inflow (positive)
        row[i] -= loanRows.repay[i];     // repay = outflow (negative)
        row[i] -= loanRows.interest[i];  // interest = outflow (negative)
      }
    } else {
      // Use dummy 1M loan balance and interest expense (legacy behavior)
      const loanBalance = Array(horizon).fill(1_000_000);
      interestExpense = accrueInterestRow(loanBalance, 0.08);
      for (let i = 0; i < horizon; i++) row[i] -= interestExpense[i];  // interest = outflow
    }
    
    // Add revenue lines (positive)
    for (const line of revenueLines) {
      const r = buildSaleRevenue(line, horizon);
      for (let i = 0; i < horizon; i++) row[i] += r[i];   // revenue = inflow
    }
    
    // Add rental revenue lines (positive)
    for (const line of rentalLines) {
      const r = buildRentalRevenue(line, horizon);
      for (let i = 0; i < horizon; i++) row[i] += r[i];   // rental = inflow
    }
    
    return { cash: row, interestRow: interestExpense, loanRows };
  }, [JSON.stringify(items), horizon, JSON.stringify(revenueLines), JSON.stringify(rentalLines), JSON.stringify(loanFacility)]);
  
  const kpi = useMemo(() => computeKPIs(cash, { discountRate }), [cash, discountRate]);
  
  return { cash, kpi, interestRow, loanRows };
}