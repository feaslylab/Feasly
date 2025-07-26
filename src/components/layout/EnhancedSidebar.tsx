import { Building2, BarChart3, FolderOpen, Settings, LogOut, Plus, User, Building, DollarSign, TrendingUp, AlertTriangle, Menu, ChevronLeft, X } from "lucide-react";
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
import { TouchTarget } from "@/components/ui/mobile-optimized";
import { componentClasses } from "@/lib/design-system";
import { useEffect } from "react";
import { TM } from "@/components/ui/trademark";

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

export const EnhancedSidebar = () => {
  const { signOut, user } = useAuth();
  const { isRTL } = useLanguage();
  const { t } = useTranslation(['common', 'auth']);
  const location = useLocation();
  const { isCollapsed, toggleSidebar, isMobile } = useSidebarState();
  
  const currentModuleTitle = getModuleTitle(location.pathname, t);

  const handleSignOut = async () => {
    await signOut();
  };

  // Auto-close sidebar on mobile when navigating
  useEffect(() => {
    if (isMobile && !isCollapsed) {
      toggleSidebar();
    }
  }, [location.pathname, isMobile]);

  // Mobile overlay when sidebar is open
  const MobileOverlay = () => (
    isMobile && !isCollapsed ? (
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
        onClick={toggleSidebar}
      />
    ) : null
  );

  return (
    <>
      <MobileOverlay />
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full bg-card border-border transition-all duration-300 flex flex-col",
        isRTL ? "border-l" : "border-r",
        isMobile ? (
          isCollapsed 
            ? "-translate-x-full" 
            : "w-64 translate-x-0"
        ) : (
          isCollapsed ? "w-16" : "w-64"
        ),
        "lg:relative lg:translate-x-0" // Always visible on desktop
      )}>
        {/* Top Section - Header */}
        <div className="flex-shrink-0">
          {/* Logo Header with Toggle */}
          <div className={cn(
            "flex h-16 items-center border-b border-border",
            isCollapsed && !isMobile ? "px-3 justify-center" : "px-4 gap-3"
          )}>
            {/* Mobile close button */}
            {isMobile && !isCollapsed && (
              <TouchTarget>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="h-8 w-8 lg:hidden"
                >
                  <X className="h-4 w-4" />
                </Button>
              </TouchTarget>
            )}

            {/* Desktop toggle button */}
            {!isMobile && (
              <TouchTarget>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="h-8 w-8 hidden lg:flex"
                >
                  {isCollapsed ? (
                    <Menu className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className={cn("h-4 w-4", isRTL && "rotate-180")} />
                  )}
                </Button>
              </TouchTarget>
            )}

            {(!isCollapsed || isMobile) && (
              <>
                {/* Feasly Logo */}
                <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <img 
                    src="/lovable-uploads/c54aee74-e595-47d1-9bf8-b8efef6fae7d.png" 
                    alt="Feasly Logo" 
                    className="w-8 h-8 object-contain"
                  />
                </div>
                
                {/* Brand and Module Title */}
                <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold text-foreground">Feasly<TM /></h1>
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
                
                {/* Controls - Only show on desktop when not collapsed */}
                {!isMobile && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <ThemeToggle />
                    <LanguageSwitcher />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Quick Action - Show when not collapsed or on mobile */}
          {(!isCollapsed || isMobile) && (
            <div className="p-4 flex-shrink-0">
              <Button 
                asChild
                className={cn(
                  "w-full min-h-[44px]", // Mobile-friendly height
                  componentClasses.button.variants.default
                )}
              >
                <NavLink to="/projects">
                  <Plus className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                  {t('nav.newProject')}
                </NavLink>
              </Button>
            </div>
          )}
        </div>

        {/* Navigation - Scrollable if needed */}
        <nav className={cn(
          "flex-1 py-2 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-border",
          isCollapsed && !isMobile ? "px-2" : "px-4"
        )}>
          <div className="space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.nameKey}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg transition-all duration-200 touch-none",
                    "min-h-[44px] px-3 py-2", // Touch-friendly sizing
                    isCollapsed && !isMobile 
                      ? "justify-center" 
                      : "text-sm font-medium",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent",
                    isRTL && (!isCollapsed || isMobile) && "flex-row-reverse"
                  )
                }
                title={isCollapsed && !isMobile ? t(`nav.${item.nameKey}`) : undefined}
                onClick={() => {
                  // Close sidebar on mobile after navigation
                  if (isMobile && !isCollapsed) {
                    setTimeout(() => toggleSidebar(), 150);
                  }
                }}
              >
                <TouchTarget minSize={24}>
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                </TouchTarget>
                {(!isCollapsed || isMobile) && (
                  <span className="truncate">{t(`nav.${item.nameKey}`)}</span>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Bottom User Section */}
        <div className={cn(
          "border-t border-border flex-shrink-0",
          isCollapsed && !isMobile ? "p-2" : "p-4"
        )}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full h-auto text-left touch-none min-h-[44px]",
                  isCollapsed && !isMobile ? "p-2 justify-center" : "p-3",
                  isRTL && (!isCollapsed || isMobile) ? "flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "flex items-center w-full",
                  isCollapsed && !isMobile ? "justify-center" : "gap-3"
                )}>
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-foreground font-medium text-sm">
                      {user?.user_metadata?.full_name?.[0] || user?.email?.[0] || "U"}
                    </span>
                  </div>
                  {(!isCollapsed || isMobile) && (
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
              <DropdownMenuItem className="cursor-pointer min-h-[44px]">
                <TouchTarget>
                  <div className="flex items-center w-full">
                    <User className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                    {t('viewAccount', { ns: 'auth' })}
                  </div>
                </TouchTarget>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer min-h-[44px]">
                <TouchTarget>
                  <div className="flex items-center w-full">
                    <Settings className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                    {t('nav.settings')}
                  </div>
                </TouchTarget>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-destructive focus:text-destructive min-h-[44px]"
                onClick={handleSignOut}
              >
                <TouchTarget>
                  <div className="flex items-center w-full">
                    <LogOut className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                    {t('signOut', { ns: 'auth' })}
                  </div>
                </TouchTarget>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile controls at bottom */}
        {isMobile && !isCollapsed && (
          <div className="border-t border-border p-4 lg:hidden">
            <div className="flex items-center justify-center gap-4">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

// Mobile hamburger button for when sidebar is hidden
export const MobileSidebarTrigger = () => {
  const { isCollapsed, toggleSidebar, isMobile } = useSidebarState();
  
  if (!isMobile || !isCollapsed) return null;
  
  return (
    <div className="fixed top-4 left-4 z-40 lg:hidden">
      <TouchTarget>
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className="h-10 w-10 bg-background/80 backdrop-blur-sm border shadow-md"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </TouchTarget>
    </div>
  );
};