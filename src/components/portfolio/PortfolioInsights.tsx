import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, AlertTriangle } from "lucide-react";
import type { PortfolioProject } from "@/hooks/usePortfolioData";

interface PortfolioInsightsProps {
  topPerformer: PortfolioProject | null;
  riskOutliers: PortfolioProject[];
}

export const PortfolioInsights = ({ topPerformer, riskOutliers }: PortfolioInsightsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Portfolio Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {topPerformer && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">Top Performer</span>
            </div>
            <div className="text-sm text-green-700">
              <div className="font-medium">{topPerformer.name}</div>
              <div>IRR: {topPerformer.irr.toFixed(1)}% | Weight: {(topPerformer.weight * 100).toFixed(0)}%</div>
            </div>
          </div>
        )}

        {riskOutliers.length > 0 && (
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="font-medium text-red-800">High Risk Projects</span>
            </div>
            <div className="space-y-2">
              {riskOutliers.map((project) => (
                <div key={project.id} className="text-sm text-red-700">
                  <div className="font-medium">{project.name}</div>
                  <div>Weight: {(project.weight * 100).toFixed(0)}% | Consider risk mitigation</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!topPerformer && riskOutliers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No insights available yet. Add projects to your portfolio to see performance analysis.
          </div>
        )}
      </CardContent>
    </Card>
  );
};