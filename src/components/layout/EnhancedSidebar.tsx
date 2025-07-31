import { Building2, BarChart3, FolderOpen, Settings, LogOut, Plus, User, Building, DollarSign, TrendingUp, AlertTriangle, Menu, ChevronLeft, X, Search, Command, Clock, Zap, Star, Bell, ChevronRight, Activity, Target, Archive } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
import { useEffect, useState, useRef } from "react";
import { TM } from "@/components/ui/trademark";

const navigation = [
  { nameKey: "nav.dashboard", href: "/dashboard", icon: BarChart3, badge: null, shortcut: "⌘D" },
  { nameKey: "nav.projects", href: "/projects", icon: FolderOpen, badge: "3", shortcut: "⌘P" },
  { nameKey: "nav.model", href: "/feasly-model", icon: Building, badge: null, shortcut: "⌘M" },
  { nameKey: "nav.flow", href: "/feasly-flow", icon: BarChart3, badge: null, shortcut: "⌘F" },
  { nameKey: "nav.finance", href: "/feasly-finance", icon: DollarSign, badge: null, shortcut: "⌘$" },
  { nameKey: "nav.consolidate", href: "/feasly-consolidate", icon: FolderOpen, badge: null, shortcut: "⌘C" },
  { nameKey: "nav.insights", href: "/feasly-insights", icon: TrendingUp, badge: "new", shortcut: "⌘I" },
  { nameKey: "nav.alerts", href: "/feasly-alerts", icon: AlertTriangle, badge: "2", shortcut: "⌘A" },
  { nameKey: "nav.settings", href: "/settings", icon: Settings, badge: null, shortcut: "⌘," },
];

