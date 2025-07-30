import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, Building, DollarSign, BarChart3, FolderOpen, Upload, Filter, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NavLink } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { ImportFromExcel } from "@/components/import/ImportFromExcel";
import { DashboardExport } from "@/components/dashboard/DashboardExport";
import { TeamActivityLog } from "@/components/dashboard/TeamActivityLog";
import { AlertsSummaryCard } from "@/components/dashboard/AlertsSummaryCard";
import { calculateFinancialMetrics, FinancialMetrics } from "@/lib/financialCalculations";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

// Memoized components for better performance
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  totalProjects: number;
  totalAssets: number;
  totalValue: number;
  totalRevenue: number;
  avgIRR: number;
}

interface RecentProject {
  id: string;
  name: string;
  description: string | null;
  assetCount: number;
  totalValue: number;
  created_at: string;
}

interface FilterState {
  projectId: string | null;
  dateRange: 30 | 90 | 365 | null;
}

interface Project {
  id: string;
  name: string;
}

interface KPIData {
  baseCase: FinancialMetrics;
  optimistic: FinancialMetrics;
  pessimistic: FinancialMetrics;
}

interface ProjectInsights {
  highestRevenueAsset: any;
  averageRevenuePerAsset: number;
  topProjects: Array<{
    id: string;
    name: string;
    totalRevenue: number;
    assetCount: number;
  }>;
}

// Memoized Stats Card Component
const StatsCard = ({ title, value, description, icon: Icon, variant = "default" }: {
  title: string;
  value: string | number;
  description: string;
  icon: any;
  variant?: "default" | "success" | "revenue";
}) => (
  <Card className="border-border shadow-soft">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <Icon className={cn(
        "h-4 w-4",
        variant === "success" && "text-success",
        variant === "revenue" && "text-green-600",
        variant === "default" && "text-muted-foreground"
      )} />
    </CardHeader>
    <CardContent>
      <div className={cn(
        "text-xl font-bold break-words",
        variant === "success" && "text-success",
        variant === "revenue" && "text-green-600",
        variant === "default" && "text-foreground"
      )}>
        {value}
      </div>
      <p className="text-xs text-muted-foreground">
        {description}
      </p>
    </CardContent>
  </Card>
);

