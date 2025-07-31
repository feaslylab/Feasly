import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar, ComposedChart } from 'recharts';
import { useTheme } from 'next-themes';

interface CashFlowChartProps {
  cashflow: number[];
  isLoading?: boolean;
}

export function CashFlowChart({ cashflow, isLoading }: CashFlowChartProps) {
  const { theme } = useTheme();
  
  // Transform data for chart
  const chartData = cashflow.map((value, index) => {
    // Calculate cumulative flow
    const cumulative = cashflow.slice(0, index + 1).reduce((sum, val) => sum + val, 0);
    
    return {
      month: `M${index + 1}`,
      monthIndex: index + 1,
      monthly: value,
      cumulative: cumulative,
      inflow: value > 0 ? value : 0,
      outflow: value < 0 ? value : 0,
    };
  });

  const colors = {
    primary: theme === 'dark' ? 'hsl(var(--primary))' : 'hsl(var(--primary))',
    success: theme === 'dark' ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-2))',
    destructive: theme === 'dark' ? 'hsl(var(--destructive))' : 'hsl(var(--destructive))',
    muted: theme === 'dark' ? 'hsl(var(--muted-foreground))' : 'hsl(var(--muted-foreground))',
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'AED',
      notation: value > 1000000 ? 'compact' : 'standard',
      maximumFractionDigits: 0
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="text-muted-foreground">Loading chart...</div>
      </div>
    );
  }

  if (cashflow.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="text-muted-foreground">No data to display</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cumulative Cash Flow Line Chart */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-3">Cumulative Cash Flow</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.muted} opacity={0.3} />
            <XAxis 
              dataKey="month" 
              stroke={colors.muted}
              fontSize={12}
              interval="preserveStartEnd"
            />
            <YAxis 
              stroke={colors.muted}
              fontSize={12}
              tickFormatter={formatCurrency}
            />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), 'Cumulative']}
              labelStyle={{ color: theme === 'dark' ? '#fff' : '#000' }}
              contentStyle={{ 
                backgroundColor: theme === 'dark' ? 'hsl(var(--background))' : '#fff',
                border: `1px solid hsl(var(--border))`,
                borderRadius: '6px'
              }}
            />
            <ReferenceLine y={0} stroke={colors.muted} strokeDasharray="2 2" />
            <Line 
              type="monotone" 
              dataKey="cumulative" 
              stroke={colors.primary}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: colors.primary }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Cash Flow Bar Chart */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-3">Monthly Cash Flow</h4>
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.muted} opacity={0.3} />
            <XAxis 
              dataKey="month" 
              stroke={colors.muted}
              fontSize={12}
              interval="preserveStartEnd"
            />
            <YAxis 
              stroke={colors.muted}
              fontSize={12}
              tickFormatter={formatCurrency}
            />
            <Tooltip 
              formatter={(value: number, name: string) => {
                const label = name === 'inflow' ? 'Inflow' : name === 'outflow' ? 'Outflow' : 'Net Flow';
                return [formatCurrency(value), label];
              }}
              labelStyle={{ color: theme === 'dark' ? '#fff' : '#000' }}
              contentStyle={{ 
                backgroundColor: theme === 'dark' ? 'hsl(var(--background))' : '#fff',
                border: `1px solid hsl(var(--border))`,
                borderRadius: '6px'
              }}
            />
            <ReferenceLine y={0} stroke={colors.muted} strokeDasharray="2 2" />
            <Bar 
              dataKey="inflow" 
              fill={colors.success}
              name="inflow"
            />
            <Bar 
              dataKey="outflow" 
              fill={colors.destructive}
              name="outflow"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}