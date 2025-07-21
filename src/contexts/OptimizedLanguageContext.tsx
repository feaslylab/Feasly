import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNamespaceLoader } from '@/hooks/useNamespaceLoader';
import '@/lib/i18n'; // Initialize i18n

export type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
  t: (key: string, namespace?: string) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { t, i18n, ready } = useTranslation();
  const { loadNamespacesForRoute } = useNamespaceLoader();
  const [isLoading, setIsLoading] = useState(!ready);

  // Get current language from i18n
  const language = (i18n.language || 'en') as Language;
  
  const isRTL = useMemo(() => language === 'ar', [language]);

  // Memoized translation function with namespace support
  const translateFunction = useCallback((key: string, namespace?: string) => {
    if (namespace) {
      return t(key, { ns: namespace });
    }
    
    // Smart namespace detection for backward compatibility
    if (key.includes('.')) {
      const parts = key.split('.');
      if (parts.length >= 2) {
        const possibleNamespace = parts[0] === 'feasly' ? `feasly.${parts[1]}` : parts[0];
        const restKey = parts.slice(parts[0] === 'feasly' ? 2 : 1).join('.');
        
        // Check if this namespace exists
        if (i18n.hasResourceBundle(language, possibleNamespace)) {
          return t(restKey, { ns: possibleNamespace });
        }
      }
    }
    
    // Fallback to default translation or return key
    return t(key) || key;
  }, [t, i18n, language]);

  const setLanguage = useCallback(async (lang: Language) => {
    setIsLoading(true);
    try {
      await i18n.changeLanguage(lang);
      // Update HTML dir attribute
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsLoading(false);
    }
  }, [i18n]);

  // Update loading state when i18n ready state changes
  useEffect(() => {
    setIsLoading(!ready);
  }, [ready]);

  // Set initial HTML attributes
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [isRTL, language]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    language,
    setLanguage,
    isRTL,
    t: translateFunction,
    isLoading,
  }), [language, setLanguage, isRTL, translateFunction, isLoading]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Provide a fallback instead of throwing an error
    console.warn('useLanguage called outside LanguageProvider, using fallback');
    return {
      language: 'en' as Language,
      setLanguage: () => {},
      isRTL: false,
      t: (key: string) => key,
      isLoading: false,
    };
  }
  return context;
};