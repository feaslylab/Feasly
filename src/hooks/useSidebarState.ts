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
    // Default to collapsed on mobile, preserve state on desktop
    return isMobile || getStoredState();
  });
  
  const [isAutoHidden, setIsAutoHidden] = useState(!isMobile);
  const [isHovered, setIsHovered] = useState(false);

  // Enhanced sidebar visibility logic with better user experience
  const shouldShowSidebar = !isCollapsed && (
    isNearEdge ||       // Mouse near left edge
    isHovered ||        // Hovering over sidebar
    !isAutoHidden ||    // Auto-hide disabled
    isMobile            // Always show on mobile when not collapsed
  );

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  // Auto-collapse on mobile, auto-hide on desktop
  useEffect(() => {
    if (isMobile) {
      setIsAutoHidden(false);
      if (!isCollapsed) {
        setIsCollapsed(true);
      }
    } else {
      setIsAutoHidden(true);
    }
  }, [isMobile, isCollapsed]);

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