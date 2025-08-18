import { Component, ReactNode } from 'react';

export class ErrorBoundary extends Component<
  { name?: string; children: ReactNode },
  { err?: Error }
> {
  state = { err: undefined as Error | undefined };
  
  static getDerivedStateFromError(err: Error) { 
    return { err }; 
  }
  
  componentDidCatch(err: Error, info: any) {
    // Enhanced logging for monitoring
    const context = {
      component: this.props.name ?? 'Component',
      route: window.location.pathname,
      search: window.location.search,
      timestamp: new Date().toISOString(),
    };
    
    console.error('[ErrorBoundary]', context, err, info);
    
    // Optional: send to Sentry/PostHog here
    // window.posthog?.capture('component_error', { ...context, error: err.message });
  }
  
  render() {
    if (this.state.err) {
      return (
        <div className="rounded-md border p-3 text-sm">
          <div className="font-medium">Something went wrong.</div>
          <div className="text-muted-foreground">{this.props.name ?? 'Component'} failed to render.</div>
        </div>
      );
    }
    return this.props.children;
  }
}