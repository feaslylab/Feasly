import type { Phase } from "./types";

/**
 * Generate monthly timeline grid from start to end date
 */
export function generateTimelineGrid(startDate: Date, endDate: Date): string[] {
  const months: string[] = [];
  const current = new Date(startDate);
  current.setDate(1); // Start from first day of month
  
  while (current <= endDate) {
    const monthName = current.toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
    months.push(monthName);
    current.setMonth(current.getMonth() + 1);
  }
  
  return months;
}

/**
 * Allocate total cost evenly over specified months
 */
export function allocateCostOverMonths(
  total: number, 
  months: string[]
): Record<string, number> {
  const monthlyAmount = total / months.length;
  return months.reduce((acc, month) => {
    acc[month] = monthlyAmount;
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Calculate revenue allocation over months (lump sum or amortized)
 */
export function calculateRevenueOverMonths(
  totalRevenue: number,
  completionMonth: string,
  allMonths: string[],
  amortizePeriodMonths: number = 6
): Record<string, number> {
  const revenue: Record<string, number> = {};
  
  // Initialize all months to 0
  allMonths.forEach(month => revenue[month] = 0);
  
  const completionIndex = allMonths.indexOf(completionMonth);
  if (completionIndex === -1) return revenue;
  
  // Amortize revenue over specified period starting from completion
  const monthlyRevenue = totalRevenue / amortizePeriodMonths;
  
  for (let i = 0; i < amortizePeriodMonths && (completionIndex + i) < allMonths.length; i++) {
    const monthIndex = completionIndex + i;
    revenue[allMonths[monthIndex]] = monthlyRevenue;
  }
  
  return revenue;
}

/**
 * Allocate costs over phases with specific timing and percentages
 */
export function allocatePhasedCosts(
  totalCost: number,
  months: string[],
  phases: Phase[]
): Record<string, number> {
  const allocation: Record<string, number> = {};
  
  // Initialize all months to 0
  months.forEach(month => allocation[month] = 0);
  
  phases.forEach(phase => {
    const phaseCost = (totalCost * phase.costPercent) / 100;
    const monthlyAmount = phaseCost / phase.duration;
    
    for (let i = 0; i < phase.duration; i++) {
      const monthIndex = phase.startMonth + i;
      if (monthIndex < months.length) {
        allocation[months[monthIndex]] += monthlyAmount;
      }
    }
  });
  
  return allocation;
}

/**
 * Allocate equity based on actual cost timing in phased projects
 */
export function allocatePhasedEquity(
  totalEquity: number,
  months: string[],
  constructionCosts: Record<string, number>,
  landCosts: Record<string, number>,
  softCosts: Record<string, number>
): Record<string, number> {
  const allocation: Record<string, number> = {};
  
  // Calculate total monthly costs
  const monthlyCosts: Record<string, number> = {};
  months.forEach(month => {
    monthlyCosts[month] = 
      (constructionCosts[month] || 0) + 
      (landCosts[month] || 0) + 
      (softCosts[month] || 0);
  });
  
  const totalCosts = Object.values(monthlyCosts).reduce((sum, cost) => sum + cost, 0);
  
  // Allocate equity proportionally to costs
  months.forEach(month => {
    if (totalCosts > 0) {
      allocation[month] = (monthlyCosts[month] / totalCosts) * totalEquity;
    } else {
      allocation[month] = 0;
    }
  });
  
  return allocation;
}