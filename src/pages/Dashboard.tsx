import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Building2, 
  DollarSign, 
  Calendar,
  BarChart3,
  Activity,
  Users,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";

export default function Dashboard() {
  const { t } = useTranslation(['common', 'feasly.model']);
  const [activeView, setActiveView] = useState<'overview' | 'analytics' | 'projects'>('overview');

  // Mock data - replace with real data from your hooks/API
  const dashboardData = {
    totalProjects: 12,
    activeProjects: 8,
    completedProjects: 4,
    totalInvestment: 125000000,
    projectedRevenue: 180000000,
    averageIRR: 15.3,
    portfolioValue: 205000000,
    monthlyGrowth: 8.2
  };

  const recentProjects = [
    { id: 1, name: "Marina Heights", status: "active", progress: 75, value: 25000000 },
    { id: 2, name: "Desert Oasis Resort", status: "planning", progress: 25, value: 45000000 },
    { id: 3, name: "City Center Plaza", status: "active", progress: 90, value: 35000000 },
    { id: 4, name: "Beachfront Villas", status: "completed", progress: 100, value: 20000000 }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex-1 space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t('common.dashboard', 'Dashboard')}
            </h1>
            <p className="text-muted-foreground">
              Welcome back! Here's an overview of your portfolio performance.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button size="sm">
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
              <div className="text-2xl font-bold">{dashboardData.totalProjects}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.activeProjects} active, {dashboardData.completedProjects} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(dashboardData.portfolioValue)}
              </div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                +{formatPercentage(dashboardData.monthlyGrowth)} from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average IRR</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPercentage(dashboardData.averageIRR)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all active projects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projected Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(dashboardData.projectedRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                Next 12 months
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeView} onValueChange={(value: any) => setActiveView(value)} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Recent Projects */}
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Recent Projects</CardTitle>
                  <CardDescription>
                    Your latest project activities and progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentProjects.map((project) => (
                      <div key={project.id} className="flex items-center space-x-4">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium leading-none">
                              {project.name}
                            </p>
                            <Badge 
                              variant={
                                project.status === 'completed' ? 'default' :
                                project.status === 'active' ? 'secondary' : 'outline'
                              }
                              className="ml-auto"
                            >
                              {project.status}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Progress value={project.progress} className="flex-1" />
                            <span className="text-xs text-muted-foreground">
                              {project.progress}%
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Value: {formatCurrency(project.value)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="mr-2 h-5 w-5" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Active Users</span>
                      <span className="font-medium">24</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Pending Reviews</span>
                      <span className="font-medium">7</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">This Month's Revenue</span>
                      <span className="font-medium text-green-600">+12.5%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest updates from your projects</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">Project Marina Heights updated</p>
                        <p className="text-xs text-muted-foreground">Construction phase completed - 2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-4 w-4 text-yellow-500 mt-1" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">Budget review required</p>
                        <p className="text-xs text-muted-foreground">Desert Oasis Resort - 4 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Clock className="h-4 w-4 text-blue-500 mt-1" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">New milestone reached</p>
                        <p className="text-xs text-muted-foreground">City Center Plaza - 1 day ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Team Performance</CardTitle>
                  <CardDescription>Current team metrics and KPIs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Projects On Track</span>
                        <span className="text-sm text-muted-foreground">85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Budget Utilization</span>
                        <span className="text-sm text-muted-foreground">72%</span>
                      </div>
                      <Progress value={72} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Quality Score</span>
                        <span className="text-sm text-muted-foreground">92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Overview</CardTitle>
                <CardDescription>
                  Performance analytics and insights for your portfolio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Advanced Analytics</h3>
                  <p className="text-muted-foreground mb-4">
                    Detailed analytics dashboard will be available here
                  </p>
                  <Button>
                    View Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Projects</CardTitle>
                <CardDescription>
                  Manage and monitor all your real estate projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Projects Overview</h3>
                  <p className="text-muted-foreground mb-4">
                    Detailed project management interface would go here
                  </p>
                  <Button>
                    View All Projects
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}