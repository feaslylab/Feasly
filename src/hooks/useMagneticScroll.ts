import { useState, useEffect, useRef, useCallback } from 'react';
import { MAG_OFFSET } from '@/constants/ui';

interface UseMagneticScrollOptions {
  threshold?: number; // Distance from edges to trigger magnetic effect
  hideDelay?: number; // Delay before hiding on scroll down
  showDelay?: number; // Delay before showing on scroll up
  magneticZone?: number; // Distance for magnetic attraction
  aggressiveHide?: boolean; // Whether to use aggressive auto-hide behavior
}

export function useMagneticScroll({
  threshold = 100,
  hideDelay = 800, // Much longer delay before hiding
  showDelay = 50,
  magneticZone = MAG_OFFSET,
  aggressiveHide = false // Default to false for better UX
}: UseMagneticScrollOptions = {}) {
  const [isVisible, setIsVisible] = useState(true);
  const [isSticky, setIsSticky] = useState(false);
  const [magneticOffset, setMagneticOffset] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  
  const lastScrollY = useRef(0);
  const hideTimeoutRef = useRef<NodeJS.Timeout>();
  const showTimeoutRef = useRef<NodeJS.Timeout>();
  const rafRef = useRef<number>();

  const updateScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    const deltaY = currentScrollY - lastScrollY.current;
    
    // Determine scroll direction
    if (deltaY > 0) {
      setScrollDirection('down');
    } else if (deltaY < 0) {
      setScrollDirection('up');
    }

    // Sticky behavior - becomes sticky after scrolling past threshold
    setIsSticky(currentScrollY > threshold);

    // Magnetic effect calculation
    const distanceFromTop = Math.min(currentScrollY, magneticZone);
    const magneticPull = Math.pow(distanceFromTop / magneticZone, 2) * 20;
    setMagneticOffset(magneticPull);

    // More conservative visibility logic - only hide during very fast scrolls
    const fastScrollThreshold = aggressiveHide ? 10 : 25; // Higher threshold = less hiding
    const shouldHide = aggressiveHide || (deltaY > fastScrollThreshold && currentScrollY > threshold * 2);
    
    if (shouldHide) {
      // Scrolling down fast - hide with longer delay
      clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, hideDelay);
    } else if (deltaY < -5 || currentScrollY <= threshold) {
      // Any upward scroll or near top - show immediately
      clearTimeout(hideTimeoutRef.current);
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      
      showTimeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, showDelay);
    }

    lastScrollY.current = currentScrollY;
  }, [threshold, hideDelay, showDelay, magneticZone, aggressiveHide]);

  const handleScroll = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    rafRef.current = requestAnimationFrame(updateScroll);
  }, [updateScroll]);

  useEffect(() => {
    // Initial check
    updateScroll();
    
    // Add scroll listener with passive for performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleScroll, updateScroll]);

  // Force show/hide methods for external control
  const forceShow = useCallback(() => {
    clearTimeout(hideTimeoutRef.current);
    clearTimeout(showTimeoutRef.current);
    setIsVisible(true);
  }, []);

  const forceHide = useCallback(() => {
    clearTimeout(hideTimeoutRef.current);
    clearTimeout(showTimeoutRef.current);
    setIsVisible(false);
  }, []);

  return {
    isVisible,
    isSticky,
    magneticOffset,
    scrollDirection,
    forceShow,
    forceHide,
    scrollY: lastScrollY.current
  };
}