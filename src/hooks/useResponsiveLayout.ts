import { useIsMobile, useIsTablet, useIsDesktop } from './use-mobile';
import { useSidebarState } from './useSidebarState';
import { useEffect } from 'react';

export function useResponsiveLayout() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();
  const { shouldShowSidebar, isCollapsed, isAutoHidden } = useSidebarState();

  // Simplified layout calculations with proper buffer zones
  const layoutSpacing = {
    headerHeight: isMobile ? 56 : 48,
    sidebarWidth: shouldShowSidebar ? (isCollapsed ? 56 : 256) : 0,
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
    
    // Enhanced sidebar space calculation - always account for sidebar when present
    let sidebarSpace = '0px';
    if (!isMobile) {
      if (shouldShowSidebar) {
        sidebarSpace = isCollapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)';
      } else if (isAutoHidden) {
        // Even when auto-hidden, reserve space for the mini sidebar
        sidebarSpace = 'var(--sidebar-collapsed)';
      }
    }
    
    root.style.setProperty('--sidebar-space', sidebarSpace);
    
    // Add transition class for smooth layout changes
    document.body.classList.add('layout-transition');
    const timeout = setTimeout(() => {
      document.body.classList.remove('layout-transition');
    }, 300);
    
    return () => clearTimeout(timeout);
  }, [shouldShowSidebar, isCollapsed, isMobile, layoutSpacing.headerHeight, layoutSpacing.mobileNavHeight]);

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
        // Left spacing with buffer for desktop - account for all sidebar states
        !isMobile && (shouldShowSidebar || isAutoHidden) ? 'ml-[var(--content-left-space)]' : '',
        // Smooth transitions
        'transition-all duration-300 ease-in-out',
        // Visual separation when sidebar is present
        !isMobile && (shouldShowSidebar || isAutoHidden) ? 'border-l border-border/30' : ''
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