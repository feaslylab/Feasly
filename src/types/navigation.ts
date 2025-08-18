import { PATHS } from '@/routes/paths';

export type PathKey = keyof typeof PATHS;
// union of the literal path values (e.g., '/dashboard' | '/projects' | ...)
export type PathValue = (typeof PATHS)[PathKey];

export interface NavigationItem {
  nameKey: 'dashboard' | 'projects' | 'reports' | 'demo'; // i18n keys you support
  href: PathValue;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}