const recentItems = [
  { name: "Villa Complex Project", href: "/feasly-model", time: "2m ago", icon: Building2 },
  { name: "Q4 Portfolio Analysis", href: "/feasly-insights", time: "15m ago", icon: TrendingUp },
  { name: "Risk Assessment Report", href: "/feasly-finance", time: "1h ago", icon: AlertTriangle },
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
  
  // Enhanced state management
  const [showRecent, setShowRecent] = useState(false);
  const [portfolioStats, setPortfolioStats] = useState({
    activeProjects: 3,
    totalValue: 2500000,
    alerts: 2,
    completion: 68
  });
  const [recentActivity, setRecentActivity] = useState([
    { type: 'update', message: 'Project Villa Complex updated', time: '2m ago', icon: Building2 },
    { type: 'alert', message: 'Cash flow warning resolved', time: '15m ago', icon: AlertTriangle },
    { type: 'calculation', message: 'KPI recalculation completed', time: '1h ago', icon: Target },
  ]);
  
  const sidebarRef = useRef<HTMLDivElement>(null);
  const currentModuleTitle = getModuleTitle(location.pathname, t);

  const handleSignOut = async () => {
    await signOut();
  };

  // Enhanced auto-close with gesture detection
  useEffect(() => {
    if (isMobile && !isCollapsed) {
      toggleSidebar();
    }
  }, [location.pathname, isMobile]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        const shortcut = navigation.find(item => {
          const key = item.shortcut.replace('⌘', '').toLowerCase();
          return e.key.toLowerCase() === key;
        });
        if (shortcut) {
          e.preventDefault();
          window.location.href = shortcut.href;
        }
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  // Smart auto-collapse based on usage
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isMobile && window.innerWidth > 1024) {
        const isNearSidebar = e.clientX < 300;
        if (isNearSidebar && isCollapsed) {
          setShowRecent(true);
        } else if (!isNearSidebar && !isCollapsed) {
          setShowRecent(false);
        }
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [isCollapsed, isMobile]);

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
      <aside ref={sidebarRef} className={cn(
        "fixed top-0 left-0 z-50 h-full transition-all duration-500 ease-out flex flex-col",
        // Glassmorphism effect
        "bg-card/95 backdrop-blur-xl border-border/50",
        // Enhanced shadows and gradients
        "shadow-2xl shadow-primary/5",
        "before:absolute before:inset-0 before:bg-gradient-to-b before:from-primary/5 before:via-transparent before:to-primary/10 before:pointer-events-none",
        isRTL ? "border-l" : "border-r",
        isMobile ? (
          isCollapsed 
            ? "-translate-x-full" 
            : "w-72 translate-x-0" // Wider on mobile
        ) : (
          isCollapsed ? "w-16" : "w-72" // Wider on desktop too
        ),
        "lg:relative lg:translate-x-0" // Always visible on desktop
      )}>
        {/* Top Section - Enhanced Header */}
        <div className="flex-shrink-0 relative">
          {/* Breadcrumb Context Bar */}
          {!isCollapsed && (
            <div className="px-4 py-2 border-b border-border/30 bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center text-xs text-muted-foreground">
                <span>Dashboard</span>
                <ChevronRight className="h-3 w-3 mx-1" />
                <span className="text-primary font-medium">{currentModuleTitle}</span>
              </div>
            </div>
          )}

          {/* Logo Header with Toggle */}
          <div className={cn(
            "flex h-16 items-center border-b border-border/30 relative",
            "bg-gradient-to-r from-card via-card to-primary/5",
            isCollapsed && !isMobile ? "px-3 justify-center" : "px-4 gap-3"
          )}>
            {/* Ambient glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 opacity-50 blur-xl" />
            {/* Mobile close button */}
            {isMobile && !isCollapsed && (
              <TouchTarget>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="h-8 w-8 lg:hidden relative z-10 hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </TouchTarget>
            )}

            {/* Desktop toggle button with enhanced animation */}
            {!isMobile && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TouchTarget>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleSidebar}
                        className="h-8 w-8 hidden lg:flex relative z-10 hover:bg-primary/10 hover:scale-110 transition-all duration-300"
                      >
                        <div className="relative">
                          {isCollapsed ? (
                            <Menu className="h-4 w-4 transition-transform duration-300" />
                          ) : (
                            <ChevronLeft className={cn("h-4 w-4 transition-transform duration-300", isRTL && "rotate-180")} />
                          )}
                        </div>
                      </Button>
                    </TouchTarget>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-popover/95 backdrop-blur-sm border border-border/50">
                    <p>{isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}</p>
                    <p className="text-xs text-muted-foreground">⌘B</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {(!isCollapsed || isMobile) && (
              <>
                {/* Enhanced Feasly Logo */}
                <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 relative z-10">
                  <div className="absolute inset-0 bg-primary/20 rounded-lg blur animate-pulse" />
                  <img 
                    src="/lovable-uploads/4b3d51a1-21a0-4d40-a32f-16a402b2a939.png" 
                    alt="Feasly Logo" 
                    className="w-8 h-8 object-contain relative z-10"
                  />
                </div>
                
                {/* Enhanced Brand and Module Title */}
                <div className={cn("flex-1 min-w-0 relative z-10", isRTL && "text-right")}>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      Feasly<TM />
                    </h1>
                    <span className="text-muted-foreground/50 hidden sm:block">—</span>
                    <span className="text-sm font-medium text-primary/80 truncate hidden sm:block">
                      {currentModuleTitle}
                    </span>
                  </div>
                  {/* Mobile: Show module title on second line */}
                  <div className="sm:hidden">
                    <p className="text-xs text-primary/70 font-medium truncate leading-tight">
                      {currentModuleTitle}
                    </p>
                  </div>
                </div>
                
                {/* Enhanced Controls */}
                {!isMobile && (
                  <div className="flex items-center gap-1 flex-shrink-0 relative z-10">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 transition-all duration-200">
                            <Search className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-popover/95 backdrop-blur-sm border border-border/50">
                          <p>Search</p>
                          <p className="text-xs text-muted-foreground">⌘K</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <ThemeToggle />
                    <LanguageSwitcher />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Enhanced Quick Stats Panel */}
          {(!isCollapsed || isMobile) && (
            <div className="p-4 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 border-b border-border/30">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-2 rounded-lg bg-card/50 border border-border/30 hover:bg-primary/5 transition-all duration-200">
                  <div className="text-lg font-bold text-foreground">{portfolioStats.activeProjects}</div>
                  <div className="text-xs text-muted-foreground">Active Projects</div>
                </div>
                <div className="p-2 rounded-lg bg-card/50 border border-border/30 hover:bg-emerald-500/5 transition-all duration-200">
                  <div className="text-lg font-bold text-emerald-600">
                    ${(portfolioStats.totalValue / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-xs text-muted-foreground">Portfolio Value</div>
                </div>
              </div>
              
              {/* Portfolio Progress */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Portfolio Completion</span>
                  <span>{portfolioStats.completion}%</span>
                </div>
                <Progress 
                  value={portfolioStats.completion} 
                  className="h-1.5 bg-muted/50" 
                />
              </div>
            </div>
          )}
        </div>

          {/* Enhanced Quick Action */}
          {(!isCollapsed || isMobile) && (
            <div className="p-4 flex-shrink-0 space-y-3">
              <Button 
                asChild
                className={cn(
                  "w-full min-h-[44px] group relative overflow-hidden",
                  "bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary",
                  "shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                )}
              >
                <NavLink to="/projects">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Plus className={cn("w-4 h-4 relative z-10", isRTL ? "ml-2" : "mr-2")} />
                  <span className="relative z-10">{t('nav.newProject')}</span>
                </NavLink>
              </Button>
              
              {/* Command Palette Trigger */}
              <Button 
                variant="outline" 
                className="w-full justify-start bg-card/50 border-border/50 hover:bg-primary/5 transition-all duration-200"
              >
                <Command className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                <span className="flex-1 text-left">Quick Actions...</span>
                <Badge variant="secondary" className="text-xs">⌘K</Badge>
              </Button>
            </div>
          )}

          {/* Recent Items Section */}
          {(!isCollapsed || isMobile) && recentItems.length > 0 && (
            <div className="px-4 pb-2">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recent</h4>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Clock className="h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-1">
                {recentItems.slice(0, 3).map((item, index) => (
                  <NavLink
                    key={index}
                    to={item.href}
                    className="flex items-center gap-2 p-2 rounded-lg text-xs hover:bg-accent/50 transition-all duration-200 group"
                  >
                    <item.icon className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-muted-foreground">{item.time}</p>
                    </div>
                  </NavLink>
                ))}
              </div>
            </div>
          )}

        {/* Enhanced Navigation */}
        <nav className={cn(
          "flex-1 py-2 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-border",
          isCollapsed && !isMobile ? "px-2" : "px-4"
        )}>
          <div className="space-y-1">
            {navigation.map((item, index) => {
              const isActive = location.pathname.startsWith(item.href);
              return (
                <TooltipProvider key={item.nameKey}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <NavLink
                        to={item.href}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-3 rounded-xl transition-all duration-300 touch-none relative group overflow-hidden",
                            "min-h-[44px] px-3 py-2",
                            isCollapsed && !isMobile 
                              ? "justify-center" 
                              : "text-sm font-medium",
                            isActive
                              ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:scale-[1.02]",
                            isRTL && (!isCollapsed || isMobile) && "flex-row-reverse"
                          )
                        }
                        onClick={() => {
                          if (isMobile && !isCollapsed) {
                            setTimeout(() => toggleSidebar(), 150);
                          }
                        }}
                      >
                        {/* Active indicator pill */}
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full animate-pulse" />
                        )}
                        
                        {/* Hover glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        <TouchTarget minSize={24}>
                          <div className="relative flex items-center">
                            <item.icon className={cn(
                              "w-5 h-5 flex-shrink-0 transition-all duration-300",
                              isActive ? "text-white" : "group-hover:scale-110"
                            )} />
                            {item.badge && (
                              <div className="absolute -top-1 -right-1">
                                <Badge 
                                  variant={item.badge === 'new' ? 'default' : 'destructive'} 
                                  className="h-4 px-1.5 text-xs animate-pulse"
                                >
                                  {item.badge}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </TouchTarget>
                        
                        {(!isCollapsed || isMobile) && (
                          <div className="flex-1 flex items-center justify-between relative z-10">
                            <span className="truncate">{t(item.nameKey)}</span>
                            {item.badge && (
                              <Badge 
                                variant={item.badge === 'new' ? 'default' : 'destructive'} 
                                className="h-5 px-2 text-xs ml-2"
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                        )}
                      </NavLink>
                    </TooltipTrigger>
                    <TooltipContent 
                      side="right" 
                      className="bg-popover/95 backdrop-blur-sm border border-border/50"
                      hidden={!isCollapsed || isMobile}
                    >
                      <div>
                        <p>{t(item.nameKey)}</p>
                        <p className="text-xs text-muted-foreground">{item.shortcut}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </nav>

        {/* Enhanced Live Activity Feed */}
        {(!isCollapsed || isMobile) && recentActivity.length > 0 && (
          <div className="px-4 py-2 border-t border-border/30 bg-gradient-to-r from-muted/20 to-transparent">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Activity className="h-3 w-3" />
                Live Activity
              </h4>
              <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
            </div>
            <div className="space-y-2 max-h-24 overflow-y-auto scrollbar-thin">
              {recentActivity.slice(0, 2).map((activity, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <activity.icon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground truncate">{activity.message}</p>
                    <p className="text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Bottom User Section */}
        <div className={cn(
          "border-t border-border/30 flex-shrink-0 relative",
          "bg-gradient-to-r from-card via-card to-primary/5",
          isCollapsed && !isMobile ? "p-2" : "p-4"
        )}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full h-auto text-left touch-none min-h-[44px] group relative overflow-hidden",
                  "hover:bg-primary/5 transition-all duration-300",
                  isCollapsed && !isMobile ? "p-2 justify-center" : "p-3",
                  isRTL && (!isCollapsed || isMobile) ? "flex-row-reverse" : ""
                )}
              >
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className={cn(
                  "flex items-center w-full relative z-10",
                  isCollapsed && !isMobile ? "justify-center" : "gap-3"
                )}>
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                      <span className="text-primary-foreground font-medium text-sm">
                        {user?.user_metadata?.full_name?.[0] || user?.email?.[0] || "U"}
                      </span>
                    </div>
                    {/* Online indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-500 rounded-full border-2 border-card" />
                  </div>
                  {(!isCollapsed || isMobile) && (
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-medium text-foreground truncate text-sm">
                        {user?.user_metadata?.full_name || t('auth.account')}
                      </p>
                      <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                        <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        Online • {user?.email}
                      </p>
                    </div>
                  )}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-64 bg-popover/95 backdrop-blur-xl border border-border/50 shadow-2xl z-[60]" 
              align={isRTL ? "end" : "start"}
              side="top"
            >
              {/* Enhanced user info header */}
              <div className="px-3 py-2 bg-gradient-to-r from-primary/10 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-primary-foreground font-medium">
                      {user?.user_metadata?.full_name?.[0] || user?.email?.[0] || "U"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user?.user_metadata?.full_name || t('user', { ns: 'auth' })}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                      <span className="text-xs text-emerald-600">Online</span>
                    </div>
                  </div>
                </div>
              </div>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem className="cursor-pointer min-h-[44px] group">
                <TouchTarget>
                  <div className="flex items-center w-full gap-3">
                    <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{t('viewAccount', { ns: 'auth' })}</p>
                      <p className="text-xs text-muted-foreground">Manage your profile</p>
                    </div>
                  </div>
                </TouchTarget>
              </DropdownMenuItem>
              
              <DropdownMenuItem className="cursor-pointer min-h-[44px] group">
                <TouchTarget>
                  <div className="flex items-center w-full gap-3">
                    <div className="h-8 w-8 bg-amber-500/10 rounded-lg flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                      <Settings className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium">{t('nav.settings')}</p>
                      <p className="text-xs text-muted-foreground">App preferences</p>
                    </div>
                  </div>
                </TouchTarget>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-destructive focus:text-destructive min-h-[44px] group hover:bg-destructive/5"
                onClick={handleSignOut}
              >
                <TouchTarget>
                  <div className="flex items-center w-full gap-3">
                    <div className="h-8 w-8 bg-destructive/10 rounded-lg flex items-center justify-center group-hover:bg-destructive/20 transition-colors">
                      <LogOut className="w-4 h-4 text-destructive" />
                    </div>
                    <div>
                      <p className="font-medium">{t('signOut', { ns: 'auth' })}</p>
                      <p className="text-xs text-muted-foreground">Sign out of account</p>
                    </div>
                  </div>
                </TouchTarget>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Enhanced Mobile controls at bottom */}
        {isMobile && !isCollapsed && (
          <div className="border-t border-border/30 p-4 lg:hidden bg-gradient-to-r from-muted/10 to-transparent">
            <div className="flex items-center justify-center gap-4">
              <ThemeToggle />
              <LanguageSwitcher />
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

// Enhanced Mobile hamburger button
export const MobileSidebarTrigger = () => {
  const { isCollapsed, toggleSidebar, isMobile } = useSidebarState();
  
  if (!isMobile || !isCollapsed) return null;
  
  return (
    <div className="fixed top-4 left-4 z-40 lg:hidden">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <TouchTarget>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleSidebar}
                className="h-12 w-12 bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                <Menu className="h-5 w-5 relative z-10" />
              </Button>
            </TouchTarget>
          </TooltipTrigger>
          <TooltipContent className="bg-popover/95 backdrop-blur-sm border border-border/50">
            <p>Open sidebar</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};