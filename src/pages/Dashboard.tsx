import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, FolderPlus, PieChart, TrendingUp, Users, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { QuickStartGuide } from "@/components/onboarding/QuickStartGuide";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const onboarding = localStorage.getItem('user-onboarding');
    const hasSeenQuickStart = localStorage.getItem('quickstart-dismissed');
    
    if (!onboarding) {
      setIsNewUser(true);
    } else if (!hasSeenQuickStart) {
      setShowQuickStart(true);
    }
  }, []);

  const handleDismissQuickStart = () => {
    setShowQuickStart(false);
    localStorage.setItem('quickstart-dismissed', 'true');
  };

  const handleGetStarted = () => {
    toast({
      title: "Welcome to Feasly!",
      description: "Let's create your first project to get started.",
    });
    navigate(PATHS.projectsNew);
  };

  const quickActions = [
    {
      title: "New Project",
      description: "Create a new financial model",
      icon: FolderPlus,
      action: () => navigate(PATHS.projectsNew),
      variant: "default" as const
    },
    {
      title: "View Projects",
      description: "Manage existing projects",
      icon: BarChart3,
      action: () => navigate(PATHS.projects),
      variant: "outline" as const
    },
    {
      title: "Portfolio Management",
      description: "Create and manage portfolios",
      icon: PieChart,
      action: () => navigate(PATHS.portfolio),
      variant: "outline" as const
    }
  ];

  const stats = [
    { label: "Total Projects", value: "0", icon: BarChart3 },
    { label: "Active Portfolios", value: "0", icon: PieChart },
    { label: "Team Members", value: "1", icon: Users },
    { label: "Models Created", value: "0", icon: TrendingUp }
  ];

  if (isNewUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Welcome to Feasly!</CardTitle>
            <CardDescription className="text-base">
              Your comprehensive platform for financial modeling and portfolio management. 
              Let's get you started with your first project.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 border rounded-lg">
                <FolderPlus className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="font-medium">Create Projects</div>
                <div className="text-muted-foreground">Build financial models</div>
              </div>
              <div className="p-3 border rounded-lg">
                <PieChart className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="font-medium">Manage Portfolios</div>
                <div className="text-muted-foreground">Track multiple investments</div>
              </div>
              <div className="p-3 border rounded-lg">
                <TrendingUp className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="font-medium">Analyze Performance</div>
                <div className="text-muted-foreground">Generate insights</div>
              </div>
            </div>
            <Button size="lg" onClick={handleGetStarted} className="w-full">
              Create Your First Project
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's an overview of your projects and portfolios.
          </p>
        </div>
        <Badge variant="secondary">Free Plan</Badge>
      </div>

      {/* Quick Start Guide */}
      {showQuickStart && (
        <QuickStartGuide onDismiss={handleDismissQuickStart} />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks to get you started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant}
                onClick={action.action}
                className="h-auto p-4 flex flex-col items-start space-y-2"
              >
                <div className="flex items-center space-x-2 w-full">
                  <action.icon className="h-5 w-5" />
                  <span className="font-medium">{action.title}</span>
                </div>
                <span className="text-sm opacity-80 text-left">
                  {action.description}
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your latest projects and portfolio updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No activity yet</p>
            <p className="text-sm">
              Create your first project to see activity here
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate(PATHS.projectsNew)}
            >
              Create Project
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}