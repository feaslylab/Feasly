import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, 
  LineChart, Line, ScatterChart, Scatter, Tooltip as RechartsTooltip, Legend
} from "recharts";
import { format } from "date-fns";
import { chartHelpers } from "@/theme/chartPalette";
import { useTheme } from "next-themes";

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

interface ScenarioChartsProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
}

export default function ScenarioCharts({ projects, onProjectClick }: ScenarioChartsProps) {
  const { theme } = useTheme();
  
  // Get theme-aware colors from chart palette
  const colors = chartHelpers.getFinancialColors(theme === 'dark' ? 'dark' : 'light');
  
  // Chart data preparations
  const bubbleChartData = projects.map(p => ({
    name: p.name,
    x: p.irr,
    y: p.roi,
    z: p.totalGFA / 1000, // Scale down for visualization
    status: p.status,
    id: p.id
  }));

  const lineChartData = useMemo(() => {
    const monthlyData: Record<string, { month: string; revenue: number; cost: number }> = {};
    
    projects.forEach(project => {
      const monthKey = format(project.createdAt, 'yyyy-MM');
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: format(project.createdAt, 'MMM yyyy'),
          revenue: 0,
          cost: 0
        };
      }
      monthlyData[monthKey].revenue += project.estimatedRevenue;
      monthlyData[monthKey].cost += project.constructionCost;
    });

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  }, [projects]);

  const scenarioComparisonData = useMemo(() => {
    const scenarios = ['Base', 'Optimistic', 'Pessimistic', 'Custom'];
    return scenarios.map(scenario => {
      const scenarioProjects = projects.filter(p => p.scenario === scenario);
      const avgIRR = scenarioProjects.length > 0 ? 
        scenarioProjects.reduce((sum, p) => sum + p.irr, 0) / scenarioProjects.length : 0;
      const totalNetProfit = scenarioProjects.reduce((sum, p) => sum + p.netProfit, 0);
      const totalRevenue = scenarioProjects.reduce((sum, p) => sum + p.estimatedRevenue, 0);
      
      return {
        scenario,
        irr: avgIRR,
        netProfit: totalNetProfit / 1000000, // In millions
        revenue: totalRevenue / 1000000 // In millions
      };
    });
  }, [projects]);

  const topProjectsData = projects
    .sort((a, b) => b.irr - a.irr)
    .slice(0, 5)
    .map(p => ({
      name: p.name,
      irr: p.irr,
      id: p.id
    }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* IRR vs ROI Bubble Chart */}
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle>IRR vs ROI Analysis</CardTitle>
          <CardDescription>Bubble size represents GFA. Click projects for details.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={bubbleChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" name="IRR" unit="%" />
              <YAxis dataKey="y" name="ROI" unit="%" />
              <RechartsTooltip 
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload[0]) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-card p-3 border rounded shadow-elevation-2">
                        <p className="font-medium">{data.name}</p>
                        <p>IRR: {data.x}%</p>
                        <p>ROI: {data.y}%</p>
                        <p>Status: {data.status}</p>
                        <p className="text-xs text-muted-foreground mt-1">Click to view details</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter 
                dataKey="z" 
                fill={colors.profit} 
                onClick={(data) => {
                  const project = projects.find(p => p.id === data.id);
                  if (project) onProjectClick(project);
                }}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Revenue vs Cost Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue vs Cost Timeline</CardTitle>
          <CardDescription>Monthly cumulative values</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke={colors.revenue} name="Revenue" />
              <Line type="monotone" dataKey="cost" stroke={colors.cost} name="Cost" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Scenario Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Scenario Comparison</CardTitle>
          <CardDescription>IRR and profit by scenario type</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={scenarioComparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="scenario" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="irr" fill={colors.profit} name="IRR %" />
              <Bar dataKey="netProfit" fill={colors.revenue} name="Net Profit (M)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Projects by IRR</CardTitle>
          <CardDescription>Highest performing projects - click to view details</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProjectsData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={120} />
              <RechartsTooltip />
              <Bar 
                dataKey="irr" 
                fill={colors.profit}
                onClick={(data) => {
                  const project = projects.find(p => p.id === data.id);
                  if (project) onProjectClick(project);
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}