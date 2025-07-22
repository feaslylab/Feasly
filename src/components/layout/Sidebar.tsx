import { Building2, BarChart3, FolderOpen, Settings, LogOut, Plus, User, Building, DollarSign, TrendingUp, AlertTriangle, Menu, ChevronLeft } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useSidebarState } from "@/hooks/useSidebarState";

const navigation = [
  { nameKey: "dashboard", href: "/dashboard", icon: BarChart3 },
  { nameKey: "projects", href: "/projects", icon: FolderOpen },
  { nameKey: "model", href: "/feasly-model", icon: Building },
  { nameKey: "flow", href: "/feasly-flow", icon: BarChart3 },
  { nameKey: "finance", href: "/feasly-finance", icon: DollarSign },
  { nameKey: "consolidate", href: "/feasly-consolidate", icon: FolderOpen },
  { nameKey: "insights", href: "/feasly-insights", icon: TrendingUp },
  { nameKey: "alerts", href: "/feasly-alerts", icon: AlertTriangle },
  { nameKey: "settings", href: "/settings", icon: Settings },
];

// Helper function to get module title based on current route
const getModuleTitle = (pathname: string, t: any) => {
  if (pathname.startsWith('/feasly-model')) return t('title', { ns: 'feasly.model' });
  if (pathname.startsWith('/feasly-flow')) return t('title', { ns: 'feasly.flow' });
  if (pathname.startsWith('/feasly-finance')) return t('title', { ns: 'feasly.finance' });
  if (pathname.startsWith('/feasly-consolidate')) return t('title', { ns: 'feasly.consolidate' });
  if (pathname.startsWith('/feasly-insights')) return t('title', { ns: 'feasly.insights' });
  if (pathname.startsWith('/feasly-alerts')) return t('title', { ns: 'feasly.alerts' });
  if (pathname.startsWith('/dashboard')) return t('nav.dashboard', { ns: 'common' });
  if (pathname.startsWith('/projects')) return t('nav.projects', { ns: 'common' });
  if (pathname.startsWith('/settings')) return t('nav.settings', { ns: 'common' });
  return 'Financial Modeling Platform';
};

export const Sidebar = () => {
  const { signOut, user } = useAuth();
  const { isRTL } = useLanguage();
  const { t } = useTranslation(['common', 'auth']);
  const location = useLocation();
  const { isCollapsed, toggleSidebar, isMobile } = useSidebarState();
  
  const currentModuleTitle = getModuleTitle(location.pathname, t);

  const handleSignOut = async () => {
    await signOut();
    // Navigation will be handled automatically by the auth state change
  };

  return (
    <div className={cn(
      "flex flex-col justify-between h-full bg-card border-border relative transition-all duration-300",
      isRTL ? "border-l" : "border-r",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Top Section - Navigation */}
      <div className="flex flex-col min-h-0">
        {/* Logo Header with Toggle */}
        <div className={cn(
          "flex h-16 items-center border-b border-border flex-shrink-0",
          isCollapsed ? "px-3 justify-center" : "px-6 gap-3"
        )}>
          {/* Sidebar Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn(
              "h-8 w-8 flex-shrink-0",
              isCollapsed && "mx-auto"
            )}
          >
            {isCollapsed ? (
              <Menu className="h-4 w-4" />
            ) : (
              <ChevronLeft className={cn("h-4 w-4", isRTL && "rotate-180")} />
            )}
          </Button>
          {!isCollapsed && (
            <>
              {/* Feasly Logo */}
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              
              {/* Brand and Module Title */}
              <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
                <div className="flex items-center gap-2 md:gap-2">
                  <h1 className="text-lg font-bold text-foreground flex-shrink-0">Feasly</h1>
                  <span className="text-muted-foreground hidden sm:block">—</span>
                  <span className="text-sm font-medium text-primary truncate hidden sm:block">
                    {currentModuleTitle}
                  </span>
                </div>
                {/* Mobile: Show module title on second line */}
                <div className="sm:hidden">
                  <p className="text-xs text-primary font-medium truncate leading-tight">
                    {currentModuleTitle}
                  </p>
                </div>
              </div>
              
              {/* Controls */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <ThemeToggle />
                <LanguageSwitcher />
              </div>
            </>
          )}
        </div>

        {/* Quick Action */}
        {!isCollapsed && (
          <div className="p-4 flex-shrink-0">
            <Button 
              asChild
              className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary"
            >
              <NavLink to="/projects/new">
                <Plus className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                {t('nav.newProject')}
              </NavLink>
            </Button>
          </div>
        )}

        {/* Navigation - Scrollable if needed */}
        <nav className={cn("flex-1 py-2 space-y-1 overflow-y-auto min-h-0", isCollapsed ? "px-2" : "px-4")}>
          {navigation.map((item) => (
            <NavLink
              key={item.nameKey}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg transition-all duration-200 touch-none",
                  "min-h-[44px]", // Touch-friendly height for mobile
                  isCollapsed 
                    ? "px-3 py-3 justify-center" 
                    : "px-3 py-2.5 text-sm font-medium",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent",
                  isRTL && !isCollapsed && "flex-row-reverse"
                )
              }
              title={isCollapsed ? t(`nav.${item.nameKey}`) : undefined} // Tooltip for collapsed state
            >
              <item.icon className={cn("w-5 h-5 flex-shrink-0")} />
              {!isCollapsed && (
                <span className="truncate">{t(`nav.${item.nameKey}`)}</span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom User Section - Always Visible */}
      <div className={cn("border-t border-border flex-shrink-0", isCollapsed ? "p-2" : "p-4")}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full h-auto text-left touch-none min-h-[44px]", // Touch-friendly height
                isCollapsed ? "p-2 justify-center" : "p-3",
                isRTL && !isCollapsed ? "flex-row-reverse" : ""
              )}
            >
              <div className={cn("flex items-center w-full", isCollapsed ? "justify-center" : "gap-3")}>
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-foreground font-medium text-sm">
                    {user?.user_metadata?.full_name?.[0] || user?.email?.[0] || "U"}
                  </span>
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-medium text-foreground truncate text-sm">
                      {user?.user_metadata?.full_name || t('auth.account')}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-56 bg-popover border border-border shadow-md z-50" 
            align={isRTL ? "end" : "start"}
            side="top"
          >
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{user?.user_metadata?.full_name || t('user', { ns: 'auth' })}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <User className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
              {t('viewAccount', { ns: 'auth' })}
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
              {t('nav.settings')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
              {t('signOut', { ns: 'auth' })}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};