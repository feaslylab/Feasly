import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '@/lib/i18n';

export type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  isRTL: boolean;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(false);

  const isRTL = language === 'ar';

  const setLanguage = async (lang: Language) => {
    setIsLoading(true);
    const previousLanguage = language;
    try {
      await i18n.changeLanguage(lang);
      setLanguageState(lang);
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
      localStorage.setItem('language', lang);
      
      // Track language change for telemetry
      if (typeof window !== 'undefined' && previousLanguage !== lang) {
        import('@/lib/telemetry').then(({ telemetry }) => {
          telemetry.localeChanged(previousLanguage, lang);
        });
      }
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize language from localStorage or browser
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    const browserLanguage = navigator.language.split('-')[0] as Language;
    const initialLanguage = savedLanguage || (browserLanguage === 'ar' ? 'ar' : 'en');
    
    if (initialLanguage !== language) {
      setLanguage(initialLanguage);
    } else {
      setLanguageState(initialLanguage);
      document.documentElement.dir = initialLanguage === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = initialLanguage;
    }
  }, []);

  const contextValue = {
    language,
    setLanguage,
    isRTL,
    isLoading,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback for when context is not available
    return {
      language: (i18n.language as Language) || 'en',
      setLanguage: async (lang: Language) => {
        await i18n.changeLanguage(lang);
      },
      isRTL: i18n.language === 'ar',
      isLoading: false,
    };
  }
  return context;
};