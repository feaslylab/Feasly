import { describe, it, expect } from 'vitest';
import { PATHS } from '@/routes/paths';
import type { NavigationItem } from '@/types/navigation';
import { BarChart3, FolderOpen, FileText, Eye } from 'lucide-react';

const makeNav = (showDemo: boolean): NavigationItem[] => {
  const base = [
    { nameKey: 'dashboard', href: PATHS.dashboard, icon: BarChart3 },
    { nameKey: 'projects',  href: PATHS.projects,  icon: FolderOpen },
    { nameKey: 'reports',   href: PATHS.report,    icon: FileText },
  ] as const satisfies NavigationItem[];
  return showDemo ? [...base, { nameKey: 'demo', href: PATHS.demo, icon: Eye }] : [...base];
};

describe('EnhancedSidebar navigation', () => {
  it('omits demo when flag is false', () => {
    const nav = makeNav(false);
    expect(nav.some(i => i.nameKey === 'demo')).toBe(false);
  });
  
  it('includes demo when flag is true', () => {
    const nav = makeNav(true);
    const demo = nav.find(i => i.nameKey === 'demo');
    expect(demo?.href).toBe(PATHS.demo);
  });
  
  it('always includes base navigation items', () => {
    const nav = makeNav(false);
    expect(nav.find(i => i.nameKey === 'dashboard')?.href).toBe(PATHS.dashboard);
    expect(nav.find(i => i.nameKey === 'projects')?.href).toBe(PATHS.projects);
    expect(nav.find(i => i.nameKey === 'reports')?.href).toBe(PATHS.report);
  });
});