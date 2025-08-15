
import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ChartErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Chart Error:', error, errorInfo);
    // Report to error monitoring if available
    if (typeof window !== 'undefined' && window.console) {
      console.warn('Chart component failed to render. This might be due to invalid data or theme context issues.');
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center h-64 bg-muted/10 rounded-lg border border-dashed">
          <div className="text-center text-muted-foreground">
            <div className="text-sm">Chart unavailable</div>
            <div className="text-xs mt-1">
              {this.state.error?.message || 'Unable to render chart data'}
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
