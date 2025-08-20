import { useState, useEffect } from 'react';
import { useIsMobile } from './use-mobile';

export function useSidebarState() {
  // Get stored state from localStorage
  const getStoredState = () => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('sidebar-collapsed');
    return stored ? JSON.parse(stored) : false;
  };

  const isMobile = useIsMobile();
  
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Start expanded by default on desktop for better UX
    if (isMobile) return true;
    return false; // Always start expanded on desktop
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
    console.log('Toggle sidebar clicked, current state:', isCollapsed);
    setIsCollapsed(prev => {
      const newState = !prev;
      console.log('New sidebar state:', newState);
      return newState;
    });
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