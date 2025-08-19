import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, DollarSign, TrendingUp, PieChart } from "lucide-react";
import { PortfolioKPIs } from "@/hooks/usePortfolioData";

interface PortfolioKPICardsProps {
  kpis: PortfolioKPIs;
}

export const PortfolioKPICards = ({ kpis }: PortfolioKPICardsProps) => {
  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis.totalProjects}</div>
          <div className="flex gap-1 mt-2">
            {kpis.statusBreakdown.map((status) => (
              <Badge 
                key={status.status}
                variant={
                  status.status === 'approved' ? 'default' :
                  status.status === 'under_review' ? 'secondary' : 'outline'
                }
                className="text-xs"
              >
                {status.count}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Total Development Value */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Dev Value</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(kpis.totalDevelopmentValue)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Across all scenarios
          </p>
        </CardContent>
      </Card>

      {/* Average IRR */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average IRR</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatPercentage(kpis.avgIRR)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Portfolio weighted
          </p>
        </CardContent>
      </Card>

      {/* Average MOIC */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average MOIC</CardTitle>
          <PieChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis.avgMOIC.toFixed(1)}x</div>
          <p className="text-xs text-muted-foreground mt-1">
            Money on invested capital
          </p>
        </CardContent>
      </Card>
    </div>
  );
};