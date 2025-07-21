import { useState, useMemo, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Download, TrendingUp } from "lucide-react";
import html2canvas from "html2canvas";
import { useFeaslyVersions } from "@/hooks/useFeaslyVersions";
import { formatCurrency } from "@/lib/currencyUtils";
import type { FeaslyModelFormData } from "./types";

interface CashflowVarianceChartProps {
  projectId: string;
}

type MetricType = "netCashflow" | "revenue" | "profit" | "cashBalance";
type ChartType = "line" | "bar";

const metricLabels = {
  netCashflow: "Net Cashflow",
  revenue: "Revenue", 
  profit: "Profit",
  cashBalance: "Cash Balance"
};

const scenarioColors = {
  base: "#2563eb",      // Blue
  optimistic: "#16a34a", // Green  
  pessimistic: "#dc2626", // Red
  custom: "#7c3aed"      // Purple
};

export function CashflowVarianceChart({ projectId }: CashflowVarianceChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>("netCashflow");
  const [chartType, setChartType] = useState<ChartType>("line");
  const chartRef = useRef<HTMLDivElement>(null);

  // Watch currency code from form context
  const form = useFormContext<FeaslyModelFormData>();
  const currencyCode = form?.watch("currency_code") || "SAR";

  const { 
    getScenarioData,
    hasData,
    isLoadingCashflow 
  } = useFeaslyVersions(projectId);

  // Transform data for chart
  const chartData = useMemo(() => {
    if (!hasData) return [];

    const scenarios = ['base', 'optimistic', 'pessimistic', 'custom'] as const;
    const scenarioData = scenarios.map(scenario => ({
      scenario,
      data: getScenarioData(scenario)
    })).filter(s => s.data.length > 0);

    if (scenarioData.length === 0) return [];

    // Get all unique months from all scenarios
    const allMonths = new Set<string>();
    scenarioData.forEach(({ data }) => {
      data.forEach(month => allMonths.add(month.month));
    });

    const sortedMonths = Array.from(allMonths).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA.getTime() - dateB.getTime();
    });

    // Create chart data structure
    return sortedMonths.map(month => {
      const monthData: any = { month };
      
      scenarioData.forEach(({ scenario, data }) => {
        const monthRecord = data.find(d => d.month === month);
        if (monthRecord) {
          let value = 0;
          switch (selectedMetric) {
            case "netCashflow":
              value = monthRecord.netCashflow;
              break;
            case "revenue":
              value = monthRecord.revenue;
              break;
            case "profit":
              value = monthRecord.profit;
              break;
            case "cashBalance":
              value = monthRecord.cashBalance;
              break;
          }
          monthData[scenario] = value;
        } else {
          monthData[scenario] = 0;
        }
      });

      return monthData;
    });
  }, [hasData, getScenarioData, selectedMetric]);

  const handleExportChart = async () => {
    if (!chartRef.current) return;

    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      
      const link = document.createElement('a');
      link.download = `cashflow-variance-${selectedMetric}-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Failed to export chart:', error);
    }
  };

  // Use currency utility with dynamic currency code
  const formatAmount = (value: number) => {
    return formatCurrency(value, { currencyCode });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.dataKey.charAt(0).toUpperCase() + entry.dataKey.slice(1)}: {formatAmount(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoadingCashflow) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Cashflow Variance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading cashflow data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasData || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Cashflow Variance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">No cashflow data available. Generate forecast to see variance analysis.</div>
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
            Cashflow Variance Analysis
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleExportChart}>
            <Download className="h-4 w-4 mr-2" />
            Export PNG
          </Button>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-6 pt-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="metric-select">Metric:</Label>
            <Select value={selectedMetric} onValueChange={(value: MetricType) => setSelectedMetric(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(metricLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="chart-type">Chart Type:</Label>
            <div className="flex items-center gap-2">
              <Label htmlFor="line-chart">Line</Label>
              <Switch
                id="chart-type"
                checked={chartType === "bar"}
                onCheckedChange={(checked) => setChartType(checked ? "bar" : "line")}
              />
              <Label htmlFor="bar-chart">Bar</Label>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div ref={chartRef} className="w-full h-96">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "line" ? (
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatAmount(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                {Object.entries(scenarioColors).map(([scenario, color]) => (
                  <Line
                    key={scenario}
                    type="monotone"
                    dataKey={scenario}
                    stroke={color}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name={scenario.charAt(0).toUpperCase() + scenario.slice(1)}
                    connectNulls={false}
                  />
                ))}
              </LineChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatAmount(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                {Object.entries(scenarioColors).map(([scenario, color]) => (
                  <Bar
                    key={scenario}
                    dataKey={scenario}
                    fill={color}
                    name={scenario.charAt(0).toUpperCase() + scenario.slice(1)}
                  />
                ))}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}