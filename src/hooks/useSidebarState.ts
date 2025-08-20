import { useState, useEffect } from 'react';
import { useIsMobile } from './use-mobile';
import { useMouseProximity } from './useMouseProximity';

export function useSidebarState() {
  // Get stored state from localStorage
  const getStoredState = () => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('sidebar-collapsed');
    return stored ? JSON.parse(stored) : false;
  };

  const isMobile = useIsMobile();
  
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Default to expanded on desktop, collapsed on mobile
    return isMobile ? true : getStoredState();
  });

  // Simple visibility logic - always show the sidebar
  const shouldShowSidebar = true;

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  // Auto-collapse on mobile only
  useEffect(() => {
    if (isMobile && !isCollapsed) {
      setIsCollapsed(true);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setIsCollapsed(prev => !prev);
  };

  return {
    isCollapsed,
    shouldShowSidebar,
    toggleSidebar,
    isMobile,
    // Legacy props for compatibility
    isAutoHidden: false,
    isNearEdge: false,
    isHovered: false,
    setIsCollapsed,
    toggleAutoHide: () => {},
    handleMouseEnter: () => {},
    handleMouseLeave: () => {}
  };
}