import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SensitivityTableProps {
  data: {
    baseKpis: {
      npv: number;
      irr: number;
      profit: number;
    };
    variations: Array<{
      variation: {
        costVariationPercent: number;
        salePriceVariationPercent: number;
        interestRateVariationBps: number;
      };
      kpis: {
        npv: number;
        irr: number;
        profit: number;
      };
      deltas: {
        npvDelta: number;
        irrDelta: number;
        profitDelta: number;
      };
    }>;
  } | null;
  isLoading: boolean;
  baseKpis?: {
    npv: number;
    irr: number;
    profit: number;
  };
}

export function SensitivityTable({ data, isLoading, baseKpis }: SensitivityTableProps) {
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'AED',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getChangeIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-3 w-3 text-success" />;
    if (value < 0) return <TrendingDown className="h-3 w-3 text-destructive" />;
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  const getChangeColor = (value: number) => {
    if (value > 0) return 'text-success';
    if (value < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  if (isLoading) {
    return (
      <div className="h-60 flex items-center justify-center">
        <div className="text-muted-foreground">Calculating scenarios...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-60 flex items-center justify-center">
        <div className="text-muted-foreground">No sensitivity data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Base Case */}
      {baseKpis && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Base Case</h4>
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">NPV</div>
              <div className="font-semibold">{formatCurrency(baseKpis.npv)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">IRR</div>
              <div className="font-semibold">{formatPercentage(baseKpis.irr)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Profit</div>
              <div className="font-semibold">{formatCurrency(baseKpis.profit)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Sensitivity Scenarios */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-2">Sensitivity Scenarios</h4>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Scenario</TableHead>
                <TableHead className="text-right">NPV</TableHead>
                <TableHead className="text-right">IRR</TableHead>
                <TableHead className="text-right">Profit</TableHead>
                <TableHead className="text-right">Impact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.variations.map((item, index) => {
                let scenarioLabel = '';
                if (item.variation.costVariationPercent !== 0) {
                  scenarioLabel = `Cost ${item.variation.costVariationPercent > 0 ? '+' : ''}${item.variation.costVariationPercent}%`;
                } else if (item.variation.salePriceVariationPercent !== 0) {
                  scenarioLabel = `Sale Price ${item.variation.salePriceVariationPercent > 0 ? '+' : ''}${item.variation.salePriceVariationPercent}%`;
                } else if (item.variation.interestRateVariationBps !== 0) {
                  scenarioLabel = `Interest Rate ${item.variation.interestRateVariationBps > 0 ? '+' : ''}${item.variation.interestRateVariationBps}bps`;
                }

                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{scenarioLabel}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(item.kpis.npv)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatPercentage(item.kpis.irr)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(item.kpis.profit)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {getChangeIcon(item.deltas.npvDelta)}
                        <span className={`text-xs font-medium ${getChangeColor(item.deltas.npvDelta)}`}>
                          {formatCurrency(Math.abs(item.deltas.npvDelta))}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}