import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { calculateFinancialMetrics } from "@/lib/financialCalculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend
} from "recharts";
import { TrendingUp, DollarSign, Clock, Calculator } from "lucide-react";
import { 
  getExchangeRates, 
  getExchangeRate, 
  convertCurrency,
  type ExchangeRate 
} from "@/lib/currencyConversion";

interface Asset {
  id: string;
  gfa_sqm: number;
  construction_cost_aed: number;
  annual_operating_cost_aed: number;
  annual_revenue_aed: number;
  occupancy_rate_percent: number;
  cap_rate_percent: number;
  development_timeline_months: number;
  stabilization_period_months: number;
}

interface ProjectAnalyticsProps {
  projectId: string;
  assets: Asset[];
  projectCurrency?: string;
}

const formatCurrency = (amount: number, currency: string = "AED") => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatPercentage = (value: number) => {
  return `${value.toFixed(1)}%`;
};

const formatYears = (years: number) => {
  if (years < 0) return "No payback";
  if (years > 10) return ">10 years";
  return `${years.toFixed(1)} years`;
};

const COLORS = {
  'Base Case': 'hsl(var(--chart-revenue))',
  'Optimistic': 'hsl(var(--chart-cost))', 
  'Pessimistic': 'hsl(var(--chart-profit))'
};

const PIE_COLORS = ['hsl(var(--chart-revenue))', 'hsl(var(--chart-cost))'];

