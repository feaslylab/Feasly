import { useRef, useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Download, TrendingUp, Expand, BarChart2, LineChart as LineChartIcon } from "lucide-react";
import { useFeaslyCalculation } from "@/hooks/useFeaslyCalculation";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ScenarioComparisonChartProps {
  projectId?: string;
}

const SCENARIO_COLORS = {
  base: "hsl(var(--primary))",
  optimistic: "hsl(var(--success))", 
  pessimistic: "hsl(var(--destructive))",
  custom: "hsl(142 71% 55%)"
};

export default function ScenarioComparisonChart({ projectId }: ScenarioComparisonChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const fullscreenChartRef = useRef<HTMLDivElement>(null);
  const [isLineChart, setIsLineChart] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
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
    if (Math.abs(value) >= 1000000) {
      return new Intl.NumberFormat('en-SA', {
        style: 'currency',
        currency: 'SAR',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
        notation: 'compact',
        compactDisplay: 'short'
      }).format(value);
    }
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const exportChart = async (isFullscreenExport = false) => {
    const targetRef = isFullscreenExport ? fullscreenChartRef : chartRef;
    if (!targetRef.current) return;

    try {
      const canvas = await html2canvas(targetRef.current, {
        backgroundColor: 'hsl(var(--background))',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `scenario-comparison-${timestamp}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();

      toast.success("Chart exported successfully");
    } catch (error) {
      console.error('Export failed:', error);
      toast.error("Failed to export chart");
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium mb-2">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: `}
              <span className="font-semibold">
                {entry.name?.includes('ROI') || entry.name?.includes('%') || entry.dataKey === 'roi' || entry.dataKey === 'profitMargin'
                  ? formatPercentage(entry.value)
                  : formatCurrency(entry.value)
                }
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const ChartTypeToggle = () => (
    <div className="flex items-center space-x-2">
      <BarChart2 className="h-4 w-4" />
      <Label htmlFor="chart-type" className="text-sm">Bar</Label>
      <Switch
        id="chart-type"
        checked={isLineChart}
        onCheckedChange={setIsLineChart}
      />
      <Label htmlFor="chart-type" className="text-sm">Line</Label>
      <LineChartIcon className="h-4 w-4" />
    </div>
  );

  const renderChart = (data: any[], dataKeys: string[], isFullscreenView = false) => {
    const height = isFullscreenView ? 600 : 400;
    
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={isLineChart ? 'line' : 'bar'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <ResponsiveContainer width="100%" height={height}>
            {isLineChart ? (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey={dataKeys[0]} 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {dataKeys.slice(1).map((key, index) => {
                  const colors = Object.values(SCENARIO_COLORS);
                  return (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      name={key.charAt(0).toUpperCase() + key.slice(1)}
                    />
                  );
                })}
              </LineChart>
            ) : (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey={dataKeys[0]} 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {dataKeys.slice(1).map((key, index) => {
                  const colors = Object.values(SCENARIO_COLORS);
                  return (
                    <Bar
                      key={key}
                      dataKey={key}
                      fill={colors[index % colors.length]}
                      name={key.charAt(0).toUpperCase() + key.slice(1)}
                      radius={[2, 2, 0, 0]}
                    />
                  );
                })}
              </BarChart>
            )}
          </ResponsiveContainer>
        </motion.div>
      </AnimatePresence>
    );
  };

  if (!hasData) {
    return (
      <Card className="feasly-chart-card">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Generate cashflow data to see scenario comparison</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const metricData = getMetricComparisonData();
  const comparisonData = getScenarioComparisonData();

  return (
    <Card className="feasly-chart-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="feasly-title flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Scenario Comparison Analysis
          </CardTitle>
          <div className="flex items-center gap-2">
            <ChartTypeToggle />
            <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Expand className="h-4 w-4 mr-2" />
                  Expand Chart
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl h-[80vh]">
                <DialogHeader>
                  <DialogTitle className="flex items-center justify-between">
                    <span className="feasly-title flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Scenario Comparison Analysis - Fullscreen
                    </span>
                    <Button variant="outline" size="sm" onClick={() => exportChart(true)}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Chart
                    </Button>
                  </DialogTitle>
                </DialogHeader>
                <div ref={fullscreenChartRef} className="flex-1">
                  <Tabs defaultValue="by-scenario" className="w-full h-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="by-scenario">By Scenario</TabsTrigger>
                      <TabsTrigger value="by-metric">By Metric</TabsTrigger>
                    </TabsList>

                    <TabsContent value="by-scenario" className="mt-6">
                      {renderChart(metricData, ['scenario', 'profit', 'roi', 'finalCashBalance'], true)}
                    </TabsContent>

                    <TabsContent value="by-metric" className="mt-6">
                      {renderChart(comparisonData, ['metric', 'base', 'optimistic', 'pessimistic', 'custom'], true)}
                    </TabsContent>
                  </Tabs>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" onClick={() => exportChart(false)}>
              <Download className="h-4 w-4 mr-2" />
              Export Chart
            </Button>
          </div>
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
              {renderChart(metricData, ['scenario', 'profit', 'roi', 'finalCashBalance'])}
            </TabsContent>

            <TabsContent value="by-metric" className="mt-6">
              {renderChart(comparisonData, ['metric', 'base', 'optimistic', 'pessimistic', 'custom'])}
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}