import { Building2, BarChart3, FolderOpen, FileText, Eye } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import { PATHS } from '@/routes/paths';
import { useState } from 'react';

// Define the navigation item type explicitly to avoid TypeScript inference issues
interface NavigationItem {
  nameKey: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const baseNavigation: NavigationItem[] = [
  { nameKey: 'dashboard', href: PATHS.dashboard, icon: BarChart3 },
  { nameKey: 'projects', href: PATHS.projects, icon: FolderOpen },
  { nameKey: 'reports', href: PATHS.report, icon: FileText },
];

// Conditionally add demo link based on feature flag
const navigation: NavigationItem[] = [...baseNavigation];
const showDemoLink = import.meta.env.VITE_FEATURE_DEMO_LINK === 'true';
if (showDemoLink) {
  navigation.push({ nameKey: 'demo', href: PATHS.demo, icon: Eye });
}

export function EnhancedSidebar() {
  const { isRTL } = useLanguage();
  const { t } = useTranslation('common');
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside 
      className={cn(
        "fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] bg-card border-r border-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <nav className="flex flex-col h-full p-4 space-y-2">
        {/* Toggle button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="self-end mb-2 h-8 w-8 p-0"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg
            className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Button>

        {/* Navigation items */}
        {navigation.map((item) => (
          <NavLink
            key={item.nameKey}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                "hover:bg-accent hover:text-accent-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                isActive && "bg-primary text-primary-foreground",
                isCollapsed && "justify-center",
                isRTL && !isCollapsed && "flex-row-reverse"
              )
            }
            title={isCollapsed ? t(`nav.${item.nameKey}`) : undefined}
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && (
              <span className="truncate">{t(`nav.${item.nameKey}`)}</span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}