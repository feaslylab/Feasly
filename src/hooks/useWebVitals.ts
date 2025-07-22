import { useCallback } from 'react';

// Web Vitals monitoring hook
export function useWebVitals() {
  const reportMetric = useCallback((metric: any) => {
    // In development, log to console
    if (import.meta.env.DEV) {
      console.log(`${metric.name}: ${metric.value.toFixed(2)}${metric.unit || ''}`);
    }
    
    // In production, send to analytics service
    if (import.meta.env.PROD && (window as any).gtag) {
      (window as any).gtag('event', metric.name, {
        custom_parameter_1: metric.value,
        custom_parameter_2: metric.rating,
        custom_parameter_3: metric.delta,
      });
    }

    // Also send to Sentry for performance monitoring
    if (import.meta.env.PROD && (window as any).__SENTRY__) {
      import('@sentry/react').then(({ addBreadcrumb }) => {
        addBreadcrumb({
          category: 'web-vitals',
          message: `${metric.name}: ${metric.value.toFixed(2)}`,
          level: 'info',
          data: metric,
        });
      });
    }
  }, []);

  // Initialize web vitals monitoring
  const initWebVitals = useCallback(async () => {
    try {
      // Dynamic import to reduce bundle size
      const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals');
      
      getCLS(reportMetric);
      getFID(reportMetric);
      getFCP(reportMetric);
      getLCP(reportMetric);
      getTTFB(reportMetric);
    } catch (error) {
      console.warn('Web Vitals not available:', error);
    }
  }, [reportMetric]);

  return { initWebVitals, reportMetric };
}

// Performance observer for custom metrics
export function usePerformanceObserver() {
  const observeCustomMetrics = useCallback(() => {
    if ('PerformanceObserver' in window) {
      // Observe long tasks (> 50ms)
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.warn('Long task detected:', {
            duration: entry.duration,
            startTime: entry.startTime,
          });
        }
      });

      // Observe paint timing
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log('Paint timing:', {
            name: entry.name,
            startTime: entry.startTime,
          });
        }
      });

      // Observe navigation timing
      const navigationObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const navEntry = entry as PerformanceNavigationTiming;
          console.log('Navigation timing:', {
            domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
            loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
          });
        }
      });

      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        paintObserver.observe({ entryTypes: ['paint'] });
        navigationObserver.observe({ entryTypes: ['navigation'] });
      } catch (error) {
        console.warn('Performance observers not fully supported:', error);
      }

      // Cleanup function
      return () => {
        longTaskObserver.disconnect();
        paintObserver.disconnect();
        navigationObserver.disconnect();
      };
    }
  }, []);

  return { observeCustomMetrics };
}