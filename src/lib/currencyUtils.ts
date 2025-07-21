/**
 * Currency formatting utilities for multi-currency support
 */

export interface CurrencyFormatOptions {
  currencyCode?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  notation?: 'standard' | 'scientific' | 'engineering' | 'compact';
}

/**
 * Format a number as currency using the specified currency code
 */
export function formatCurrency(
  value: number, 
  options: CurrencyFormatOptions = {}
): string {
  const {
    currencyCode = 'SAR', // Default fallback to SAR
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
    notation = 'standard'
  } = options;

  try {
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits,
      maximumFractionDigits,
      notation,
    }).format(value);
  } catch (error) {
    // Fallback to SAR if currency code is invalid
    console.warn(`Invalid currency code: ${currencyCode}, falling back to SAR`);
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits,
      maximumFractionDigits,
      notation,
    }).format(value);
  }
}

/**
 * Format currency for compact display (K, M, B suffixes)
 */
export function formatCurrencyCompact(
  value: number,
  currencyCode: string = 'SAR'
): string {
  return formatCurrency(value, {
    currencyCode,
    notation: 'compact',
    maximumFractionDigits: 1,
  });
}

/**
 * Format currency with full precision for detailed views
 */
export function formatCurrencyDetailed(
  value: number,
  currencyCode: string = 'SAR'
): string {
  return formatCurrency(value, {
    currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Get currency symbol for a given currency code
 */
export function getCurrencySymbol(currencyCode: string = 'SAR'): string {
  try {
    const formatter = new Intl.NumberFormat('en', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    
    // Extract just the currency symbol
    const parts = formatter.formatToParts(0);
    const currencyPart = parts.find(part => part.type === 'currency');
    return currencyPart?.value || currencyCode;
  } catch (error) {
    return currencyCode;
  }
}

/**
 * Common currency codes with their display names
 */
export const CURRENCY_OPTIONS = [
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'ر.ق' },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: 'د.ب' },
  { code: 'OMR', name: 'Omani Rial', symbol: 'ر.ع' },
] as const;