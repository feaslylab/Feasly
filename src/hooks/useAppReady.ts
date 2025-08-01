import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '@/lib/i18n';

/**
 * Hook to check if all critical app resources are loaded and ready
 * Includes fonts, i18n, and other assets needed for smooth initial render
 */
export function useAppReady() {
  const { ready } = useTranslation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkAllResourcesReady = async () => {
      try {
        // Wait for all critical resources
        await Promise.all([
          // Fonts ready
          document.fonts.ready,
          
          // i18n initialized and marketing namespace loaded
          new Promise<void>((resolve) => {
            if (ready && i18n.isInitialized && i18n.hasResourceBundle(i18n.language, 'marketing')) {
              resolve();
            } else {
              const checkReady = () => {
                if (ready && i18n.isInitialized && i18n.hasResourceBundle(i18n.language, 'marketing')) {
                  i18n.off('loaded', checkReady);
                  i18n.off('languageChanged', checkReady);
                  resolve();
                }
              };
              i18n.on('loaded', checkReady);
              i18n.on('languageChanged', checkReady);
            }
          }),
          
          // Minimum loading time for smooth experience (avoid flash)
          new Promise(resolve => setTimeout(resolve, 1500)),
        ]);

        setIsReady(true);
      } catch (error) {
        console.warn('Error loading app resources:', error);
        // Fallback - show app after timeout even if some resources failed
        setTimeout(() => setIsReady(true), 3000);
      }
    };

    checkAllResourcesReady();
  }, [ready]);

  return isReady;
}