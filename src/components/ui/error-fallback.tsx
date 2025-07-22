import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { logger } from "@/lib/logger";

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  errorInfo?: React.ErrorInfo;
  componentStack?: string;
  title?: string;
  description?: string;
  showDetails?: boolean;
}

export function ErrorFallback({ 
  error, 
  resetError, 
  errorInfo,
  title = "Something went wrong",
  description = "An unexpected error occurred. You can try refreshing the page or go back to the dashboard.",
  showDetails = false
}: ErrorFallbackProps) {
  const navigate = useNavigate();

  // Log error details
  logger.error("Component Error Boundary Triggered", {
    error: error.message,
    stack: error.stack,
    componentStack: errorInfo?.componentStack
  }, "ErrorFallback");

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
          <CardDescription className="text-center">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {showDetails && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="font-mono text-xs break-all">
                {error.message}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button onClick={resetError} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            <Button onClick={() => navigate('/dashboard')} className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Button>
          </div>
          
          {import.meta.env.DEV && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                Debug Information (Development Only)
              </summary>
              <div className="mt-2 space-y-2">
                <div className="rounded bg-muted p-3">
                  <h4 className="font-medium text-sm mb-2">Error Stack:</h4>
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap overflow-auto max-h-32">
                    {error.stack}
                  </pre>
                </div>
                {errorInfo?.componentStack && (
                  <div className="rounded bg-muted p-3">
                    <h4 className="font-medium text-sm mb-2">Component Stack:</h4>
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap overflow-auto max-h-32">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Specific error fallbacks for different scenarios
export function NetworkErrorFallback({ resetError }: { resetError: () => void }) {
  return (
    <ErrorFallback
      error={new Error("Network connection failed")}
      resetError={resetError}
      title="Connection Problem"
      description="Unable to connect to the server. Please check your internet connection and try again."
    />
  );
}

export function DataErrorFallback({ resetError }: { resetError: () => void }) {
  return (
    <ErrorFallback
      error={new Error("Data loading failed")}
      resetError={resetError}
      title="Data Loading Error"
      description="We couldn't load the data for this section. This might be a temporary issue."
    />
  );
}

export function ChartErrorFallback({ resetError }: { resetError: () => void }) {
  return (
    <ErrorFallback
      error={new Error("Chart rendering failed")}
      resetError={resetError}
      title="Chart Display Error"
      description="Unable to display the chart. The data might be corrupted or incomplete."
    />
  );
}