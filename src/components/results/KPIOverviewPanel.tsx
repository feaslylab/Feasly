import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUp, 
  ArrowDown, 
  Minus,
  Download,
  Share2,
  Info,
  Target,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { fmtCurrency, fmtPct, fmtMult } from '@/lib/formatters';

export interface KPIMetrics {
  npv: number;
  irr_pa: number;
  equity_multiple: number;
  profit_pct: number;
  project_value: number;
  total_cost: number;
  roi: number;
  dscr_min?: number;
  cash_on_cash?: number;
  payback_months?: number;
}

export interface KPIOverviewPanelProps {
  kpis: {
    base: KPIMetrics;
    optimistic?: KPIMetrics;
    pessimistic?: KPIMetrics;
  };
  currency: string;
}

interface KPICardData {
  key: keyof KPIMetrics;
  title: string;
  format: 'currency' | 'percentage' | 'number' | 'months';
  tooltip: string;
  benchmark?: {
    excellent: number;
    good: number;
    warning: number;
  };
  reverseScale?: boolean; // For metrics where lower is better
}

const KPI_DEFINITIONS: KPICardData[] = [
  {
    key: 'npv',
    title: 'Net Present Value',
    format: 'currency',
    tooltip: 'Present value of all future cash flows discounted at the required rate of return',
    benchmark: { excellent: 50000000, good: 20000000, warning: 5000000 }
  },
  {
    key: 'irr_pa',
    title: 'IRR (pa)',
    format: 'percentage',
    tooltip: 'Internal Rate of Return - the annualized return on equity investment',
    benchmark: { excellent: 0.20, good: 0.15, warning: 0.10 }
  },
  {
    key: 'equity_multiple',
    title: 'Equity Multiple',
    format: 'number',
    tooltip: 'Total cash return divided by equity invested',
    benchmark: { excellent: 2.5, good: 1.8, warning: 1.3 }
  },
  {
    key: 'profit_pct',
    title: 'Total Profit %',
    format: 'percentage',
    tooltip: 'Total profit margin on project cost',
    benchmark: { excellent: 0.50, good: 0.30, warning: 0.15 }
  },
  {
    key: 'project_value',
    title: 'Project Value',
    format: 'currency',
    tooltip: 'Total gross development value of the project'
  },
  {
    key: 'total_cost',
    title: 'Total Cost',
    format: 'currency',
    tooltip: 'All-in project cost including construction, land, and soft costs'
  },
  {
    key: 'roi',
    title: 'ROI',
    format: 'percentage',
    tooltip: 'Return on Investment - profit divided by initial investment',
    benchmark: { excellent: 0.40, good: 0.25, warning: 0.15 }
  },
  {
    key: 'dscr_min',
    title: 'DSCR (Min)',
    format: 'number',
    tooltip: 'Minimum Debt Service Coverage Ratio across project lifecycle',
    benchmark: { excellent: 1.5, good: 1.2, warning: 1.1 }
  },
  {
    key: 'cash_on_cash',
    title: 'Cash Yield',
    format: 'percentage',
    tooltip: 'Annual cash return as percentage of equity invested',
    benchmark: { excellent: 0.12, good: 0.08, warning: 0.05 }
  },
  {
    key: 'payback_months',
    title: 'Payback Period',
    format: 'months',
    tooltip: 'Time to recover initial equity investment',
    benchmark: { excellent: 24, good: 36, warning: 48 },
    reverseScale: true
  }
];

function formatKPIValue(value: number, format: KPICardData['format'], currency: string): string {
  switch (format) {
    case 'currency':
      return fmtCurrency(value, currency);
    case 'percentage':
      return fmtPct(value);
    case 'number':
      return fmtMult(value);
    case 'months':
      return `${Math.round(value)} months`;
    default:
      return value.toString();
  }
}

function getBenchmarkStatus(
  value: number, 
  benchmark?: KPICardData['benchmark'], 
  reverseScale = false
): 'excellent' | 'good' | 'warning' | 'poor' | 'neutral' {
  if (!benchmark) return 'neutral';
  
  const { excellent, good, warning } = benchmark;
  
  if (reverseScale) {
    // Lower is better (e.g., payback period)
    if (value <= excellent) return 'excellent';
    if (value <= good) return 'good';
    if (value <= warning) return 'warning';
    return 'poor';
  } else {
    // Higher is better (e.g., IRR, NPV)
    if (value >= excellent) return 'excellent';
    if (value >= good) return 'good';
    if (value >= warning) return 'warning';
    return 'poor';
  }
}

