import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';
import { getCachedScenarioResult } from '@/services/scenario';
import { useEffect, useState } from 'react';

interface CashFlowSummaryCardProps {
  projectId: string;
  scenarioId?: string;
  className?: string;
}

export function CashFlowSummaryCard({ projectId, scenarioId, className }: CashFlowSummaryCardProps) {
  const { theme } = useTheme();
  const [cashflow, setCashflow] = useState<number[]>([]);
  const [kpis, setKpis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCashFlow = async () => {
      if (!scenarioId) {
        setLoading(false);
        return;
      }

      try {
        const result = await getCachedScenarioResult(projectId, scenarioId);
        if (result) {
          setCashflow(result.cashflow);
          setKpis(result.kpis);
        }
      } catch (error) {
        console.error('Error fetching cash flow:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCashFlow();
  }, [projectId, scenarioId]);

  // Calculate 30-year net cash flow and next 12 months
  const yearlyFlow = cashflow.reduce((acc, curr, index) => {
    const year = Math.floor(index / 12);
    if (!acc[year]) acc[year] = 0;
    acc[year] += curr;
    return acc;
  }, [] as number[]);

  const next12Months = cashflow.slice(0, 12).reduce((sum, val) => sum + val, 0);
  const totalNetFlow = cashflow.reduce((sum, val) => sum + val, 0);

  const sparklineData = yearlyFlow.slice(0, 30).map((value, index) => ({
    year: index + 1,
    value
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'AED',
      notation: Math.abs(value) > 1000000 ? 'compact' : 'standard',
      maximumFractionDigits: 0
    }).format(value);
  };

  const getStatusIcon = (value: number) => {
    if (value > 0) {
      return <TrendingUp className="h-4 w-4 text-emerald-600" />;
    } else if (value < 0) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return <DollarSign className="h-4 w-4 text-muted-foreground" />;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Cash Flow Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-6 bg-muted rounded w-1/2 mb-4"></div>
            <div className="h-16 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!scenarioId || cashflow.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Cash Flow Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-sm">
            No cash flow data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          Cash Flow Summary
          {getStatusIcon(totalNetFlow)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Next 12 Months KPI */}
          <div>
            <div className="text-sm text-muted-foreground">Next 12 Months Net</div>
            <div className={`text-lg font-semibold ${
              next12Months > 0 ? 'text-emerald-600' : next12Months < 0 ? 'text-red-600' : 'text-muted-foreground'
            }`}>
              {formatCurrency(next12Months)}
            </div>
          </div>

          {/* 30-Year Sparkline */}
          <div>
            <div className="text-sm text-muted-foreground mb-2">30-Year Net Cash Flow</div>
            <ResponsiveContainer width="100%" height={60}>
              <LineChart data={sparklineData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={theme === 'dark' ? 'hsl(var(--primary))' : 'hsl(var(--primary))'}
                  strokeWidth={2}
                  dot={false}
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Net Flow']}
                  labelFormatter={(label) => `Year ${label}`}
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? 'hsl(var(--background))' : '#fff',
                    border: `1px solid hsl(var(--border))`,
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className={`text-sm font-medium ${
              totalNetFlow > 0 ? 'text-emerald-600' : totalNetFlow < 0 ? 'text-red-600' : 'text-muted-foreground'
            }`}>
              Total: {formatCurrency(totalNetFlow)}
            </div>
          </div>

          {/* NPV if available */}
          {kpis && (
            <div>
              <div className="text-sm text-muted-foreground">Net Present Value</div>
              <div className={`text-lg font-semibold ${
                kpis.npv > 0 ? 'text-emerald-600' : kpis.npv < 0 ? 'text-red-600' : 'text-muted-foreground'
              }`}>
                {formatCurrency(kpis.npv)}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}