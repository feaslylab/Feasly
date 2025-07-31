import { calcIRR } from "./irr";

export interface KPIOptions {
  discountRate: number;           // e.g. 0.10  for 10 %
}

export interface KPIs {
  projectIRR: number | null;
  npv: number;
  profit: number;
  equityMultiple: number;
  paybackMonths: number | null;
  peakFunding: number;
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

  // Calculate equity multiple (total positive cashflow / total negative cashflow)
  const totalInflow = netCashflow.filter(cf => cf > 0).reduce((sum, cf) => sum + cf, 0);
  const totalOutflow = Math.abs(netCashflow.filter(cf => cf < 0).reduce((sum, cf) => sum + cf, 0));
  const equityMultiple = totalOutflow > 0 ? totalInflow / totalOutflow : 0;

  // Calculate payback period (months until cumulative cashflow turns positive)
  let cumulativeCF = 0;
  let paybackMonths: number | null = null;
  for (let i = 0; i < netCashflow.length; i++) {
    cumulativeCF += netCashflow[i];
    if (cumulativeCF > 0 && paybackMonths === null) {
      paybackMonths = i;
      break;
    }
  }

  // Calculate peak funding requirement (maximum negative cumulative cashflow)
  let cumulativeForPeak = 0;
  let peakFunding = 0;
  for (const cf of netCashflow) {
    cumulativeForPeak += cf;
    if (cumulativeForPeak < peakFunding) {
      peakFunding = cumulativeForPeak;
    }
  }
  peakFunding = Math.abs(peakFunding);

  return { 
    projectIRR: irr, 
    npv, 
    profit, 
    equityMultiple, 
    paybackMonths, 
    peakFunding 
  };
}

export * from "./irr";