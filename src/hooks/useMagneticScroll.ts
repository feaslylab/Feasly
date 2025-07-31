import { useState, useEffect, useRef, useCallback } from 'react';

interface UseMagneticScrollOptions {
  threshold?: number; // Distance from edges to trigger magnetic effect
  hideDelay?: number; // Delay before hiding on scroll down
  showDelay?: number; // Delay before showing on scroll up
  magneticZone?: number; // Distance for magnetic attraction
}

export function useMagneticScroll({
  threshold = 100,
  hideDelay = 150,
  showDelay = 50,
  magneticZone = 200
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

    // Visibility logic with delays
    if (deltaY > 10 && currentScrollY > threshold) {
      // Scrolling down - hide with delay
      clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, hideDelay);
    } else if (deltaY < -10 || currentScrollY <= threshold) {
      // Scrolling up or near top - show with delay
      clearTimeout(hideTimeoutRef.current);
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      
      showTimeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, showDelay);
    }

    lastScrollY.current = currentScrollY;
  }, [threshold, hideDelay, showDelay, magneticZone]);

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