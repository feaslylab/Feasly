import { useIsMobile, useIsTablet, useIsDesktop } from './use-mobile';

export function useResponsiveLayout() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();

  // Simplified layout calculations
  const layoutSpacing = {
    headerHeight: isMobile ? 56 : 48,
    contentPadding: isMobile ? 16 : 24,
    mobileNavHeight: isMobile ? 56 : 0,
  };

  return {
    isMobile,
    isTablet,
    isDesktop,
    isTouch: isMobile || isTablet,
    breakpoint: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
    layoutSpacing
  };
}