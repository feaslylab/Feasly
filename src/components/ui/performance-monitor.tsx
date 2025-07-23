import { useEffect } from 'react';

export function PerformanceMonitor() {
  useEffect(() => {
    // Reduce animations on low-performance devices
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const isLowPerformance = navigator.hardwareConcurrency < 4 || 
                            ('memory' in navigator && (navigator as any).memory?.jsHeapSizeLimit < 1000000000);
    
    if (mediaQuery.matches || isLowPerformance) {
      document.documentElement.style.setProperty('--animation-duration', '0.1s');
      document.documentElement.classList.add('reduce-animations');
    }

    // Monitor frame rate
    let frameCount = 0;
    let lastTime = performance.now();
    
    function measureFPS() {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        if (fps < 30) {
          // Disable heavy animations on low FPS
          document.documentElement.classList.add('low-fps-mode');
        }
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    }
    
    requestAnimationFrame(measureFPS);
  }, []);

  return null;
}