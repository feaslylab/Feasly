import Decimal from "decimal.js";

export type CashBlock = {
  project_before_fin: Decimal[]; // revenue - opex - capex
  project: Decimal[];            // + debt draws - interest - principal (no taxes yet)
  equity_cf: Decimal[];          // placeholder (add waterfall later)
};

function zeros(T: number) { return Array.from({ length: T }, () => new Decimal(0)); }

export function assembleCash(
  rev_sales: Decimal[],
  rev_rent: Decimal[],
  capex: Decimal[],
  opex: Decimal[],
  fin: { draws: Decimal[]; interest: Decimal[]; principal: Decimal[]; }
): CashBlock {
  const T = rev_sales.length;
  const project_before_fin = zeros(T);
  const project            = zeros(T);
  const equity_cf          = zeros(T);

  for (let t = 0; t < T; t++) {
    const revenue = rev_sales[t].add(rev_rent[t]);

    const beforeFin = revenue.minus(opex[t]).minus(capex[t]);
    project_before_fin[t] = beforeFin;

    // financing effects (cash view): +draws -interest -principal
    project[t] = beforeFin.add(fin.draws[t]).minus(fin.interest[t]).minus(fin.principal[t]);

    // equity CF placeholder: equal to project for now (will change with debt/equity flows later)
    equity_cf[t] = project[t];
  }

  return { project_before_fin, project, equity_cf };
}