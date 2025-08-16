import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEngineNumbers } from "@/lib/engine/EngineContext";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

const fmt = (n: number) => {
  const abs = Math.abs(n);
  if (abs >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return n.toFixed(0);
};

export function CashFlowCard() {
  const result = useEngineNumbers();
  
  if (!result?.cash_flow) {
    return (
      <Card className="border-warning/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Cash Flow Statement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No cash flow data available</p>
        </CardContent>
      </Card>
    );
  }

  const { cash_flow: cf, balance_sheet: bs } = result;
  const T = cf.from_operations?.length || 0;
  
  if (T === 0) {
    return (
      <Card className="border-warning/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Cash Flow Statement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No periods available</p>
        </CardContent>
      </Card>
    );
  }

  // Get last period values for display
  const lastIdx = T - 1;
  const opsFlow = cf.from_operations[lastIdx] || 0;
  const invFlow = cf.from_investing[lastIdx] || 0;
  const finFlow = cf.from_financing[lastIdx] || 0;
  const netFlow = cf.net_change[lastIdx] || 0;
  const closingCash = cf.cash_closing[lastIdx] || 0;
  const bsCash = bs?.cash?.[lastIdx] || 0;

  // Tie-out check
  const cashError = Math.abs(closingCash - bsCash);
  const tieOutOK = cf.detail?.tie_out_ok_cash ?? (cashError < 0.01);
  const maxError = cf.detail?.max_cash_error ?? cashError;

  const FlowItem = ({ 
    label, 
    value, 
    icon 
  }: { 
    label: string; 
    value: number; 
    icon?: React.ReactNode;
  }) => {
    const isPositive = value > 0;
    const isNegative = value < 0;
    
    return (
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-mono ${
            isPositive ? 'text-success' : 
            isNegative ? 'text-destructive' : 
            'text-muted-foreground'
          }`}>
            {isPositive ? '+' : ''}{fmt(value)}
          </span>
          {isPositive && <TrendingUp className="h-3 w-3 text-success" />}
          {isNegative && <TrendingDown className="h-3 w-3 text-destructive" />}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Cash Flow Statement
          </div>
          <Badge variant={tieOutOK ? "default" : "destructive"}>
            {tieOutOK ? "✅ Ties to BS" : "⚠️ Mismatch"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Operating Activities */}
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground mb-2">
            Operating Activities
          </h4>
          <FlowItem 
            label="From Operations" 
            value={opsFlow}
            icon={<div className="w-2 h-2 rounded-full bg-primary" />}
          />
        </div>

        <Separator />

        {/* Investing Activities */}
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground mb-2">
            Investing Activities
          </h4>
          <FlowItem 
            label="From Investing" 
            value={invFlow}
            icon={<div className="w-2 h-2 rounded-full bg-chart-2" />}
          />
        </div>

        <Separator />

        {/* Financing Activities */}
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground mb-2">
            Financing Activities
          </h4>
          <FlowItem 
            label="From Financing" 
            value={finFlow}
            icon={<div className="w-2 h-2 rounded-full bg-chart-3" />}
          />
        </div>

        <Separator />

        {/* Net Change */}
        <div className="bg-muted/50 rounded-lg p-3">
          <FlowItem 
            label="Net Change in Cash" 
            value={netFlow}
          />
          <FlowItem 
            label="Closing Cash Balance" 
            value={closingCash}
          />
        </div>

        {/* Tie-out diagnostic */}
        <div className="text-xs text-muted-foreground">
          {tieOutOK ? (
            <span className="text-success">✅ Cash flow closing matches BS cash</span>
          ) : (
            <span className="text-destructive">
              ⚠️ Cash mismatch: max error {fmt(maxError)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}