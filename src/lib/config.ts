import * as Sentry from "@sentry/react";
import { logger } from "./logger";

// Feature flags system
interface FeatureFlags {
  pwa: boolean;
  realTimeCollaboration: boolean;
  advancedAnalytics: boolean;
  aiInsights: boolean;
  mobileApp: boolean;
  businessIntelligence: boolean;
  complianceMonitoring: boolean;
  advancedExports: boolean;
}

// Default feature flags - can be overridden by remote config
const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  pwa: true,
  realTimeCollaboration: false, // Scaffold ready
  advancedAnalytics: true,
  aiInsights: false, // Scaffold ready  
  mobileApp: false, // Scaffold ready
  businessIntelligence: false, // Scaffold ready
  complianceMonitoring: true,
  advancedExports: true,
};

class FeatureFlagManager {
  private flags: FeatureFlags = DEFAULT_FEATURE_FLAGS;

  // Initialize feature flags from remote config or localStorage
  async initialize() {
    try {
      // Try to load from localStorage first
      const stored = localStorage.getItem('feasly_feature_flags');
      if (stored) {
        this.flags = { ...DEFAULT_FEATURE_FLAGS, ...JSON.parse(stored) };
      }

      // In production, you would fetch from a remote config service
      // await this.fetchRemoteFlags();
      
      logger.info('Feature flags initialized', this.flags, 'FeatureFlags');
    } catch (error) {
      logger.error('Failed to initialize feature flags', error, 'FeatureFlags');
      this.flags = DEFAULT_FEATURE_FLAGS;
    }
  }

  // Check if a feature is enabled
  isEnabled(feature: keyof FeatureFlags): boolean {
    return this.flags[feature];
  }

  // Get all flags
  getAllFlags(): FeatureFlags {
    return { ...this.flags };
  }

  // Update a flag (for admin/development use)
  updateFlag(feature: keyof FeatureFlags, enabled: boolean) {
    this.flags[feature] = enabled;
    localStorage.setItem('feasly_feature_flags', JSON.stringify(this.flags));
    logger.info('Feature flag updated', { feature, enabled }, 'FeatureFlags');
  }

  // Reset to defaults
  reset() {
    this.flags = DEFAULT_FEATURE_FLAGS;
    localStorage.removeItem('feasly_feature_flags');
    logger.info('Feature flags reset to defaults', {}, 'FeatureFlags');
  }
}

// Singleton instance
export const featureFlags = new FeatureFlagManager();

// React hook for using feature flags
export function useFeatureFlag(feature: keyof FeatureFlags): boolean {
  return featureFlags.isEnabled(feature);
}

// Initialize Sentry for error monitoring
export function initializeSentry() {
  if (import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN || "https://your-sentry-dsn@sentry.io/project-id",
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
      // Performance Monitoring
      tracesSampleRate: 1.0,
      // Session Replay
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      environment: import.meta.env.MODE,
      beforeSend(event) {
        // Filter out noise
        if (event.exception) {
          const error = event.exception.values?.[0];
          if (error?.type === 'ChunkLoadError' || error?.type === 'ResizeObserver loop limit exceeded') {
            return null;
          }
        }
        return event;
      },
    });

    logger.info('Sentry initialized for production', {}, 'Sentry');
  } else {
    logger.info('Sentry disabled in development mode', {}, 'Sentry');
  }
}

// Error boundary HOC with Sentry integration
export const withSentryErrorBoundary = Sentry.withErrorBoundary;

// Performance monitoring utilities
export const performance = {
  // Mark the start of a performance measurement
  mark: (name: string) => {
    if ('performance' in window && window.performance.mark) {
      window.performance.mark(`${name}-start`);
    }
  },

  // Measure performance between two marks
  measure: (name: string, startMark?: string) => {
    if ('performance' in window && window.performance.measure) {
      try {
        const measurement = window.performance.measure(
          name,
          startMark || `${name}-start`
        );
        
        // Log to Sentry in production
        if (import.meta.env.PROD) {
          Sentry.addBreadcrumb({
            category: 'performance',
            message: `${name}: ${measurement.duration.toFixed(2)}ms`,
            level: 'info',
          });
        }

        logger.debug('Performance measurement', {
          name,
          duration: measurement.duration,
        }, 'Performance');

        return measurement.duration;
      } catch (error) {
        logger.warn('Performance measurement failed', { name, error }, 'Performance');
      }
    }
    return 0;
  },

  // Track component render times
  trackRender: (componentName: string) => {
    const startTime = window.performance.now();
    return () => {
      const duration = window.performance.now() - startTime;
      logger.debug('Component render time', {
        component: componentName,
        duration: duration.toFixed(2)
      }, 'Performance');
    };
  }
};

// App configuration with feature flags
export const appConfig = {
  // API endpoints
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 30000,
  },

  // Supabase configuration
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },

  // Feature flags
  features: featureFlags,

  // Performance thresholds
  performance: {
    slowRenderThreshold: 16, // 16ms = 60fps
    slowApiThreshold: 2000, // 2 seconds
    largePayloadThreshold: 1024 * 1024, // 1MB
  },

  // PWA configuration
  pwa: {
    enabled: featureFlags.isEnabled('pwa'),
    updateCheckInterval: 60000, // 1 minute
    offlineMessage: "You're working offline. Changes will sync when you reconnect.",
  },

  // Mobile app configuration
  mobile: {
    enabled: featureFlags.isEnabled('mobileApp'),
    minimumTouchTarget: 44, // 44px minimum for accessibility
    breakpoints: {
      mobile: 768,
      tablet: 1024,
      desktop: 1280,
    },
  },

  // Analytics configuration
  analytics: {
    enabled: featureFlags.isEnabled('advancedAnalytics'),
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    trackPageViews: true,
    trackUserInteractions: true,
  },
};