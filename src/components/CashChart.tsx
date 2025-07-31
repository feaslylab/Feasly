import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
} from "recharts";
import { useCashSeries } from "@/hooks/useCashSeries";

export default function CashChart() {
  const data = useCashSeries();

  // hide when nothing to show
  if (!data.length || data.every(p => p.net === 0)) return null;

  return (
    <div className="mt-8 rounded-lg bg-card p-4 shadow">
      <h3 className="text-lg font-semibold mb-2">Monthly Cash-Flow</h3>

      <ResponsiveContainer key={data.length} width="100%" height={240}>
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
          {/* ✔ no explicit colours – Lovable will theme */}
          <Area type="monotone" dataKey="inflow"  stackId="1" fillOpacity={0.55}/>
          <Area type="monotone" dataKey="outflow" stackId="1" fillOpacity={0.55}/>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}