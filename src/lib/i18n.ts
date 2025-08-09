
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';

// Available namespaces
export const namespaces = {
  COMMON: 'common',
  AUTH: 'auth',
  MARKETING: 'marketing',
  MODEL: 'feasly.model',
  FLOW: 'feasly.flow',
  FINANCE: 'feasly.finance',
  CONSOLIDATE: 'feasly.consolidate',
  INSIGHTS: 'feasly.insights',
  VALIDATION: 'validation',
} as const;

// Initialize i18next
i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'ar'],
    ns: ['common', 'auth', 'marketing', 'feasly.model', 'feasly.flow', 'feasly.finance', 'feasly.consolidate', 'feasly.insights', 'validation'],
    defaultNS: 'common',
    
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      // Preload critical namespaces for faster initial loading
      crossDomain: false,
      withCredentials: false,
    },
    
    react: {
      useSuspense: false, // Keep disabled for better control
    },
    
    interpolation: {
      escapeValue: false,
    },
    
    // Safe fallback configuration
    returnEmptyString: false,
    returnNull: false,
    returnObjects: false,
    
    // Performance optimizations
    load: 'languageOnly',
    preload: ['en', 'ar'], // Preload both languages
    
    // Preload critical namespaces immediately
    initImmediate: false,
    
    // Debug in development
    debug: process.env.NODE_ENV === 'development',
  });

// Preload marketing translations on initialization for faster hero rendering
const preloadCriticalTranslations = async () => {
  try {
    // Load marketing namespace for current language immediately
    await i18n.loadNamespaces(['marketing', 'common']);
  } catch (error) {
    console.warn('Failed to preload critical translations:', error);
  }
};

// Start preloading critical translations
if (typeof window !== 'undefined') {
  preloadCriticalTranslations();
}

export default i18n;
