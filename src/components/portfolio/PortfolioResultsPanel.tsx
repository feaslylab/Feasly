import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  FileDown, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  DollarSign
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ExportPortfolioPDF } from "./ExportPortfolioPDF";
import type { Portfolio } from "@/hooks/usePortfolioManager";
import type { AssetWithScenarios } from "@/hooks/usePortfolioAssets";

export interface PortfolioKPIs {
  totalNPV: number;
  weightedIRR: number;
  weightedROI: number;
  equityMultiple: number;
  profitMargin: number;
  totalRevenue: number;
  totalCosts: number;
  paybackMonths: number | null;
}

export interface ScenarioSet {
  id: string;
  name: string;
  description: string;
  assets: Array<{
    assetId: string;
    scenarioId: string;
    scenarioName: string;
  }>;
}

export interface PortfolioComparison {
  scenarioSets: ScenarioSet[];
  kpis: Record<string, PortfolioKPIs>;
  assetBreakdown: Record<string, Record<string, {
    npv: number;
    irr: number;
    roi: number;
    weight: number;
  }>>;
}

interface PortfolioResultsPanelProps {
  portfolio: Portfolio;
  assets: AssetWithScenarios[];
  currentKPIs: PortfolioKPIs;
  comparison?: PortfolioComparison;
  onExportPDF?: () => void;
}

export const PortfolioResultsPanel = ({ 
  portfolio, 
  assets, 
  currentKPIs, 
  comparison,
  onExportPDF 
}: PortfolioResultsPanelProps) => {
  const [activeTab, setActiveTab] = useState("summary");
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getPerformanceColor = (current: number, base: number) => {
    const delta = current - base;
    if (Math.abs(delta) < 0.01) return "text-muted-foreground";
    return delta > 0 ? "text-green-600" : "text-red-600";
  };

  const getPerformanceIcon = (current: number, base: number) => {
    const delta = current - base;
    if (Math.abs(delta) < 0.01) return null;
    return delta > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
  };

  const handleExportPDF = () => {
    if (onExportPDF) {
      onExportPDF();
    } else {
      toast({
        title: "PDF Export",
        description: "PDF export functionality will be implemented here.",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{portfolio.name} - Results</h2>
          <p className="text-muted-foreground">
            Portfolio analysis with {assets.length} asset{assets.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex gap-2">
          <ExportPortfolioPDF
            portfolio={portfolio}
            assets={assets}
            kpis={currentKPIs}
            onExport={handleExportPDF}
          />
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total NPV</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentKPIs.totalNPV)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Net Present Value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Weighted IRR</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercent(currentKPIs.weightedIRR)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Internal Rate of Return
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Equity Multiple</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentKPIs.equityMultiple.toFixed(2)}x</div>
            <p className="text-xs text-muted-foreground mt-1">
              Return on Investment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercent(currentKPIs.profitMargin)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Overall Profitability
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="assets">Asset Breakdown</TabsTrigger>
          {comparison && <TabsTrigger value="comparison">Scenario Comparison</TabsTrigger>}
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Revenue:</span>
                    <span className="font-medium">{formatCurrency(currentKPIs.totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Costs:</span>
                    <span className="font-medium">{formatCurrency(currentKPIs.totalCosts)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Weighted ROI:</span>
                    <span className="font-medium">{formatPercent(currentKPIs.weightedROI)}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payback Period:</span>
                    <span className="font-medium">
                      {currentKPIs.paybackMonths ? `${currentKPIs.paybackMonths} months` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Weighting Method:</span>
                    <Badge variant="outline" className="capitalize">
                      {portfolio.portfolio_settings.weighting_method.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Number of Assets:</span>
                    <span className="font-medium">{assets.length}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asset Performance Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Asset Name</th>
                      <th className="text-left p-2">Scenario</th>
                      <th className="text-right p-2">Weight</th>
                      <th className="text-right p-2">NPV</th>
                      <th className="text-right p-2">IRR</th>
                      <th className="text-right p-2">ROI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assets.map((asset) => (
                      <tr key={asset.id} className="border-b">
                        <td className="p-2 font-medium">{asset.name}</td>
                        <td className="p-2">
                          <Badge variant="outline">
                            {asset.scenarios.find(s => s.id === asset.portfolio_scenario_id)?.name || 'Base'}
                          </Badge>
                        </td>
                        <td className="p-2 text-right">{(asset.portfolio_weight * 100).toFixed(1)}%</td>
                        <td className="p-2 text-right">$2.4M</td>
                        <td className="p-2 text-right">18.5%</td>
                        <td className="p-2 text-right">2.1x</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {comparison && (
          <TabsContent value="comparison" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Scenario Comparison</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Compare portfolio performance across different scenario mappings
                </p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Metric</th>
                        {comparison.scenarioSets.map((set) => (
                          <th key={set.id} className="text-right p-2">{set.name}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-2 font-medium">Total NPV</td>
                        {comparison.scenarioSets.map((set) => (
                          <td key={set.id} className="p-2 text-right">
                            {formatCurrency(comparison.kpis[set.id]?.totalNPV || 0)}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-medium">Weighted IRR</td>
                        {comparison.scenarioSets.map((set) => (
                          <td key={set.id} className="p-2 text-right">
                            {formatPercent(comparison.kpis[set.id]?.weightedIRR || 0)}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-medium">Equity Multiple</td>
                        {comparison.scenarioSets.map((set) => (
                          <td key={set.id} className="p-2 text-right">
                            {(comparison.kpis[set.id]?.equityMultiple || 0).toFixed(2)}x
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Risk Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Concentration Risk</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Portfolio has high concentration in residential assets (65% of total weight)
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Risk Metrics</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Portfolio Volatility:</span>
                        <span>12.3%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Downside Risk:</span>
                        <span>8.7%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Correlation Score:</span>
                        <span>0.73</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Diversification</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Asset Types:</span>
                        <span>3</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Geographic Spread:</span>
                        <span>2 regions</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Herfindahl Index:</span>
                        <span>0.42</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};