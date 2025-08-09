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
  const { 
    isCollapsed, 
    isAutoHidden, 
    shouldShowSidebar, 
    handleMouseEnter, 
    handleMouseLeave, 
    toggleSidebar, 
    isMobile 
  } = useSidebarState();

  // Reflect sidebar layout on the document for global spacing rules
  const expanded = shouldShowSidebar && !isCollapsed;
  const showMini = isAutoHidden && !shouldShowSidebar && !isMobile;

  useEffect(() => {
    const root = document.documentElement;
    const offset = expanded ? '16rem' : (showMini ? '4rem' : '0px');
    root.style.setProperty('--sidebar-offset', offset);
    return () => {
      root.style.removeProperty('--sidebar-offset');
    };
  }, [expanded, showMini]);

  const handleSignOut = async () => {
    await signOut();
    // Navigation will be handled automatically by the auth state change
  };

  return (
    <>
      {/* Mini Sidebar - Always visible when auto-hidden */}
      {isAutoHidden && !shouldShowSidebar && !isMobile && (
        <div className="fixed left-0 top-0 z-20 h-full w-16 bg-card border-r border-border flex flex-col">
          {/* Mini Header */}
          <div className="flex items-center justify-center h-14 border-b border-border">
            <div className="w-6 h-6">
              <img 
                src="/lovable-uploads/4b3d51a1-21a0-4d40-a32f-16a402b2a939.png" 
                alt="Feasly Logo" 
                className="w-6 h-6 object-contain"
              />
            </div>
          </div>
          
          {/* Mini Navigation */}
          <nav className="flex-1 py-4 px-2 overflow-y-auto space-y-2">
            {navigation.map((item) => (
              <NavLink
                key={item.nameKey}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center justify-center rounded-lg transition-all duration-200",
                    "h-10 w-10 mx-auto", // Added mx-auto for centered positioning
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )
                }
                title={t(`nav.${item.nameKey}`)}
              >
                <item.icon className="w-4 h-4" /> {/* Slightly smaller icons */}
              </NavLink>
            ))}
          </nav>
        </div>
      )}

      {/* Main Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 z-40 h-full bg-card border-r border-border transition-all duration-300 ease-in-out",
        "flex flex-col justify-between",
        shouldShowSidebar ? "translate-x-0" : "-translate-x-full",
        isCollapsed ? "w-16" : "w-64"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
          {navigation.map((item) => (
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
    </>
  );
};