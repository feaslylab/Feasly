import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useSensitivityAnalysis } from '@/hooks/useSensitivityAnalysis';
import { TornadoChart } from '@/components/risk/TornadoChart';
import { SensitivityTable } from '@/components/risk/SensitivityTable';
import { Loader2, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function RiskPage() {
  const { t } = useTranslation();
  const { projectId, scenarioId } = useParams<{ projectId: string; scenarioId: string }>();
  
  const [costVariation, setCostVariation] = useState(0);
  const [salePriceVariation, setSalePriceVariation] = useState(0);
  const [interestRateVariation, setInterestRateVariation] = useState(0);
  
  const { result, isAnalyzing, runSensitivity, error } = useSensitivityAnalysis(
    projectId || null,
    scenarioId || null
  );

  const handleRunSensitivity = () => {
    runSensitivity({
      costVariationPercent: costVariation,
      salePriceVariationPercent: salePriceVariation,
      interestRateVariationBps: interestRateVariation * 100 // Convert % to bps
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'AED',
      notation: Math.abs(value) > 1000000 ? 'compact' : 'standard',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <span>{t('Error')}: {error}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t('Risk & Sensitivity Analysis')}
          </h1>
          <p className="text-muted-foreground">
            {t('Analyze how changes in key variables affect project returns')}
          </p>
        </div>
        
        <Badge variant={result ? 'default' : 'secondary'} className="flex items-center gap-2">
          {result ? (
            <>
              <TrendingUp className="h-4 w-4" />
              {t('Analysis Complete')}
            </>
          ) : (
            <>
              <TrendingDown className="h-4 w-4" />
              {t('No Analysis Run')}
            </>
          )}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('Sensitivity Variables')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Cost Variation */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                {t('Construction Cost Variation')}
              </Label>
              <div className="space-y-2">
                <Slider
                  value={[costVariation]}
                  onValueChange={([value]) => setCostVariation(value)}
                  min={-50}
                  max={50}
                  step={1}
                  className="w-full"
                />
                <div className="flex items-center justify-between">
                  <Input
                    type="number"
                    value={costVariation}
                    onChange={(e) => setCostVariation(Number(e.target.value))}
                    className="w-20 h-8 text-xs"
                    min={-50}
                    max={50}
                  />
                  <span className="text-xs text-muted-foreground">
                    {formatPercentage(costVariation)}
                  </span>
                </div>
              </div>
            </div>

            {/* Sale Price Variation */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                {t('Sale Price Variation')}
              </Label>
              <div className="space-y-2">
                <Slider
                  value={[salePriceVariation]}
                  onValueChange={([value]) => setSalePriceVariation(value)}
                  min={-50}
                  max={50}
                  step={1}
                  className="w-full"
                />
                <div className="flex items-center justify-between">
                  <Input
                    type="number"
                    value={salePriceVariation}
                    onChange={(e) => setSalePriceVariation(Number(e.target.value))}
                    className="w-20 h-8 text-xs"
                    min={-50}
                    max={50}
                  />
                  <span className="text-xs text-muted-foreground">
                    {formatPercentage(salePriceVariation)}
                  </span>
                </div>
              </div>
            </div>

            {/* Interest Rate Variation */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                {t('Interest Rate Variation')}
              </Label>
              <div className="space-y-2">
                <Slider
                  value={[interestRateVariation]}
                  onValueChange={([value]) => setInterestRateVariation(value)}
                  min={-5}
                  max={5}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex items-center justify-between">
                  <Input
                    type="number"
                    value={interestRateVariation}
                    onChange={(e) => setInterestRateVariation(Number(e.target.value))}
                    className="w-20 h-8 text-xs"
                    min={-5}
                    max={5}
                    step={0.1}
                  />
                  <span className="text-xs text-muted-foreground">
                    {formatPercentage(interestRateVariation)}
                  </span>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleRunSensitivity}
              disabled={isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('Analyzing...')}
                </>
              ) : (
                t('Run Sensitivity Analysis')
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tornado Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('Impact Analysis')}</CardTitle>
            </CardHeader>
            <CardContent>
              <TornadoChart
                data={result}
                isLoading={isAnalyzing}
              />
            </CardContent>
          </Card>

          {/* Sensitivity Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('Scenario Outcomes')}</CardTitle>
            </CardHeader>
            <CardContent>
              <SensitivityTable
                data={result}
                isLoading={isAnalyzing}
                baseKpis={result?.baseKpis}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}