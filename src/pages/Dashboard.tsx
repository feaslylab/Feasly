import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PageContainer, PageHeader } from "@/components/ui/page-layout";
import { useToast } from "@/hooks/use-toast";
import { useSelectionStore } from "@/state/selectionStore";
import { useScenarioStore } from "@/hooks/useScenarioStore";
import { 
  useConstructionStoreScenario, 
  useSaleStore, 
  useRentalStore
} from "@/hooks/useTableStores";
import KpiGrid from "@/components/KpiGrid";
import CashChart from "@/components/CashChart";
import { useLiveRecalc }     from '@/hooks/useLiveRecalc';
import ConstructionTable     from '@/components/ConstructionTable';
import SaleTable             from '@/components/SaleTable';
import RentalTable           from '@/components/RentalTable';
import { 
  TrendingUp, 
  TrendingDown, 
  Building2, 
  DollarSign, 
  Calendar,
  BarChart3,
  Activity,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  Zap,
  Target,
  Eye,
  Bell,
  ChevronDown,
  ChevronUp,
  Star,
  Edit3,
  Archive,
  ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";

interface Project {
  id: string;
  name: string;
  status: string;
  created_at: string;
  description?: string;
  currency_code?: string;
  is_pinned?: boolean;
}

interface KPISnapshot {
  npv: number;
  irr: number | null;
  profit: number;
  created_at: string;
}

interface Alert {
  id: string;
  title: string;
  body: string;
  severity: string;
  resolved: boolean;
  created_at: string;
  alert_type: string;
}

export default function Dashboard() {
  const { t } = useTranslation(['common']);
  const { user } = useAuth();
  const { toast } = useToast();
  const { projectId, scenarioId } = useSelectionStore();
  const { cash, kpi } = useLiveRecalc();   // ← replaces previous hook usage
  
  // Scenario management
  const { scenarios, current } = useScenarioStore(projectId);
  
  // Data state
  const [projects, setProjects] = useState<Project[]>([]);
  const [kpis, setKpis] = useState<KPISnapshot[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertsExpanded, setAlertsExpanded] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);
  const [activityVisible, setActivityVisible] = useState(false);
  
  // Refs for animations
  const counterRefs = useRef<(HTMLDivElement | null)[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Only call table stores when we have valid project and scenario
  // This prevents the React queue error by ensuring hooks are called conditionally
  if (!import.meta.env.PROD) console.log("Dashboard render - projectId:", projectId, "scenarioId:", scenarioId);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, name, status, created_at, description, currency_code, is_pinned')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      // Fetch KPI snapshots
      const { data: kpiData, error: kpiError } = await supabase
        .from('kpi_snapshot')
        .select('npv, irr, profit, created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (kpiError) throw kpiError;

      // Fetch alerts for user's projects
      const { data: alertsData, error: alertsError } = await supabase
        .from('feasly_alerts')
        .select('id, title, body, severity, resolved, created_at, alert_type, project_id')
        .eq('resolved', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (alertsError) throw alertsError;

      // Filter alerts to only include those from user's projects
      const userProjectIds = (projectsData || []).map(p => p.id);
      const filteredAlerts = (alertsData || []).filter(alert => 
        userProjectIds.includes(alert.project_id)
      );

      setProjects(projectsData || []);
      setKpis(kpiData || []);
      setAlerts(filteredAlerts || []);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error loading dashboard",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'active': { variant: 'default' as const, label: 'Active' },
      'completed': { variant: 'secondary' as const, label: 'Completed' },
      'draft': { variant: 'outline' as const, label: 'Draft' },
      'planning': { variant: 'outline' as const, label: 'Planning' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'outline' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-warning';
      case 'low': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  // Enhanced time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    if (hour < 6) return { greeting: 'Good night', icon: '🌙', class: 'from-primary-dark to-primary' };
    if (hour < 12) return { greeting: 'Good morning', icon: '☀️', class: 'from-warning to-warning-light' };
    if (hour < 17) return { greeting: 'Good afternoon', icon: '🌤️', class: 'from-primary to-primary-light' };
    if (hour < 21) return { greeting: 'Good evening', icon: '🌅', class: 'from-primary-glow to-primary' };
    return { greeting: 'Good night', icon: '🌙', class: 'from-primary-dark to-primary' };
  };

  // Portfolio health score calculation
  const calculateHealthScore = () => {
    if (kpis.length === 0) return { score: 0, status: 'No Data', color: 'text-muted-foreground' };
    
    const avgNPV = totalPortfolioValue / Math.max(kpis.length, 1);
    const avgIRR = averageIRR;
    const alertRatio = alerts.length / Math.max(totalProjects, 1);
    
    let score = 0;
    if (avgNPV > 1000000) score += 40;
    else if (avgNPV > 500000) score += 25;
    else if (avgNPV > 0) score += 15;
    
    if (avgIRR > 0.15) score += 35;
    else if (avgIRR > 0.1) score += 25;
    else if (avgIRR > 0.05) score += 15;
    
    if (alertRatio < 0.1) score += 25;
    else if (alertRatio < 0.3) score += 15;
    else if (alertRatio < 0.5) score += 5;
    
    if (score >= 80) return { score, status: 'Excellent', color: 'text-success' };
    if (score >= 60) return { score, status: 'Good', color: 'text-primary' };
    if (score >= 40) return { score, status: 'Fair', color: 'text-warning' };
    return { score, status: 'Needs Attention', color: 'text-destructive' };
  };

  // Performance indicators for projects
  const getPerformanceIndicator = (project: Project) => {
    const projectKpis = kpis.filter(k => k.created_at > project.created_at);
    if (projectKpis.length === 0) return '⚪';
    
    const avgIRR = projectKpis.reduce((sum, k) => sum + (k.irr || 0), 0) / projectKpis.length;
    if (avgIRR > 0.15) return '🟢';
    if (avgIRR > 0.08) return '🟡';
    return '🔴';
  };

  // Animated counter hook
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            const targetValue = parseInt(element.dataset.target || '0');
            animateCounter(element, targetValue);
          }
        });
      },
      { threshold: 0.5 }
    );

    counterRefs.current.forEach((ref) => {
      if (ref && observerRef.current) {
        observerRef.current.observe(ref);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const animateCounter = (element: HTMLElement, target: number) => {
    const start = 0;
    const duration = 1500;
    const startTime = performance.now();

    const updateCounter = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(start + (target - start) * easeOutCubic(progress));
      element.textContent = current.toString();

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };

    requestAnimationFrame(updateCounter);
  };

  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

  // Group alerts by type
  const groupedAlerts = alerts.reduce((acc, alert) => {
    const type = alert.alert_type || 'general';
    if (!acc[type]) acc[type] = [];
    acc[type].push(alert);
    return acc;
  }, {} as Record<string, Alert[]>);

  // Memoized calculations for performance
  const portfolioMetrics = useMemo(() => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const pinnedProjects = projects.filter(p => p.is_pinned).length;
    const totalPortfolioValue = kpis.reduce((sum, kpi) => sum + kpi.npv, 0);
    const averageIRR = kpis.length > 0 
      ? kpis.filter(k => k.irr !== null).reduce((sum, kpi) => sum + (kpi.irr || 0), 0) / kpis.filter(k => k.irr !== null).length 
      : 0;
    
    return {
      totalProjects,
      activeProjects,
      pinnedProjects,
      totalPortfolioValue,
      averageIRR
    };
  }, [projects, kpis]);

  const { totalProjects, activeProjects, pinnedProjects, totalPortfolioValue, averageIRR } = portfolioMetrics;
  const latestKpis = useMemo(() => kpis.slice(0, 3), [kpis]);

  // Memoized format functions for performance
  const formatCurrency = useCallback((amount: number, currency = 'AED') => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(amount);
  }, []);

  const formatPercentage = useCallback((value: number | null) => {
    if (value === null) return 'N/A';
    return `${(value * 100).toFixed(1)}%`;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pt-14">
        <PageContainer className="py-8">
          {/* Enhanced skeleton for hero section */}
          <div className="mb-8 sm:mb-12">
            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-card/50 via-card/50 to-primary/5 border border-border/50 shadow-xl">
              <div className="relative p-4 sm:p-6 lg:p-8 xl:p-12">
                <div className="flex flex-col gap-6 sm:gap-8 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-r from-muted/50 to-muted/80 animate-pulse" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-8 sm:h-10 lg:h-12 w-3/4 bg-gradient-to-r from-muted/50 to-muted/80 animate-pulse" />
                        <Skeleton className="h-6 sm:h-7 w-1/2 bg-gradient-to-r from-muted/30 to-muted/60 animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      <Skeleton className="h-4 sm:h-5 w-full max-w-2xl bg-gradient-to-r from-muted/30 to-muted/60 animate-pulse" />
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <Skeleton className="h-12 sm:h-14 w-full sm:w-64 rounded-lg sm:rounded-xl bg-gradient-to-r from-primary/20 to-primary/40 animate-pulse" />
                        <Skeleton className="h-12 sm:h-14 w-full sm:w-48 rounded-lg sm:rounded-xl bg-gradient-to-r from-emerald-500/20 to-emerald-500/40 animate-pulse" />
                      </div>
                    </div>
                  </div>
                  <div className="xl:flex-shrink-0 w-full xl:w-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-3 sm:gap-4">
                      <Skeleton className="h-16 sm:h-20 w-full rounded-lg bg-gradient-to-r from-primary/30 to-primary/50 animate-pulse" />
                      <Skeleton className="h-16 sm:h-20 w-full rounded-lg bg-gradient-to-r from-muted/40 to-muted/60 animate-pulse" />
                      <Skeleton className="h-16 sm:h-20 w-full rounded-lg bg-gradient-to-r from-muted/40 to-muted/60 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced skeleton for metrics cards */}
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 mb-8 sm:mb-10">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="relative overflow-hidden border-0 rounded-xl bg-gradient-to-br from-card/50 to-primary/5 shadow-elevation-2">
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Skeleton className="h-4 w-24 bg-gradient-to-r from-muted/40 to-muted/60 animate-pulse" />
                    <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-r from-primary/20 to-primary/40 animate-pulse" />
                  </div>
                  <Skeleton className="h-8 sm:h-10 w-20 mb-2 bg-gradient-to-r from-muted/50 to-muted/80 animate-pulse" />
                  <Skeleton className="h-3 w-32 bg-gradient-to-r from-muted/30 to-muted/50 animate-pulse" />
                  <div className="mt-3">
                    <Skeleton className="h-2 w-full rounded-full bg-gradient-to-r from-muted/20 to-muted/40 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced skeleton for content sections */}
          <div className="grid gap-6 lg:grid-cols-3 mb-10">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border-0 rounded-xl shadow-elevation-2 bg-gradient-to-br from-card/50 via-card/50 to-primary/5">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Skeleton className="h-8 w-8 rounded-lg bg-gradient-to-r from-primary/20 to-primary/40 animate-pulse" />
                    <Skeleton className="h-6 w-24 bg-gradient-to-r from-muted/40 to-muted/60 animate-pulse" />
                  </div>
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <Skeleton key={j} className="h-12 w-full rounded-lg bg-gradient-to-r from-muted/30 to-muted/50 animate-pulse" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pt-14">
      <PageContainer className="py-8">
        {/* Premium Welcome Hero Section - Responsive Optimized */}
        <div className="mb-8 sm:mb-12">
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-card via-card to-primary/5 border border-border/50 shadow-xl">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5 opacity-50" />
            <div className="absolute top-0 right-0 w-48 h-48 sm:w-96 sm:h-96 bg-primary/5 rounded-full blur-3xl -translate-y-24 translate-x-24 sm:-translate-y-48 sm:translate-x-48" />
            
            <div className="relative p-4 sm:p-6 lg:p-8 xl:p-12">
              <div className="flex flex-col gap-6 sm:gap-8 xl:flex-row xl:items-center xl:justify-between">
                {/* Left: Enhanced greeting section */}
                <div className="flex-1">
                  <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                    {(() => {
                      const timeGreeting = getTimeBasedGreeting();
                      const now = new Date();
                      const dateStr = now.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      });
                      const timeStr = now.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true 
                      });
                      
                      return (
                        <div className="flex items-start gap-4 sm:gap-6">
                          <div className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl flex-shrink-0 animate-fade-in">{timeGreeting.icon}</div>
                          <div className="min-w-0 flex-1">
                            <div className="space-y-2">
                              <h1 className={`text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r ${timeGreeting.class} bg-clip-text text-transparent leading-tight animate-fade-in`}>
                                {timeGreeting.greeting}
                              </h1>
                              <p className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground animate-fade-in">
                                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'admin'}
                              </p>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-base sm:text-lg text-muted-foreground animate-fade-in">
                                <span className="font-medium">{dateStr}</span>
                                <span className="hidden sm:inline">•</span>
                                <span className="font-medium">{timeStr}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl">
                      Welcome back to your portfolio dashboard. Here's your real-time financial overview and project insights.
                    </p>
                    
                    {/* Enhanced health score section - Mobile optimized */}
                    <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-4">
                      {(() => {
                        const health = calculateHealthScore();
                        return (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <div className="flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-card/60 border border-border/30 hover:border-primary/30 transition-all duration-300">
                                  <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="relative">
                                      <div className="w-8 h-8 sm:w-10 lg:w-12 sm:h-10 lg:h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                                        <Target className="h-4 w-4 sm:h-5 lg:h-6 sm:w-5 lg:w-6 text-primary" />
                                      </div>
                                      <div className="absolute -top-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary-foreground rounded-full" />
                                      </div>
                                    </div>
                                    <div>
                                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Portfolio Health</p>
                                      <p className={`text-sm sm:text-base lg:text-lg font-bold ${health.color}`}>
                                        {health.score}/100 · {health.status}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-sm">
                                  <p className="font-medium">Portfolio Health Score</p>
                                  <p>Based on NPV, IRR, and alert ratio</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    NPV: {Math.round((totalPortfolioValue / 1000000) * 10) / 10}M • IRR: {formatPercentage(averageIRR)} • Alerts: {alerts.length}
                                  </p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })()}
                      
                      {/* Quick stats - Mobile optimized */}
                      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-emerald-500 rounded-full animate-pulse" />
                        <div>
                           <p className="text-xs sm:text-sm font-medium text-success-foreground">
                             {activeProjects} Active Projects
                           </p>
                           <p className="text-xs text-foreground font-medium">
                             {formatCurrency(totalPortfolioValue)} Total Value
                           </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Action buttons - Mobile optimized */}
                <div className="xl:flex-shrink-0 w-full xl:w-auto">
                  <div className="flex flex-col sm:flex-row xl:flex-col gap-3 sm:gap-4 xl:gap-4">
                    <Link to="/projects/new" className="xl:order-1 flex-1">
                      <Button size="lg" className="w-full h-16 px-6 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary shadow-elevation-2 hover:shadow-elevation-3 transition-all duration-300 hover:scale-[1.02] group">
                        <div className="flex items-center justify-center gap-3 w-full">
                          <Plus className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300 flex-shrink-0" />
                          <div className="text-center">
                            <div className="font-semibold text-base lg:text-lg">New Project</div>
                            <div className="text-xs text-primary-foreground/80 hidden sm:block">Start modeling</div>
                          </div>
                        </div>
                      </Button>
                    </Link>
                     <Button 
                       variant="outline" 
                       onClick={() => setActivityVisible(!activityVisible)}
                       className="xl:order-2 flex-1 h-16 px-6 border-border/50 backdrop-blur-sm hover:bg-primary/5 transition-all duration-300 hover:scale-[1.02]"
                     >
                       <div className="flex items-center justify-center gap-3 w-full">
                         <Activity className="h-6 w-6 flex-shrink-0" />
                         <div className="text-center">
                           <div className="font-medium text-base">Activity Feed</div>
                           <div className="text-xs text-muted-foreground hidden sm:block">Live updates</div>
                         </div>
                       </div>
                     </Button>
                     
                     <Button variant="outline" className="xl:order-3 flex-1 h-16 px-6 border-border/50 backdrop-blur-sm hover:bg-accent/50 transition-all duration-300 hover:scale-[1.02]">
                       <div className="flex items-center justify-center gap-3 w-full">
                         <Calendar className="h-6 w-6 flex-shrink-0" />
                         <div className="text-center">
                           <div className="font-medium text-base">This Month</div>
                           <div className="text-xs text-muted-foreground hidden sm:block">{new Date().toLocaleDateString('en', { month: 'long' })}</div>
                         </div>
                       </div>
                     </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Feed Sidebar */}
        {activityVisible && (
          <Card className="mb-8 border-0 shadow-elevation-2 bg-gradient-to-r from-card via-card to-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <span>Recent Activity</span>
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setActivityVisible(false)}>
                  <ChevronUp className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-muted-foreground">Project "Villa Complex" updated</span>
                  <span className="text-xs text-muted-foreground">2 minutes ago</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-muted-foreground">New KPI calculation completed</span>
                  <span className="text-xs text-muted-foreground">15 minutes ago</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-muted-foreground">Alert resolved: Cash flow warning</span>
                  <span className="text-xs text-muted-foreground">1 hour ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Premium Key Metrics Cards - Responsive Grid */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 mb-8 sm:mb-10">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-elevation-2 hover:shadow-elevation-3 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
                    <CardTitle className="text-xs sm:text-sm font-medium text-foreground/80">Total Projects</CardTitle>
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300 group-hover:scale-110">
                      <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative">
                    <div 
                      ref={(el) => (counterRefs.current[0] = el)}
                      data-target={totalProjects}
                      className="text-3xl font-bold text-foreground mb-1"
                    >
                      0
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-emerald-600 font-medium flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        {activeProjects} active
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-warning font-medium">{pinnedProjects} pinned</span>
                    </div>
                    <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary via-primary-dark to-primary rounded-full transition-all duration-700 animate-pulse"
                        style={{ 
                          width: `${Math.min((activeProjects / Math.max(totalProjects, 1)) * 100, 100)}%`,
                          animationDuration: '2s'
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-sm">
                  <p className="font-medium">Portfolio Overview</p>
                  <p>Active: {activeProjects} projects</p>
                  <p>Pinned: {pinnedProjects} projects</p>
                  <p>Activity Rate: {Math.round((activeProjects / Math.max(totalProjects, 1)) * 100)}%</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent shadow-elevation-2 hover:shadow-elevation-3 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-medium text-foreground/80">Portfolio NPV</CardTitle>
                    <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors duration-300 group-hover:scale-110">
                      <DollarSign className="h-5 w-5 text-success" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="text-3xl font-bold text-foreground mb-1">
                      {formatCurrency(totalPortfolioValue)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      From {kpis.length} calculated projects
                    </p>
                    <div className="mt-3 flex items-center space-x-1">
                       <TrendingUp className="h-4 w-4 text-success animate-pulse" />
                       <span className="text-sm text-success font-medium">+12.5%</span>
                      <span className="text-xs text-muted-foreground">vs last month</span>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-sm">
                  <p className="font-medium">Net Present Value</p>
                  <p>Total Portfolio Value: {formatCurrency(totalPortfolioValue)}</p>
                  <p>Average per Project: {formatCurrency(totalPortfolioValue / Math.max(kpis.length, 1))}</p>
                  <p>Growth Trend: Positive 📈</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent shadow-elevation-2 hover:shadow-elevation-3 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-medium text-foreground/80">Average IRR</CardTitle>
                    <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors duration-300 group-hover:scale-110">
                      <BarChart3 className="h-5 w-5 text-amber-600" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="text-3xl font-bold text-foreground mb-1">
                      {formatPercentage(averageIRR)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Portfolio weighted average
                    </p>
                    <div className="mt-3 flex items-center space-x-1">
                      <Target className="h-4 w-4 text-amber-600" />
                      <span className="text-sm text-amber-600 font-medium">
                        {averageIRR > 0.1 ? 'Above target' : averageIRR > 0.05 ? 'On target' : 'Below target'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-sm">
                  <p className="font-medium">Internal Rate of Return</p>
                  <p>Portfolio Average: {formatPercentage(averageIRR)}</p>
                  <p>Target Benchmark: 10%</p>
                  <p>Performance: {averageIRR > 0.1 ? '🟢 Excellent' : averageIRR > 0.05 ? '🟡 Good' : '🔴 Needs Improvement'}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent shadow-elevation-2 hover:shadow-elevation-3 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-medium text-foreground/80">Active Alerts</CardTitle>
                    <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors duration-300 group-hover:scale-110">
                      <div className="relative">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        {alerts.length > 0 && (
                          <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative">
                    <div 
                      ref={(el) => (counterRefs.current[3] = el)}
                      data-target={alerts.length}
                      className="text-3xl font-bold text-foreground mb-1"
                    >
                      0
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Requiring attention
                    </p>
                    {alerts.length === 0 ? (
                      <div className="mt-3 flex items-center space-x-1">
                        <CheckCircle className="h-4 w-4 text-emerald-600 animate-pulse" />
                        <span className="text-sm text-emerald-600 font-medium">All clear</span>
                      </div>
                    ) : (
                      <div className="mt-3 flex items-center space-x-1">
                        <Bell className="h-4 w-4 text-red-600 animate-pulse" />
                        <span className="text-sm text-red-600 font-medium">Action needed</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-sm">
                  <p className="font-medium">Alert Summary</p>
                  <p>Total Active: {alerts.length}</p>
                  {Object.entries(groupedAlerts).map(([type, typeAlerts]) => (
                    <p key={type}>
                      {type}: {typeAlerts.length} 
                      {typeAlerts.some(a => a.severity === 'high') && ' 🔴'}
                    </p>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Enhanced Analytics Section */}
        <div className="mb-10 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Analytics & Performance</h2>
              <p className="text-muted-foreground">Real-time insights from your portfolio</p>
            </div>
            <Button variant="outline" className="border-border/50 backdrop-blur-sm">
              <BarChart3 className="mr-2 h-4 w-4" />
              View Detailed Reports
            </Button>
          </div>
          
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="border-0 shadow-elevation-2 bg-gradient-to-br from-card via-card to-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-primary" />
                  </div>
                  <span>Construction</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ConstructionTable />
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-elevation-2 bg-gradient-to-br from-card via-card to-emerald-500/5">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                  </div>
                  <span>Sales</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SaleTable />
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-elevation-2 bg-gradient-to-br from-card via-card to-amber-500/5">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-amber-600" />
                  </div>
                  <span>Rentals</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RentalTable />
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Cash Flow Chart */}
          <Card className="border-0 shadow-elevation-2 bg-gradient-to-br from-card via-card to-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <span>Cash Flow Analysis</span>
                </CardTitle>
                <Button variant="outline" size="sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  Export Chart
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <CashChart data={cash}/>
            </CardContent>
          </Card>
          
          <KpiGrid/>
        </div>

        {/* Premium Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3 mb-10">
          {/* Enhanced Recent Projects */}
          <Card className="lg:col-span-2 border-0 shadow-elevation-2 bg-gradient-to-br from-card via-card to-primary/5">
            <CardHeader className="border-b border-border/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Recent Projects</CardTitle>
                    <CardDescription>Your latest projects and their current status</CardDescription>
                  </div>
                </div>
                <Link to="/projects">
                  <Button variant="outline" size="sm" className="border-border/50">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {projects.slice(0, 5).map((project, index) => (
                  <div key={project.id} className="group flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-primary/20 hover:shadow-elevation-2 transition-all duration-300 hover:scale-[1.02]">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/10 transition-colors duration-300 relative">
                        <Building2 className="h-5 w-5 text-primary" />
                        <div className="absolute -top-1 -right-1 text-sm">
                          {getPerformanceIndicator(project)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Link 
                            to={`/projects/${project.id}`}
                            className="font-semibold text-foreground hover:text-primary transition-colors duration-200 flex items-center gap-1"
                          >
                            {project.name}
                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                          {project.is_pinned && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Star className="h-4 w-4 text-amber-500 fill-current animate-pulse" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Pinned Project</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {project.description || 'No description'}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <p className="text-xs text-muted-foreground">
                            Created {new Date(project.created_at).toLocaleDateString()}
                          </p>
                          <span className="text-xs text-muted-foreground">•</span>
                          <p className="text-xs text-primary font-medium">
                            {project.currency_code || 'AED'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(project.status)}
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Quick View</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Edit3 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit Project</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
                ))}
                
                {projects.length === 0 && (
                  <div className="text-center py-12">
                    <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-4">
                      <Building2 className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Create your first project to start building your real estate portfolio
                    </p>
                    <Link to="/projects/new">
                      <Button size="lg" className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary">
                        <Plus className="mr-2 h-5 w-5" />
                        Create Your First Project
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Recent Alerts */}
          <Card className="border-0 shadow-elevation-2 bg-gradient-to-br from-card via-card to-red-500/5">
            <CardHeader className="border-b border-border/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Alerts</CardTitle>
                    <CardDescription>System notifications</CardDescription>
                  </div>
                </div>
                <Link to="/feasly-alerts">
                  <Button variant="outline" size="sm" className="border-border/50">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Smart Alert Grouping */}
                {Object.keys(groupedAlerts).length > 1 && (
                  <div className="flex items-center justify-between border-b border-border/20 pb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {Object.keys(groupedAlerts).length} Alert Categories
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setAlertsExpanded(!alertsExpanded)}
                    >
                      {alertsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                )}

                {alertsExpanded && Object.keys(groupedAlerts).length > 1 ? (
                  Object.entries(groupedAlerts).map(([type, typeAlerts]) => (
                    <div key={type} className="space-y-2">
                      <h4 className="text-sm font-medium text-foreground capitalize flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {type} ({typeAlerts.length})
                        </Badge>
                      </h4>
                      {typeAlerts.slice(0, 2).map((alert) => (
                        <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg border border-border/30 hover:border-red-500/20 hover:shadow-sm transition-all duration-300 ml-4">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                            alert.severity === 'high' ? 'bg-red-500/10 animate-pulse' : 
                            alert.severity === 'medium' ? 'bg-amber-500/10' : 'bg-blue-500/10'
                          }`}>
                            <AlertCircle className={`h-4 w-4 ${getSeverityColor(alert.severity)}`} />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium text-foreground">{alert.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">{alert.body}</p>
                            <div className="flex items-center space-x-2">
                              <p className="text-xs text-muted-foreground">
                                {new Date(alert.created_at).toLocaleDateString()}
                              </p>
                              <Badge variant="outline" className={`text-xs ${
                                alert.severity === 'high' ? 'border-red-200 text-red-700' :
                                alert.severity === 'medium' ? 'border-amber-200 text-amber-700' :
                                'border-blue-200 text-blue-700'
                              }`}>
                                {alert.severity.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  alerts.slice(0, 5).map((alert, index) => (
                    <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg border border-border/30 hover:border-red-500/20 hover:shadow-sm transition-all duration-300">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                        alert.severity === 'high' ? 'bg-red-500/10 animate-pulse' : 
                        alert.severity === 'medium' ? 'bg-amber-500/10' : 'bg-blue-500/10'
                      }`}>
                        <AlertCircle className={`h-4 w-4 ${getSeverityColor(alert.severity)}`} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium text-foreground">{alert.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{alert.body}</p>
                        <div className="flex items-center space-x-2">
                          <p className="text-xs text-muted-foreground">
                            {new Date(alert.created_at).toLocaleDateString()}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {alert.alert_type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                {alerts.length === 0 && (
                  <div className="text-center py-8">
                    <div className="h-12 w-12 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
                      <CheckCircle className="h-6 w-6 text-emerald-600 animate-pulse" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">All Clear!</p>
                    <p className="text-xs text-muted-foreground">
                      No active alerts at this time
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced KPI Performance Section */}
        {latestKpis.length > 0 && (
          <Card className="border-0 shadow-elevation-2 bg-gradient-to-br from-card via-card to-primary/5">
            <CardHeader className="border-b border-border/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Performance Metrics</CardTitle>
                    <CardDescription>Latest KPI calculations from your projects</CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-border/50">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Details
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-6 md:grid-cols-3">
                {latestKpis.map((kpi, index) => (
                  <div key={index} className="group relative overflow-hidden rounded-xl border border-border/30 p-6 hover:border-primary/20 hover:shadow-elevation-2 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">NPV</span>
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                          <DollarSign className="h-4 w-4 text-emerald-600" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-foreground">
                        {formatCurrency(kpi.npv)}
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">IRR</span>
                          <span className="text-sm font-semibold text-foreground">
                            {formatPercentage(kpi.irr)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Profit</span>
                          <span className="text-sm font-semibold text-foreground">
                            {formatCurrency(kpi.profit)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="pt-3 border-t border-border/20">
                        <p className="text-xs text-muted-foreground">
                          {new Date(kpi.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
           </Card>
         )}
        </PageContainer>
      </div>
    );
  }