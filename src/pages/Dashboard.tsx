import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, Building, DollarSign, BarChart3, FolderOpen, Upload, Filter } from "lucide-react";
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

interface Asset {
  id: string;
  name: string;
  annual_revenue_potential_aed: number;
  project: {
    name: string;
  };
}

interface FilterState {
  projectId: string | null; // null means "All Projects"
  dateRange: 30 | 90 | 365 | null; // null means "All Time"
}

interface Project {
  id: string;
  name: string;
}

interface ProjectInsights {
  highestRevenueAsset: Asset | null;
  averageRevenuePerAsset: number;
  topProjects: Array<{
    id: string;
    name: string;
    totalRevenue: number;
    assetCount: number;
  }>;
}

export default function Dashboard() {
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
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      fetchProjectsList();
    }
  }, [user, filters]); // Re-fetch when filters change

  const fetchProjectsList = async () => {
    try {
      const { data: projectsData, error } = await supabase
        .from('projects')
        .select('id, name')
        .eq('user_id', user?.id)
        .order('name');

      if (error) throw error;
      setProjects(projectsData || []);
    } catch (error) {
      console.error('Error fetching projects list:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Build query with filters
      let query = supabase
        .from('projects')
        .select(`
          id,
          name,
          description,
          created_at,
          assets (
            id,
            construction_cost_aed,
            annual_revenue_potential_aed
          )
        `)
        .eq('user_id', user?.id);

      // Apply project filter if selected
      if (filters.projectId) {
        query = query.eq('id', filters.projectId);
      }

      // Apply date filter if selected
      if (filters.dateRange) {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - filters.dateRange);
        query = query.gte('created_at', daysAgo.toISOString());
      }

      const { data: projects, error: projectsError } = await query
        .order('created_at', { ascending: false })
        .limit(filters.projectId ? 1 : 5); // If filtering by project, get just that one

      if (projectsError) throw projectsError;

      // Calculate stats
      const totalProjects = projects?.length || 0;
      let totalAssets = 0;
      let totalValue = 0;
      let totalRevenue = 0;

      const recentProjectsData: RecentProject[] = projects?.map(project => {
        const assetCount = project.assets?.length || 0;
        const projectValue = project.assets?.reduce((sum, asset) => 
          sum + (asset.construction_cost_aed || 0), 0) || 0;
        const projectRevenue = project.assets?.reduce((sum, asset) => 
          sum + (asset.annual_revenue_potential_aed || 0), 0) || 0;
        
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
        avgIRR: 12.5, // Placeholder - would calculate from financial scenarios
      });
      setRecentProjects(recentProjectsData);

      // Fetch detailed insights data
      await fetchPortfolioInsights();

    } catch (error: any) {
      toast({
        title: "Error loading dashboard",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPortfolioInsights = async () => {
    try {
      // Build assets query with filters
      let query = supabase
        .from('assets')
        .select(`
          id,
          name,
          annual_revenue_potential_aed,
          project_id,
          projects (
            id,
            name,
            created_at
          )
        `)
        .order('annual_revenue_potential_aed', { ascending: false });

      const { data: assets, error: assetsError } = await query;

      if (assetsError) throw assetsError;

      if (!assets || assets.length === 0) {
        setInsights({
          highestRevenueAsset: null,
          averageRevenuePerAsset: 0,
          topProjects: [],
        });
        return;
      }

      // Filter assets based on current filters
      let filteredAssets = assets.filter(asset => asset.projects);

      // Apply project filter
      if (filters.projectId) {
        filteredAssets = filteredAssets.filter(asset => 
          (asset.projects as any)?.id === filters.projectId
        );
      }

      // Apply date filter to projects
      if (filters.dateRange) {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - filters.dateRange);
        filteredAssets = filteredAssets.filter(asset => {
          const projectCreatedAt = new Date((asset.projects as any)?.created_at);
          return projectCreatedAt >= daysAgo;
        });
      }

      if (filteredAssets.length === 0) {
        setInsights({
          highestRevenueAsset: null,
          averageRevenuePerAsset: 0,
          topProjects: [],
        });
        return;
      }

      // Find highest revenue asset
      const highestRevenueAsset = filteredAssets[0];

      // Calculate average revenue per asset
      const totalRevenue = filteredAssets.reduce((sum, asset) => sum + (asset.annual_revenue_potential_aed || 0), 0);
      const averageRevenuePerAsset = filteredAssets.length > 0 ? totalRevenue / filteredAssets.length : 0;

      // Group by project and calculate totals
      const projectRevenues = new Map();
      filteredAssets.forEach(asset => {
        const project = asset.projects as any;
        const projectId = project?.id;
        const projectName = project?.name;
        const revenue = asset.annual_revenue_potential_aed || 0;
        
        if (projectId && projectRevenues.has(projectId)) {
          const existing = projectRevenues.get(projectId);
          existing.totalRevenue += revenue;
          existing.assetCount += 1;
        } else if (projectId) {
          projectRevenues.set(projectId, {
            id: projectId,
            name: projectName,
            totalRevenue: revenue,
            assetCount: 1,
          });
        }
      });

      // Get top 3 projects by revenue
      const topProjects = Array.from(projectRevenues.values())
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 3);

      setInsights({
        highestRevenueAsset: {
          ...highestRevenueAsset,
          project: { 
            name: (highestRevenueAsset.projects as any)?.name || 'Unknown Project'
          }
        },
        averageRevenuePerAsset,
        topProjects,
      });

    } catch (error: any) {
      console.error('Error fetching portfolio insights:', error);
    }
  };

  // Generate 12-month revenue projection data with date filtering
  const generateRevenueProjection = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let monthlyRevenue = stats.totalRevenue / 12;
    
    // If date range filter is applied, adjust the projection
    if (filters.dateRange && filters.dateRange < 365) {
      const monthsInRange = Math.ceil(filters.dateRange / 30);
      monthlyRevenue = stats.totalRevenue / monthsInRange;
      
      return months.slice(0, monthsInRange).map((month, index) => ({
        month,
        cumulativeRevenue: monthlyRevenue * (index + 1),
        monthlyRevenue: monthlyRevenue,
      }));
    }
    
    return months.map((month, index) => ({
      month,
      cumulativeRevenue: monthlyRevenue * (index + 1),
      monthlyRevenue: monthlyRevenue,
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCurrencyShort = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-medium">
          <p className="text-sm font-medium text-foreground">{`${label}`}</p>
          <p className="text-sm text-muted-foreground">
            Monthly: {formatCurrency(data.monthlyRevenue)}
          </p>
          <p className="text-sm text-primary">
            Cumulative: {formatCurrency(data.cumulativeRevenue)}
          </p>
        </div>
      );
    }
    return null;
  };

  const getFilterLabel = () => {
    const parts = [];
    
    if (filters.projectId) {
      const project = projects.find(p => p.id === filters.projectId);
      parts.push(project?.name || 'Selected Project');
    } else {
      parts.push('All Projects');
    }
    
    if (filters.dateRange) {
      parts.push(`Last ${filters.dateRange} days`);
    }
    
    return parts.join(' • ');
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's an overview of your projects and portfolio.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                {getFilterLabel()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-64 bg-background border border-border shadow-lg z-50"
            >
              <DropdownMenuLabel>Filter Dashboard</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuLabel className="text-xs text-muted-foreground">Projects</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => setFilters(prev => ({ ...prev, projectId: null }))}
                className={`cursor-pointer ${!filters.projectId ? 'bg-accent' : ''}`}
              >
                All Projects
              </DropdownMenuItem>
              {projects.map(project => (
                <DropdownMenuItem
                  key={project.id}
                  onClick={() => setFilters(prev => ({ ...prev, projectId: project.id }))}
                  className={`cursor-pointer ${filters.projectId === project.id ? 'bg-accent' : ''}`}
                >
                  {project.name}
                </DropdownMenuItem>
              ))}
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">Date Range</DropdownMenuLabel>
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
        <Card className="border-border shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Projects
            </CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              Active development projects
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Assets
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalAssets}</div>
            <p className="text-xs text-muted-foreground">
              Across all projects
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Portfolio Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(stats.totalValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total construction cost
            </p>
          </CardContent>
        </Card>

        {/* Estimated Revenue Card - Only show if there's revenue */}
        {stats.totalRevenue > 0 && (
          <Card className="border-border shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Estimated Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                Annual revenue potential
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="border-border shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. IRR
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.avgIRR}%</div>
            <p className="text-xs text-muted-foreground">
              Expected return rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Insights Section */}
      {stats.totalRevenue > 0 && (
        <Card className="border-border shadow-soft">
          <CardHeader>
            <CardTitle className="text-foreground">Portfolio Insights</CardTitle>
            <CardDescription>
              Key performance metrics across your real estate portfolio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Highest Revenue Asset */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Highest Revenue Asset</h4>
                {insights.highestRevenueAsset ? (
                  <div className="p-4 bg-accent/50 rounded-lg border border-border">
                    <div className="font-semibold text-foreground">
                      {insights.highestRevenueAsset.name}
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {insights.highestRevenueAsset.project.name}
                    </div>
                    <div className="text-lg font-bold text-success">
                      {formatCurrency(insights.highestRevenueAsset.annual_revenue_potential_aed)}
                      <span className="text-xs font-normal text-muted-foreground">/year</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground">No revenue data available</div>
                  </div>
                )}
              </div>

              {/* Average Revenue Per Asset */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Average Revenue Per Asset</h4>
                <div className="p-4 bg-accent/50 rounded-lg border border-border">
                  <div className="text-2xl font-bold text-foreground">
                    {formatCurrency(insights.averageRevenuePerAsset)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    per asset annually
                  </div>
                </div>
              </div>

              {/* Top 3 Projects */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Top Projects by Revenue</h4>
                <div className="space-y-2">
                  {insights.topProjects.length > 0 ? (
                    insights.topProjects.map((project, index) => (
                      <div key={project.id} className="p-3 bg-accent/50 rounded-lg border border-border">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                              index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-600'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium text-foreground text-sm">
                                {project.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {project.assetCount} assets
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-foreground text-sm">
                              {formatCurrencyShort(project.totalRevenue)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="text-sm text-muted-foreground">No projects available</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                      <h3 className="font-medium text-foreground">{project.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {project.assetCount} assets
                      </Badge>
                    </div>
                    {project.description && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Value: {formatCurrency(project.totalValue)}</span>
                      <span>Created: {formatDate(project.created_at)}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <NavLink to={`/projects/${project.id}`}>
                      View Project
                    </NavLink>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revenue Projection Chart - Only show if there's revenue */}
      {stats.totalRevenue > 0 && (
        <Card className="border-border shadow-soft">
          <CardHeader>
            <CardTitle className="text-foreground">Revenue Projection</CardTitle>
            <CardDescription>
              12-month cumulative revenue projection based on annual estimates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={generateRevenueProjection()}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="month" 
                    className="text-muted-foreground"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    className="text-muted-foreground"
                    tick={{ fontSize: 12 }}
                    tickFormatter={formatCurrencyShort}
                  />
                  <Tooltip content={<CustomTooltip />} />
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
  );
}