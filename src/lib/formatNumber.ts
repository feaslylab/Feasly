/**
 * Format numbers based on current language
 * Returns Arabic numerals when language is Arabic, English numerals otherwise
 */
export const formatNumber = (num: number, lang?: string): string => {
  // Get language from i18n if not provided
  const currentLang = lang || (typeof window !== 'undefined' && window.localStorage.getItem('i18nextLng')) || 'en';
  
  if (currentLang === 'ar') {
    // Convert to Arabic numerals
    const formatted = num.toLocaleString('en-US');
    return formatted.replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
  }
  
  return num.toLocaleString('en-US');
};

/**
 * Format currency amounts with proper localization
 */
export const formatCurrency = (amount: number, currency: string = 'AED', lang?: string): string => {
  const formattedNumber = formatNumber(amount, lang);
  const currentLang = lang || (typeof window !== 'undefined' && window.localStorage.getItem('i18nextLng')) || 'en';
  
  if (currentLang === 'ar') {
    return `${formattedNumber} ${currency}`;
  }
  
  return `${currency} ${formattedNumber}`;
};