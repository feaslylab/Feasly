import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export type Locale = 'en' | 'ar';
export type Direction = 'ltr' | 'rtl';

interface LocaleContextType {
  locale: Locale;
  dir: Direction;
  setLocale: (locale: Locale) => void;
  isRTL: boolean;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

interface LocaleProviderProps {
  children: ReactNode;
}

export const LocaleProvider: React.FC<LocaleProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();
  
  // Initialize from localStorage or default to 'en'
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('feasly-locale') as Locale;
      return stored && ['en', 'ar'].includes(stored) ? stored : 'en';
    }
    return 'en';
  });

  const dir: Direction = locale === 'ar' ? 'rtl' : 'ltr';
  const isRTL = dir === 'rtl';

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('feasly-locale', newLocale);
    i18n.changeLanguage(newLocale);
    
    // Update document attributes
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLocale;
      document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr';
    }
  };

  // Set initial document attributes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
      document.documentElement.dir = dir;
    }
    i18n.changeLanguage(locale);
  }, [locale, dir, i18n]);

  return (
    <LocaleContext.Provider value={{ locale, dir, setLocale, isRTL }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = (): LocaleContextType => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};