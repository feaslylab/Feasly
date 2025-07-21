import type { LoanSchedule } from "./types";

/**
 * Calculate loan schedule with interest and repayments
 */
export function calculateLoanSchedule(
  loanAmount: number,
  interestRate: number, // annual rate as decimal
  termMonths: number,
  repaymentType: 'bullet' | 'equal' | 'interest_only',
  gracePeriodMonths: number,
  allMonths: string[]
): LoanSchedule {
  const monthlyInterestRate = interestRate / 12;
  const loanDrawn: Record<string, number> = {};
  const loanInterest: Record<string, number> = {};
  const loanRepayment: Record<string, number> = {};
  
  // Initialize all months
  allMonths.forEach(month => {
    loanDrawn[month] = 0;
    loanInterest[month] = 0;
    loanRepayment[month] = 0;
  });
  
  // Draw loan in first month
  if (allMonths.length > 0) {
    loanDrawn[allMonths[0]] = loanAmount;
  }
  
  let outstandingBalance = loanAmount;
  
  allMonths.forEach((month, index) => {
    // Calculate monthly interest
    if (outstandingBalance > 0) {
      loanInterest[month] = outstandingBalance * monthlyInterestRate;
    }
    
    // Calculate repayments after grace period
    if (index >= gracePeriodMonths && outstandingBalance > 0) {
      switch (repaymentType) {
        case 'bullet':
          // Pay all principal at the end
          if (index === allMonths.length - 1) {
            loanRepayment[month] = outstandingBalance;
            outstandingBalance = 0;
          }
          break;
          
        case 'equal':
          // Equal monthly payments
          const remainingMonths = allMonths.length - index;
          const monthlyPayment = outstandingBalance / remainingMonths;
          loanRepayment[month] = monthlyPayment;
          outstandingBalance -= monthlyPayment;
          break;
          
        case 'interest_only':
          // Only interest payments, principal at end
          if (index === allMonths.length - 1) {
            loanRepayment[month] = outstandingBalance;
            outstandingBalance = 0;
          }
          break;
      }
    }
  });
  
  return { loanDrawn, loanInterest, loanRepayment };
}