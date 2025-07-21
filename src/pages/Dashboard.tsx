import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, Building, DollarSign, BarChart3, FolderOpen, Upload } from "lucide-react";
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

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalAssets: 0,
    totalValue: 0,
    totalRevenue: 0,
    avgIRR: 0,
  });
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Fetch projects with asset counts
      const { data: projects, error: projectsError } = await supabase
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
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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
        <div className="flex gap-3">
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
    </div>
  );
}