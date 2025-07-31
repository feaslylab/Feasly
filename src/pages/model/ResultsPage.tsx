import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KpiCard } from '@/components/results/KpiCard';
import { EquityWaterfall } from '@/components/results/EquityWaterfall';
import { CumulativeChart } from '@/components/results/CumulativeChart';
import { useScenarioResults } from '@/hooks/useScenarioResults';
import { Download, FileText, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useReportGeneration } from '@/hooks/useReportGeneration';

export default function ResultsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { projectId, scenarioId } = useParams<{ projectId: string; scenarioId: string }>();
  const { generateReport, isGenerating } = useReportGeneration();
  
  const { result, isLoading, error } = useScenarioResults(projectId || null, scenarioId || null);

  const handleGeneratePDF = async () => {
    if (!projectId || !scenarioId) return;
    
    try {
      const reportUrl = await generateReport(projectId, scenarioId, { reportType: 'standard' });
      
      // Open the report in a new tab
      window.open(reportUrl, '_blank');
    } catch (error) {
      // Error handling is done in the hook
      console.error('Failed to generate report:', error);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-destructive">{t('Error')}: {error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const kpis = result?.kpis;

  return (
    <div className="container mx-auto p-6 space-y-6 print:p-4">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t('Results & Insights')}
          </h1>
          <p className="text-muted-foreground">
            {t('Comprehensive project performance analysis')}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant={result ? 'default' : 'secondary'}>
            {result ? t('Analysis Complete') : t('No Data')}
          </Badge>
          <Button 
            onClick={handleGeneratePDF}
            disabled={isGenerating || !result}
            variant="outline"
            size="sm"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('Generating...')}
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                {t('Generate PDF')}
              </>
            )}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <KpiCard
              title={t('Net Present Value')}
              value={kpis?.npv || 0}
              format="currency"
              threshold={{ good: 0, warning: -100000 }}
              description={t('Discounted value of all cash flows')}
            />
            <KpiCard
              title={t('Internal Rate of Return')}
              value={kpis?.projectIRR || 0}
              format="percentage"
              threshold={{ good: 0.15, warning: 0.08 }}
              description={t('Annual return rate')}
            />
            <KpiCard
              title={t('Equity Multiple')}
              value={kpis?.equityMultiple || 0}
              format="number"
              decimals={2}
              suffix="x"
              threshold={{ good: 2, warning: 1.5 }}
              description={t('Total return on investment')}
            />
            <KpiCard
              title={t('Payback Period')}
              value={kpis?.paybackMonths || 0}
              format="number"
              suffix={t('months')}
              threshold={{ good: 24, warning: 48 }}
              reverseThreshold
              description={t('Time to break even')}
            />
            <KpiCard
              title={t('Peak Funding')}
              value={kpis?.peakFunding || 0}
              format="currency"
              threshold={{ good: 1000000, warning: 5000000 }}
              reverseThreshold
              description={t('Maximum capital requirement')}
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('Equity Waterfall Analysis')}</CardTitle>
              </CardHeader>
              <CardContent>
                <EquityWaterfall 
                  cashflow={result?.cashflow || []}
                  kpis={kpis}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('Cumulative Cash Flow & Debt')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CumulativeChart 
                  cashflow={result?.cashflow || []}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </div>

          {/* Performance Summary */}
          {result && (
            <Card className="print:break-inside-avoid">
              <CardHeader>
                <CardTitle>{t('Performance Summary')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">{t('Key Highlights')}</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• {t('Project generates positive NPV of')} {kpis?.npv?.toLocaleString('en-US', { style: 'currency', currency: 'AED' }) || 'N/A'}</li>
                      <li>• {t('Expected return rate of')} {((kpis?.projectIRR || 0) * 100).toFixed(1)}% {t('annually')}</li>
                      <li>• {t('Capital efficiency ratio of')} {kpis?.equityMultiple?.toFixed(2) || 'N/A'}x</li>
                      <li>• {t('Payback achieved in')} {kpis?.paybackMonths || 'N/A'} {t('months')}</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">{t('Risk Considerations')}</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• {t('Peak funding requirement:')} {kpis?.peakFunding?.toLocaleString('en-US', { style: 'currency', currency: 'AED' }) || 'N/A'}</li>
                      <li>• {t('Total profit potential:')} {result.kpis?.profit?.toLocaleString('en-US', { style: 'currency', currency: 'AED' }) || 'N/A'}</li>
                      <li>• {t('Consider running sensitivity analysis for key variables')}</li>
                      <li>• {t('Monitor construction cost escalation risks')}</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}