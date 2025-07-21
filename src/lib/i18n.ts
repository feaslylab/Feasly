import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

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

// Route-based namespace mapping
export const routeNamespaces: Record<string, string[]> = {
  '/auth': [namespaces.AUTH],
  '/login': [namespaces.AUTH],
  '/signup': [namespaces.AUTH],
  '/register': [namespaces.AUTH],
  '/feasly-model': [namespaces.MODEL],
  '/feasly-flow': [namespaces.FLOW],
  '/feasly-finance': [namespaces.FINANCE],
  '/feasly-consolidate': [namespaces.CONSOLIDATE],
  '/feasly-insights': [namespaces.INSIGHTS],
};

// Get required namespaces for a route
export const getNamespacesForRoute = (pathname: string): string[] => {
  // Check if user is authenticated - if not, only load auth namespace
  const isPublicRoute = pathname.startsWith('/auth') || 
                        pathname === '/login' || 
                        pathname === '/signup' || 
                        pathname === '/register' ||
                        pathname === '/';

  if (isPublicRoute) {
    return [namespaces.COMMON, namespaces.AUTH];
  }

  // For authenticated routes, find matching namespace
  const matchedRoute = Object.keys(routeNamespaces).find(route => 
    pathname.startsWith(route)
  );

  if (matchedRoute) {
    return routeNamespaces[matchedRoute];
  }

  // Default: load common + all Feasly namespaces for authenticated users
  return [
    namespaces.COMMON,
    namespaces.MODEL,
    namespaces.FLOW, 
    namespaces.FINANCE,
    namespaces.CONSOLIDATE,
    namespaces.INSIGHTS
  ];
};

// Initialize i18next with lazy loading
i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    debug: false,
    
    // Load common and auth namespaces initially
    ns: [namespaces.COMMON, namespaces.AUTH],
    defaultNS: namespaces.COMMON,
    
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
    load: 'languageOnly', // Don't load region-specific translations
    preload: [], // Don't preload any languages
    
    // Cache translations
    cache: {
      enabled: true,
    },
  });

export default i18n;