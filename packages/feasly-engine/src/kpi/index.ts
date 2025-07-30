import { calcIRR } from "./irr";

export interface KPIOptions {
  discountRate: number;           // e.g. 0.10  for 10 %
}

export interface KPIs {
  projectIRR: number | null;
  npv: number;
  profit: number;
}

export function computeKPIs(
  netCashflow: number[],
  { discountRate }: KPIOptions
): KPIs {
  const profit = netCashflow.reduce((a, b) => a + b, 0);

  const npv = netCashflow.reduce(
    (acc, c, i) => acc + c / (1 + discountRate) ** i,
    0
  );

  const irr = calcIRR(netCashflow);

  return { projectIRR: irr, npv, profit };
}

export * from "./irr";