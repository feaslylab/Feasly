export const nf = (locale: 'en' | 'ar') => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });

export function fmtNumber(value: number, locale: 'en' | 'ar') { 
  return nf(locale).format(value); 
}

// For finance we'll keep Western numerals even in AR for readability
export function fmtFinance(value: number, locale: 'en' | 'ar') {
  return new Intl.NumberFormat(locale === 'ar' ? 'en' : locale, { 
    maximumFractionDigits: 2 
  }).format(value);
}

export function fmtCurrency(value: number, locale: 'en' | 'ar', currency = 'USD') {
  return new Intl.NumberFormat(locale === 'ar' ? 'en' : locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(value);
}

export function fmtPercentage(value: number, locale: 'en' | 'ar') {
  return new Intl.NumberFormat(locale === 'ar' ? 'en' : locale, {
    style: 'percent',
    maximumFractionDigits: 1
  }).format(value / 100);
}
