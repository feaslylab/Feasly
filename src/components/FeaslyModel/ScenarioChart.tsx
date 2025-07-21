import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { BarChart3 } from "lucide-react";
import type { FeaslyModelFormData, ScenarioType } from "./types";

export function ScenarioChart() {
  const { t } = useTranslation('feasly.model');
  const form = useFormContext<FeaslyModelFormData>();

  // Watch key values for calculations
  const constructionCost = form.watch("construction_cost") || 0;
  const landCost = form.watch("land_cost") || 0;
  const softCosts = form.watch("soft_costs") || 0;
  const averageSalePrice = form.watch("average_sale_price") || 0;
  const totalGFA = form.watch("total_gfa_sqm") || 0;
  const targetIRR = form.watch("target_irr") || 15;
  const targetROI = form.watch("target_roi") || 20;

  // Calculate scenario data
  const calculateScenarioMetrics = (multipliers: Record<string, number>) => {
    const adjustedConstructionCost = constructionCost * (multipliers.construction_cost || 1);
    const adjustedSalePrice = averageSalePrice * (multipliers.average_sale_price || 1);
    const adjustedIRR = targetIRR * (multipliers.target_irr || 1);
    const adjustedROI = targetROI * (multipliers.target_roi || 1);
    
    const totalCost = adjustedConstructionCost + landCost + softCosts;
    const totalRevenue = adjustedSalePrice * totalGFA;
    const netProfit = totalRevenue - totalCost;
    
    return {
      netProfit: netProfit / 1000000, // Convert to millions
      irr: adjustedIRR,
      roi: adjustedROI,
      revenue: totalRevenue / 1000000, // Convert to millions
    };
  };

  const scenarioData = [
    {
      scenario: "Base",
      ...calculateScenarioMetrics({
        construction_cost: 1.0,
        average_sale_price: 1.0,
        target_irr: 1.0,
        target_roi: 1.0,
      })
    },
    {
      scenario: "Optimistic",
      ...calculateScenarioMetrics({
        construction_cost: 0.9,
        average_sale_price: 1.15,
        target_irr: 1.2,
        target_roi: 1.25,
      })
    },
    {
      scenario: "Pessimistic",
      ...calculateScenarioMetrics({
        construction_cost: 1.2,
        average_sale_price: 0.9,
        target_irr: 0.8,
        target_roi: 0.75,
      })
    },
    {
      scenario: "Custom",
      ...calculateScenarioMetrics({
        construction_cost: 1.05,
        average_sale_price: 1.05,
        target_irr: 0.95,
        target_roi: 1.1,
      })
    }
  ];

  const formatTooltipValue = (value: number, name: string) => {
    if (name === "netProfit" || name === "revenue") {
      return [`${value.toFixed(1)}M`, name === "netProfit" ? "Net Profit" : "Revenue"];
    }
    return [`${value.toFixed(1)}%`, name === "irr" ? "IRR" : "ROI"];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <CardTitle>{t('feasly.model.scenario_comparison')}</CardTitle>
        </div>
        <CardDescription>
          Compare financial metrics across different scenarios
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={scenarioData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="scenario" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={formatTooltipValue}
                labelClassName="font-medium"
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px"
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: "12px" }}
              />
              <Bar 
                dataKey="netProfit" 
                name="Net Profit (M)" 
                fill="hsl(var(--primary))" 
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="revenue" 
                name="Revenue (M)" 
                fill="hsl(var(--secondary))" 
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="irr" 
                name="IRR (%)" 
                fill="hsl(var(--accent))" 
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="roi" 
                name="ROI (%)" 
                fill="hsl(var(--muted))" 
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t">
          {["Base", "Optimistic", "Pessimistic", "Custom"].map((scenario) => {
            const data = scenarioData.find(d => d.scenario === scenario);
            if (!data) return null;
            
            return (
              <div key={scenario} className="text-center">
                <div className="text-sm font-medium text-muted-foreground">{scenario}</div>
                <div className="text-lg font-bold">{data.netProfit.toFixed(1)}M</div>
                <div className="text-xs text-muted-foreground">Net Profit</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}