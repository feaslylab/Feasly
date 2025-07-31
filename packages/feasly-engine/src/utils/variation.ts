/** Apply variations to scenario inputs for sensitivity analysis */
export interface VariationInput {
  costVariationPercent: number;      // e.g., +10% = 10, -5% = -5
  salePriceVariationPercent: number; // e.g., +15% = 15
  interestRateVariationBps: number;  // e.g., +50 bps = 50
}

export function applyVariation<T extends {
  constructionItems: Array<{ baseCost: number; [key: string]: any }>;
  saleLines: Array<{ pricePerUnit: number; [key: string]: any }>;
  loanFacility?: { interestRate: number; [key: string]: any };
}>(scenario: T, variation: VariationInput): T {
  const { costVariationPercent, salePriceVariationPercent, interestRateVariationBps } = variation;
  
  return {
    ...scenario,
    constructionItems: scenario.constructionItems.map(item => ({
      ...item,
      baseCost: item.baseCost * (1 + costVariationPercent / 100)
    })),
    saleLines: scenario.saleLines.map(line => ({
      ...line,
      pricePerUnit: line.pricePerUnit * (1 + salePriceVariationPercent / 100)
    })),
    loanFacility: scenario.loanFacility ? {
      ...scenario.loanFacility,
      interestRate: scenario.loanFacility.interestRate + (interestRateVariationBps / 10000)
    } : undefined
  };
}