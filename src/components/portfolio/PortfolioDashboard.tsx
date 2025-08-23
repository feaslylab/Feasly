import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Portfolio Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                No portfolio projects found. Create your first portfolio to get started.
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Portfolio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PortfolioKPICards kpis={portfolioKPIs} />
      <PortfolioProjectsList projects={portfolioProjects} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PortfolioInsights 
          topPerformer={topPerformer}
          riskOutliers={riskOutliers}
        />
        <PortfolioExportPanel />
      </div>
    </div>
  );
};