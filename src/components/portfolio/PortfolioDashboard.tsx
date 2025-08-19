import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { usePortfolioData } from "@/hooks/usePortfolioData";
import { PortfolioKPICards } from "./PortfolioKPICards";
import { PortfolioProjectsList } from "./PortfolioProjectsList";
import { PortfolioInsights } from "./PortfolioInsights";
import { PortfolioExportPanel } from "./PortfolioExportPanel";

export const PortfolioDashboard = () => {
  const { portfolioProjects, portfolioKPIs, getTopPerformer, getRiskOutliers } = usePortfolioData();
  
  const topPerformer = getTopPerformer();
  const riskOutliers = getRiskOutliers();

  if (portfolioProjects.length === 0) {
    return (
      <div className="space-y-6">
        {/* Empty State */}
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-center max-w-md">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Welcome to Feasly Portfolio</h3>
              <p className="text-muted-foreground mb-6">
                Your portfolio consolidation dashboard will appear here once you have created and run scenarios.
              </p>
              <div className="space-y-3">
                <Button size="lg" onClick={() => window.location.href = '/projects/new'}>
                  Create Your First Project
                </Button>
                <p className="text-sm text-muted-foreground">
                  Or try the <a href="/demo" className="text-primary underline">demo project</a> to see how it works
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Portfolio Overview</h1>
          <p className="text-muted-foreground">
            Consolidated view of all your projects and scenarios
          </p>
        </div>
        <div className="flex gap-3">
          <PortfolioExportPanel />
        </div>
      </div>

      {/* KPI Cards */}
      <PortfolioKPICards kpis={portfolioKPIs} />

      {/* Insights */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Portfolio Insights</h2>
        <PortfolioInsights 
          topPerformer={topPerformer} 
          riskOutliers={riskOutliers} 
        />
      </div>

      {/* Projects List */}
      <div>
        <PortfolioProjectsList projects={portfolioProjects} />
      </div>
    </div>
  );
};