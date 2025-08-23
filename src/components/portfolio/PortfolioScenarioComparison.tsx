import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { AssetWithScenarios } from "@/hooks/usePortfolioAssets";
import type { ScenarioSet, PortfolioComparison } from "./PortfolioResultsPanel";

interface PortfolioScenarioComparisonProps {
  assets: AssetWithScenarios[];
  portfolioId: string;
  onComparisonChange: (comparison: PortfolioComparison | null) => void;
}

export const PortfolioScenarioComparison = ({ 
  assets, 
  portfolioId, 
  onComparisonChange 
}: PortfolioScenarioComparisonProps) => {
  const [comparisonMode, setComparisonMode] = useState<string>("none");
  const [scenarioSets, setScenarioSets] = useState<ScenarioSet[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (comparisonMode !== "none") {
      generateScenarioSets();
    } else {
      onComparisonChange(null);
    }
  }, [comparisonMode, assets]);

  const generateScenarioSets = async () => {
    setLoading(true);
    try {
      const sets: ScenarioSet[] = [];
      
      // Current Setup (what user has configured)
      const currentSet: ScenarioSet = {
        id: "current",
        name: "Current Setup",
        description: "User-configured scenario mapping",
        assets: assets.map(asset => ({
          assetId: asset.id,
          scenarioId: asset.portfolio_scenario_id || "",
          scenarioName: asset.scenarios.find(s => s.id === asset.portfolio_scenario_id)?.name || "Base"
        }))
      };
      sets.push(currentSet);

      // Base Scenarios
      const baseSet: ScenarioSet = {
        id: "base",
        name: "Base Scenarios",
        description: "All assets using their base scenarios",
        assets: assets.map(asset => {
          const baseScenario = asset.scenarios.find(s => s.is_base) || asset.scenarios[0];
          return {
            assetId: asset.id,
            scenarioId: baseScenario.id,
            scenarioName: baseScenario.name
          };
        })
      };
      sets.push(baseSet);

      if (comparisonMode === "full") {
        // Try to identify optimistic/pessimistic scenarios based on naming
        const optimisticSet: ScenarioSet = {
          id: "optimistic",
          name: "Optimistic Scenarios",
          description: "Best-case scenario mapping",
          assets: assets.map(asset => {
            const optimisticScenario = asset.scenarios.find(s => 
              s.name.toLowerCase().includes('optimistic') || 
              s.name.toLowerCase().includes('best') ||
              s.name.toLowerCase().includes('high')
            ) || asset.scenarios.find(s => s.is_base) || asset.scenarios[0];
            
            return {
              assetId: asset.id,
              scenarioId: optimisticScenario.id,
              scenarioName: optimisticScenario.name
            };
          })
        };
        sets.push(optimisticSet);

        const pessimisticSet: ScenarioSet = {
          id: "pessimistic", 
          name: "Pessimistic Scenarios",
          description: "Conservative scenario mapping",
          assets: assets.map(asset => {
            const pessimisticScenario = asset.scenarios.find(s => 
              s.name.toLowerCase().includes('pessimistic') || 
              s.name.toLowerCase().includes('conservative') ||
              s.name.toLowerCase().includes('worst') ||
              s.name.toLowerCase().includes('low')
            ) || asset.scenarios.find(s => s.is_base) || asset.scenarios[0];
            
            return {
              assetId: asset.id,
              scenarioId: pessimisticScenario.id,
              scenarioName: pessimisticScenario.name
            };
          })
        };
        sets.push(pessimisticSet);
      }

      setScenarioSets(sets);

      // Calculate KPIs for each scenario set (mock data for now)
      const kpis: Record<string, any> = {};
      const assetBreakdown: Record<string, Record<string, any>> = {};
      
      sets.forEach(set => {
        // Mock KPI calculation - in real implementation, this would 
        // call the calculation engine for each scenario set
        const baseNPV = 5000000;
        const variation = set.id === "optimistic" ? 1.2 : 
                         set.id === "pessimistic" ? 0.8 : 1.0;
        
        kpis[set.id] = {
          totalNPV: baseNPV * variation,
          weightedIRR: 15.5 * variation,
          weightedROI: 22.3 * variation,
          equityMultiple: 2.1 * variation,
          profitMargin: 18.7 * variation,
          totalRevenue: 12000000 * variation,
          totalCosts: 9500000 * variation,
          paybackMonths: Math.round(36 / variation)
        };

        assetBreakdown[set.id] = {};
        assets.forEach(asset => {
          assetBreakdown[set.id][asset.id] = {
            npv: 1500000 * variation,
            irr: 17.2 * variation,
            roi: 24.1 * variation,
            weight: asset.portfolio_weight
          };
        });
      });

      const comparison: PortfolioComparison = {
        scenarioSets: sets,
        kpis,
        assetBreakdown
      };

      onComparisonChange(comparison);
      
    } catch (error) {
      console.error('Error generating scenario sets:', error);
      toast({
        title: "Comparison Error",
        description: "Failed to generate scenario comparison. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceIndicator = (current: number, base: number) => {
    const delta = ((current - base) / base) * 100;
    if (Math.abs(delta) < 1) {
      return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
    return delta > 0 ? 
      <TrendingUp className="h-4 w-4 text-green-600" /> : 
      <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getPerformanceColor = (current: number, base: number) => {
    const delta = ((current - base) / base) * 100;
    if (Math.abs(delta) < 1) return "text-muted-foreground";
    return delta > 0 ? "text-green-600" : "text-red-600";
  };

  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scenario Comparison</CardTitle>
        <p className="text-sm text-muted-foreground">
          Compare portfolio performance across different scenario mappings
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="comparison-mode">Comparison Mode</Label>
          <Select 
            value={comparisonMode} 
            onValueChange={setComparisonMode}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select comparison mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Comparison</SelectItem>
              <SelectItem value="base">Compare with Base Scenarios</SelectItem>
              <SelectItem value="full">Full Scenario Analysis</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {comparisonMode !== "none" && scenarioSets.length > 0 && (
          <div className="space-y-4">
            <div className="grid gap-2">
              <h4 className="font-medium">Scenario Sets:</h4>
              <div className="flex flex-wrap gap-2">
                {scenarioSets.map(set => (
                  <Badge key={set.id} variant="outline">
                    {set.name}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>
                Comparison analysis will be displayed in the Portfolio Results panel.
                Switch to the "Scenario Comparison" tab to view detailed metrics.
              </p>
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-4 text-muted-foreground">
            Generating scenario comparison...
          </div>
        )}
      </CardContent>
    </Card>
  );
};