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
  const { isNearEdge } = useMouseProximity(80); // Larger proximity zone for better UX
  
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Default to expanded on desktop, collapsed on mobile
    return isMobile ? true : getStoredState();
  });
  
  const [isAutoHidden, setIsAutoHidden] = useState(false); // Disable auto-hide by default 
  const [isHovered, setIsHovered] = useState(false);

  // Enhanced sidebar visibility logic - simpler approach
  const shouldShowSidebar = !isAutoHidden || isNearEdge || isHovered || isMobile;

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

  const toggleAutoHide = () => {
    setIsAutoHidden(prev => !prev);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return {
    isCollapsed,
    isAutoHidden,
    shouldShowSidebar,
    isNearEdge,
    isHovered,
    setIsCollapsed,
    toggleSidebar,
    toggleAutoHide,
    handleMouseEnter,
    handleMouseLeave,
    isMobile
  };
}