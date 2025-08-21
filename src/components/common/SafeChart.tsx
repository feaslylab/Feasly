import React from "react";

export function SafeChart({ ready, fallback = null, children }: {
  ready: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  if (!ready) {
    return fallback ?? <div className="text-sm text-muted-foreground">No data to display</div>;
  }
  
  try {
    return (
      <div className="chart-container">
        {children}
      </div>
    );
  } catch (error) {
    console.error('Chart rendering error:', error);
    return (
      <div className="flex items-center justify-center h-64 bg-muted/10 rounded-lg border border-dashed">
        <div className="text-center text-muted-foreground">
          <div className="text-sm">Chart unavailable</div>
          <div className="text-xs mt-1">Unable to render chart data</div>
        </div>
      </div>
    );
  }
}