export const ProjectAnalytics = ({ projectId, assets, projectCurrency = "AED" }: ProjectAnalyticsProps) => {
  // Fetch exchange rates
  const { data: exchangeRates = [] } = useQuery({
    queryKey: ["exchange-rates"],
    queryFn: getExchangeRates,
  });
  // Fetch all scenarios
  const { data: scenarios } = useQuery({
    queryKey: ["scenarios-analytics", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scenarios")
        .select("*")
        .eq("project_id", projectId)
        .order("name", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });

  // Fetch all scenario overrides
  const { data: allOverrides, isLoading } = useQuery({
    queryKey: ["all-scenario-overrides", projectId],
    queryFn: async () => {
      if (!scenarios) return [];
      
      const scenarioIds = scenarios.map(s => s.id);
      const { data, error } = await supabase
        .from("scenario_overrides")
        .select("*")
        .in("scenario_id", scenarioIds);

      if (error) throw error;
      return data;
    },
    enabled: !!scenarios && scenarios.length > 0,
  });

  if (isLoading || !scenarios || !allOverrides || !assets) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // If no scenarios exist, show a message
  if (!scenarios || scenarios.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Financial Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Scenarios Found</h3>
              <p className="text-muted-foreground">
                Create scenarios in the Scenarios tab to see detailed analytics and projections
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate metrics for all scenarios
  const scenarioMetrics = scenarios.map(scenario => {
    const scenarioOverrides = allOverrides.filter(o => o.scenario_id === scenario.id);
    const metrics = calculateFinancialMetrics(assets, scenarioOverrides);
    
    // Use name as type fallback, or determine type from name
    let scenarioType = scenario.name;
    if (scenario.is_base) {
      scenarioType = "Base Case";
    } else if (scenario.name?.toLowerCase().includes('optimistic')) {
      scenarioType = "Optimistic";
    } else if (scenario.name?.toLowerCase().includes('pessimistic')) {
      scenarioType = "Pessimistic";
    }
    
    return {
      scenario: scenario.name,
      type: scenarioType,
      ...metrics
    };
  });

  // Prepare data for charts
  const irrData = scenarioMetrics.map(m => ({
    scenario: m.type,
    irr: m.irr,
    fill: COLORS[m.type as keyof typeof COLORS]
  }));

  const paybackData = scenarioMetrics.map(m => ({
    scenario: m.type,
    payback: m.paybackPeriod > 0 ? m.paybackPeriod : 0,
    fill: COLORS[m.type as keyof typeof COLORS]
  }));

  // Generate 10-year cash flow data
  const cashFlowData = Array.from({ length: 11 }, (_, year) => {
    const yearData: any = { year };
    
    scenarioMetrics.forEach(m => {
      if (year === 0) {
        yearData[m.type] = -m.totalConstructionCost;
      } else {
        const annualCashFlow = m.totalRevenue - m.totalOperatingCost;
        const cumulativeCashFlow = year === 1 
          ? -m.totalConstructionCost + annualCashFlow
          : yearData[m.type] + annualCashFlow;
        yearData[m.type] = cumulativeCashFlow;
      }
    });
    
    return yearData;
  });

  return (
    <div className="space-y-6">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {scenarioMetrics.map((metrics, index) => (
          <Card key={index} className="relative overflow-hidden shadow-elevation-2">
            <div 
              className="absolute top-0 left-0 w-full h-1"
              style={{ backgroundColor: COLORS[metrics.type as keyof typeof COLORS] }}
            />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{metrics.type}</CardTitle>
                <Badge variant="outline">{metrics.scenario}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">IRR</span>
                  </div>
                  <p className="text-sm font-semibold">{formatPercentage(metrics.irr)}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Payback</span>
                  </div>
                  <p className="text-sm font-semibold">{formatYears(metrics.paybackPeriod)}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Revenue</span>
                  </div>
                  <p className="text-sm font-semibold">{projectCurrency} {formatCurrency(metrics.totalRevenue, projectCurrency)}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Calculator className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Margin</span>
                  </div>
                  <p className="text-sm font-semibold">{formatPercentage(metrics.profitMargin)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* IRR Comparison Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              IRR Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <BarChart data={irrData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="scenario" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'IRR']} />
                <Bar dataKey="irr" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payback Period Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Payback Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <BarChart data={paybackData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="scenario" />
                <YAxis tickFormatter={(value) => `${value}y`} />
                <Tooltip formatter={(value) => [`${Number(value).toFixed(1)} years`, 'Payback Period']} />
                <Bar dataKey="payback" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cost Breakdown Pie Charts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Cost Breakdown by Scenario
            </CardTitle>
            {projectCurrency !== "AED" && exchangeRates.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Values shown in {projectCurrency} • Exchange rate: {projectCurrency} → AED at {getExchangeRate(projectCurrency, "AED", exchangeRates)}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scenarioMetrics.map((metrics, index) => {
                const costData = [
                  { name: 'Construction', value: metrics.totalConstructionCost },
                  { name: 'Annual Operating', value: metrics.totalOperatingCost * 10 } // 10 years
                ];
                
                return (
                  <div key={index} className="space-y-2">
                    <h4 className="text-sm font-medium" style={{ color: COLORS[metrics.type as keyof typeof COLORS] }}>
                      {metrics.type}
                    </h4>
                    <ResponsiveContainer width="100%" height={100} className="sm:h-[120px]">
                      <PieChart>
                        <Pie
                          data={costData}
                          cx="50%"
                          cy="50%"
                          outerRadius={40}
                          dataKey="value"
                        >
                          {costData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => {
                            const rate = getExchangeRate(projectCurrency, "AED", exchangeRates);
                            return [
                              `${projectCurrency} ${formatCurrency(Number(value), projectCurrency)}${
                                projectCurrency !== "AED" && rate 
                                  ? ` ≈ AED ${formatCurrency(convertCurrency(Number(value), projectCurrency, "AED", exchangeRates))}` 
                                  : ""
                              }`,
                              "Value"
                            ];
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 10-Year Cash Flow Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              10-Year Cumulative Cash Flow
            </CardTitle>
            {projectCurrency !== "AED" && exchangeRates.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Values shown in {projectCurrency} • Exchange rate: {projectCurrency} → AED at {getExchangeRate(projectCurrency, "AED", exchangeRates)}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <AreaChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" tickFormatter={(value) => `Y${value}`} />
                <YAxis tickFormatter={(value) => `${projectCurrency} ${formatCurrency(value, projectCurrency)}`} />
                <Tooltip 
                  formatter={(value, name) => {
                    const rate = getExchangeRate(projectCurrency, "AED", exchangeRates);
                    return [
                      `${projectCurrency} ${formatCurrency(Number(value), projectCurrency)}${
                        projectCurrency !== "AED" && rate 
                          ? ` ≈ AED ${formatCurrency(convertCurrency(Number(value), projectCurrency, "AED", exchangeRates))}` 
                          : ""
                      }`,
                      name
                    ];
                  }}
                  labelFormatter={(value) => `Year ${value}`}
                />
                <Legend />
                {scenarios.map((scenario) => {
                  // Use name as type fallback, or determine type from name
                  let scenarioType = scenario.name;
                  if (scenario.is_base) {
                    scenarioType = "Base Case";
                  } else if (scenario.name?.toLowerCase().includes('optimistic')) {
                    scenarioType = "Optimistic";
                  } else if (scenario.name?.toLowerCase().includes('pessimistic')) {
                    scenarioType = "Pessimistic";
                  }
                  
                  return (
                    <Area
                      key={scenario.id}
                      type="monotone"
                      dataKey={scenarioType}
                      stackId="1"
                      stroke={COLORS[scenarioType as keyof typeof COLORS]}
                      fill={COLORS[scenarioType as keyof typeof COLORS]}
                      fillOpacity={0.6}
                    />
                  );
                })}
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};