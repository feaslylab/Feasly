import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';

// Available namespaces
export const namespaces = {
  COMMON: 'common',
  AUTH: 'auth',
  MODEL: 'feasly.model',
  FLOW: 'feasly.flow',
  FINANCE: 'feasly.finance',
  CONSOLIDATE: 'feasly.consolidate',
  INSIGHTS: 'feasly.insights',
} as const;

// Initialize i18next
i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'ar'],
    ns: ['common', 'auth', 'feasly.model', 'feasly.flow', 'feasly.finance', 'feasly.consolidate', 'feasly.insights'],
    defaultNS: 'common',
    
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    
    react: {
      useSuspense: false, // Disable suspense for better control
    },
    
    interpolation: {
      escapeValue: false,
    },
    
    // Performance optimizations
    load: 'languageOnly',
    preload: ['en'], // Preload English
    
    // Debug in development
    debug: process.env.NODE_ENV === 'development',
  });

export default i18n;