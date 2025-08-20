import { useIsMobile, useIsTablet, useIsDesktop } from './use-mobile';
import { useSidebarState } from './useSidebarState';
import { useEffect } from 'react';

export function useResponsiveLayout() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();
  const { isCollapsed } = useSidebarState();

  // Simplified layout calculations with proper buffer zones
  const layoutSpacing = {
    headerHeight: isMobile ? 56 : 48,
    sidebarWidth: isCollapsed ? 56 : 256,
    contentPadding: isMobile ? 16 : 24,
    mobileNavHeight: isMobile ? 56 : 0,
    sidebarBuffer: 24, // Consistent breathing room
  };

  // Single source of truth for sidebar spacing with smooth transitions
  useEffect(() => {
    const root = document.documentElement;
    
    // Update core layout variables
    root.style.setProperty('--header-height', `${layoutSpacing.headerHeight}px`);
    root.style.setProperty('--mobile-nav-height', `${layoutSpacing.mobileNavHeight}px`);
    
    // Enhanced sidebar space calculation with concrete values
    let sidebarSpace = '0px';
    if (!isMobile) {
      sidebarSpace = isCollapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-expanded)';
    }
    
    root.style.setProperty('--sidebar-space', sidebarSpace);
    
    // Add transition class for smooth layout changes
    document.body.classList.add('layout-transition');
    const timeout = setTimeout(() => {
      document.body.classList.remove('layout-transition');
    }, 300);
    
    return () => clearTimeout(timeout);
  }, [isCollapsed, isMobile, layoutSpacing.headerHeight, layoutSpacing.mobileNavHeight]);

  return {
    isMobile,
    isTablet,
    isDesktop,
    isTouch: isMobile || isTablet,
    breakpoint: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
    layoutSpacing,
    // Enhanced helper classes with proper spacing and visual separation
    contentClasses: {
      main: [
        'flex-1 overflow-auto relative',
        // Top spacing for header
        isMobile ? 'pt-[var(--header-height)] pb-[var(--mobile-nav-height)]' : 'pt-[var(--header-height)]',
        // Left spacing with buffer for desktop
        !isMobile ? 'ml-[var(--content-left-space)]' : '',
        // Smooth transitions
        'transition-all duration-300 ease-in-out',
        // Visual separation when sidebar is present
        !isMobile ? 'border-l border-border/30' : ''
      ].filter(Boolean).join(' '),
      container: [
        'w-full mx-auto relative',
        isMobile ? 'px-4 py-4' : 'px-6 py-6',
        'max-w-7xl',
        // Additional breathing room on desktop
        !isMobile ? 'min-h-[calc(100vh-var(--content-safe-area))]' : ''
      ].filter(Boolean).join(' '),
      sidebar: [
        'fixed left-0 top-[var(--header-height)] h-[calc(100vh-var(--header-height))]',
        'transition-all duration-300 ease-in-out',
        'z-[var(--z-sidebar)]',
        // Enhanced shadow for visual separation
        'shadow-elegant border-r border-border/50',
        // Backdrop blur for premium feel
        'backdrop-blur-sm bg-sidebar/95'
      ].join(' ')
    }
  };
}