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
    return <>{children}</>;
  } catch {
    return <div className="text-sm text-red-500">Chart failed to render.</div>;
  }
}