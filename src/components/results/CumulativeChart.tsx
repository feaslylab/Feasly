
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';
import { ChartErrorBoundary } from "@/components/charts/ChartErrorBoundary";

interface CumulativeChartProps {
  cashflow: number[];
  isLoading?: boolean;
}

export function CumulativeChart({ cashflow, isLoading }: CumulativeChartProps) {
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="text-muted-foreground">Loading cumulative analysis...</div>
      </div>
    );
  }

  if (!Array.isArray(cashflow) || cashflow.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="text-muted-foreground">No data available</div>
      </div>
    );
  }

  // Transform data for dual-axis chart with safety checks
  const chartData = cashflow.map((value, index) => {
    const cumulativeCash = cashflow.slice(0, index + 1).reduce((sum, cf) => sum + (cf || 0), 0);
    const cumulativeDebt = Math.min(0, cumulativeCash); // Debt is negative cumulative cash
    const cumulativeEquity = Math.max(0, Math.abs(Math.min(0, cumulativeCash))); // Track equity requirement
    
    return {
      month: `M${index + 1}`,
      monthIndex: index + 1,
      year: Math.floor(index / 12) + 1,
      monthlyCashflow: value || 0,
      cumulativeCash: cumulativeCash,
      cumulativeDebt: Math.abs(cumulativeDebt), // Show as positive for chart
      equityRequired: cumulativeEquity,
      netPosition: cumulativeCash,
    };
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'AED',
      notation: 'compact',
      maximumFractionDigits: 0
    }).format(value);
  };

  const colors = {
    cashArea: theme === 'dark' ? 'hsl(var(--chart-3))' : 'hsl(var(--chart-3))',
    debtLine: theme === 'dark' ? 'hsl(var(--destructive))' : 'hsl(var(--destructive))',
    equityLine: theme === 'dark' ? 'hsl(var(--primary))' : 'hsl(var(--primary))',
  };

  // Find key metrics
  const peakDebt = Math.max(...chartData.map(d => d.cumulativeDebt));
  const finalPosition = chartData[chartData.length - 1]?.netPosition || 0;

  return (
    <div className="space-y-6">
      {/* Summary Metrics */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
        <div className="text-center">
          <div className="text-sm text-muted-foreground">Peak Debt Requirement</div>
          <div className="text-lg font-bold text-destructive">
            {formatCurrency(peakDebt)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-muted-foreground">Final Cash Position</div>
          <div className={`text-lg font-bold ${finalPosition >= 0 ? 'text-success' : 'text-destructive'}`}>
            {formatCurrency(finalPosition)}
          </div>
        </div>
      </div>

      {/* Cumulative Chart */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-3">
          Cash Flow & Debt Evolution
        </h4>
        <ChartErrorBoundary>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="cashGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.cashArea} stopOpacity={0.6}/>
                  <stop offset="95%" stopColor={colors.cashArea} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.3} />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                interval="preserveStartEnd"
              />
              <YAxis 
                yAxisId="left"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={formatCurrency}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={formatCurrency}
              />
              
              <Tooltip 
                formatter={(value: number, name: string) => {
                  const labels = {
                    cumulativeCash: 'Cumulative Cash',
                    cumulativeDebt: 'Debt Required',
                    equityRequired: 'Equity Required'
                  };
                  return [formatCurrency(value), labels[name as keyof typeof labels] || name];
                }}
                labelFormatter={(label) => `Month: ${label}`}
                contentStyle={{ 
                  backgroundColor: theme === 'dark' ? 'hsl(var(--background))' : '#fff',
                  border: `1px solid hsl(var(--border))`,
                  borderRadius: '6px'
                }}
              />
              
              <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="2 2" />
              
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="cumulativeCash"
                stroke={colors.cashArea}
                fill="url(#cashGradient)"
                name="cumulativeCash"
              />
              
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="cumulativeDebt"
                stroke={colors.debtLine}
                strokeWidth={2}
                dot={false}
                name="cumulativeDebt"
              />
              
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="equityRequired"
                stroke={colors.equityLine}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="equityRequired"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartErrorBoundary>
      </div>
    </div>
  );
}
