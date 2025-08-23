/**
 * Consolidated Results Panel - Display aggregated KPIs and child project breakdown
 * Shows consolidated financial metrics and individual project contributions
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Building2, PieChart, Settings } from "lucide-react";
import { ConsolidatedResult } from "@/types/consolidation";
import { KPIOverviewPanel } from "@/components/results/KPIOverviewPanel";
import { fmtCurrency, fmtPct, fmtMult } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface ConsolidatedResultsPanelProps {
  result: ConsolidatedResult;
  onChildProjectClick?: (projectId: string) => void;
  onSettingsClick?: () => void;
}

export function ConsolidatedResultsPanel({ 
  result, 
  onChildProjectClick,
  onSettingsClick 
}: ConsolidatedResultsPanelProps) {
  const { children, totals, aggregationBreakdown, consolidationSettings } = result;

  return (
    <div className="space-y-6">
      {/* Header with consolidation info */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Consolidated Portfolio</CardTitle>
              <p className="text-sm text-muted-foreground">
                {children.length} projects • Weighted by {consolidationSettings.weightingMethod}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <PieChart className="h-3 w-3" />
              Consolidated
            </Badge>
            {onSettingsClick && (
              <Button variant="outline" size="sm" onClick={onSettingsClick}>
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Main tabs for different views */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="breakdown">Project Breakdown</TabsTrigger>
          <TabsTrigger value="composition">Portfolio Composition</TabsTrigger>
        </TabsList>

        {/* Overview Tab - Main KPIs */}
        <TabsContent value="overview" className="space-y-4">
          <KPIOverviewPanel 
            kpis={{ base: totals }}
            currency="AED"
          />
          
          {/* Aggregation Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Portfolio Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="font-semibold">{fmtCurrency(aggregationBreakdown.totalRevenue)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Cost</p>
                  <p className="font-semibold">{fmtCurrency(aggregationBreakdown.totalCost)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Equity</p>
                  <p className="font-semibold">{fmtCurrency(aggregationBreakdown.totalEquity)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total GFA</p>
                  <p className="font-semibold">{aggregationBreakdown.totalGFA?.toLocaleString()} sqm</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Project Breakdown Tab */}
        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid gap-4">
            {children.map((child) => (
              <Card key={child.projectId} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{child.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Weight: {fmtPct(child.weight || 0)}
                        </p>
                      </div>
                    </div>
                    {onChildProjectClick && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onChildProjectClick(child.projectId)}
                      >
                        View Details
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">NPV</p>
                      <p className="font-medium">{fmtCurrency(child.metrics.npv)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">IRR</p>
                      <p className="font-medium">{fmtPct(child.metrics.irr_pa)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">ROI</p>
                      <p className="font-medium">{fmtPct(child.metrics.roi)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Equity Multiple</p>
                      <p className="font-medium">{fmtMult(child.metrics.equity_multiple)}</p>
                    </div>
                  </div>

                  {child.warnings.length > 0 && (
                    <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        {child.warnings.length} warning(s) detected
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Portfolio Composition Tab */}
        <TabsContent value="composition" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Composition</CardTitle>
              <p className="text-sm text-muted-foreground">
                Contribution breakdown by project
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {children.map((child) => (
                  <div key={child.projectId} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{child.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {fmtPct(child.weight || 0)} weight
                      </span>
                    </div>
                    
                    {/* Progress bar for weight visualization */}
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary rounded-full h-2 transition-all"
                        style={{ width: `${(child.weight || 0) * 100}%` }}
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Revenue</p>
                        <p>{fmtCurrency(child.contribution.revenue)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Equity</p>
                        <p>{fmtCurrency(child.contribution.equity)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">GFA</p>
                        <p>{child.contribution.gfa?.toLocaleString()} sqm</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weighting Method Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Weighting Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="capitalize">
                  {consolidationSettings.weightingMethod}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Projects are weighted by {consolidationSettings.weightingMethod} for aggregation calculations
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}