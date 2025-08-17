import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

interface CapTableCardProps {
  equity?: {
    kpis: {
      by_investor: Record<string, {
        irr_pa: number | null;
        tvpi: number;
        dpi: number;
        rvpi: number;
        moic: number;
        contributed: number;
        distributed: number;
        nav: number;
      }>;
    };
    calls_by_investor: Record<string, number[]>;
    dists_by_investor: Record<string, number[]>;
  };
}

export function CapTableCard({ equity }: CapTableCardProps) {
  if (!equity || !equity.kpis.by_investor) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cap Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">No investor data available</div>
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

  const investors = Object.keys(equity.kpis.by_investor);

  const generateSparkline = (calls: number[], dists: number[]) => {
    const combined = calls.map((call, i) => call - (dists[i] || 0));
    const max = Math.max(...combined.map(Math.abs));
    if (max === 0) return [];
    
    return combined.slice(-12).map((value, i) => ({
      x: i * 8,
      y: 15 - (value / max) * 15,
      positive: value >= 0
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cap Table</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 font-medium">Investor</th>
                <th className="text-right py-2 font-medium">Contributed</th>
                <th className="text-right py-2 font-medium">Distributed</th>
                <th className="text-right py-2 font-medium">NAV</th>
                <th className="text-right py-2 font-medium">DPI</th>
                <th className="text-right py-2 font-medium">TVPI</th>
                <th className="text-right py-2 font-medium">IRR</th>
                <th className="text-center py-2 font-medium">Trend</th>
              </tr>
            </thead>
            <tbody>
              {investors.map((investorKey) => {
                const investor = equity.kpis.by_investor[investorKey];
                const calls = equity.calls_by_investor[investorKey] || [];
                const dists = equity.dists_by_investor[investorKey] || [];
                const sparkline = generateSparkline(calls, dists);
                const isGP = investorKey.includes("GP");

                return (
                  <tr key={investorKey} className="border-b border-border/50">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{investorKey}</span>
                        {isGP && <Badge variant="secondary" className="text-xs">GP</Badge>}
                      </div>
                    </td>
                    <td className="text-right py-3 font-mono text-sm">
                      {formatCurrency(investor.contributed)}
                    </td>
                    <td className="text-right py-3 font-mono text-sm">
                      {formatCurrency(investor.distributed)}
                    </td>
                    <td className="text-right py-3 font-mono text-sm">
                      {formatCurrency(investor.nav)}
                    </td>
                    <td className="text-right py-3 font-mono text-sm">
                      <span className={investor.dpi >= 1 ? "text-green-600" : "text-orange-600"}>
                        {investor.dpi.toFixed(2)}x
                      </span>
                    </td>
                    <td className="text-right py-3 font-mono text-sm">
                      <span className={investor.tvpi >= 1 ? "text-green-600" : "text-orange-600"}>
                        {investor.tvpi.toFixed(2)}x
                      </span>
                    </td>
                    <td className="text-right py-3 font-mono text-sm">
                      <div className="flex items-center justify-end gap-1">
                        {investor.irr_pa && investor.irr_pa > 0 ? (
                          <TrendingUp className="h-3 w-3 text-green-600" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-600" />
                        )}
                        {formatPercent(investor.irr_pa)}
                      </div>
                    </td>
                    <td className="text-center py-3">
                      <svg width="64" height="30" className="inline-block">
                        {sparkline.map((point, i) => (
                          <circle
                            key={i}
                            cx={point.x}
                            cy={point.y}
                            r="1.5"
                            fill={point.positive ? "hsl(var(--chart-1))" : "hsl(var(--chart-2))"}
                            opacity={0.7}
                          />
                        ))}
                      </svg>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {investors.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No investors configured
          </div>
        )}
      </CardContent>
    </Card>
  );
}