import {
  buildConstructionRow,
  buildSaleRevenue,
  buildLoanSchedule,
  computeKPIs
} from "../../packages/feasly-engine/src";

export function runEngine(dto: Awaited<ReturnType<typeof import("./parseEmdfToDto").emdfToDto>>) {
  const horizon = 60;
  const cash = Array(horizon).fill(0);

  // construction
  for (const c of dto.construction) {
    const row = buildConstructionRow(c, horizon);
    for (let i=0;i<horizon;i++) cash[i] -= row[i];
  }

  // sales
  for (const s of dto.sales) {
    const row = buildSaleRevenue(s, horizon);
    for (let i=0;i<horizon;i++) cash[i] += row[i];
  }

  // loan
  if (dto.loan) {
    const costOnly = cash.map(v => -Math.min(0, v));   // positive outflows
    const loanRows = buildLoanSchedule(dto.loan, costOnly, horizon);
    for (let i=0;i<horizon;i++) {
      cash[i] += loanRows.draw[i];
      cash[i] -= loanRows.repay[i] + loanRows.interest[i];
    }
  }

  const kpi = computeKPIs(cash, { discountRate: 0.10 });
  return { cash, kpi };
}