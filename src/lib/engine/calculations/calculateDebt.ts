import type { DebtItemInput } from "@/schemas/inputs";
import type { DebtCalculationResult, DebtSchedule } from "@/types/finance";

/**
 * Calculate debt service schedule for financing items
 * This is a placeholder implementation that will be enhanced in future sprints
 */
export function calculateDebt(
  debtItems: DebtItemInput[],
  totalMonths: number = 60
): DebtCalculationResult {
  let totalInterest = 0;
  let totalPrincipal = 0;
  let totalDebtService = 0;
  const monthlySchedule: DebtSchedule[] = [];
  let peakOutstanding = 0;

  // Initialize monthly schedule
  for (let month = 0; month < totalMonths; month++) {
    monthlySchedule.push({
      month,
      beginningBalance: 0,
      drawdown: 0,
      interestPayment: 0,
      principalPayment: 0,
      endingBalance: 0,
      totalDebtService: 0,
    });
  }

  // Process each debt item
  for (const debt of debtItems) {
    const drawdownStart = debt.drawdown_start;
    const drawdownEnd = Math.min(debt.drawdown_end, totalMonths);
    const drawdownPeriods = Math.max(1, drawdownEnd - drawdownStart);
    const monthlyDrawdown = debt.amount / drawdownPeriods;
    const monthlyInterestRate = debt.interest_rate / 100 / 12;

    let outstandingBalance = 0;

    for (let month = 0; month < totalMonths; month++) {
      const schedule = monthlySchedule[month];
      
      // Drawdown phase
      if (month >= drawdownStart && month < drawdownEnd) {
        schedule.drawdown += monthlyDrawdown;
        outstandingBalance += monthlyDrawdown;
      }

      schedule.beginningBalance += outstandingBalance;

      // Interest calculation
      const interestPayment = outstandingBalance * monthlyInterestRate;
      
      if (debt.payment_type === 'paid') {
        schedule.interestPayment += interestPayment;
        totalInterest += interestPayment;
        totalDebtService += interestPayment;
      } else if (debt.payment_type === 'capitalized') {
        // Interest is capitalized (added to balance)
        outstandingBalance += interestPayment;
        totalInterest += interestPayment;
      }

      // Principal repayment (simplified linear amortization after drawdown)
      if (debt.amortization === 'linear' && month >= drawdownEnd) {
        const remainingMonths = totalMonths - drawdownEnd;
        if (remainingMonths > 0) {
          const monthlyPrincipal = debt.amount / remainingMonths;
          schedule.principalPayment += Math.min(monthlyPrincipal, outstandingBalance);
          outstandingBalance -= Math.min(monthlyPrincipal, outstandingBalance);
          totalPrincipal += Math.min(monthlyPrincipal, outstandingBalance);
          totalDebtService += Math.min(monthlyPrincipal, outstandingBalance);
        }
      }

      schedule.endingBalance += outstandingBalance;
      schedule.totalDebtService = schedule.interestPayment + schedule.principalPayment;
      
      peakOutstanding = Math.max(peakOutstanding, schedule.endingBalance);
    }
  }

  return {
    totalInterest,
    totalPrincipal,
    totalDebtService,
    monthlySchedule,
    peakOutstanding,
  };
}

/**
 * Format currency for debt calculations
 */
export function formatDebtCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    notation: 'compact',
    maximumFractionDigits: 0,
  }).format(amount);
}