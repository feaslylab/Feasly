import React from "react";
import { useEngineNumbers } from "@/lib/engine/EngineContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, DollarSign, Percent } from "lucide-react";

const fmt = (n: number | null, suffix = "") => {
  if (n == null) return "—";
  if (suffix === "%") return `${(n * 100).toFixed(1)}%`;
  const abs = Math.abs(n);
  if (abs >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return n.toFixed(2);
};

export function WaterfallCard() {
  const { waterfall } = useEngineNumbers();
  
  // Add comprehensive safety checks
  if (!waterfall || 
      (!Array.isArray(waterfall.lp_distributions) && !Array.isArray(waterfall.gp_distributions)) ||
      (waterfall.lp_distributions?.length === 0 && waterfall.gp_distributions?.length === 0)) {
    return (
      <Card className="border-warning/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Equity Waterfall
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No equity tranches configured. Add LP/GP equity tranches to see waterfall analysis.
          </p>
        </CardContent>
      </Card>
    );
  }

  const [basis] = React.useState<"european">("european"); // American disabled for now
  
  const T = waterfall.lp_distributions?.length || 0;
  const totalLpDist = waterfall.lp_distributions?.reduce((sum, val) => sum + val, 0) || 0;
  const totalGpDist = waterfall.gp_distributions?.reduce((sum, val) => sum + val, 0) || 0;
  const totalCarry = waterfall.carry_paid?.reduce((sum, val) => sum + val, 0) || 0;

  // Download CSV function
  const downloadCSV = () => {
    const lines = [
      [
        "Period",
        "LP_Distributions",
        "GP_Distributions", 
        "Carry_Paid",
        "Total_Distributions"
      ].join(",")
    ];
    
    for (let t = 0; t < T; t++) {
      const lp = waterfall.lp_distributions[t] || 0;
      const gp = waterfall.gp_distributions[t] || 0;
      const carry = waterfall.carry_paid[t] || 0;
      
      lines.push([
        t + 1,
        lp,
        gp,
        carry,
        lp + gp
      ].join(","));
    }
    
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "waterfall.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card suppressHydrationWarning>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Equity Waterfall
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {basis.charAt(0).toUpperCase() + basis.slice(1)} (Project)
            </Badge>
            <button 
              onClick={downloadCSV}
              className="text-xs px-3 py-1 rounded bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
            >
              Export CSV
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="border border-border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-muted-foreground">LP IRR</span>
            </div>
            <div className="text-lg font-semibold text-foreground">
              {fmt(waterfall.lp?.irr_pa, "%")}
            </div>
            <div className="text-xs text-muted-foreground">
              MOIC: {fmt(waterfall.lp?.moic)}×
            </div>
          </div>
          
          <div className="border border-border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-xs text-muted-foreground">GP IRR</span>
            </div>
            <div className="text-lg font-semibold text-foreground">
              {fmt(waterfall.gp?.irr_pa, "%")}
            </div>
            <div className="text-xs text-muted-foreground">
              MOIC: {fmt(waterfall.gp?.moic)}×
            </div>
          </div>
          
          <div className="border border-border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-purple-600" />
              <span className="text-xs text-muted-foreground">Total Carry</span>
            </div>
            <div className="text-lg font-semibold text-foreground">
              {fmt(totalCarry)}
            </div>
            <div className="text-xs text-muted-foreground">
              GP excess return
            </div>
          </div>
          
          <div className="border border-border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Percent className="h-4 w-4 text-orange-600" />
              <span className="text-xs text-muted-foreground">DPI</span>
            </div>
            <div className="text-lg font-semibold text-foreground">
              {fmt(waterfall.lp?.dpi)}
            </div>
            <div className="text-xs text-muted-foreground">
              Distributions/Paid-in
            </div>
          </div>
        </div>

        {/* Distribution Summary */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Distribution Summary</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Total LP</div>
              <div className="font-semibold text-blue-600">{fmt(totalLpDist)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Total GP</div>
              <div className="font-semibold text-green-600">{fmt(totalGpDist)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Total Project</div>
              <div className="font-semibold text-foreground">{fmt(totalLpDist + totalGpDist)}</div>
            </div>
          </div>
        </div>

        {/* Timeline visualization */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Distribution Timeline</h4>
          <div className="flex gap-1 flex-wrap">
            {Array.from({ length: T }, (_, i) => {
              const lp = waterfall.lp_distributions[i] || 0;
              const gp = waterfall.gp_distributions[i] || 0;
              const total = lp + gp;
              const hasDistribution = total > 0;
              
              return (
                <span
                  key={i}
                  className={`inline-block h-3 w-3 rounded-sm ${
                    hasDistribution ? "bg-green-500" : "bg-gray-200"
                  }`}
                  title={`Period ${i + 1}: ${hasDistribution ? fmt(total) : "No distributions"}`}
                />
              );
            })}
          </div>
        </div>

        {/* Capital Accounts Preview */}
        {Object.keys(waterfall.capital_accounts || {}).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Capital Accounts</h4>
            <div className="grid gap-2 text-xs">
              {Object.entries(waterfall.capital_accounts).map(([key, account]: [string, any]) => {
                const totalContributed = account.contributed?.reduce((sum: number, val: number) => sum + val, 0) || 0;
                const totalReturned = account.returned_capital?.reduce((sum: number, val: number) => sum + val, 0) || 0;
                const totalProfits = account.profit_distributions?.reduce((sum: number, val: number) => sum + val, 0) || 0;
                
                return (
                  <div key={key} className="flex justify-between items-center py-1 px-2 bg-muted/30 rounded">
                    <span className="font-medium">{key}</span>
                    <div className="text-right">
                      <div>Contributed: {fmt(totalContributed)}</div>
                      <div>Returned: {fmt(totalReturned + totalProfits)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}