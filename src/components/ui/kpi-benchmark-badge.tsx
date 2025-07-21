import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPIBenchmarkBadgeProps {
  actualValue: number;
  benchmarkValue: number;
  metricType: 'roi' | 'irr' | 'profit_margin';
  className?: string;
}

export function KPIBenchmarkBadge({ 
  actualValue, 
  benchmarkValue, 
  metricType,
  className 
}: KPIBenchmarkBadgeProps) {
  const difference = actualValue - benchmarkValue;
  const percentageDiff = benchmarkValue !== 0 ? (difference / benchmarkValue) * 100 : 0;
  
  const isPositive = difference > 0;
  const isNeutral = Math.abs(percentageDiff) < 1; // Less than 1% difference considered neutral

  const formatValue = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getIcon = () => {
    if (isNeutral) return <Minus className="h-3 w-3" />;
    return isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />;
  };

  const getVariant = () => {
    if (isNeutral) return "secondary";
    return isPositive ? "default" : "destructive";
  };

  const getBgColor = () => {
    if (isNeutral) return "bg-muted";
    return isPositive ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200";
  };

  const getText = () => {
    if (isNeutral) return "On benchmark";
    const metricName = metricType === 'profit_margin' ? 'margin' : metricType.toUpperCase();
    return `${formatValue(percentageDiff)} vs avg ${metricName}`;
  };

  return (
    <Badge 
      variant={getVariant()}
      className={cn(
        "flex items-center gap-1 text-xs font-medium px-2 py-1",
        getBgColor(),
        className
      )}
    >
      {getIcon()}
      {getText()}
    </Badge>
  );
}