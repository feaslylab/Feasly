import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { FeaslyModelFormData, ScenarioType } from "./types";

export function SensitivityAnalysis() {
  const { t } = useTranslation('feasly.model');
  const form = useFormContext<FeaslyModelFormData>();

  // Watch base values
  const constructionCost = form.watch("construction_cost") || 0;
  const averageSalePrice = form.watch("average_sale_price") || 0;
  const yieldEstimate = form.watch("yield_estimate") || 0;
  const targetIRR = form.watch("target_irr") || 0;
  const currencyCode = form.watch("currency_code") || "SAR";

  // Define scenario multipliers for sensitivity analysis
  const scenarios: Record<ScenarioType, { name: string; multipliers: Record<string, number> }> = {
    base: {
      name: "Base Case",
      multipliers: {
        construction_cost: 1.0,
        average_sale_price: 1.0,
        yield_estimate: 1.0,
        target_irr: 1.0,
      }
    },
    optimistic: {
      name: "Optimistic",
      multipliers: {
        construction_cost: 0.9, // 10% cost reduction
        average_sale_price: 1.15, // 15% higher prices
        yield_estimate: 1.1, // 10% higher yield
        target_irr: 1.2, // 20% higher returns
      }
    },
    pessimistic: {
      name: "Pessimistic", 
      multipliers: {
        construction_cost: 1.2, // 20% cost increase
        average_sale_price: 0.9, // 10% lower prices
        yield_estimate: 0.85, // 15% lower yield
        target_irr: 0.8, // 20% lower returns
      }
    },
    custom: {
      name: "Custom",
      multipliers: {
        construction_cost: 1.05, // 5% increase
        average_sale_price: 1.05, // 5% increase
        yield_estimate: 0.95, // 5% decrease
        target_irr: 0.95, // 5% decrease
      }
    }
  };

  const getVarianceIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-3 w-3 text-green-600" />;
    if (change < 0) return <TrendingDown className="h-3 w-3 text-red-600" />;
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  const getVarianceBadge = (baseValue: number, scenarioValue: number) => {
    if (baseValue === 0) return <Badge variant="secondary">--</Badge>;
    
    const change = ((scenarioValue - baseValue) / baseValue) * 100;
    const variant = change > 0 ? "default" : change < 0 ? "destructive" : "secondary";
    
    return (
      <Badge variant={variant} className="text-xs flex items-center space-x-1">
        {getVarianceIcon(change)}
        <span>{change > 0 ? "+" : ""}{change.toFixed(1)}%</span>
      </Badge>
    );
  };

  const formatCurrency = (value: number) => {
    return `${value.toLocaleString()} ${currencyCode}`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const rows = [
    {
      label: "Construction Cost",
      baseValue: constructionCost,
      format: formatCurrency,
      key: "construction_cost"
    },
    {
      label: "Average Sale Price",
      baseValue: averageSalePrice,
      format: formatCurrency,
      key: "average_sale_price"
    },
    {
      label: "Yield Estimate",
      baseValue: yieldEstimate,
      format: formatPercentage,
      key: "yield_estimate"
    },
    {
      label: "Target IRR",
      baseValue: targetIRR,
      format: formatPercentage,
      key: "target_irr"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <CardTitle>{t('sensitivity_analysis')}</CardTitle>
        </div>
        <CardDescription>
          Compare key financial inputs across different scenarios
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-48">Financial Input</TableHead>
                {Object.entries(scenarios).map(([key, scenario]) => (
                  <TableHead key={key} className="text-center min-w-32">
                    {scenario.name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.key}>
                  <TableCell className="font-medium">{row.label}</TableCell>
                  {Object.entries(scenarios).map(([scenarioKey, scenario]) => {
                    const multiplier = scenario.multipliers[row.key] || 1;
                    const scenarioValue = row.baseValue * multiplier;
                    const isBase = scenarioKey === "base";
                    
                    return (
                      <TableCell key={scenarioKey} className="text-center">
                        <div className="space-y-1">
                          <div className="font-mono text-sm">
                            {row.format(scenarioValue)}
                          </div>
                          {!isBase && (
                            getVarianceBadge(row.baseValue, scenarioValue)
                          )}
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}