function getBenchmarkIcon(status: string) {
  switch (status) {
    case 'excellent':
      return <CheckCircle className="h-4 w-4 text-success" />;
    case 'good':
      return <TrendingUp className="h-4 w-4 text-success" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-warning" />;
    case 'poor':
      return <TrendingDown className="h-4 w-4 text-destructive" />;
    default:
      return <Minus className="h-4 w-4 text-muted-foreground" />;
  }
}

function getBenchmarkColor(status: string): string {
  switch (status) {
    case 'excellent':
    case 'good':
      return 'text-success';
    case 'warning':
      return 'text-warning';
    case 'poor':
      return 'text-destructive';
    default:
      return 'text-foreground';
  }
}

function calculateDelta(current: number, base: number): { percentage: number; direction: 'up' | 'down' | 'neutral' } {
  const delta = ((current - base) / base) * 100;
  return {
    percentage: Math.abs(delta),
    direction: delta > 0.1 ? 'up' : delta < -0.1 ? 'down' : 'neutral'
  };
}

function DeltaIndicator({ current, base }: { current: number; base: number }) {
  const delta = calculateDelta(current, base);
  
  if (delta.direction === 'neutral') {
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  }
  
  const Icon = delta.direction === 'up' ? ArrowUp : ArrowDown;
  const colorClass = delta.direction === 'up' ? 'text-success' : 'text-destructive';
  
  return (
    <div className={`flex items-center gap-1 ${colorClass}`}>
      <Icon className="h-3 w-3" />
      <span className="text-xs font-medium">{delta.percentage.toFixed(1)}%</span>
    </div>
  );
}

