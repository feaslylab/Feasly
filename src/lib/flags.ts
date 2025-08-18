// Production-safe feature flags
export const FLAGS = {
  // Debug-related flags - only enabled in development
  showWaterfallDebug: process.env.NODE_ENV !== 'production',
  showScrollSpyDebug: process.env.NODE_ENV !== 'production',
  enableDebugLogging: process.env.NODE_ENV !== 'production',
  
  // Feature flags that can be toggled in production
  showClawbackBanner: true,
  enableAdvancedFeatures: true,
  enableScenarios: true, // on in both dev/prod
  onboardingChecklist: true,
} as const;

// Type-safe flag checker
export function isFeatureEnabled(flag: keyof typeof FLAGS): boolean {
  return FLAGS[flag];
}

// Development-only wrapper for debug operations
export function runIfDev<T>(operation: () => T): T | undefined {
  if (process.env.NODE_ENV !== 'production') {
    return operation();
  }
  return undefined;
}