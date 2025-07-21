import { useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, TrendingUp } from "lucide-react";
import { useFeaslyCalculation } from "@/hooks/useFeaslyCalculation";
import html2canvas from "html2canvas";
import { toast } from "sonner";

interface ScenarioComparisonChartProps {
  projectId?: string;
}

const SCENARIO_COLORS = {
  base: "#3b82f6",
  optimistic: "#10b981", 
  pessimistic: "#ef4444",
  custom: "#8b5cf6"
};

export default function ScenarioComparisonChart({ projectId }: ScenarioComparisonChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const { compareScenarios, getScenarioSummary, hasData } = useFeaslyCalculation(projectId);

  const scenarios = compareScenarios();

  // Prepare data for different chart views
  const getMetricComparisonData = () => {
    return scenarios.map(({ scenario, summary }) => ({
      scenario: scenario.charAt(0).toUpperCase() + scenario.slice(1),
      profit: summary?.totalProfit || 0,
      profitMargin: summary?.profitMargin || 0,
      finalCashBalance: summary?.finalCashBalance || 0,
      roi: ((summary?.totalProfit || 0) / (summary?.totalCosts || 1)) * 100,
    }));
  };

  const getScenarioComparisonData = () => {
    const metrics = ['Total Profit', 'ROI %', 'Final Cash Balance'];
    return metrics.map(metric => {
      const data: any = { metric };
      scenarios.forEach(({ scenario, summary }) => {
        switch (metric) {
          case 'Total Profit':
            data[scenario] = summary?.totalProfit || 0;
            break;
          case 'ROI %':
            data[scenario] = ((summary?.totalProfit || 0) / (summary?.totalCosts || 1)) * 100;
            break;
          case 'Final Cash Balance':
            data[scenario] = summary?.finalCashBalance || 0;
            break;
        }
      });
      return data;
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: value > 1000000 ? 'compact' : 'standard'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const exportChart = async () => {
    if (!chartRef.current) return;

    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
      });

      const link = document.createElement('a');
      link.download = `scenario-comparison-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL();
      link.click();

      toast.success("Chart exported successfully");
    } catch (error) {
      console.error('Export failed:', error);
      toast.error("Failed to export chart");
    }
  };

  if (!hasData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Generate cashflow data to see scenario comparison</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Scenario Comparison Analysis
          </CardTitle>
          <Button variant="outline" size="sm" onClick={exportChart}>
            <Download className="h-4 w-4 mr-2" />
            Export Chart
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div ref={chartRef}>
          <Tabs defaultValue="by-scenario" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="by-scenario">By Scenario</TabsTrigger>
              <TabsTrigger value="by-metric">By Metric</TabsTrigger>
            </TabsList>

            <TabsContent value="by-scenario" className="mt-6">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={getMetricComparisonData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="scenario" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      if (name === 'roi' || name === 'profitMargin') {
                        return [formatPercentage(value), name];
                      }
                      return [formatCurrency(value), name];
                    }}
                  />
                  <Legend />
                  <Bar dataKey="profit" fill={SCENARIO_COLORS.base} name="Total Profit" />
                  <Bar dataKey="roi" fill={SCENARIO_COLORS.optimistic} name="ROI %" />
                  <Bar dataKey="finalCashBalance" fill={SCENARIO_COLORS.custom} name="Final Cash Balance" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="by-metric" className="mt-6">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={getScenarioComparisonData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      if (name.includes('ROI')) {
                        return [formatPercentage(value), name];
                      }
                      return [formatCurrency(value), name];
                    }}
                  />
                  <Legend />
                  <Bar dataKey="base" fill={SCENARIO_COLORS.base} name="Base" />
                  <Bar dataKey="optimistic" fill={SCENARIO_COLORS.optimistic} name="Optimistic" />
                  <Bar dataKey="pessimistic" fill={SCENARIO_COLORS.pessimistic} name="Pessimistic" />
                  <Bar dataKey="custom" fill={SCENARIO_COLORS.custom} name="Custom" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}