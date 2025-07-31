import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from 'next-themes';

interface TornadoChartProps {
  data: {
    variations: Array<{
      variation: {
        costVariationPercent: number;
        salePriceVariationPercent: number;
        interestRateVariationBps: number;
      };
      deltas: {
        npvDelta: number;
        irrDelta: number;
        profitDelta: number;
      };
    }>;
  } | null;
  isLoading: boolean;
}

export function TornadoChart({ data, isLoading }: TornadoChartProps) {
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="text-muted-foreground">Running sensitivity analysis...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="text-muted-foreground">Run analysis to see impact chart</div>
      </div>
    );
  }

  // Transform data for tornado chart (focus on NPV deltas)
  const chartData = data.variations.map((item, index) => {
    let label = '';
    let value = item.deltas.npvDelta;
    
    if (item.variation.costVariationPercent !== 0) {
      label = `Cost ${item.variation.costVariationPercent > 0 ? '+' : ''}${item.variation.costVariationPercent}%`;
    } else if (item.variation.salePriceVariationPercent !== 0) {
      label = `Price ${item.variation.salePriceVariationPercent > 0 ? '+' : ''}${item.variation.salePriceVariationPercent}%`;
    } else if (item.variation.interestRateVariationBps !== 0) {
      label = `Rate ${item.variation.interestRateVariationBps > 0 ? '+' : ''}${item.variation.interestRateVariationBps}bps`;
    }

    return {
      label,
      value,
      color: value >= 0 ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))',
    };
  }).sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'AED',
      notation: 'compact',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div>
      <h4 className="text-sm font-medium text-muted-foreground mb-3">
        NPV Impact Analysis
      </h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          layout="horizontal"
          margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.3} />
          <XAxis 
            type="number"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickFormatter={formatCurrency}
          />
          <YAxis 
            type="category"
            dataKey="label"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            width={70}
          />
          <Tooltip
            formatter={(value: number) => [formatCurrency(value), 'NPV Impact']}
            contentStyle={{
              backgroundColor: theme === 'dark' ? 'hsl(var(--background))' : '#fff',
              border: `1px solid hsl(var(--border))`,
              borderRadius: '6px'
            }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}