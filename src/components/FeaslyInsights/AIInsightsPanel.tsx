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
      <Card className="border-green-200">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <Lightbulb className="h-5 w-5 text-green-600 mr-2" />
          <CardTitle className="text-sm font-medium text-green-800">Top Opportunities</CardTitle>
        </CardHeader>
        <CardContent>
          {topOpportunities.length > 0 ? (
            <div className="space-y-2">
              {topOpportunities.map(project => (
                <div 
                  key={project.id} 
                  className="text-sm cursor-pointer hover:bg-green-50 p-2 rounded"
                  onClick={() => onProjectClick(project)}
                >
                  <div className="font-medium">{project.name}</div>
                  <div className="text-green-600">IRR: {project.irr.toFixed(1)}%</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No high-opportunity projects found</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
          <CardTitle className="text-sm font-medium text-red-800">Risk Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          {riskAlerts.length > 0 ? (
            <div className="space-y-2">
              {riskAlerts.slice(0, 3).map(project => (
                <div 
                  key={project.id} 
                  className="text-sm cursor-pointer hover:bg-red-50 p-2 rounded"
                  onClick={() => onProjectClick(project)}
                >
                  <div className="font-medium">{project.name}</div>
                  <div className="text-red-600">
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

      <Card className="border-yellow-200">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <Search className="h-5 w-5 text-yellow-600 mr-2" />
          <CardTitle className="text-sm font-medium text-yellow-800">Data Gaps</CardTitle>
        </CardHeader>
        <CardContent>
          {dataGaps.length > 0 ? (
            <div className="space-y-2">
              {dataGaps.slice(0, 3).map(project => (
                <div 
                  key={project.id} 
                  className="text-sm cursor-pointer hover:bg-yellow-50 p-2 rounded"
                  onClick={() => onProjectClick(project)}
                >
                  <div className="font-medium">{project.name}</div>
                  <div className="text-yellow-600">Missing key data</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">All data complete</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-blue-200">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
          <CardTitle className="text-sm font-medium text-blue-800">Scenario Sensitivity</CardTitle>
        </CardHeader>
        <CardContent>
          {scenarioSensitivity.length > 0 ? (
            <div className="space-y-2">
              {scenarioSensitivity.slice(0, 3).map(project => (
                <div 
                  key={project.id} 
                  className="text-sm cursor-pointer hover:bg-blue-50 p-2 rounded"
                  onClick={() => onProjectClick(project)}
                >
                  <div className="font-medium">{project.name}</div>
                  <div className="text-blue-600">High sensitivity</div>
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