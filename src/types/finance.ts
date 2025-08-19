export type LoanType = 'senior' | 'mezzanine' | 'bridge';
export type PaymentType = 'paid' | 'capitalized' | 'bullet';
export type AmortizationType = 'linear' | 'bullet';

export interface DebtSchedule {
  month: number;
  beginningBalance: number;
  drawdown: number;
  interestPayment: number;
  principalPayment: number;
  endingBalance: number;
  totalDebtService: number;
}

export interface DebtCalculationResult {
  totalInterest: number;
  totalPrincipal: number;
  totalDebtService: number;
  monthlySchedule: DebtSchedule[];
  peakOutstanding: number;
}