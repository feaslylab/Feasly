import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, BarChart } from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';

interface EquityFlowsCardProps {
  equity?: {
    calls_total: number[];
    dists_total: number[];
    kpis: {
      irr_pa: number | null;
    };
  };
  frequency?: 'monthly' | 'quarterly';
}

export function EquityFlowsCard({ equity, frequency = 'monthly' }: EquityFlowsCardProps) {
  const { theme } = useTheme();

  if (!equity) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Equity Flows</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">No equity flow data available</div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'AED',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  // Create chart data
  const T = equity.calls_total.length;
  const chartData = [];
  
  for (let t = 0; t < T; t++) {
    const calls = equity.calls_total[t] || 0;
    const dists = equity.dists_total[t] || 0;
    const net = calls - dists;
    
    chartData.push({
      period: `M${t + 1}`,
      calls: calls,
      distributions: -dists, // Negative for visualization
      net: net,
      cumulative: chartData.length > 0 
        ? (chartData[chartData.length - 1].cumulative || 0) + net 
        : net
    });
  }

  // Take last 24 periods for better visualization
  const displayData = chartData.slice(-24);

  const totalCalls = equity.calls_total.reduce((sum, call) => sum + call, 0);
  const totalDists = equity.dists_total.reduce((sum, dist) => sum + dist, 0);
  const netFlow = totalCalls - totalDists;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Equity Flows</CardTitle>
        <div className="flex gap-2">
          <Badge variant={frequency === 'quarterly' ? 'default' : 'secondary'}>
            {frequency === 'quarterly' ? 'Quarterly' : 'Monthly'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Total Called</div>
            <div className="text-lg font-bold text-green-600">
              ↑ {formatCurrency(totalCalls)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Total Distributed</div>
            <div className="text-lg font-bold text-red-600">
              ↓ {formatCurrency(totalDists)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Net Flow</div>
            <div className={`text-lg font-bold ${netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {netFlow >= 0 ? '↑' : '↓'} {formatCurrency(Math.abs(netFlow))}
            </div>
          </div>
        </div>

        {/* Flow Timeline */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            Equity Flows Timeline (Last 24 Periods)
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={displayData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.3} />
              <XAxis 
                dataKey="period" 
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
                  const label = name === 'calls' ? 'Capital Calls' : 
                               name === 'distributions' ? 'Distributions' : 'Net Flow';
                  return [formatCurrency(Math.abs(value)), label];
                }}
                contentStyle={{ 
                  backgroundColor: theme === 'dark' ? 'hsl(var(--background))' : '#fff',
                  border: `1px solid hsl(var(--border))`,
                  borderRadius: '6px'
                }}
              />
              <Bar 
                dataKey="calls" 
                fill="hsl(var(--chart-1))"
                name="calls"
              />
              <Bar 
                dataKey="distributions" 
                fill="hsl(var(--chart-2))"
                name="distributions"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cumulative Flow Chart */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            Cumulative Net Flow
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={displayData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.3} />
              <XAxis 
                dataKey="period" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={formatCurrency}
              />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Cumulative Net']}
                contentStyle={{ 
                  backgroundColor: theme === 'dark' ? 'hsl(var(--background))' : '#fff',
                  border: `1px solid hsl(var(--border))`,
                  borderRadius: '6px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="cumulative" 
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Flow Indicators */}
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-chart-1 rounded"></div>
            <span>Capital Calls</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-chart-2 rounded"></div>
            <span>Distributions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded"></div>
            <span>Cumulative Net</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}