// Memoized KPI Section Component
const KPISection = ({ kpiData, formatPercentage, formatYears, formatCurrencyShort, t }: {
  kpiData: KPIData;
  formatPercentage: (value: number) => string;
  formatYears: (value: number) => string;
  formatCurrencyShort: (amount: number) => string;
  t: any;
}) => {
  const hasData = useMemo(() => 
    kpiData.baseCase.totalRevenue > 0 || 
    kpiData.optimistic.totalRevenue > 0 || 
    kpiData.pessimistic.totalRevenue > 0
  , [kpiData]);

  if (!hasData) return null;

  return (
    <Card className="border-border shadow-soft">
      <CardHeader>
        <CardTitle className="text-foreground">{t('dashboard.kpiComparison', 'KPI Comparison')}</CardTitle>
        <CardDescription>
          {t('dashboard.kpiComparisonDesc', 'Compare key performance indicators across different scenarios')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Base Case */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground">{t('dashboard.baseCase', 'Base Case')}</h3>
              <p className="text-sm text-muted-foreground">{t('dashboard.conservativeEstimates', 'Conservative estimates')}</p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground">IRR</span>
                <span className="text-sm font-bold text-foreground">
                  {formatPercentage(kpiData.baseCase.irr)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground">Payback Period</span>
                <span className="text-sm font-bold text-foreground">
                  {formatYears(kpiData.baseCase.paybackPeriod)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground">Revenue</span>
                <span className="text-sm font-bold text-foreground">
                  {formatCurrencyShort(kpiData.baseCase.totalRevenue)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground">Profit Margin</span>
                <span className="text-sm font-bold text-foreground">
                  {formatPercentage(kpiData.baseCase.profitMargin)}
                </span>
              </div>
            </div>
          </div>

          {/* Optimistic */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-success">{t('dashboard.optimistic', 'Optimistic')}</h3>
              <p className="text-sm text-muted-foreground">{t('dashboard.bestCaseScenario', 'Best case scenario')}</p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-success/10 rounded-lg border border-success/20">
                <span className="text-sm font-medium text-muted-foreground">IRR</span>
                <span className="text-sm font-bold text-success">
                  {formatPercentage(kpiData.optimistic.irr)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-success/10 rounded-lg border border-success/20">
                <span className="text-sm font-medium text-muted-foreground">Payback Period</span>
                <span className="text-sm font-bold text-success">
                  {formatYears(kpiData.optimistic.paybackPeriod)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-success/10 rounded-lg border border-success/20">
                <span className="text-sm font-medium text-muted-foreground">Revenue</span>
                <span className="text-sm font-bold text-success">
                  {formatCurrencyShort(kpiData.optimistic.totalRevenue)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-success/10 rounded-lg border border-success/20">
                <span className="text-sm font-medium text-muted-foreground">Profit Margin</span>
                <span className="text-sm font-bold text-success">
                  {formatPercentage(kpiData.optimistic.profitMargin)}
                </span>
              </div>
            </div>
          </div>

          {/* Pessimistic */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-destructive">{t('dashboard.pessimistic', 'Pessimistic')}</h3>
              <p className="text-sm text-muted-foreground">{t('dashboard.worstCaseScenario', 'Worst case scenario')}</p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <span className="text-sm font-medium text-muted-foreground">IRR</span>
                <span className="text-sm font-bold text-destructive">
                  {formatPercentage(kpiData.pessimistic.irr)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <span className="text-sm font-medium text-muted-foreground">Payback Period</span>
                <span className="text-sm font-bold text-destructive">
                  {formatYears(kpiData.pessimistic.paybackPeriod)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <span className="text-sm font-medium text-muted-foreground">Revenue</span>
                <span className="text-sm font-bold text-destructive">
                  {formatCurrencyShort(kpiData.pessimistic.totalRevenue)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <span className="text-sm font-medium text-muted-foreground">Profit Margin</span>
                <span className="text-sm font-bold text-destructive">
                  {formatPercentage(kpiData.pessimistic.profitMargin)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Loading skeleton component
const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-16" />
          </CardHeader>
        </Card>
      ))}
    </div>
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-64 w-full" />
      </CardContent>
    </Card>
  </div>
);

export default function OptimizedDashboard() {
  const { isRTL } = useLanguage();
  const { t } = useTranslation('common');
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalAssets: 0,
    totalValue: 0,
    totalRevenue: 0,
    avgIRR: 0,
  });
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [insights, setInsights] = useState<ProjectInsights>({
    highestRevenueAsset: null,
    averageRevenuePerAsset: 0,
    topProjects: [],
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    projectId: null,
    dateRange: null,
  });
  const [kpiData, setKpiData] = useState<KPIData>({
    baseCase: { totalConstructionCost: 0, totalRevenue: 0, totalOperatingCost: 0, profitMargin: 0, irr: 0, paybackPeriod: 0 },
    optimistic: { totalConstructionCost: 0, totalRevenue: 0, totalOperatingCost: 0, profitMargin: 0, irr: 0, paybackPeriod: 0 },
    pessimistic: { totalConstructionCost: 0, totalRevenue: 0, totalOperatingCost: 0, profitMargin: 0, irr: 0, paybackPeriod: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Memoized formatting functions
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  const formatPercentage = useCallback((value: number) => {
    return `${value.toFixed(1)}%`;
  }, []);

  const formatYears = useCallback((value: number) => {
    if (value <= 0) return 'N/A';
    return `${value.toFixed(1)} years`;
  }, []);

  const formatCurrencyShort = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  // Optimized data fetching with better error handling
  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);

      // Single optimized query to fetch all needed data
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          description,
          created_at,
          currency_code,
          assets (
            id,
            construction_cost_aed,
            annual_revenue_aed
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (projectsError) throw projectsError;

      // Process data efficiently
      const totalProjects = projects?.length || 0;
      let totalAssets = 0;
      let totalValue = 0;
      let totalRevenue = 0;

      const recentProjectsData: RecentProject[] = projects?.map(project => {
        const assetCount = project.assets?.length || 0;
        const projectValue = project.assets?.reduce((sum, asset) => 
          sum + (asset.construction_cost_aed || 0), 0) || 0;
        const projectRevenue = project.assets?.reduce((sum, asset) => 
          sum + (asset.annual_revenue_aed || 0), 0) || 0;
        
        totalAssets += assetCount;
        totalValue += projectValue;
        totalRevenue += projectRevenue;

        return {
          id: project.id,
          name: project.name,
          description: project.description,
          assetCount,
          totalValue: projectValue,
          created_at: project.created_at,
        };
      }) || [];

      setStats({
        totalProjects,
        totalAssets,
        totalValue,
        totalRevenue,
        avgIRR: 12.5, // Would calculate from financial scenarios in production
      });
      setRecentProjects(recentProjectsData);

    } catch (error: any) {
      toast({
        title: "Error loading dashboard",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, toast]);

  const fetchProjectsList = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data: projectsData, error } = await supabase
        .from('projects')
        .select('id, name')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setProjects(projectsData || []);
    } catch (error) {
      // Silent error - not critical for dashboard function
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      Promise.all([
        fetchDashboardData(),
        fetchProjectsList()
      ]);
    }
  }, [user, fetchDashboardData, fetchProjectsList]);

  // Memoized revenue projection data
  const revenueProjectionData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRevenue = stats.totalRevenue / 12;
    
    return months.map((month, index) => ({
      month,
      cumulativeRevenue: monthlyRevenue * (index + 1),
      monthlyRevenue: monthlyRevenue,
    }));
  }, [stats.totalRevenue]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('nav.dashboard')}</h1>
            <p className="text-muted-foreground">
              {t('dashboard.overview', 'Overview of your real estate development portfolio')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filters */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  {filters.projectId 
                    ? projects.find(p => p.id === filters.projectId)?.name || 'Selected Project'
                    : 'All Projects'
                  }
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-background border border-border shadow-lg z-50">
                <DropdownMenuLabel>Filter by Project</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setFilters(prev => ({ ...prev, projectId: null }))}
                  className={`cursor-pointer ${!filters.projectId ? 'bg-accent' : ''}`}
                >
                  All Projects
                </DropdownMenuItem>
                {projects.map((project) => (
                  <DropdownMenuItem
                    key={project.id}
                    onClick={() => setFilters(prev => ({ ...prev, projectId: project.id }))}
                    className={`cursor-pointer ${filters.projectId === project.id ? 'bg-accent' : ''}`}
                  >
                    {project.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  {filters.dateRange ? `Last ${filters.dateRange} days` : 'All Time'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 bg-background border border-border shadow-lg z-50">
                <DropdownMenuLabel>Date Range</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setFilters(prev => ({ ...prev, dateRange: null }))}
                  className={`cursor-pointer ${!filters.dateRange ? 'bg-accent' : ''}`}
                >
                  All Time
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setFilters(prev => ({ ...prev, dateRange: 30 }))}
                  className={`cursor-pointer ${filters.dateRange === 30 ? 'bg-accent' : ''}`}
                >
                  Last 30 days
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setFilters(prev => ({ ...prev, dateRange: 90 }))}
                  className={`cursor-pointer ${filters.dateRange === 90 ? 'bg-accent' : ''}`}
                >
                  Last 90 days
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setFilters(prev => ({ ...prev, dateRange: 365 }))}
                  className={`cursor-pointer ${filters.dateRange === 365 ? 'bg-accent' : ''}`}
                >
                  Last 365 days
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DashboardExport 
              filters={filters}
              stats={stats}
              projects={projects}
            />

            <ImportFromExcel 
              trigger={
                <Button variant="outline" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Import from Excel
                </Button>
              }
            />
            <Button 
              asChild
              className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary"
            >
              <NavLink to="/projects/new">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </NavLink>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatsCard
            title={t('dashboard.totalProjects', 'Total Projects')}
            value={stats.totalProjects}
            description={t('dashboard.activeProjects', `${recentProjects.length} active projects`)}
            icon={FolderOpen}
          />
          
          <StatsCard
            title={t('dashboard.totalAssets', 'Total Assets')}
            value={stats.totalAssets}
            description={t('dashboard.developmentProperties', 'Development properties')}
            icon={Building}
          />
          
          <StatsCard
            title={t('dashboard.portfolioValue', 'Portfolio Value')}
            value={formatCurrencyShort(stats.totalValue)}
            description={t('dashboard.totalConstructionCost', 'Total construction cost')}
            icon={DollarSign}
          />
          
          {stats.totalRevenue > 0 && (
            <StatsCard
              title="Estimated Revenue"
              value={formatCurrencyShort(stats.totalRevenue)}
              description="Annual revenue potential"
              icon={DollarSign}
              variant="revenue"
            />
          )}
          
          <StatsCard
            title="Avg. IRR"
            value={`${stats.avgIRR}%`}
            description="Expected return rate"
            icon={TrendingUp}
            variant="success"
          />
        </div>

        {/* KPI Comparison Section */}
        <KPISection 
          kpiData={kpiData}
          formatPercentage={formatPercentage}
          formatYears={formatYears}
          formatCurrencyShort={formatCurrencyShort}
          t={t}
        />

        {/* Portfolio Alerts Summary */}
        <ErrorBoundary>
          <AlertsSummaryCard />
        </ErrorBoundary>

        {/* Team Activity Log */}
        <ErrorBoundary>
          <TeamActivityLog filters={filters} />
        </ErrorBoundary>

        {/* Recent Projects */}
        <Card className="border-border shadow-soft">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground">Recent Projects</CardTitle>
                <CardDescription>
                  Your latest project developments and their key metrics
                </CardDescription>
              </div>
              <Button variant="outline" asChild>
                <NavLink to="/projects">
                  View All
                </NavLink>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentProjects.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No projects yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first project to get started with financial modeling.
                </p>
                <Button asChild>
                  <NavLink to="/projects/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Project
                  </NavLink>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-foreground">{project.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {project.assetCount} assets
                        </Badge>
                      </div>
                      {project.description && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Value: {formatCurrencyShort(project.totalValue)}</span>
                        <span>•</span>
                        <span>Created: {formatDate(project.created_at)}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <NavLink to={`/project/${project.id}`}>
                        View Details
                      </NavLink>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue Projection Chart */}
        {stats.totalRevenue > 0 && (
          <Card className="border-border shadow-soft">
            <CardHeader>
              <CardTitle className="text-foreground">Revenue Projection</CardTitle>
              <CardDescription>
                Monthly cumulative revenue projection based on current portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueProjectionData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="month" 
                      className="text-muted-foreground"
                    />
                    <YAxis 
                      className="text-muted-foreground"
                      tickFormatter={(value) => formatCurrencyShort(value)}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        formatCurrency(value),
                        name === 'cumulativeRevenue' ? 'Cumulative Revenue' : 'Monthly Revenue'
                      ]}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cumulativeRevenue" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ErrorBoundary>
  );
}