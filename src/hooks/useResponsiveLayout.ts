import { useIsMobile, useIsTablet, useIsDesktop } from './use-mobile';
import { useSidebarState } from './useSidebarState';
import { useEffect } from 'react';

export function useResponsiveLayout() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();
  const { shouldShowSidebar, isCollapsed } = useSidebarState();

  // Calculate dynamic spacing based on layout state
  const layoutSpacing = {
    headerHeight: isMobile ? 56 : 48, // Mobile gets slightly larger touch targets
    sidebarWidth: shouldShowSidebar ? (isCollapsed ? 56 : 256) : 0,
    contentPadding: isMobile ? 16 : 24,
    mobileNavHeight: isMobile ? 56 : 0,
  };

  // Update CSS custom properties for dynamic layout
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--header-height', `${layoutSpacing.headerHeight}px`);
    root.style.setProperty('--content-left', `${layoutSpacing.sidebarWidth}px`);
    root.style.setProperty('--mobile-nav-height', `${layoutSpacing.mobileNavHeight}px`);
    
    // Set sidebar width class for spacing calculations
    if (shouldShowSidebar && !isCollapsed) {
      root.style.setProperty('--sidebar-space', 'var(--sidebar-width)');
    } else if (shouldShowSidebar && isCollapsed) {
      root.style.setProperty('--sidebar-space', 'var(--sidebar-collapsed)');
    } else {
      root.style.setProperty('--sidebar-space', '0px');
    }
  }, [layoutSpacing.headerHeight, layoutSpacing.sidebarWidth, layoutSpacing.mobileNavHeight, shouldShowSidebar, isCollapsed]);

  return {
    isMobile,
    isTablet,
    isDesktop,
    isTouch: isMobile || isTablet,
    breakpoint: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
    layoutSpacing,
    // Helper classes for consistent spacing
    contentClasses: {
      main: [
        'flex-1 overflow-auto',
        isMobile ? 'pt-[var(--header-height)] pb-[var(--mobile-nav-height)]' : 'pt-[var(--header-height)]',
        'transition-all duration-300 ease-in-out'
      ].join(' '),
      container: [
        'w-full mx-auto',
        isMobile ? 'px-4 py-4' : 'px-6 py-6',
        'max-w-7xl'
      ].join(' '),
      sidebar: [
        'transition-all duration-300 ease-in-out',
        shouldShowSidebar ? 'ml-[var(--sidebar-space)]' : 'ml-0'
      ].join(' ')
    }
  };
}