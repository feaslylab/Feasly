import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useSelectionStore } from "@/state/selectionStore";
import { useScenarioStore } from "@/hooks/useScenarioStore";
import { 
  useConstructionStoreScenario, 
  useSaleStore, 
  useRentalStore
} from "@/hooks/useTableStores";
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
  
  // Scenario management
  const { scenarios, current } = useScenarioStore(projectId);
  
  // Scenario-aware stores
  const { items: constructionItems, loading: constructionLoading } = useConstructionStoreScenario(projectId, scenarioId);
  const { items: saleItems, loading: saleLoading } = useSaleStore(projectId, scenarioId);
  const { items: rentalItems, loading: rentalLoading } = useRentalStore(projectId, scenarioId);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [kpis, setKpis] = useState<KPISnapshot[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

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

      // Fetch alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('feasly_alerts')
        .select(`
          id, title, body, severity, resolved, created_at, alert_type,
          projects!inner(user_id)
        `)
        .eq('projects.user_id', user?.id)
        .eq('resolved', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (alertsError) throw alertsError;

      setProjects(projectsData || []);
      setKpis(kpiData || []);
      setAlerts(alertsData || []);
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
      <div className="flex flex-col min-h-screen bg-background pt-14">
        <div className="flex-1 space-y-6 p-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="space-y-0 pb-2">
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-24 mb-2" />
                  <Skeleton className="h-3 w-40" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pt-14">
      <div className="flex-1 space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t('common.dashboard', 'Dashboard')}
            </h1>
            <p className="text-muted-foreground">
              Welcome back! Here's your portfolio overview and recent activity.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Link to="/projects/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </Link>
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              This Month
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProjects}</div>
              <p className="text-xs text-muted-foreground">
                {activeProjects} active • {pinnedProjects} pinned
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Portfolio NPV</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalPortfolioValue)}
              </div>
              <p className="text-xs text-muted-foreground">
                From {kpis.length} calculated projects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average IRR</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPercentage(averageIRR)}
              </div>
              <p className="text-xs text-muted-foreground">
                Portfolio weighted average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{alerts.length}</div>
              <p className="text-xs text-muted-foreground">
                Requiring attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Recent Projects */}
          <Card className="col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Projects</CardTitle>
                <Link to="/projects">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
              <CardDescription>
                Your latest projects and their current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.slice(0, 5).map((project) => (
                  <div key={project.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Link 
                          to={`/projects/${project.id}`}
                          className="font-medium hover:underline"
                        >
                          {project.name}
                        </Link>
                        {project.is_pinned && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {project.description || 'No description'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Created {new Date(project.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {getStatusBadge(project.status)}
                  </div>
                ))}
                
                {projects.length === 0 && (
                  <div className="text-center py-8">
                    <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No projects yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first project to get started
                    </p>
                    <Link to="/projects/new">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Project
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Alerts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Alerts</CardTitle>
                <Link to="/feasly-alerts">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
              <CardDescription>Latest system notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start space-x-3">
                    <AlertCircle className={`h-4 w-4 mt-1 ${getSeverityColor(alert.severity)}`} />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{alert.title}</p>
                      <p className="text-xs text-muted-foreground">{alert.body}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(alert.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {alerts.length === 0 && (
                  <div className="text-center py-6">
                    <CheckCircle className="mx-auto h-8 w-8 text-green-500 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No active alerts
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* KPI Performance */}
        {latestKpis.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Performance</CardTitle>
              <CardDescription>Latest KPI calculations from your projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {latestKpis.map((kpi, index) => (
                  <div key={index} className="space-y-2 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">NPV</span>
                      <span className="text-sm font-bold">
                        {formatCurrency(kpi.npv)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">IRR</span>
                      <span className="text-sm font-bold">
                        {formatPercentage(kpi.irr)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Profit</span>
                      <span className="text-sm font-bold">
                        {formatCurrency(kpi.profit)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(kpi.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}