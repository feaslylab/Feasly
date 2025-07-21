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

// Format currency amount with enhanced options
export const formatCurrencyAmount = ({
  amount,
  currency,
  convertedToAED,
  showOriginal = true,
  rate
}: {
  amount: number;
  currency: string;
  convertedToAED?: number;
  showOriginal?: boolean;
  rate?: number;
}): { display: string; footnote?: string } => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // If currency is AED, just return the amount
  if (currency === 'AED') {
    return { display: `AED ${formatNumber(amount)}` };
  }

  // If we don't want to show original, return converted AED
  if (!showOriginal && convertedToAED) {
    return { display: `AED ${formatNumber(convertedToAED)}` };
  }

  // Show original currency as primary with AED footnote
  const display = `${currency} ${formatNumber(amount)}`;
  const footnote = convertedToAED && rate 
    ? `Converted to AED: AED ${formatNumber(convertedToAED)} at ${rate}`
    : convertedToAED 
    ? `Converted to AED: AED ${formatNumber(convertedToAED)}`
    : undefined;

  return { display, footnote };
};

// Get exchange rate between two currencies
export const getExchangeRate = (
  fromCurrency: string,
  toCurrency: string,
  exchangeRates: ExchangeRate[]
): number | null => {
  const rate = exchangeRates.find(
    r => r.from_currency === fromCurrency && r.to_currency === toCurrency
  );
  return rate ? rate.rate : null;
};

// Get currency symbol/code display
export const getCurrencyDisplay = (currencyCode: string): string => {
  return currencyCode;
};