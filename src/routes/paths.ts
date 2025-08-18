export const PATHS = {
  root: '/',
  dashboard: '/dashboard',
  projects: '/projects',
  projectsNew: '/projects/new',
  model: '/model',          // expects ?project=<id>&scenario=<id> (scenario optional)
  report: '/report',        // optional preview route for last-exported report
  demo: '/demo',            // public read-only demo
  share: '/share/:token',   // public read-only share view
  auth: '/auth',
  resetPassword: '/reset-password',
  welcome: '/welcome',
  notFound: '/404',
} as const;

export const KNOWN_PATHS = new Set<string>(Object.values(PATHS));

// Helper to validate paths at runtime
export function isKnownPath(path: string): boolean {
  return KNOWN_PATHS.has(path);
}