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
    // optional: send to Sentry/PostHog here
    console.error('[ErrorBoundary]', this.props.name ?? 'Component', err, info);
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