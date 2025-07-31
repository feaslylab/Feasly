import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
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
  Plus
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

  const formatCurrency = (amount: number, currency = 'AED') => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(amount);
  };

  const formatPercentage = (value: number | null) => {
    if (value === null) return 'N/A';
    return `${(value * 100).toFixed(1)}%`;
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
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  // Calculate portfolio metrics
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const pinnedProjects = projects.filter(p => p.is_pinned).length;
  
  const latestKpis = kpis.slice(0, 3);
  const totalPortfolioValue = kpis.reduce((sum, kpi) => sum + kpi.npv, 0);
  const averageIRR = kpis.length > 0 
    ? kpis.filter(k => k.irr !== null).reduce((sum, kpi) => sum + (kpi.irr || 0), 0) / kpis.filter(k => k.irr !== null).length 
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pt-14">
        <div className="flex-1 space-y-8 p-6">
          <div className="space-y-3">
            <Skeleton className="h-10 w-80 bg-gradient-to-r from-muted to-muted/50" />
            <Skeleton className="h-6 w-96 bg-gradient-to-r from-muted to-muted/50" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-0 shadow-lg bg-gradient-to-br from-card to-primary/5">
                <CardHeader className="space-y-0 pb-3">
                  <Skeleton className="h-5 w-32 bg-gradient-to-r from-muted to-muted/50" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-24 mb-3 bg-gradient-to-r from-muted to-muted/50" />
                  <Skeleton className="h-4 w-40 bg-gradient-to-r from-muted to-muted/50" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="border-0 shadow-lg bg-gradient-to-br from-card to-primary/5">
                <CardHeader>
                  <Skeleton className="h-6 w-40 bg-gradient-to-r from-muted to-muted/50" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <Skeleton key={j} className="h-12 w-full bg-gradient-to-r from-muted to-muted/50" />
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pt-14">
      <PageContainer className="py-8">
        {/* Premium Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.email?.split('@')[0] || 'there'}
              </h1>
              <p className="text-muted-foreground mt-1 text-lg">
                Welcome back to your portfolio dashboard
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link to="/projects/new">
                <Button size="lg" className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300">
                  <Plus className="mr-2 h-5 w-5" />
                  New Project
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="border-border/50 backdrop-blur-sm">
                <Calendar className="mr-2 h-4 w-4" />
                This Month
              </Button>
            </div>
          </div>
        </div>

        {/* Premium Key Metrics Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10">
          <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-foreground/80">Total Projects</CardTitle>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-foreground mb-1">{totalProjects}</div>
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-emerald-600 font-medium">{activeProjects} active</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-amber-600 font-medium">{pinnedProjects} pinned</span>
              </div>
              <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-primary-dark rounded-full transition-all duration-700"
                  style={{ width: `${Math.min((activeProjects / Math.max(totalProjects, 1)) * 100, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-foreground/80">Portfolio NPV</CardTitle>
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors duration-300">
                <DollarSign className="h-5 w-5 text-emerald-600" />
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
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <span className="text-sm text-emerald-600 font-medium">+12.5%</span>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-foreground/80">Average IRR</CardTitle>
              <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors duration-300">
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
                <Activity className="h-4 w-4 text-amber-600" />
                <span className="text-sm text-amber-600 font-medium">Above target</span>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-foreground/80">Active Alerts</CardTitle>
              <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors duration-300">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-foreground mb-1">{alerts.length}</div>
              <p className="text-sm text-muted-foreground">
                Requiring attention
              </p>
              {alerts.length === 0 ? (
                <div className="mt-3 flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm text-emerald-600 font-medium">All clear</span>
                </div>
              ) : (
                <div className="mt-3 flex items-center space-x-1">
                  <Clock className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-600 font-medium">Action needed</span>
                </div>
              )}
            </CardContent>
          </Card>
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
            <Card className="border-0 shadow-lg bg-gradient-to-br from-card via-card to-primary/5">
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
            
            <Card className="border-0 shadow-lg bg-gradient-to-br from-card via-card to-emerald-500/5">
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
            
            <Card className="border-0 shadow-lg bg-gradient-to-br from-card via-card to-amber-500/5">
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
          <Card className="border-0 shadow-lg bg-gradient-to-br from-card via-card to-primary/5">
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
          <Card className="lg:col-span-2 border-0 shadow-lg bg-gradient-to-br from-card via-card to-primary/5">
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
                  <div key={project.id} className="group flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-primary/20 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/10 transition-colors duration-300">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Link 
                            to={`/projects/${project.id}`}
                            className="font-semibold text-foreground hover:text-primary transition-colors duration-200"
                          >
                            {project.name}
                          </Link>
                          {project.is_pinned && (
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
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
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Activity className="h-4 w-4" />
                      </Button>
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
          <Card className="border-0 shadow-lg bg-gradient-to-br from-card via-card to-red-500/5">
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
                {alerts.map((alert, index) => (
                  <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg border border-border/30 hover:border-red-500/20 hover:shadow-sm transition-all duration-300">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                      alert.severity === 'high' ? 'bg-red-500/10' : 
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
                ))}
                
                {alerts.length === 0 && (
                  <div className="text-center py-8">
                    <div className="h-12 w-12 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
                      <CheckCircle className="h-6 w-6 text-emerald-600" />
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
          <Card className="border-0 shadow-lg bg-gradient-to-br from-card via-card to-primary/5">
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
                  <div key={index} className="group relative overflow-hidden rounded-xl border border-border/30 p-6 hover:border-primary/20 hover:shadow-lg transition-all duration-300">
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