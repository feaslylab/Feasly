import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getNamespacesForRoute } from '@/lib/i18n';

export const useNamespaceLoader = () => {
  const location = useLocation();
  const { i18n } = useTranslation();

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
    loadNamespacesForRoute(location.pathname);
  }, [location.pathname, loadNamespacesForRoute]);

  return { loadNamespacesForRoute };
};