import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const fmtCurrency = (
  v: number | null | undefined,
  currency = 'AED',
  dp = 0
): string =>
  v == null || !Number.isFinite(v) 
    ? 'N/A' 
    : new Intl.NumberFormat('en-AE', {
        style: 'currency',
        currency,
        minimumFractionDigits: dp,
        maximumFractionDigits: dp,
      }).format(v);
