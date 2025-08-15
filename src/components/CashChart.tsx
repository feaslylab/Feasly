
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend,
} from "recharts";
import { useCashSeries, CashPoint } from "@/hooks/useCashSeries";
import { Button } from "@/components/ui/button";
import { csvFormat } from 'd3-dsv';
import { chartHelpers } from "@/theme/chartPalette";
import { useTheme } from "next-themes";
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
  let rows: CashPoint[] = [];
  
  try {
    rows = data ? toRows(data) : useCashSeries();
  } catch (error) {
    console.error('Error generating cash series:', error);
    // Return a safe fallback instead of crashing
    rows = [{ period: 'P0', inflow: 0, outflow: 0, net: 0 }];
  }
  
  // Add safety checks for data
  if (!Array.isArray(rows) || rows.length === 0) {
    return <div className="text-sm text-muted-foreground p-4">No cash flow data available</div>;
  }
  
  const { theme } = useTheme();

  // hide when nothing to show
  if (rows.every(p => p.net === 0)) {
    return <div className="text-sm text-muted-foreground p-4">No cash flow activity</div>;
  }
  
  // Get theme-aware colors from our chart palette
  const colors = chartHelpers.getCashFlowColors(theme === 'dark' ? 'dark' : 'light');

  return (
    <div className="mt-8 rounded-lg bg-card p-4 shadow">
      <h3 className="text-lg font-semibold mb-2">Monthly Cash-Flow</h3>
      
      <Button
        variant="ghost"
        size="sm"
        className="ml-auto mb-2"
        onClick={() => exportCsv(rows)}
      >
        Export CSV
      </Button>

      <ChartErrorBoundary>
        <ResponsiveContainer key={rows.length} width="100%" height={310}>
          <AreaChart data={rows} stackOffset="sign">
            <XAxis dataKey="period" hide />
            <YAxis
              tickFormatter={v => v.toLocaleString()}
              width={70}
            />
            <Tooltip
              formatter={(v: number) => v.toLocaleString()}
              labelFormatter={p => `Period ${p}`}
            />
            <Legend verticalAlign="top" height={24} />
            <Area type="monotone" dataKey="inflow" stackId="1" fillOpacity={0.55} fill={colors.inflow} stroke="none" name="Inflow"/>
            <Area type="monotone" dataKey="outflow" stackId="1" fillOpacity={0.55} fill={colors.outflow} stroke="none" name="Outflow"/>
            <Area type="monotone" dataKey="net" stackId="1" fillOpacity={0.55} fill={colors.net} stroke="none" name="Net"/>
          </AreaChart>
        </ResponsiveContainer>
      </ChartErrorBoundary>
    </div>
  );
}
