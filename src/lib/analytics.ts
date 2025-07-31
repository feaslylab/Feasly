/**
 * Analytics and Error Monitoring Setup
 * Conditional loading based on VITE_ENABLE_ANALYTICS flag
 */

import * as Sentry from '@sentry/react';
import posthog from 'posthog-js';

const ENABLE_ANALYTICS = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

/**
 * Initialize Sentry for error monitoring
 */
export function initSentry() {
  if (!ENABLE_ANALYTICS || !SENTRY_DSN) {
    console.info('📊 Sentry disabled (VITE_ENABLE_ANALYTICS=false or no DSN)');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    replaysSessionSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0,
    beforeSend: (event) => {
      // Filter out non-actionable errors
      if (event.exception?.values?.[0]?.value?.includes('Non-Error promise rejection')) {
        return null;
      }
      return event;
    },
  });

  console.info('📊 Sentry initialized');
}

/**
 * Initialize PostHog for product analytics
 */
export function initPostHog() {
  if (!ENABLE_ANALYTICS || !POSTHOG_KEY) {
    console.info('📊 PostHog disabled (VITE_ENABLE_ANALYTICS=false or no key)');
    return;
  }

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    autocapture: false, // Manual tracking only
    capture_pageview: false, // Manual page views
    disable_session_recording: import.meta.env.PROD ? false : true,
    loaded: (posthog) => {
      if (!import.meta.env.PROD) {
        posthog.debug();
      }
    },
  });

  console.info('📊 PostHog initialized');
}

/**
 * Analytics utilities
 */
export const analytics = {
  /**
   * Track page view
   */
  pageView: (path: string, title?: string) => {
    if (!ENABLE_ANALYTICS) return;
    
    try {
      posthog.capture('$pageview', {
        $current_url: window.location.href,
        $pathname: path,
        $title: title || document.title,
      });
    } catch (error) {
      console.warn('Analytics pageView error:', error);
    }
  },

  /**
   * Track custom event
   */
  track: (event: string, properties?: Record<string, any>) => {
    if (!ENABLE_ANALYTICS) return;
    
    try {
      posthog.capture(event, {
        ...properties,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.warn('Analytics track error:', error);
    }
  },

  /**
   * Identify user (for authenticated analytics)
   */
  identify: (userId: string, traits?: Record<string, any>) => {
    if (!ENABLE_ANALYTICS) return;
    
    try {
      posthog.identify(userId, traits);
    } catch (error) {
      console.warn('Analytics identify error:', error);
    }
  },

  /**
   * Log error to Sentry
   */
  captureError: (error: Error, context?: Record<string, any>) => {
    if (!ENABLE_ANALYTICS) {
      console.error('Error (analytics disabled):', error, context);
      return;
    }
    
    try {
      Sentry.withScope((scope) => {
        if (context) {
          Object.entries(context).forEach(([key, value]) => {
            scope.setTag(key, String(value));
          });
        }
        Sentry.captureException(error);
      });
    } catch (sentryError) {
      console.error('Sentry error:', sentryError);
      console.error('Original error:', error);
    }
  },
};

/**
 * React Router integration for automatic page tracking
 */
export function usePageTracking() {
  if (!ENABLE_ANALYTICS) return;
  
  // This will be called from the router
  return (location: { pathname: string }) => {
    analytics.pageView(location.pathname);
  };
}