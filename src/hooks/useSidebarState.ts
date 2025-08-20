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
    const defaultState = stored !== null ? stored : true;
    console.log('🔧 Sidebar State Init:', { stored, defaultState });
    return defaultState;
  });

  // Persist state to localStorage
  useEffect(() => {
    console.log('💾 Persisting to localStorage:', isCollapsed);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const clearStorageAndReset = () => {
    console.log('🧹 Clearing localStorage and resetting');
    localStorage.removeItem('sidebar-collapsed');
    setIsCollapsed(true); // Reset to default
  };

  const toggleSidebar = () => {
    console.log('🔧 Sidebar Toggle Called - Current State:', isCollapsed);
    setIsCollapsed(prev => {
      const newState = !prev;
      console.log('🔧 Sidebar Toggle - New State:', newState);
      return newState;
    });
  };

  return {
    isCollapsed,
    toggleSidebar,
    clearStorageAndReset,
    isMobile
  };
}