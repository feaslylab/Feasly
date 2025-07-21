import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, TrendingUp, TrendingDown, DollarSign, Percent, Clock } from "lucide-react";
import { formatCurrency, formatCurrencyCompact } from "@/lib/currencyUtils";
import type { FeaslyModelFormData, KPIResults } from "./types";

export function KPIResults() {
  const { t } = useTranslation('feasly.model');
  const form = useFormContext<FeaslyModelFormData>();

  // Watch form values for real-time calculations
  const formValues = form.watch();

  // Calculate KPIs based on form values
  const kpiResults: KPIResults = useMemo(() => {
    const landCost = formValues.land_cost || 0;
    const constructionCost = formValues.construction_cost || 0;
    const softCosts = formValues.soft_costs || 0;
    const marketingCost = formValues.marketing_cost || 0;
    const contingencyPercent = formValues.contingency_percent || 0;
    
    const subtotal = landCost + constructionCost + softCosts + marketingCost;
    const contingencyValue = subtotal * (contingencyPercent / 100);
    const totalCost = subtotal + contingencyValue;

    const averageSalePrice = formValues.average_sale_price || 0;
    const totalGFA = formValues.total_gfa_sqm || 0;
    const expectedSaleRate = formValues.expected_sale_rate_sqm_per_month || 0;
    const yieldEstimate = formValues.yield_estimate || 0;
    const targetIRR = formValues.target_irr || 0;

    // Calculate total revenue (simplified calculation)
    const totalRevenue = averageSalePrice * totalGFA;
    
    // Calculate profit
    const profit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
    
    // Calculate ROI
    const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;
    
    // Simple IRR estimation (placeholder - real IRR requires complex calculation)
    const irr = targetIRR || 0;
    
    // Payback period calculation (simplified)
    const paybackPeriod = profit > 0 && expectedSaleRate > 0 
      ? totalCost / (expectedSaleRate * averageSalePrice * 12) 
      : 0;

    // Zakat calculation
    const zakatDue = formValues.zakat_applicable && formValues.zakat_rate_percent 
      ? profit * (formValues.zakat_rate_percent / 100)
      : 0;

    return {
      total_cost: totalCost,
      total_revenue: totalRevenue,
      profit,
      profit_margin: profitMargin,
      roi,
      irr,
      payback_period: paybackPeriod,
      zakat_due: zakatDue,
    };
  }, [formValues]);

  // Use dynamic currency formatting
  const currencyCode = formValues.currency_code || 'SAR';
  const formatAmount = (value: number) => {
    return formatCurrency(value, { currencyCode });
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const formatYears = (value: number) => {
    return `${value.toFixed(1)} years`;
  };

  const getStatusColor = (value: number, thresholds: { good: number; fair: number }) => {
    if (value >= thresholds.good) return "text-green-600";
    if (value >= thresholds.fair) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressValue = (value: number, max: number) => {
    return Math.min((value / max) * 100, 100);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <BarChart className="h-5 w-5 text-primary" />
          <CardTitle>{t('kpi_dashboard')}</CardTitle>
        </div>
        <CardDescription>
          {t('kpi_dashboard_desc')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Financial Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{t('feasly.model.kpi_total_cost')}</span>
              </div>
              <div className="text-2xl font-bold mt-2">
                {formatAmount(kpiResults.total_cost)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Including contingency and all costs
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{t('feasly.model.kpi_total_revenue')}</span>
              </div>
              <div className="text-2xl font-bold mt-2">
                {formatAmount(kpiResults.total_revenue)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Expected total project revenue
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className={`h-4 w-4 ${kpiResults.profit >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                <span className="text-sm font-medium">{t('feasly.model.kpi_profit')}</span>
              </div>
              <div className={`text-2xl font-bold mt-2 ${kpiResults.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatAmount(kpiResults.profit)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Net profit after all costs
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t('feasly.model.kpi_profit_margin')}</span>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className={`text-lg font-bold ${getStatusColor(kpiResults.profit_margin, { good: 20, fair: 10 })}`}>
              {formatPercent(kpiResults.profit_margin)}
            </div>
            <Progress 
              value={getProgressValue(kpiResults.profit_margin, 50)} 
              className="mt-2"
            />
            <div className="text-xs text-muted-foreground mt-1">
              Target: 20%+
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t('feasly.model.kpi_roi')}</span>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className={`text-lg font-bold ${getStatusColor(kpiResults.roi, { good: 15, fair: 8 })}`}>
              {formatPercent(kpiResults.roi)}
            </div>
            <Progress 
              value={getProgressValue(kpiResults.roi, 30)} 
              className="mt-2"
            />
            <div className="text-xs text-muted-foreground mt-1">
              Target: 15%+
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t('feasly.model.kpi_irr')}</span>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className={`text-lg font-bold ${getStatusColor(kpiResults.irr, { good: 12, fair: 8 })}`}>
              {formatPercent(kpiResults.irr)}
            </div>
            <Progress 
              value={getProgressValue(kpiResults.irr, 25)} 
              className="mt-2"
            />
            <div className="text-xs text-muted-foreground mt-1">
              Target: {formatPercent(formValues.target_irr || 0)}
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t('feasly.model.kpi_payback_period')}</span>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className={`text-lg font-bold ${getStatusColor(10 - kpiResults.payback_period, { good: 5, fair: 2 })}`}>
              {formatYears(kpiResults.payback_period)}
            </div>
            <Progress 
              value={100 - getProgressValue(kpiResults.payback_period, 10)} 
              className="mt-2"
            />
            <div className="text-xs text-muted-foreground mt-1">
              Target: &lt; 5 years
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Project Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Profitability Risk</span>
                <Badge variant={kpiResults.profit_margin > 15 ? "default" : kpiResults.profit_margin > 5 ? "secondary" : "destructive"}>
                  {kpiResults.profit_margin > 15 ? "Low" : kpiResults.profit_margin > 5 ? "Medium" : "High"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Return Risk</span>
                <Badge variant={kpiResults.roi > 12 ? "default" : kpiResults.roi > 6 ? "secondary" : "destructive"}>
                  {kpiResults.roi > 12 ? "Low" : kpiResults.roi > 6 ? "Medium" : "High"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Timeline Risk</span>
                <Badge variant={kpiResults.payback_period < 5 ? "default" : kpiResults.payback_period < 8 ? "secondary" : "destructive"}>
                  {kpiResults.payback_period < 5 ? "Low" : kpiResults.payback_period < 8 ? "Medium" : "High"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Islamic Finance Considerations */}
        {formValues.zakat_applicable && kpiResults.zakat_due > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Islamic Finance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t('feasly.model.zakat_due')}</span>
                <span className="text-lg font-bold text-primary">
                  {formatAmount(kpiResults.zakat_due)}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Based on {formatPercent(formValues.zakat_rate_percent || 0)} of profit
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary */}
        <div className="bg-primary/5 rounded-lg p-4">
          <h4 className="font-medium mb-2">Project Summary</h4>
          <p className="text-sm text-muted-foreground">
            {kpiResults.profit > 0 
              ? `This project shows positive returns with a profit margin of ${formatPercent(kpiResults.profit_margin)} and ROI of ${formatPercent(kpiResults.roi)}. The payback period is ${formatYears(kpiResults.payback_period)}.`
              : "This project currently shows negative returns. Consider adjusting costs, revenues, or other parameters to improve profitability."
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}