import { useFormContext } from "react-hook-form";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, AlertTriangle, TrendingDown, Calculator, Ruler, Percent } from "lucide-react";
import type { FeaslyModelFormData } from "./types";

interface Insight {
  icon: React.ReactNode;
  message: string;
  category: string;
  severity: "warning" | "info" | "error";
}

export function AiInsightPanel() {
  const { t } = useLanguage();
  const form = useFormContext<FeaslyModelFormData>();

  // Watch key fields for real-time insights
  const landCost = form.watch("land_cost") || 0;
  const constructionCost = form.watch("construction_cost") || 0;
  const softCosts = form.watch("soft_costs") || 0;
  const equityContribution = form.watch("equity_contribution") || 0;
  const loanAmount = form.watch("loan_amount") || 0;
  const buildableRatio = form.watch("buildable_ratio") || 0;
  const zakatApplicable = form.watch("zakat_applicable") || false;
  const zakatRate = form.watch("zakat_rate_percent") || 0;
  const averageSalePrice = form.watch("average_sale_price") || 0;
  const expectedLeaseRate = form.watch("expected_lease_rate") || 0;
  const targetIRR = form.watch("target_irr") || 0;
  const targetROI = form.watch("target_roi") || 0;

  // Calculate insights based on form data
  const generateInsights = (): Insight[] => {
    const insights: Insight[] = [];
    const totalCost = landCost + constructionCost + softCosts;
    const totalFunding = equityContribution + loanAmount;

    // Funding gap detection
    if (totalCost > 0 && totalFunding > 0 && totalFunding < totalCost) {
      const gap = totalCost - totalFunding;
      insights.push({
        icon: <AlertTriangle className="h-4 w-4" />,
        message: `Funding gap detected: ${gap.toLocaleString()} shortfall`,
        category: "Financial",
        severity: "warning"
      });
    }

    // High buildable ratio warning
    if (buildableRatio > 90) {
      insights.push({
        icon: <Ruler className="h-4 w-4" />,
        message: "Buildable ratio above 90% — verify zoning compliance",
        category: "Risk",
        severity: "warning"
      });
    }

    // No revenue inputs detected
    if (averageSalePrice === 0 && expectedLeaseRate === 0) {
      insights.push({
        icon: <Calculator className="h-4 w-4" />,
        message: "No revenue inputs detected — add sale/lease values",
        category: "Financial",
        severity: "error"
      });
    }

    // Zakat impact notification
    if (zakatApplicable && zakatRate > 0) {
      insights.push({
        icon: <Percent className="h-4 w-4" />,
        message: `Zakat enabled — profit will be reduced by ${zakatRate}%`,
        category: "Financial",
        severity: "info"
      });
    }

    // Low ROI warning
    if (targetROI > 0 && targetROI < 10) {
      insights.push({
        icon: <TrendingDown className="h-4 w-4" />,
        message: "ROI target below 10% — consider cost optimization",
        category: "Performance",
        severity: "warning"
      });
    }

    // High IRR expectation
    if (targetIRR > 25) {
      insights.push({
        icon: <TrendingDown className="h-4 w-4" />,
        message: "IRR target above 25% — validate market assumptions",
        category: "Risk",
        severity: "warning"
      });
    }

    // Construction cost dominance
    if (totalCost > 0 && constructionCost / totalCost > 0.7) {
      insights.push({
        icon: <Calculator className="h-4 w-4" />,
        message: "Construction costs >70% of total — review specifications",
        category: "Financial",
        severity: "info"
      });
    }

    return insights;
  };

  const insights = generateInsights();

  const getSeverityColor = (severity: "warning" | "info" | "error") => {
    switch (severity) {
      case "error":
        return "destructive";
      case "warning":
        return "secondary";
      case "info":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-primary" />
          <CardTitle>AI Insights</CardTitle>
        </div>
        <CardDescription>
          Dynamic insights based on your inputs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No insights available yet</p>
            <p className="text-sm">Enter project data to see AI-powered recommendations</p>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-3 rounded-lg border bg-card/50"
              >
                <div className="flex-shrink-0 mt-0.5 text-muted-foreground">
                  {insight.icon}
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium leading-relaxed">
                    {insight.message}
                  </p>
                  <Badge 
                    variant={getSeverityColor(insight.severity) as any}
                    className="text-xs"
                  >
                    #{insight.category}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}