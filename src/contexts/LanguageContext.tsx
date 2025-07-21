import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import i18n from '@/lib/i18n';

export type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  isRTL: boolean;
  t: (key: string, options?: any) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(false);

  const isRTL = useMemo(() => language === 'ar', [language]);

  const setLanguage = async (lang: Language) => {
    setIsLoading(true);
    try {
      await i18n.changeLanguage(lang);
      setLanguageState(lang);
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
      localStorage.setItem('language', lang);
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const t = (key: string, options?: any): string => {
    const result = i18n.t(key, options);
    return typeof result === 'string' ? result : key;
  };

  // Set initial HTML attributes and load saved language
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language || 'en';
    if (savedLanguage !== language) {
      setLanguage(savedLanguage);
    } else {
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
    }
  }, []);

  // Update HTML attributes when language changes
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [isRTL, language]);

  // Sync with i18next language changes
  useEffect(() => {
    // Set initial language from i18next
    if (i18n.language) {
      setLanguageState(i18n.language as Language);
    }
  }, []);

  // Memoize context value
  const contextValue = useMemo(() => ({
    language,
    setLanguage,
    isRTL,
    t,
    isLoading,
  }), [language, setLanguage, isRTL, t, isLoading]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    console.warn('useLanguage called outside LanguageProvider, using fallback');
    // Fallback to i18next directly if context is not available
    return {
      language: (i18n.language as Language) || 'en',
      setLanguage: async (lang: Language) => { 
        await i18n.changeLanguage(lang);
      },
      isRTL: i18n.language === 'ar',
      t: (key: string, options?: any) => {
        const result = i18n.t(key, options);
        return typeof result === 'string' ? result : key;
      },
      isLoading: false,
    };
  }
  return context;
};