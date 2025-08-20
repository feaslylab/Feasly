export const PATHS = {
  root: '/',
  dashboard: '/dashboard',
  projects: '/projects',
  projectsNew: '/projects/new',
  model: '/model',
  portfolio: '/portfolio',
  flow: '/feasly-flow',
  finance: '/feasly-finance',
  consolidate: '/feasly-consolidate',
  insights: '/feasly-insights',
  alerts: '/feasly-alerts',
  settings: '/settings',
  auth: '/auth',
  resetPassword: '/reset-password',
  welcome: '/welcome',
  demo: '/demo',
  demoProject: '/demo-project',
} as const;

export const KNOWN_PATHS = new Set<string>(Object.values(PATHS));

// Helper to validate paths at runtime
export function isKnownPath(path: string): boolean {
  return KNOWN_PATHS.has(path);
}