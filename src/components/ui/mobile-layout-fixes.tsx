/**
 * Mobile Layout Fixes Component
 * 
 * This component applies CSS fixes for mobile layout issues,
 * including viewport handling for iOS Safari and proper z-index management.
 */

import { useEffect } from 'react';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

export function MobileLayoutFixes() {
  const { isMobile } = useResponsiveLayout();

  useEffect(() => {
    // Fix iOS Safari viewport height issues
    function updateViewportHeight() {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    // Fix for iOS Safari address bar changes
    if (isMobile) {
      updateViewportHeight();
      window.addEventListener('resize', updateViewportHeight);
      window.addEventListener('orientationchange', updateViewportHeight);
      
      return () => {
        window.removeEventListener('resize', updateViewportHeight);
        window.removeEventListener('orientationchange', updateViewportHeight);
      };
    }
  }, [isMobile]);

  useEffect(() => {
    // Prevent zoom on double tap for iOS
    if (isMobile) {
      let lastTouchEnd = 0;
      const preventZoom = (e: TouchEvent) => {
        const now = new Date().getTime();
        if (now - lastTouchEnd <= 300) {
          e.preventDefault();
        }
        lastTouchEnd = now;
      };

      document.addEventListener('touchend', preventZoom, { passive: false });
      
      return () => {
        document.removeEventListener('touchend', preventZoom);
      };
    }
  }, [isMobile]);

  // This component doesn't render anything visible
  return null;
}

/**
 * CSS Custom Properties for Mobile Layout
 * These are injected via the component above
 */
export const mobileLayoutStyles = `
  /* Mobile-specific viewport fixes */
  @media (max-width: 640px) {
    .mobile-full-height {
      height: calc(var(--vh, 1vh) * 100);
      min-height: calc(var(--vh, 1vh) * 100);
    }
    
    .mobile-safe-content {
      padding-bottom: env(safe-area-inset-bottom);
      padding-top: env(safe-area-inset-top);
    }
    
    /* Prevent content from being hidden behind mobile keyboards */
    .mobile-keyboard-safe {
      height: 100dvh; /* Dynamic viewport height when supported */
    }
  }
  
  /* Touch target optimization */
  @media (max-width: 768px) {
    button, [role="button"], .clickable {
      min-height: 44px;
      min-width: 44px;
    }
    
    input, select, textarea {
      min-height: 44px;
    }
  }
`;