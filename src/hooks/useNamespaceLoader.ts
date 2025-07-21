import { useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getNamespacesForRoute } from '@/lib/i18n';

// Hook that safely gets the current pathname without requiring router context
const usePathname = () => {
  // For now, just use window.location.pathname as fallback
  // This will work whether we're inside or outside router context
  return window.location.pathname;
};

export const useNamespaceLoader = () => {
  const { i18n } = useTranslation();
  const pathname = usePathname();

  const loadNamespacesForRoute = useCallback(async (pathname: string) => {
    const requiredNamespaces = getNamespacesForRoute(pathname);
    const currentLanguage = i18n.language;
    
    // Load only missing namespaces
    const missingNamespaces = requiredNamespaces.filter(ns => 
      !i18n.hasResourceBundle(currentLanguage, ns)
    );

    if (missingNamespaces.length > 0) {
      try {
        await Promise.all(
          missingNamespaces.map(ns => i18n.loadNamespaces(ns))
        );
      } catch (error) {
        console.warn('Failed to load namespaces:', missingNamespaces, error);
      }
    }
  }, [i18n]);

  // Load namespaces when route changes
  useEffect(() => {
    loadNamespacesForRoute(pathname);
  }, [pathname, loadNamespacesForRoute]);

  return { loadNamespacesForRoute };
};