import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from 'recharts';
import { useTheme } from 'next-themes';

interface EquityWaterfallProps {
  cashflow: number[];
  kpis?: {
    equityMultiple: number;
    projectIRR: number | null;
  };
  isLoading?: boolean;
}

export function EquityWaterfall({ cashflow, kpis, isLoading }: EquityWaterfallProps) {
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="text-muted-foreground">Loading equity analysis...</div>
      </div>
    );
  }

  if (!cashflow || cashflow.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="text-muted-foreground">No cashflow data available</div>
      </div>
    );
  }

  // Transform data for equity waterfall
  const chartData = cashflow.map((value, index) => {
    const year = Math.floor(index / 12) + 1;
    const cumulativeEquity = cashflow.slice(0, index + 1).reduce((sum, cf) => sum + (cf < 0 ? cf : 0), 0);
    const cumulativeReturns = cashflow.slice(0, index + 1).reduce((sum, cf) => sum + (cf > 0 ? cf : 0), 0);
    
    return {
      month: `M${index + 1}`,
      year: `Y${year}`,
      monthIndex: index + 1,
      equityInvested: value < 0 ? Math.abs(value) : 0,
      returns: value > 0 ? value : 0,
      cumulativeEquity: Math.abs(cumulativeEquity),
      cumulativeReturns,
      equityIRR: kpis?.projectIRR || 0,
    };
  });

  // Group by years for better visualization
  const yearlyData = chartData.reduce((acc, curr) => {
    const year = curr.year;
    if (!acc[year]) {
      acc[year] = {
        year,
        equityInvested: 0,
        returns: 0,
        cumulativeEquity: curr.cumulativeEquity,
        cumulativeReturns: curr.cumulativeReturns,
        equityIRR: curr.equityIRR,
      };
    }
    acc[year].equityInvested += curr.equityInvested;
    acc[year].returns += curr.returns;
    return acc;
  }, {} as Record<string, any>);

  const yearlyChartData = Object.values(yearlyData).slice(0, 10); // Show first 10 years

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'AED',
      notation: 'compact',
      maximumFractionDigits: 0
    }).format(value);
  };

  const colors = {
    equity: theme === 'dark' ? 'hsl(var(--chart-1))' : 'hsl(var(--chart-1))',
    returns: theme === 'dark' ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-2))',
    irr: theme === 'dark' ? 'hsl(var(--primary))' : 'hsl(var(--primary))',
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
        <div className="text-center">
          <div className="text-sm text-muted-foreground">Equity Multiple</div>
          <div className="text-lg font-bold text-primary">
            {kpis?.equityMultiple?.toFixed(2) || 'N/A'}x
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-muted-foreground">Equity IRR</div>
          <div className="text-lg font-bold text-primary">
            {kpis?.projectIRR ? `${(kpis.projectIRR * 100).toFixed(1)}%` : 'N/A'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-muted-foreground">Total Returns</div>
          <div className="text-lg font-bold text-primary">
            {formatCurrency(chartData[chartData.length - 1]?.cumulativeReturns || 0)}
          </div>
        </div>
      </div>

      {/* Waterfall Chart */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-3">
          Annual Equity Flow & Returns
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={yearlyChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.3} />
            <XAxis 
              dataKey="year" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={formatCurrency}
            />
            <Tooltip 
              formatter={(value: number, name: string) => {
                const label = name === 'equityInvested' ? 'Equity Invested' : 
                             name === 'returns' ? 'Returns' : 'Equity IRR';
                if (name === 'equityIRR') {
                  return [`${(value * 100).toFixed(1)}%`, label];
                }
                return [formatCurrency(value), label];
              }}
              contentStyle={{ 
                backgroundColor: theme === 'dark' ? 'hsl(var(--background))' : '#fff',
                border: `1px solid hsl(var(--border))`,
                borderRadius: '6px'
              }}
            />
            <Bar 
              dataKey="equityInvested" 
              fill={colors.equity}
              name="equityInvested"
              stackId="flow"
            />
            <Bar 
              dataKey="returns" 
              fill={colors.returns}
              name="returns" 
              stackId="flow"
            />
            <Line 
              type="monotone" 
              dataKey="equityIRR" 
              stroke={colors.irr}
              strokeWidth={2}
              dot={false}
              name="equityIRR"
              yAxisId="right"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}