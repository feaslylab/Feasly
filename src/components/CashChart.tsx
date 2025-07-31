import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend,
} from "recharts";
import { useCashSeries, CashPoint } from "@/hooks/useCashSeries";
import { Button } from "@/components/ui/button";
import { csvFormat } from 'd3-dsv';

function exportCsv(rows: CashPoint[]) {
  const blob = new Blob([csvFormat(rows)], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'cashflow.csv'; a.click();
  URL.revokeObjectURL(url);
}

export default function CashChart() {
  const data = useCashSeries();

  // hide when nothing to show
  if (!data.length || data.every(p => p.net === 0)) return null;

  return (
    <div className="mt-8 rounded-lg bg-card p-4 shadow">
      <h3 className="text-lg font-semibold mb-2">Monthly Cash-Flow</h3>
      
      <Button
        variant="ghost"
        size="sm"
        className="ml-auto mb-2"
        onClick={() => exportCsv(data)}
      >
        Export CSV
      </Button>

      <ResponsiveContainer key={data.length} width="100%" height={310}>
        <AreaChart data={data} stackOffset="sign">
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
          <Area type="monotone" dataKey="inflow" stackId="1" fillOpacity={0.55} fill="hsl(var(--success))" stroke="none" name="Inflow"/>
          <Area type="monotone" dataKey="outflow" stackId="1" fillOpacity={0.55} fill="hsl(var(--destructive))" stroke="none" name="Outflow"/>
          <Area type="monotone" dataKey="net" stackId="1" fillOpacity={0.55} fill="hsl(var(--primary))" stroke="none" name="Net"/>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}