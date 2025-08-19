import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, AlertTriangle, Lightbulb, ExternalLink } from "lucide-react";
import { PortfolioProject } from "@/hooks/usePortfolioData";
import { useNavigate } from "react-router-dom";

interface PortfolioInsightsProps {
  topPerformer: PortfolioProject | null;
  riskOutliers: PortfolioProject[];
}

export const PortfolioInsights = ({ topPerformer, riskOutliers }: PortfolioInsightsProps) => {
  const navigate = useNavigate();

  const handleProjectClick = (project: PortfolioProject) => {
    navigate(`/model?project=${project.projectId}&scenario=${project.scenarioId}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Top Performer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Top Performer
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topPerformer ? (
            <div className="space-y-3">
              <div>
                <h4 className="font-medium">{topPerformer.projectName}</h4>
                <p className="text-sm text-muted-foreground">{topPerformer.scenarioName}</p>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">IRR</span>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {(topPerformer.irr || 0).toFixed(1)}%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Asset Type</span>
                <span className="text-sm">{topPerformer.assetType || 'Not specified'}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-3"
                onClick={() => handleProjectClick(topPerformer)}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Project
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No projects available</p>
          )}
        </CardContent>
      </Card>

      {/* Risk Outliers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Risk Outliers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {riskOutliers.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-3">
                {riskOutliers.length} project(s) with IRR below 10%
              </p>
              {riskOutliers.slice(0, 2).map((project) => (
                <div 
                  key={`${project.projectId}-${project.scenarioId}`}
                  className="p-2 border rounded-md cursor-pointer hover:bg-muted/50"
                  onClick={() => handleProjectClick(project)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">{project.projectName}</p>
                      <p className="text-xs text-muted-foreground">{project.scenarioName}</p>
                    </div>
                    <Badge variant="destructive">
                      {(project.irr || 0).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              ))}
              {riskOutliers.length > 2 && (
                <p className="text-xs text-muted-foreground">
                  +{riskOutliers.length - 2} more projects
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">All projects meet risk thresholds</p>
          )}
        </CardContent>
      </Card>

      {/* Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-blue-600" />
            Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Optimize Capital Structure
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Consider increasing debt leverage on high-performing projects to improve equity returns.
              </p>
            </div>
            
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-md">
              <h4 className="text-sm font-medium text-amber-900 dark:text-amber-100">
                Diversification Review
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                Portfolio may benefit from geographic or asset type diversification.
              </p>
            </div>
            
            <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-md">
              <h4 className="text-sm font-medium text-green-900 dark:text-green-100">
                Approval Workflow
              </h4>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                Move draft scenarios through approval process for better governance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};