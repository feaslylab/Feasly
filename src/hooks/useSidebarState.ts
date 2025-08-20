import { useState, useEffect } from 'react';
import { useIsMobile } from './use-mobile';

export function useSidebarState() {
  const isMobile = useIsMobile();
  
  // Get stored state from localStorage with proper null checking
  const getStoredState = (): boolean | null => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('sidebar-collapsed');
    if (stored === null) return null;
    return JSON.parse(stored);
  };
  
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const stored = getStoredState();
    // Default to collapsed if no stored preference
    return stored !== null ? stored : true;
  });

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(prev => !prev);
  };

  return {
    isCollapsed,
    toggleSidebar,
    isMobile
  };
}