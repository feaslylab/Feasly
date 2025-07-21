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
    // Default to collapsed on mobile
    return isMobile || getStoredState();
  });

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  // Auto-collapse on mobile
  useEffect(() => {
    if (isMobile && !isCollapsed) {
      setIsCollapsed(true);
    }
  }, [isMobile, isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(prev => !prev);
  };

  return {
    isCollapsed,
    setIsCollapsed,
    toggleSidebar,
    isMobile
  };
}