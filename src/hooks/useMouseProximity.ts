import { useState, useEffect, useCallback } from 'react';

export function useMouseProximity(threshold: number = 50) {
  const [isNearEdge, setIsNearEdge] = useState(false);
  const [mouseX, setMouseX] = useState(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const x = e.clientX;
    setMouseX(x);
    
    // Check if mouse is near left edge
    const nearLeftEdge = x <= threshold;
    setIsNearEdge(nearLeftEdge);
  }, [threshold]);

  const handleMouseLeave = useCallback(() => {
    setIsNearEdge(false);
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  return {
    isNearEdge,
    mouseX
  };
}