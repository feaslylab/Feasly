import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { KPIBenchmarkBadge } from "@/components/ui/kpi-benchmark-badge";
import { AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react";
import { useFeaslyCalculation } from "@/hooks/useFeaslyCalculation";
import { useBenchmarks } from "@/hooks/useBenchmarks";
import { formatCurrency } from "@/lib/currencyUtils";
import type { FeaslyModelFormData } from "./types";

interface SmartInsightsPanelProps {
  projectId?: string;
}

type InsightSeverity = "success" | "warning" | "error" | "info";

interface Insight {
  title: string;
  description: string;
  severity: InsightSeverity;
  value?: string;
  scenario?: string;
}

const severityConfig = {
  success: {
    icon: CheckCircle,
    className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    alertVariant: "default" as const
  },
  warning: {
    icon: AlertTriangle,
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    alertVariant: "default" as const
  },
  error: {
    icon: XCircle,
    className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    alertVariant: "destructive" as const
  },
  info: {
    icon: Info,
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    alertVariant: "default" as const
  }
};

export default function SmartInsightsPanel({ projectId }: SmartInsightsPanelProps) {
  const { compareScenarios, getScenarioSummary, hasData } = useFeaslyCalculation(projectId);
  const { getBenchmarkByAssetType } = useBenchmarks();

  const generateInsights = (): Insight[] => {
    if (!hasData) return [];

    const insights: Insight[] = [];
    const benchmark = getBenchmarkByAssetType("Commercial"); // Default to Commercial for now
    const scenarios = compareScenarios();

    scenarios.forEach(({ scenario, summary, data }) => {
      if (!summary || !data.length) return;

      const scenarioName = scenario.charAt(0).toUpperCase() + scenario.slice(1);
      
      // Calculate IRR (simplified - using profit margin as proxy)
      const estimatedIRR = summary.profitMargin;
      
      // IRR Analysis
      if (estimatedIRR < 10) {
        insights.push({
          title: "Low Return Warning",
          description: `IRR of ${estimatedIRR.toFixed(1)}% is below recommended 10% threshold`,
          severity: "error",
          value: `${estimatedIRR.toFixed(1)}%`,
          scenario: scenarioName
        });
      } else if (estimatedIRR > 25) {
        insights.push({
          title: "Excellent Returns",
          description: `IRR of ${estimatedIRR.toFixed(1)}% indicates strong investment potential`,
          severity: "success",
          value: `${estimatedIRR.toFixed(1)}%`,
          scenario: scenarioName
        });
      }

      // Payback Period Analysis (simplified calculation)
      const paybackPeriod = summary.timelineMonths;
      if (paybackPeriod > 60) { // 5 years
        insights.push({
          title: "Long Payback Risk",
          description: `Payback period of ${Math.round(paybackPeriod / 12)} years may indicate high risk`,
          severity: "warning",
          value: `${Math.round(paybackPeriod / 12)} years`,
          scenario: scenarioName
        });
      }

      // Negative Cashflow Analysis
      const negativeCashflowMonths = data.filter(month => month.netCashflow < 0).length;
      if (negativeCashflowMonths > data.length * 0.5) {
        insights.push({
          title: "Cash Flow Risk",
          description: `${negativeCashflowMonths} out of ${data.length} months show negative cashflow`,
          severity: "error",
          value: `${Math.round((negativeCashflowMonths / data.length) * 100)}%`,
          scenario: scenarioName
        });
      }

      // Zakat Impact Analysis
      const totalZakat = summary.totalZakat || 0;
      const zakatImpact = totalZakat > 0 ? (totalZakat / summary.totalProfit) * 100 : 0;
      if (zakatImpact > 5) {
        insights.push({
          title: "Significant Zakat Impact",
          description: `Zakat reduces profit by ${zakatImpact.toFixed(1)}%`,
          severity: "warning",
          value: `${zakatImpact.toFixed(1)}%`,
          scenario: scenarioName
        });
      }

      // Profit Margin Analysis
      if (summary.profitMargin < 15) {
        insights.push({
          title: "Low Profit Margin",
          description: `Profit margin of ${summary.profitMargin.toFixed(1)}% may indicate tight economics`,
          severity: "warning",
          value: `${summary.profitMargin.toFixed(1)}%`,
          scenario: scenarioName
        });
      } else if (summary.profitMargin > 30) {
        insights.push({
          title: "Strong Profit Margin",
          description: `Profit margin of ${summary.profitMargin.toFixed(1)}% indicates healthy returns`,
          severity: "success",
          value: `${summary.profitMargin.toFixed(1)}%`,
          scenario: scenarioName
        });
      }

      // Final Cash Balance Analysis
      if (summary.finalCashBalance < 0) {
        insights.push({
          title: "Negative Final Balance",
          description: "Project ends with negative cash balance requiring additional funding",
          severity: "error",
          value: new Intl.NumberFormat('en-SA', {
            style: 'currency',
            currency: 'SAR',
            notation: 'compact'
          }).format(summary.finalCashBalance),
          scenario: scenarioName
        });
      }
    });

    // Cross-scenario insights
    if (scenarios.length > 1) {
      const bestScenario = scenarios.reduce((best, current) => 
        (current.summary?.totalProfit || 0) > (best.summary?.totalProfit || 0) ? current : best
      );
      
      const worstScenario = scenarios.reduce((worst, current) => 
        (current.summary?.totalProfit || 0) < (worst.summary?.totalProfit || 0) ? current : worst
      );

      const profitDifference = (bestScenario.summary?.totalProfit || 0) - (worstScenario.summary?.totalProfit || 0);
      
      if (profitDifference > 1000000) { // 1M SAR difference
        insights.push({
          title: "High Scenario Variance",
          description: `Profit varies by ${new Intl.NumberFormat('en-SA', {
            style: 'currency',
            currency: 'SAR',
            notation: 'compact'
          }).format(profitDifference)} between best and worst scenarios`,
          severity: "info",
          value: "High Risk"
        });
      }
    }

    // Benchmark comparison insights
    const baseSummary = getScenarioSummary("base");
    if (benchmark && baseSummary) {
      const roiVariance = ((baseSummary.totalProfit / (baseSummary.totalCosts || 1)) * 100) - benchmark.avg_roi;
      const profitMarginVariance = baseSummary.profitMargin - benchmark.avg_profit_margin;
      
      if (roiVariance > 5) {
        insights.push({
          title: "Excellent ROI Performance",
          description: `Your project's ROI is ${roiVariance.toFixed(1)}% above industry benchmark for commercial projects.`,
          severity: "success",
          value: `+${roiVariance.toFixed(1)}%`,
          scenario: "base"
        });
      } else if (roiVariance < -5) {
        insights.push({
          title: "ROI Below Benchmark",
          description: `Your project's ROI is ${Math.abs(roiVariance).toFixed(1)}% below industry benchmark. Consider cost optimization.`,
          severity: "warning",
          value: `${roiVariance.toFixed(1)}%`,
          scenario: "base"
        });
      }
      
      if (profitMarginVariance > 3) {
        insights.push({
          title: "Strong Profit Margins",
          description: `Your profit margin exceeds industry benchmark by ${profitMarginVariance.toFixed(1)}%.`,
          severity: "success",
          value: `+${profitMarginVariance.toFixed(1)}%`,
          scenario: "base"
        });
      }
    }

    return insights;
  };

  const insights = generateInsights();
  const groupedInsights = insights.reduce((acc, insight) => {
    if (!acc[insight.severity]) acc[insight.severity] = [];
    acc[insight.severity].push(insight);
    return acc;
  }, {} as Record<InsightSeverity, Insight[]>);

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Smart Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Generate cashflow data to see intelligent insights and risk analysis
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Smart Insights & Risk Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-semibold text-green-600">All scenarios look healthy!</p>
            <p className="text-muted-foreground">No significant risks or issues detected</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedInsights).map(([severity, severityInsights]) => {
              const config = severityConfig[severity as InsightSeverity];
              const Icon = config.icon;
              
              return (
                <div key={severity} className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Icon className="h-4 w-4" />
                    {severity.charAt(0).toUpperCase() + severity.slice(1)} Issues ({severityInsights.length})
                  </div>
                  {severityInsights.map((insight, index) => (
                    <Alert key={index} variant={config.alertVariant}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{insight.title}</span>
                            {insight.scenario && (
                              <Badge variant="outline" className="text-xs">
                                {insight.scenario}
                              </Badge>
                            )}
                          </div>
                          <AlertDescription>{insight.description}</AlertDescription>
                        </div>
                        {insight.value && (
                          <Badge className={config.className}>
                            {insight.value}
                          </Badge>
                        )}
                      </div>
                    </Alert>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}