function KPICard({ 
  kpiData, 
  metrics, 
  baseMetrics, 
  currency, 
  showBenchmarks, 
  showDeltas 
}: {
  kpiData: KPICardData;
  metrics: KPIMetrics;
  baseMetrics?: KPIMetrics;
  currency: string;
  showBenchmarks: boolean;
  showDeltas: boolean;
}) {
  const value = metrics[kpiData.key];
  if (value === undefined || value === null) return null;
  
  const formattedValue = formatKPIValue(value, kpiData.format, currency);
  const benchmarkStatus = getBenchmarkStatus(value, kpiData.benchmark, kpiData.reverseScale);
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className="hover:shadow-md transition-all duration-200 cursor-help">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-muted-foreground">{kpiData.title}</h4>
                  <div className="flex items-center gap-2">
                    {showBenchmarks && getBenchmarkIcon(benchmarkStatus)}
                    {showDeltas && baseMetrics && (
                      <DeltaIndicator current={value} base={baseMetrics[kpiData.key] || value} />
                    )}
                  </div>
                </div>
                
                <div className={`text-2xl font-bold ${getBenchmarkColor(benchmarkStatus)}`}>
                  {formattedValue}
                </div>
                
                {showBenchmarks && benchmarkStatus !== 'neutral' && (
                  <Badge 
                    variant={benchmarkStatus === 'excellent' || benchmarkStatus === 'good' ? 'default' : 
                             benchmarkStatus === 'warning' ? 'secondary' : 'destructive'}
                    className="text-xs"
                  >
                    {benchmarkStatus.charAt(0).toUpperCase() + benchmarkStatus.slice(1)}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{kpiData.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function FeasibilityGrade({ kpis }: { kpis: KPIMetrics }): { grade: string; color: string; description: string } {
  let score = 0;
  let validMetrics = 0;
  
  KPI_DEFINITIONS.forEach(def => {
    const value = kpis[def.key];
    if (value !== undefined && value !== null && def.benchmark) {
      validMetrics++;
      const status = getBenchmarkStatus(value, def.benchmark, def.reverseScale);
      switch (status) {
        case 'excellent': score += 4; break;
        case 'good': score += 3; break;
        case 'warning': score += 2; break;
        case 'poor': score += 1; break;
      }
    }
  });
  
  if (validMetrics === 0) return { grade: 'N/A', color: 'text-muted-foreground', description: 'Insufficient data' };
  
  const avgScore = score / validMetrics;
  
  if (avgScore >= 3.5) return { grade: 'A', color: 'text-success', description: 'Excellent feasibility' };
  if (avgScore >= 2.5) return { grade: 'B', color: 'text-success', description: 'Good feasibility' };
  if (avgScore >= 1.5) return { grade: 'C', color: 'text-warning', description: 'Acceptable feasibility' };
  return { grade: 'D', color: 'text-destructive', description: 'Poor feasibility' };
}

export function KPIOverviewPanel({ kpis, currency }: KPIOverviewPanelProps) {
  const [activeScenario, setActiveScenario] = useState<'base' | 'optimistic' | 'pessimistic'>('base');
  const [showComparison, setShowComparison] = useState(false);
  const [showBenchmarks, setShowBenchmarks] = useState(true);
  
  const currentMetrics = kpis[activeScenario];
  const hasMultipleScenarios = Boolean(kpis.optimistic || kpis.pessimistic);
  const feasibilityGrade = FeasibilityGrade({ kpis: currentMetrics });
  
  const handleExportPDF = () => {
    // TODO: Implement PDF export
    console.log('Exporting KPI summary to PDF...');
  };
  
  const handleShareLink = () => {
    // TODO: Implement share link generation
    console.log('Generating shareable link...');
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Financial KPIs</h2>
          <p className="text-muted-foreground">Key performance indicators and benchmarks</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${feasibilityGrade.color} bg-muted/50`}>
            Grade: {feasibilityGrade.grade}
          </div>
          
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleShareLink}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-muted/30 rounded-xl">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Show Benchmarks</span>
          <Switch checked={showBenchmarks} onCheckedChange={setShowBenchmarks} />
        </div>
        
        {hasMultipleScenarios && (
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Compare All</span>
            <Switch checked={showComparison} onCheckedChange={setShowComparison} />
          </div>
        )}
      </div>
      
      {/* Content */}
      {showComparison && hasMultipleScenarios ? (
        // Comparison View
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {KPI_DEFINITIONS.map(kpiData => {
              const baseValue = kpis.base[kpiData.key];
              if (baseValue === undefined || baseValue === null) return null;
              
              return (
                <Card key={kpiData.key} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {kpiData.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* Base */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Base</span>
                        <span className="font-semibold">
                          {formatKPIValue(baseValue, kpiData.format, currency)}
                        </span>
                      </div>
                      
                      {/* Optimistic */}
                      {kpis.optimistic?.[kpiData.key] && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Optimistic</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">
                              {formatKPIValue(kpis.optimistic[kpiData.key]!, kpiData.format, currency)}
                            </span>
                            <DeltaIndicator 
                              current={kpis.optimistic[kpiData.key]!} 
                              base={baseValue} 
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Pessimistic */}
                      {kpis.pessimistic?.[kpiData.key] && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Pessimistic</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">
                              {formatKPIValue(kpis.pessimistic[kpiData.key]!, kpiData.format, currency)}
                            </span>
                            <DeltaIndicator 
                              current={kpis.pessimistic[kpiData.key]!} 
                              base={baseValue} 
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        // Scenario Tabs View
        <Tabs value={activeScenario} onValueChange={(v) => setActiveScenario(v as any)}>
          {hasMultipleScenarios && (
            <TabsList className="mb-6">
              <TabsTrigger value="base">Base Case</TabsTrigger>
              {kpis.optimistic && <TabsTrigger value="optimistic">Optimistic</TabsTrigger>}
              {kpis.pessimistic && <TabsTrigger value="pessimistic">Pessimistic</TabsTrigger>}
            </TabsList>
          )}
          
          <TabsContent value={activeScenario} className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {KPI_DEFINITIONS.map(kpiData => (
                <KPICard
                  key={kpiData.key}
                  kpiData={kpiData}
                  metrics={currentMetrics}
                  baseMetrics={activeScenario !== 'base' ? kpis.base : undefined}
                  currency={currency}
                  showBenchmarks={showBenchmarks}
                  showDeltas={activeScenario !== 'base'}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
      
      {/* Feasibility Summary */}
      <Card className="bg-gradient-to-r from-muted/30 to-background">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Feasibility Assessment</h3>
              <p className="text-muted-foreground">{feasibilityGrade.description}</p>
            </div>
            <div className={`text-6xl font-bold ${feasibilityGrade.color}`}>
              {feasibilityGrade.grade}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}