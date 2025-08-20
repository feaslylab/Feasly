import { useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PATHS } from '@/routes/paths';

interface BreadcrumbsProps {
  className?: string;
}

export default function Breadcrumbs({ className }: BreadcrumbsProps) {
  const location = useLocation();
  const pathname = location.pathname;

  const getBreadcrumbs = () => {
    const breadcrumbs: Array<{ label: string; path: string; icon?: any }> = [
      { label: 'Home', path: PATHS.dashboard, icon: Home }
    ];

    if (pathname.startsWith(PATHS.projects)) {
      breadcrumbs.push({ label: 'Projects', path: PATHS.projects });
      if (pathname === PATHS.projectsNew) {
        breadcrumbs.push({ label: 'New Project', path: PATHS.projectsNew });
      }
    } else if (pathname.startsWith(PATHS.model)) {
      breadcrumbs.push({ label: 'Model', path: PATHS.model });
    } else if (pathname.startsWith(PATHS.portfolio)) {
      breadcrumbs.push({ label: 'Portfolio', path: PATHS.portfolio });
    } else if (pathname.startsWith(PATHS.demo)) {
      if (pathname === PATHS.demoProject) {
        breadcrumbs.push({ label: 'Demo Project', path: PATHS.demoProject });
      } else {
        breadcrumbs.push({ label: 'Demo', path: PATHS.demo });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className={cn("flex items-center space-x-1 text-sm text-muted-foreground", className)}>
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        const Icon = crumb.icon;

        return (
          <div key={crumb.path} className="flex items-center">
            {index > 0 && <ChevronRight className="h-3 w-3 mx-1" />}
            <span className={cn(
              "flex items-center gap-1",
              isLast ? "text-foreground font-medium" : "hover:text-foreground"
            )}>
              {Icon && <Icon className="h-3 w-3" />}
              {crumb.label}
            </span>
          </div>
        );
      })}
    </nav>
  );
}