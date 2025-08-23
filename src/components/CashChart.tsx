
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend,
} from "recharts";
import { useCashSeries, CashPoint } from "@/hooks/useCashSeries";
import { Button } from "@/components/ui/button";
import { csvFormat } from 'd3-dsv';
import { chartHelpers } from "@/theme/chartPalette";
import { useTheme } from "@/contexts/ThemeContext";
import { ChartErrorBoundary } from "@/components/charts/ChartErrorBoundary";

function exportCsv(rows: CashPoint[]) {
  const blob = new Blob([csvFormat(rows)], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'cashflow.csv'; a.click();
  URL.revokeObjectURL(url);
}

function toRows(cash: number[]) {
  return cash.map((v, i) => ({
    period : `P${i}`,
    inflow : v > 0 ?  v : 0,
    outflow: v < 0 ? -v : 0,
    net    : v,
  }));
}

export default function CashChart({ data }: { data?: number[] }) {
  // Use theme hook unconditionally at the top level
  const { actualTheme } = useTheme();
  
  let rows: CashPoint[] = [];
  
  try {
    // Only call useCashSeries if no data prop is provided
    if (data) {
      rows = toRows(data);
    } else {
      // Try to get cash series, but fallback gracefully
      try {
        rows = useCashSeries();
      } catch (seriesError) {
        console.warn('useCashSeries failed:', seriesError);
        rows = [{ period: 'P0', inflow: 0, outflow: 0, net: 0 }];
      }
    }
  } catch (error) {
    console.error('Error generating cash series:', error);
    // Return a safe fallback instead of crashing
    rows = [{ period: 'P0', inflow: 0, outflow: 0, net: 0 }];
  }
  
  // Add safety checks for data - validate each data point
  if (!Array.isArray(rows) || rows.length === 0) {
    return <div className="text-sm text-muted-foreground p-4">No cash flow data available</div>;
  }

  // Validate and clean the data to prevent chart rendering errors
  const validRows = rows.filter(row => {
    return row && 
           typeof row.period === 'string' && 
           typeof row.inflow === 'number' && 
           typeof row.outflow === 'number' && 
           typeof row.net === 'number' &&
           Number.isFinite(row.inflow) &&
           Number.isFinite(row.outflow) &&
           Number.isFinite(row.net);
  });

  if (validRows.length === 0) {
    return <div className="text-sm text-muted-foreground p-4">No valid cash flow data available</div>;
  }

  // hide when nothing to show
  if (validRows.every(p => p.net === 0)) {
    return <div className="text-sm text-muted-foreground p-4">No cash flow activity</div>;
  }
  
  // Get theme-aware colors from our chart palette - with fallback
  let colors;
  try {
    colors = chartHelpers.getCashFlowColors(actualTheme);
  } catch (error) {
    console.error('Error getting chart colors:', error);
    // Fallback colors
    colors = {
      inflow: 'hsl(142, 71%, 45%)',
      outflow: 'hsl(0, 84%, 60%)',
      net: 'hsl(217, 79%, 53%)'
    };
  }

  return (
    <div className="mt-8 rounded-lg bg-card p-4 shadow">
      <h3 className="text-lg font-semibold mb-2">Monthly Cash-Flow</h3>
      
      <Button
        variant="ghost"
        size="sm"
        className="ml-auto mb-2"
        onClick={() => exportCsv(validRows)}
      >
        Export CSV
      </Button>

      <ChartErrorBoundary>
        <ResponsiveContainer key={`${validRows.length}-${actualTheme}`} width="100%" height={310}>
          <AreaChart data={validRows} stackOffset="sign">
            <XAxis 
              dataKey="period" 
              hide 
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis
              tickFormatter={v => v.toLocaleString()}
              width={70}
              stroke="hsl(var(--muted-foreground))"
            />
            <Tooltip
              formatter={(v: number) => v.toLocaleString()}
              labelFormatter={p => `Period ${p}`}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Legend verticalAlign="top" height={24} />
            <Area 
              type="monotone" 
              dataKey="inflow" 
              stackId="1" 
              fillOpacity={0.55} 
              fill={colors.inflow} 
              stroke="none" 
              name="Inflow"
            />
            <Area 
              type="monotone" 
              dataKey="outflow" 
              stackId="1" 
              fillOpacity={0.55} 
              fill={colors.outflow} 
              stroke="none" 
              name="Outflow"
            />
            <Area 
              type="monotone" 
              dataKey="net" 
              stackId="1" 
              fillOpacity={0.55} 
              fill={colors.net} 
              stroke="none" 
              name="Net"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartErrorBoundary>
    </div>
  );
}
