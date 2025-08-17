import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, AlertTriangle, Info } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';

interface WaterfallCardProps {
  equity?: {
    calls_total: number[];
    dists_total: number[];
    gp_promote: number[];
    gp_clawback: number[];
    kpis: {
      irr_pa: number | null;
      tvpi: number;
      dpi: number;
      rvpi: number;
      moic: number;
      by_investor: Record<string, any>;
    };
    dists_by_investor: Record<string, number[]>;
  };
}

export function WaterfallCard({ equity }: WaterfallCardProps) {
  const { theme } = useTheme();

  if (!equity) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Equity Waterfall</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">No equity data available</div>
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

  const formatPercent = (value: number | null) => {
    if (value === null) return 'N/A';
    return `${(value * 100).toFixed(1)}%`;
  };

  // Create chart data for last 12 periods
  const T = equity.calls_total.length;
  const startPeriod = Math.max(0, T - 12);
  const chartData = [];
  
  for (let t = startPeriod; t < T; t++) {
    chartData.push({
      period: `M${t + 1}`,
      calls: equity.calls_total[t] || 0,
      distributions: equity.dists_total[t] || 0,
      gp_promote: equity.gp_promote[t] || 0,
    });
  }

  const lastPeriod = T - 1;
  const hasClawback = equity.gp_clawback[lastPeriod] > 0;

  const downloadCSV = () => {
    const headers = ['Period', 'Capital Calls', 'Distributions', 'GP Promote'];
    const investors = Object.keys(equity.dists_by_investor);
    investors.forEach(inv => headers.push(`${inv} Distributions`));

    const rows = [headers.join(',')];
    
    for (let t = 0; t < T; t++) {
      const row = [
        `M${t + 1}`,
        equity.calls_total[t] || 0,
        equity.dists_total[t] || 0,
        equity.gp_promote[t] || 0,
      ];
      
      investors.forEach(inv => {
        row.push(equity.dists_by_investor[inv][t] || 0);
      });
      
      rows.push(row.join(','));
    }

    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'equity-waterfall.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Equity Waterfall</CardTitle>
        <div className="flex gap-2">
          {hasClawback && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              GP Clawback Outstanding
            </Badge>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={downloadCSV}
            className="flex items-center gap-1"
          >
            <Download className="h-3 w-3" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* KPI Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Portfolio IRR</div>
            <div className="text-lg font-bold text-primary">
              {formatPercent(equity.kpis.irr_pa)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">TVPI</div>
            <div className="text-lg font-bold text-primary">
              {equity.kpis.tvpi.toFixed(2)}x
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">DPI</div>
            <div className="text-lg font-bold text-primary">
              {equity.kpis.dpi.toFixed(2)}x
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">RVPI</div>
            <div className="text-lg font-bold text-primary">
              {equity.kpis.rvpi.toFixed(2)}x
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">MOIC</div>
            <div className="text-lg font-bold text-primary">
              {equity.kpis.moic.toFixed(2)}x
            </div>
          </div>
        </div>

        {/* Waterfall Chart */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            Capital Calls vs Distributions (Last 12 Periods)
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                formatter={(value: number, name: string) => [formatCurrency(value), name]}
                contentStyle={{ 
                  backgroundColor: theme === 'dark' ? 'hsl(var(--background))' : '#fff',
                  border: `1px solid hsl(var(--border))`,
                  borderRadius: '6px'
                }}
              />
              <Bar 
                dataKey="calls" 
                fill="hsl(var(--chart-1))"
                name="Capital Calls"
              />
              <Bar 
                dataKey="distributions" 
                fill="hsl(var(--chart-2))"
                name="Distributions"
              />
              <Bar 
                dataKey="gp_promote" 
                fill="hsl(var(--chart-3))"
                name="GP Promote"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribution Summary */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Total Called</div>
            <div className="text-lg font-bold">
              {formatCurrency(equity.calls_total.reduce((sum, call) => sum + call, 0))}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Total Distributed</div>
            <div className="text-lg font-bold">
              {formatCurrency(equity.dists_total.reduce((sum, dist) => sum + dist, 0))}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">GP Promote</div>
            <div className="text-lg font-bold">
              {formatCurrency(equity.gp_promote.reduce((sum, promote) => sum + promote, 0))}
            </div>
          </div>
        </div>

        {/* Warnings */}
        {hasClawback && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive">
              GP clawback of {formatCurrency(equity.gp_clawback[lastPeriod])} outstanding
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}