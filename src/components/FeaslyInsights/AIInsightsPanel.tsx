import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, AlertTriangle, Search, TrendingUp } from "lucide-react";

interface Project {
  id: string;
  name: string;
  totalGFA: number;
  constructionCost: number;
  estimatedRevenue: number;
  irr: number;
  roi: number;
  profitMargin: number;
  netProfit: number;
  status: 'Planning' | 'Development' | 'Construction' | 'Completed';
  currency: string;
  createdAt: Date;
  scenario: 'Base' | 'Optimistic' | 'Pessimistic' | 'Custom';
  country?: string;
  city?: string;
}

interface AIInsightsPanelProps {
  projects: Project[];
  allProjects: Project[];
  onProjectClick: (project: Project) => void;
}

export default function AIInsightsPanel({ projects, allProjects, onProjectClick }: AIInsightsPanelProps) {
  // AI Insight calculations
  const topOpportunities = projects
    .filter(p => p.irr > 18 && p.netProfit > 5000000)
    .sort((a, b) => b.irr - a.irr)
    .slice(0, 3);

  const riskAlerts = projects
    .filter(p => p.roi < 5 || p.profitMargin < 10 || p.netProfit < 0);

  const dataGaps = projects
    .filter(p => !p.totalGFA || !p.estimatedRevenue || !p.constructionCost);

  const scenarioSensitivity = projects.filter(p => {
    const optimisticVersion = allProjects.find(op => 
      op.name === p.name && op.scenario === 'Optimistic'
    );
    return optimisticVersion && optimisticVersion.irr >= p.irr * 1.2;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-success/20">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <Lightbulb className="h-5 w-5 text-success mr-2" />
          <CardTitle className="text-sm font-medium text-success-foreground">Top Opportunities</CardTitle>
        </CardHeader>
        <CardContent>
          {topOpportunities.length > 0 ? (
            <div className="space-y-2">
              {topOpportunities.map(project => (
                <div 
                  key={project.id} 
                  className="text-sm cursor-pointer hover:bg-success/10 p-2 rounded"
                  onClick={() => onProjectClick(project)}
                >
                  <div className="font-medium">{project.name}</div>
                  <div className="text-success">IRR: {project.irr.toFixed(1)}%</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No high-opportunity projects found</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-destructive/20">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <AlertTriangle className="h-5 w-5 text-destructive mr-2" />
          <CardTitle className="text-sm font-medium text-destructive-foreground">Risk Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          {riskAlerts.length > 0 ? (
            <div className="space-y-2">
              {riskAlerts.slice(0, 3).map(project => (
                <div 
                  key={project.id} 
                  className="text-sm cursor-pointer hover:bg-destructive/10 p-2 rounded"
                  onClick={() => onProjectClick(project)}
                >
                  <div className="font-medium">{project.name}</div>
                  <div className="text-destructive">
                    {project.netProfit < 0 ? 'Negative profit' : 
                     project.roi < 5 ? 'Low ROI' : 'Low margin'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No risk alerts</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-warning/20">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <Search className="h-5 w-5 text-warning mr-2" />
          <CardTitle className="text-sm font-medium text-warning-foreground">Data Gaps</CardTitle>
        </CardHeader>
        <CardContent>
          {dataGaps.length > 0 ? (
            <div className="space-y-2">
              {dataGaps.slice(0, 3).map(project => (
                <div 
                  key={project.id} 
                  className="text-sm cursor-pointer hover:bg-warning/10 p-2 rounded"
                  onClick={() => onProjectClick(project)}
                >
                  <div className="font-medium">{project.name}</div>
                  <div className="text-warning">Missing key data</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">All data complete</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-primary/20">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <TrendingUp className="h-5 w-5 text-primary mr-2" />
          <CardTitle className="text-sm font-medium text-primary-foreground">Scenario Sensitivity</CardTitle>
        </CardHeader>
        <CardContent>
          {scenarioSensitivity.length > 0 ? (
            <div className="space-y-2">
              {scenarioSensitivity.slice(0, 3).map(project => (
                <div 
                  key={project.id} 
                  className="text-sm cursor-pointer hover:bg-primary/10 p-2 rounded"
                  onClick={() => onProjectClick(project)}
                >
                  <div className="font-medium">{project.name}</div>
                  <div className="text-primary">High sensitivity</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Low scenario sensitivity</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}