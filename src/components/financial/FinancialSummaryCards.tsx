import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { calculateFinancialMetrics, type FinancialMetrics } from "@/lib/financialCalculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  convertCurrency, 
  formatCurrencyAmount, 
  getExchangeRates, 
  getExchangeRate,
  type ExchangeRate 
} from "@/lib/currencyConversion";
import { 
  DollarSign, 
  TrendingUp, 
  Percent, 
  Calculator,
  Clock,
  Building2
} from "lucide-react";

interface Asset {
  id: string;
  gfa_sqm: number;
  construction_cost_aed: number;
  annual_operating_cost_aed: number;
  annual_revenue_aed: number;
  occupancy_rate_percent: number;
  cap_rate_percent: number;
  development_timeline_months: number;
  stabilization_period_months: number;
}

interface ScenarioOverride {
  asset_id: string;
  field_name: string;
  override_value: number;
}

interface FinancialSummaryCardsProps {
  projectId: string;
  selectedScenarioId?: string | null;
  assets?: Asset[];
  projectCurrency?: string;
  showOriginalCurrency?: boolean;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatPercentage = (value: number, decimals = 1) => {
  return `${value.toFixed(decimals)}%`;
};

const formatYears = (years: number) => {
  if (years < 0) return "No payback";
  if (years > 10) return ">10 years";
  return `${years.toFixed(1)} years`;
};

export const FinancialSummaryCards = ({ 
  projectId, 
  selectedScenarioId, 
  assets = [],
  projectCurrency = "AED",
  showOriginalCurrency = true
}: FinancialSummaryCardsProps) => {
  const { toast } = useToast();

  // Fetch exchange rates
  const { data: exchangeRates = [], isLoading: ratesLoading } = useQuery({
    queryKey: ["exchange-rates"],
    queryFn: getExchangeRates,
  });

  // Fetch scenario overrides for calculations
  const { data: overrides = [], isLoading: overridesLoading } = useQuery({
    queryKey: ["scenario-overrides", selectedScenarioId],
    queryFn: async () => {
      if (!selectedScenarioId) return [];
      
      const { data, error } = await supabase
        .from("scenario_overrides")
        .select("asset_id, field_name, override_value")
        .eq("scenario_id", selectedScenarioId);

      if (error) {
        console.error("Error fetching overrides:", error);
        // Don't show toast for this error as it's expected for now
        return [];
      }
      return (data || []) as ScenarioOverride[];
    },
    enabled: !!selectedScenarioId,
  });

  // Calculate financial metrics
  const metrics: FinancialMetrics = useMemo(() => {
    try {
      return calculateFinancialMetrics(assets, overrides);
    } catch (error) {
      console.error("Financial calculation error:", error);
      toast({
        title: "Calculation Error",
        description: "Failed to calculate financial metrics. Please check your data.",
        variant: "destructive",
      });
      return {
        totalConstructionCost: 0,
        totalRevenue: 0,
        totalOperatingCost: 0,
        profitMargin: 0,
        irr: 0,
        paybackPeriod: -1,
      };
    }
  }, [assets, overrides, toast]);

  // Convert currency values to AED if needed
  const convertedMetrics = useMemo(() => {
    if (projectCurrency === "AED" || exchangeRates.length === 0) {
      return metrics;
    }

    return {
      ...metrics,
      totalConstructionCost: convertCurrency(
        metrics.totalConstructionCost, 
        projectCurrency, 
        "AED", 
        exchangeRates
      ),
      totalRevenue: convertCurrency(
        metrics.totalRevenue, 
        projectCurrency, 
        "AED", 
        exchangeRates
      ),
      totalOperatingCost: convertCurrency(
        metrics.totalOperatingCost, 
        projectCurrency, 
        "AED", 
        exchangeRates
      ),
    };
  }, [metrics, projectCurrency, exchangeRates]);

  if (overridesLoading || ratesLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-3 w-1/2 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const summaryCards = [
    {
      title: "Total Construction Cost",
      value: (() => {
        const rate = getExchangeRate(projectCurrency, "AED", exchangeRates);
        return formatCurrencyAmount({
          amount: metrics.totalConstructionCost,
          currency: projectCurrency,
          convertedToAED: showOriginalCurrency && projectCurrency !== "AED" ? convertedMetrics.totalConstructionCost : undefined,
          showOriginal: showOriginalCurrency,
          rate: rate || undefined
        });
      })(),
      subtitle: `${assets.length} asset${assets.length === 1 ? "" : "s"}`,
      icon: Building2,
      color: "text-blue-600",
    },
    {
      title: "Annual Revenue",
      value: (() => {
        const rate = getExchangeRate(projectCurrency, "AED", exchangeRates);
        return formatCurrencyAmount({
          amount: metrics.totalRevenue,
          currency: projectCurrency,
          convertedToAED: showOriginalCurrency && projectCurrency !== "AED" ? convertedMetrics.totalRevenue : undefined,
          showOriginal: showOriginalCurrency,
          rate: rate || undefined
        });
      })(),
      subtitle: "With occupancy rates",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Profit Margin",
      value: { display: formatPercentage(metrics.profitMargin) },
      subtitle: "After operating costs",
      icon: Percent,
      color: metrics.profitMargin > 0 ? "text-green-600" : "text-red-600",
    },
    {
      title: "IRR (10-year)",
      value: { display: formatPercentage(metrics.irr) },
      subtitle: "Internal rate of return",
      icon: Calculator,
      color: metrics.irr > 0 ? "text-green-600" : "text-red-600",
    },
    {
      title: "Payback Period",
      value: { display: formatYears(metrics.paybackPeriod) },
      subtitle: "Time to break even",
      icon: Clock,
      color: metrics.paybackPeriod > 0 && metrics.paybackPeriod <= 5 ? "text-green-600" : 
             metrics.paybackPeriod > 5 && metrics.paybackPeriod <= 10 ? "text-yellow-600" : "text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {summaryCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="hover:shadow-elevation-2 transition-shadow shadow-elevation-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-xl sm:text-2xl font-bold ${card.color}`}>
                {typeof card.value === 'string' ? card.value : card.value.display}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.subtitle}
              </p>
              {typeof card.value === 'object' && card.value.footnote && (
                <p className="text-xs text-muted-foreground italic mt-1">
                  {card.value.footnote}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};