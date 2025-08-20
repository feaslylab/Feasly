import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, X, LayoutDashboard, FolderOpen, Calculator, BarChart3, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PATHS } from '@/routes/paths';

interface NavigationMenuProps {
  className?: string;
}

const navigationItems = [
  {
    label: 'Dashboard',
    href: PATHS.dashboard,
    icon: LayoutDashboard,
    description: 'Overview and analytics'
  },
  {
    label: 'Projects',
    href: PATHS.projects,
    icon: FolderOpen,
    description: 'Manage your projects'
  },
  {
    label: 'Model',
    href: PATHS.model,
    icon: Calculator,
    description: 'Financial modeling workspace'
  },
  {
    label: 'Portfolio',
    href: PATHS.portfolio,
    icon: BarChart3,
    description: 'Portfolio analysis'
  },
  {
    label: 'Demo',
    href: PATHS.demo,
    icon: Play,
    description: 'Interactive demo'
  },
];

export default function NavigationMenu({ className }: NavigationMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const currentPath = location.pathname;
  const isActive = (href: string) => {
    if (href === PATHS.dashboard) {
      return currentPath === href;
    }
    return currentPath.startsWith(href);
  };

  return (
    <>
      {/* Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={cn("h-8 w-8 p-0", className)}
        aria-label="Open navigation menu"
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Floating Menu */}
      {isOpen && (
        <div className="fixed top-16 left-4 z-50 w-80 bg-background border rounded-lg shadow-lg animate-scale-in">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Navigation</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <nav className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                      active 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}