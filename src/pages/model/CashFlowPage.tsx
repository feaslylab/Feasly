import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CashFlowTable } from '@/components/model/CashFlowTable';
import { CashFlowChart } from '@/components/model/CashFlowChart';
import { ExportButton } from '@/components/model/ExportButton';
import { useScenarioCalculation } from '@/hooks/useScenarioCalculation';
import { useConstructionStoreScenario, useSaleStore, useRentalStore } from '@/hooks/useTableStores';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function CashFlowPage() {
  const { projectId, scenarioId } = useParams<{ projectId: string; scenarioId: string }>();
  
  const { items: constructionItems } = useConstructionStoreScenario(projectId!, scenarioId);
  const { items: saleItems } = useSaleStore(projectId!, scenarioId);
  const { items: rentalItems } = useRentalStore(projectId!, scenarioId);
  
  const { result, isCalculating, error, calculateScenario } = useScenarioCalculation(
    projectId || null, 
    scenarioId || null
  );

  // Trigger calculation when data changes
  useEffect(() => {
    if (constructionItems.length > 0 || saleItems.length > 0 || rentalItems.length > 0) {
      calculateScenario({
        constructionItems: constructionItems.map(item => ({
          baseCost: item.base_cost,
          startPeriod: item.start_period,
          endPeriod: item.end_period,
          escalationRate: item.escalation_rate,
          retentionPercent: item.retention_percent,
          retentionReleaseLag: item.retention_release_lag,
        })),
        saleLines: saleItems.map(item => ({
          units: item.units,
          pricePerUnit: item.price_per_unit,
          startPeriod: item.start_period,
          endPeriod: item.end_period,
          escalation: item.escalation,
        })),
        rentalLines: rentalItems.map(item => ({
          rooms: item.rooms,
          adr: item.adr,
          occupancyRate: item.occupancy_rate,
          startPeriod: item.start_period,
          endPeriod: item.end_period,
          annualEscalation: item.annual_escalation,
        })),
        horizon: 60
      });
    }
  }, [constructionItems, saleItems, rentalItems, calculateScenario]);

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-destructive">Error: {error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cash Flow Analysis</h1>
          <p className="text-muted-foreground">
            Monthly cash flow projections and cumulative analysis
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {isCalculating && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Calculating...</span>
            </div>
          )}
          <ExportButton cashflow={result?.cashflow || []} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cash Flow Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <CashFlowChart 
              cashflow={result?.cashflow || []} 
              isLoading={isCalculating}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Performance Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            {result?.kpis ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {result.kpis.npv.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'AED',
                      maximumFractionDigits: 0
                    })}
                  </div>
                  <div className="text-sm text-muted-foreground">Net Present Value</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {(result.kpis.projectIRR * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Internal Rate of Return</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {result.kpis.totalRevenue.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'AED',
                      maximumFractionDigits: 0
                    })}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Revenue</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {result.kpis.profit.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'AED',
                      maximumFractionDigits: 0
                    })}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Profit</div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                {isCalculating ? 'Calculating KPIs...' : 'No data available'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Cash Flow Table</CardTitle>
        </CardHeader>
        <CardContent>
          <CashFlowTable 
            cashflow={result?.cashflow || []} 
            isLoading={isCalculating}
          />
        </CardContent>
      </Card>
    </div>
  );
}