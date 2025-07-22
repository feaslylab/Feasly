import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorFallback } from '@/components/ui/error-fallback';
import { logger } from '@/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  title?: string;
  description?: string;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    
    // Log error with proper error tracking
    logger.error('ErrorBoundary caught an error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    }, 'ErrorBoundary');
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  public render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback || (
        <ErrorFallback
          error={this.state.error}
          resetError={this.handleRetry}
          errorInfo={this.state.errorInfo}
          title={this.props.title}
          description={this.props.description}
          showDetails={this.props.showDetails}
        />
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier use
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  return (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
};