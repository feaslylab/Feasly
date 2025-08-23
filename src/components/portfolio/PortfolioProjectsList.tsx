import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building } from "lucide-react";
import type { PortfolioProject } from "@/hooks/usePortfolioData";

interface PortfolioProjectsListProps {
  projects: PortfolioProject[];
}

export const PortfolioProjectsList = ({ projects }: PortfolioProjectsListProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';  
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (projects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Portfolio Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No projects in portfolio yet.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Portfolio Projects
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {projects.map((project) => (
            <div 
              key={project.id} 
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{project.name}</h4>
                  <Badge className={getRiskColor(project.risk)}>
                    {project.risk} risk
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium text-foreground">NPV:</span>
                    <div>{formatCurrency(project.npv)}</div>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">IRR:</span>
                    <div>{project.irr.toFixed(1)}%</div>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Weight:</span>
                    <div>{(project.weight * 100).toFixed(0)}%</div>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Scenario:</span>
                    <div className="capitalize">{project.scenario}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};