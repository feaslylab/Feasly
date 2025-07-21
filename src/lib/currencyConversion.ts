import { supabase } from "@/integrations/supabase/client";

export interface ExchangeRate {
  id: string;
  from_currency: string;
  to_currency: string;
  rate: number;
  updated_at: string;
}

export const SUPPORTED_CURRENCIES = [
  'AED', 'SAR', 'QAR', 'USD', 'EUR', 'GBP', 'KWD', 'BHD', 'OMR', 'EGP', 'INR', 'PKR', 'CNY'
] as const;

export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number];

// Get all exchange rates
export const getExchangeRates = async (): Promise<ExchangeRate[]> => {
  const { data, error } = await supabase
    .from('exchange_rates')
    .select('*');
  
  if (error) {
    console.error('Error fetching exchange rates:', error);
    return [];
  }
  
  return data || [];
};

// Convert amount from one currency to another
export const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  exchangeRates: ExchangeRate[]
): number => {
  // If same currency, no conversion needed
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  // Find exchange rate
  const rate = exchangeRates.find(
    r => r.from_currency === fromCurrency && r.to_currency === toCurrency
  );
  
  if (!rate) {
    console.warn(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
    return amount; // Return original amount if no rate found
  }
  
  return amount * rate.rate;
};

// Format currency amount with symbol
export const formatCurrencyAmount = (
  amount: number,
  currency: string,
  showOriginal: boolean = false,
  originalAmount?: number,
  originalCurrency?: string
): string => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const mainDisplay = `${currency} ${formatNumber(amount)}`;
  
  if (showOriginal && originalAmount && originalCurrency && originalCurrency !== currency) {
    return `${originalCurrency} ${formatNumber(originalAmount)} ≈ ${mainDisplay}`;
  }
  
  return mainDisplay;
};

// Get currency symbol/code display
export const getCurrencyDisplay = (currencyCode: string): string => {
  return currencyCode;
};