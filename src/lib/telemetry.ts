// Minimal client telemetry utility
// Falls back to console logging if no vendor integration is configured

interface TelemetryEvent {
  page_view: {
    path: string;
    mode: 'app' | 'demo' | 'share';
    locale: string;
  };
  locale_changed: {
    from: string;
    to: string;
  };
  share_view_opened: {
    token: string;
  };
  demo_opened: boolean;
}

type EventName = keyof TelemetryEvent;
type EventData<T extends EventName> = TelemetryEvent[T];

class TelemetryService {
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = !import.meta.env.DEV;
  }

  track<T extends EventName>(eventName: T, data: EventData<T>) {
    if (!this.isEnabled) {
      console.log('[Telemetry]', eventName, data);
      return;
    }

    try {
      // TODO: Integrate with actual analytics service (PostHog, etc.)
      // For now, use console logging
      console.log('[Telemetry]', eventName, data);

      // Example PostHog integration:
      // if (window.posthog) {
      //   window.posthog.capture(eventName, data);
      // }
    } catch (error) {
      console.warn('Telemetry error:', error);
    }
  }

  pageView(path: string, mode: 'app' | 'demo' | 'share' = 'app', locale: string = 'en') {
    this.track('page_view', { path, mode, locale });
  }

  localeChanged(from: string, to: string) {
    this.track('locale_changed', { from, to });
  }

  shareViewOpened(token: string) {
    this.track('share_view_opened', { token });
  }

  demoOpened() {
    this.track('demo_opened', true);
  }
}

export const telemetry = new TelemetryService();