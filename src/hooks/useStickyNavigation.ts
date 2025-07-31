import { useState, useEffect, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface StickyNavigationOptions {
  enabled?: boolean;
  breakpoint?: number; // Pixel width for enabling sticky behavior
  topOffset?: number; // Offset from top of viewport
  maxHeight?: string; // Max height for sticky container
}

export function useStickyNavigation(options: StickyNavigationOptions = {}) {
  const {
    enabled = true,
    breakpoint = 1024,
    topOffset = 64, // Account for header height
    maxHeight = 'calc(100vh - 4rem)'
  } = options;

  const isMobile = useIsMobile();
  const [isSticky, setIsSticky] = useState(false);
  const [shouldUsePortal, setShouldUsePortal] = useState(false);

  // Check if we should enable sticky behavior
  const shouldBeSticky = enabled && !isMobile && window.innerWidth >= breakpoint;

  // Monitor scroll position for sticky behavior
  useEffect(() => {
    if (!shouldBeSticky) {
      setIsSticky(false);
      return;
    }

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsSticky(scrollTop > topOffset);
    };

    // Initial check
    handleScroll();

    // Throttled scroll listener for performance
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [shouldBeSticky, topOffset]);

  // Monitor viewport resize
  useEffect(() => {
    const handleResize = () => {
      const newShouldBeSticky = enabled && !isMobile && window.innerWidth >= breakpoint;
      
      // If switching between mobile/desktop, reset sticky state
      if (newShouldBeSticky !== shouldBeSticky) {
        setIsSticky(newShouldBeSticky);
      }
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [enabled, isMobile, breakpoint, shouldBeSticky]);

  // Check if parent container might cause sticky issues
  const checkStickyParent = useCallback((element: HTMLElement | null) => {
    if (!element || !shouldBeSticky) return false;

    let parent = element.parentElement;
    while (parent && parent !== document.body) {
      const computed = window.getComputedStyle(parent);
      
      // Check if parent has overflow that could break sticky
      if (computed.overflow === 'hidden' || 
          computed.overflow === 'scroll' || 
          computed.overflowY === 'scroll') {
        setShouldUsePortal(true);
        return true;
      }
      
      parent = parent.parentElement;
    }
    
    setShouldUsePortal(false);
    return false;
  }, [shouldBeSticky]);

  // Get sticky container styles
  const getStickyContainerStyles = useCallback(() => {
    // Use fixed positioning for reliable sticky behavior
    const baseStyles = {
      position: 'fixed' as const,
      top: `${topOffset}px`,
      left: '0',
      height: maxHeight,
      overflowY: 'auto' as const,
      overflowX: 'hidden' as const,
      width: '256px', // 16rem = 256px
    };

    // Add enhanced styles when in sticky state
    if (isSticky) {
      return {
        ...baseStyles,
        backgroundColor: 'hsl(var(--background) / 0.95)',
        backdropFilter: 'blur(8px)',
        borderRight: '1px solid hsl(var(--border))',
        zIndex: 30,
      };
    }

    // Base fixed positioning styles
    return {
      ...baseStyles,
      backgroundColor: 'hsl(var(--background) / 0.98)',
      backdropFilter: 'blur(4px)',
      zIndex: 20,
    };
  }, [isSticky, topOffset, maxHeight]);

  // Get portal container styles for problematic layouts
  const getPortalStyles = useCallback(() => {
    if (!shouldUsePortal || !shouldBeSticky) {
      return {};
    }

    return {
      position: 'fixed' as const,
      top: `${topOffset}px`,
      left: '0',
      width: '256px', // Standard sidebar width
      height: maxHeight,
      backgroundColor: 'hsl(var(--background) / 0.95)',
      backdropFilter: 'blur(8px)',
      borderRight: '1px solid hsl(var(--border))',
      zIndex: 40,
      overflowY: 'auto' as const,
      overflowX: 'hidden' as const,
    };
  }, [shouldUsePortal, shouldBeSticky, topOffset, maxHeight]);

  return {
    isSticky,
    shouldBeSticky,
    shouldUsePortal,
    checkStickyParent,
    getStickyContainerStyles,
    getPortalStyles,
    topOffset,
    maxHeight
  };
}