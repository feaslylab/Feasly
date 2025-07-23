
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Hook to check if critical translations are loaded and ready
 * Prevents rendering components with missing translations
 */
export function useTranslationReady(namespace: string = 'marketing', criticalKeys: string[] = []) {
  const { i18n, ready } = useTranslation(namespace);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkTranslationsLoaded = () => {
      // Check if i18next is ready
      if (!ready || !i18n.isInitialized) {
        return false;
      }

      // Check if the namespace is loaded
      if (!i18n.hasResourceBundle(i18n.language, namespace)) {
        return false;
      }

      // Check critical keys if provided
      if (criticalKeys.length > 0) {
        const hasAllKeys = criticalKeys.every(key => {
          const translation = i18n.t(`${namespace}:${key}`, { lng: i18n.language });
          return translation !== key && translation !== `${namespace}:${key}`;
        });
        return hasAllKeys;
      }

      return true;
    };

    const updateReadyState = () => {
      setIsReady(checkTranslationsLoaded());
    };

    // Initial check
    updateReadyState();

    // Listen for language changes and resource loading
    i18n.on('languageChanged', updateReadyState);
    i18n.on('loaded', updateReadyState);
    i18n.on('failedLoading', updateReadyState);

    return () => {
      i18n.off('languageChanged', updateReadyState);
      i18n.off('loaded', updateReadyState);
      i18n.off('failedLoading', updateReadyState);
    };
  }, [i18n, ready, namespace, criticalKeys]);

  return isReady;
}
