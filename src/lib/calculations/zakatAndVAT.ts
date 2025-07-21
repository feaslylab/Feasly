/**
 * Calculate zakat on profit
 */
export function calculateZakat(profit: number, zakatRatePercent: number): number {
  return profit > 0 ? (profit * zakatRatePercent) / 100 : 0;
}

/**
 * Calculate VAT on costs
 */
export function calculateVATOnCosts(
  constructionCost: number,
  landCost: number,
  softCosts: number,
  vatRate: number
): number {
  const totalCosts = constructionCost + landCost + softCosts;
  return (totalCosts * vatRate) / 100;
}

/**
 * Calculate recoverable VAT (assuming full recovery in this simplified model)
 */
export function calculateRecoverableVAT(vatOnCosts: number): number {
  return vatOnCosts; // Assuming VAT can be fully recovered
}