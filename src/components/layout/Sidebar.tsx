import { useEffect } from "react";
import { Building2, BarChart3, FolderOpen, Settings, LogOut, Plus, User, Building, DollarSign, TrendingUp, AlertTriangle, Menu, ChevronLeft } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "react-i18next";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useSidebarState } from "@/hooks/useSidebarState";
import SidebarHeader from "./SidebarHeader";
import { useViewMode } from '@/lib/view-mode';
import { VIEW_CONFIG } from '@/lib/views/config';
import { PATHS } from "@/routes/paths";

const navigation = [
  { nameKey: "dashboard", href: "/dashboard", icon: BarChart3 },
  { nameKey: "projects", href: "/projects", icon: FolderOpen },
  { nameKey: "portfolio", href: PATHS.portfolio, icon: Building2 },
  { nameKey: "model", href: PATHS.model, icon: Building },
  { nameKey: "flow", href: PATHS.flow, icon: BarChart3 },
  { nameKey: "finance", href: PATHS.finance, icon: DollarSign },
  { nameKey: "consolidate", href: PATHS.consolidate, icon: FolderOpen },
  { nameKey: "insights", href: PATHS.insights, icon: TrendingUp },
  { nameKey: "alerts", href: PATHS.alerts, icon: AlertTriangle },
  { nameKey: "settings", href: PATHS.settings, icon: Settings },
];

// Helper function to get module title based on current route
const getModuleTitle = (pathname: string, t: any) => {
  if (pathname.startsWith('/model')) return t('title', { ns: 'feasly.model' });
  if (pathname.startsWith(PATHS.flow)) return t('title', { ns: 'feasly.flow' });
  if (pathname.startsWith(PATHS.finance)) return t('title', { ns: 'feasly.finance' });
  if (pathname.startsWith(PATHS.consolidate)) return t('title', { ns: 'feasly.consolidate' });
  if (pathname.startsWith(PATHS.insights)) return t('title', { ns: 'feasly.insights' });
  if (pathname.startsWith(PATHS.alerts)) return t('title', { ns: 'feasly.alerts' });
  if (pathname.startsWith('/dashboard')) return t('nav.dashboard', { ns: 'common' });
  if (pathname.startsWith('/projects')) return t('nav.projects', { ns: 'common' });
  if (pathname.startsWith('/portfolio')) return t('nav.portfolio', { ns: 'common' });
  if (pathname.startsWith(PATHS.settings)) return t('nav.settings', { ns: 'common' });
  return 'Financial Modeling Platform';
};

export const Sidebar = () => {
  const { signOut, user } = useAuth();
  const { isRTL } = useLanguage();
  const { t } = useTranslation(['common', 'auth']);
  const location = useLocation();
  const { mode } = useViewMode();
  const cfg = VIEW_CONFIG[mode];
  const { 
    isCollapsed, 
    isAutoHidden, 
    shouldShowSidebar, 
    handleMouseEnter, 
    handleMouseLeave, 
    toggleSidebar, 
    isMobile 
  } = useSidebarState();
  
  const filteredNavigation = navigation.filter(item => !cfg.nav.hiddenRoutes.includes(item.href));
  
  // Enhanced mini sidebar with better visual indicators
  const shouldShowMiniSidebar = isAutoHidden && !shouldShowSidebar && !isMobile;

  // Consolidated CSS variable management - now handled by useResponsiveLayout
  // This ensures single source of truth for spacing calculations
  useEffect(() => {
    // Legacy support - useResponsiveLayout now handles the main CSS variable updates
    const sidebarWidth = !shouldShowSidebar ? 0 : isCollapsed ? 56 : 256;
    document.documentElement.style.setProperty('--sidebar-width', `${sidebarWidth}px`);
  }, [shouldShowSidebar, isCollapsed]);

  const handleSignOut = async () => {
    await signOut();
    // Navigation will be handled automatically by the auth state change
  };

  return (
    <>
      {/* Single Unified Sidebar */}
      <div 
        className={cn(
          "fixed left-0 top-[var(--header-height)] h-[calc(100vh-var(--header-height))]",
          "bg-sidebar/98 backdrop-blur-lg border-r border-sidebar-border/60 shadow-elegant z-[var(--z-sidebar)]",
          "flex flex-col transition-all duration-300 ease-in-out",
          // Width based on collapsed state
          isCollapsed ? "w-14" : "w-64",
          // RTL support
          "rtl:right-0 rtl:left-auto rtl:border-l rtl:border-r-0"
        )}
      >
      {/* Top Section - Navigation */}
      <div className="flex flex-col min-h-0">
        {/* Simplified Header */}
        <SidebarHeader />

        {/* Quick Action */}
        {!isCollapsed && (
          <div className="px-4 pb-2 pt-6 flex-shrink-0">
            <Button 
              asChild
              className={cn(
                "w-full justify-start gap-3 px-3 py-3 text-primary-foreground rounded-lg",
                "bg-gradient-to-b from-primary to-primary-dark",
                "shadow-sm hover:shadow-md transition-colors",
                isRTL && !isCollapsed && "flex-row-reverse"
              )}
            >
              <NavLink to="/projects">
                <Plus className="w-4 h-4" />
                {t('nav.newProject')}
              </NavLink>
            </Button>
          </div>
        )}

        {/* Navigation - Scrollable */}
        <nav className={cn(
          "flex-1 pt-2 pb-4 space-y-2 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent",
          isCollapsed ? "px-3" : "px-4"
        )}>
          {filteredNavigation.map((item) => (
            <NavLink
              key={item.nameKey}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg transition-all duration-200 touch-none",
                  "min-h-[44px]",
                  isCollapsed 
                    ? "px-2 py-2 justify-center mx-auto w-10" // Better spacing for collapsed state
                    : "px-3 py-3 text-sm font-medium", // More padding for expanded state
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent",
                  isRTL && !isCollapsed && "flex-row-reverse"
                )
              }
              title={isCollapsed ? t(`nav.${item.nameKey}`) : undefined}
            >
              <item.icon className={cn("w-4 h-4 flex-shrink-0")} /> {/* Slightly smaller icons */}
              {!isCollapsed && (
                <span className="truncate">{t(`nav.${item.nameKey}`)}</span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom User Section - Always Visible */}
      <div className={cn("border-t border-sidebar-border flex-shrink-0 bg-sidebar/95", isCollapsed ? "p-2" : "p-4")}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full h-auto text-left touch-none min-h-[44px] hover:bg-sidebar-accent", 
                isCollapsed ? "p-2 justify-center" : "p-3",
                isRTL && !isCollapsed ? "flex-row-reverse" : ""
              )}
            >
              <div className={cn("flex items-center w-full", isCollapsed ? "justify-center" : "gap-3")}>
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-sidebar-border/20">
                  <span className="text-primary-foreground font-medium text-sm">
                    {user?.user_metadata?.full_name?.[0] || user?.email?.[0] || "U"}
                  </span>
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-medium text-sidebar-foreground truncate text-sm">
                      {user?.user_metadata?.full_name || t('auth.account')}
                    </p>
                    <p className="text-xs text-sidebar-foreground/60 truncate">
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
    </>
  );
};