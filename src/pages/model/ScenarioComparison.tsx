import { useParams } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileText, Copy, TrendingUp, TrendingDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface ComparisonData {
  scenarioId: string;
  scenarioName: string;
  kpis: {
    npv: number;
    projectIRR: number;
    equityMultiple: number;
    paybackMonths: number;
    peakFunding: number;
    profit: number;
  } | null;
  error?: string;
}

export default function ScenarioComparison() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { projectId, scenarioId } = useParams<{ projectId: string; scenarioId: string }>();
  
  const [comparisons, setComparisons] = useState<ComparisonData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [showPercentageDeltas, setShowPercentageDeltas] = useState(true);
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  const [projectName, setProjectName] = useState('');

  // Load scenarios and comparison data
  useEffect(() => {
    const loadData = async () => {
      if (!projectId || !scenarioId) return;

      try {
        setIsLoading(true);

        // Get project name
        const { data: project } = await supabase
          .from('projects')
          .select('name')
          .eq('id', projectId)
          .single();

        if (project) {
          setProjectName(project.name);
        }

        // Get all scenarios for this project
        const { data: scenarios, error: scenarioError } = await supabase
          .from('scenarios')
          .select('id, name')
          .eq('project_id', projectId)
          .limit(4); // Base + 3 alternatives max

        if (scenarioError) {
          console.error('Error fetching scenarios:', scenarioError);
          throw scenarioError;
        }

        if (!scenarios || scenarios.length === 0) {
          toast({
            title: t('No scenarios found'),
            description: t('Create additional scenarios to compare'),
            variant: 'destructive'
          });
          return;
        }

        // Set base scenario and first 3 alternatives
        const baseScenario = scenarios.find(s => s.id === scenarioId) || scenarios[0];
        const alternativeScenarios = scenarios
          .filter(s => s.id !== baseScenario.id)
          .slice(0, 3);

        const scenarioIds = [baseScenario.id, ...alternativeScenarios.map(s => s.id)];
        setSelectedScenarios(scenarioIds);

        // Call comparison edge function
        const { data: comparisonData, error } = await supabase.functions.invoke('compare', {
          body: {
            projectId,
            scenarioIds
          }
        });

        if (error) {
          throw error;
        }

        setComparisons(comparisonData.comparisons || []);

      } catch (error) {
        console.error('Error loading comparison data:', error);
        toast({
          title: t('Failed to load comparison'),
          description: t('Please try again'),
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [projectId, scenarioId, t, toast]);

  // Calculate deltas relative to base scenario
  const baseScenario = comparisons[0];
  const comparisonDeltas = useMemo(() => {
    if (!baseScenario?.kpis) return [];

    return comparisons.slice(1).map(comp => {
      if (!comp.kpis) return { ...comp, deltas: null };

      const deltas = {
        npv: {
          absolute: comp.kpis.npv - baseScenario.kpis.npv,
          percentage: baseScenario.kpis.npv !== 0 ? 
            ((comp.kpis.npv - baseScenario.kpis.npv) / Math.abs(baseScenario.kpis.npv)) * 100 : 0
        },
        projectIRR: {
          absolute: (comp.kpis.projectIRR - baseScenario.kpis.projectIRR) * 100,
          percentage: baseScenario.kpis.projectIRR !== 0 ? 
            ((comp.kpis.projectIRR - baseScenario.kpis.projectIRR) / baseScenario.kpis.projectIRR) * 100 : 0
        },
        equityMultiple: {
          absolute: comp.kpis.equityMultiple - baseScenario.kpis.equityMultiple,
          percentage: baseScenario.kpis.equityMultiple !== 0 ? 
            ((comp.kpis.equityMultiple - baseScenario.kpis.equityMultiple) / baseScenario.kpis.equityMultiple) * 100 : 0
        },
        paybackMonths: {
          absolute: comp.kpis.paybackMonths - baseScenario.kpis.paybackMonths,
          percentage: baseScenario.kpis.paybackMonths !== 0 ? 
            ((comp.kpis.paybackMonths - baseScenario.kpis.paybackMonths) / baseScenario.kpis.paybackMonths) * 100 : 0
        },
        peakFunding: {
          absolute: comp.kpis.peakFunding - baseScenario.kpis.peakFunding,
          percentage: baseScenario.kpis.peakFunding !== 0 ? 
            ((comp.kpis.peakFunding - baseScenario.kpis.peakFunding) / Math.abs(baseScenario.kpis.peakFunding)) * 100 : 0
        }
      };

      return { ...comp, deltas };
    });
  }, [comparisons, baseScenario]);

  const handleExportXLSX = async () => {
    if (!projectName || comparisons.length === 0) return;

    setIsExporting(true);
    toast({
      title: t('Generating Excel Export'),
      description: t('Preparing comparison data...'),
    });

    try {
      // Create worker for XLSX generation
      const worker = new Worker(new URL('/src/workers/xlsx.worker.ts', import.meta.url), {
        type: 'module'
      });

      worker.postMessage({
        type: 'generate',
        data: {
          projectName,
          comparisons
        }
      });

      worker.onmessage = (event) => {
        const { type, data, filename, error } = event.data;

        if (type === 'success') {
          // Create download link
          const blob = new Blob([data], { 
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
          });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          toast({
            title: t('Export Complete'),
            description: t('Excel file downloaded successfully'),
          });
        } else if (type === 'error') {
          throw new Error(error);
        }

        worker.terminate();
        setIsExporting(false);
      };

    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: t('Export Failed'),
        description: t('Failed to generate Excel file'),
        variant: 'destructive'
      });
      setIsExporting(false);
    }
  };

  const handleCloneScenario = async (sourceScenarioId: string) => {
    toast({
      title: t('Clone Scenario'),
      description: t('This feature will be available soon'),
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'AED',
      notation: 'compact',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatDelta = (delta: { absolute: number; percentage: number }, format: 'currency' | 'percentage' | 'number', suffix = '') => {
    const value = showPercentageDeltas ? delta.percentage : delta.absolute;
    const isPositive = value > 0;
    const isNegative = value < 0;
    
    let formattedValue = '';
    if (showPercentageDeltas) {
      formattedValue = `${value.toFixed(1)}%`;
    } else {
      if (format === 'currency') {
        formattedValue = formatCurrency(Math.abs(value));
      } else if (format === 'percentage') {
        formattedValue = `${Math.abs(value).toFixed(1)}%`;
      } else {
        formattedValue = `${Math.abs(value).toFixed(1)}${suffix}`;
      }
    }

    return (
      <span className={cn(
        'flex items-center gap-1 font-medium',
        isPositive && 'text-success',
        isNegative && 'text-destructive'
      )}>
        {isPositive && <TrendingUp className="h-3 w-3" />}
        {isNegative && <TrendingDown className="h-3 w-3" />}
        {isPositive && !showPercentageDeltas ? '+' : ''}{formattedValue}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="h-8 bg-muted animate-pulse rounded w-1/3"></div>
          <div className="h-96 bg-muted animate-pulse rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t('Scenario Comparison')}
          </h1>
          <p className="text-muted-foreground">
            {t('Compare financial performance across scenarios')}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {showPercentageDeltas ? t('% Change') : t('Absolute Change')}
            </span>
            <Switch 
              checked={showPercentageDeltas}
              onCheckedChange={setShowPercentageDeltas}
              data-testid="delta-toggle"
            />
          </div>
          <Button 
            onClick={handleExportXLSX}
            disabled={isExporting || comparisons.length === 0}
            variant="outline"
            size="sm"
            data-testid="export-xlsx-btn"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? t('Exporting...') : t('Export XLSX')}
          </Button>
        </div>
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('Financial Metrics Comparison')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-40">{t('Metric')}</TableHead>
                  <TableHead className="text-center">
                    <div className="flex flex-col items-center">
                      <span>{baseScenario?.scenarioName || t('Base')}</span>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {t('Base')}
                      </Badge>
                    </div>
                  </TableHead>
                  {comparisonDeltas.map((comp, index) => (
                    <TableHead key={comp.scenarioId} className="text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span>{comp.scenarioName}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => handleCloneScenario(comp.scenarioId)}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          {t('Clone')}
                        </Button>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* NPV Row */}
                <TableRow>
                  <TableCell className="font-medium">{t('Net Present Value')}</TableCell>
                  <TableCell className="text-center">
                    {baseScenario?.kpis ? formatCurrency(baseScenario.kpis.npv) : 'N/A'}
                  </TableCell>
                  {comparisonDeltas.map((comp) => (
                    <TableCell key={comp.scenarioId} className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span>{comp.kpis ? formatCurrency(comp.kpis.npv) : 'Error'}</span>
                        {comp.deltas && (
                          <div className="text-sm">
                            {formatDelta(comp.deltas.npv, 'currency')}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>

                {/* IRR Row */}
                <TableRow>
                  <TableCell className="font-medium">{t('Internal Rate of Return')}</TableCell>
                  <TableCell className="text-center">
                    {baseScenario?.kpis ? formatPercentage(baseScenario.kpis.projectIRR) : 'N/A'}
                  </TableCell>
                  {comparisonDeltas.map((comp) => (
                    <TableCell key={comp.scenarioId} className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span>{comp.kpis ? formatPercentage(comp.kpis.projectIRR) : 'Error'}</span>
                        {comp.deltas && (
                          <div className="text-sm">
                            {formatDelta(comp.deltas.projectIRR, 'percentage')}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>

                {/* Equity Multiple Row */}
                <TableRow>
                  <TableCell className="font-medium">{t('Equity Multiple')}</TableCell>
                  <TableCell className="text-center">
                    {baseScenario?.kpis ? `${baseScenario.kpis.equityMultiple.toFixed(2)}x` : 'N/A'}
                  </TableCell>
                  {comparisonDeltas.map((comp) => (
                    <TableCell key={comp.scenarioId} className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span>{comp.kpis ? `${comp.kpis.equityMultiple.toFixed(2)}x` : 'Error'}</span>
                        {comp.deltas && (
                          <div className="text-sm">
                            {formatDelta(comp.deltas.equityMultiple, 'number', 'x')}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>

                {/* Payback Period Row */}
                <TableRow>
                  <TableCell className="font-medium">{t('Payback Period')}</TableCell>
                  <TableCell className="text-center">
                    {baseScenario?.kpis ? `${baseScenario.kpis.paybackMonths} ${t('months')}` : 'N/A'}
                  </TableCell>
                  {comparisonDeltas.map((comp) => (
                    <TableCell key={comp.scenarioId} className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span>{comp.kpis ? `${comp.kpis.paybackMonths} ${t('months')}` : 'Error'}</span>
                        {comp.deltas && (
                          <div className="text-sm">
                            {formatDelta(comp.deltas.paybackMonths, 'number', ' mo')}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>

                {/* Peak Funding Row */}
                <TableRow>
                  <TableCell className="font-medium">{t('Peak Funding')}</TableCell>
                  <TableCell className="text-center">
                    {baseScenario?.kpis ? formatCurrency(baseScenario.kpis.peakFunding) : 'N/A'}
                  </TableCell>
                  {comparisonDeltas.map((comp) => (
                    <TableCell key={comp.scenarioId} className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span>{comp.kpis ? formatCurrency(comp.kpis.peakFunding) : 'Error'}</span>
                        {comp.deltas && (
                          <div className="text-sm">
                            {formatDelta(comp.deltas.peakFunding, 'currency')}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Insights */}
      {comparisonDeltas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('Key Insights')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">{t('Best Performing Scenarios')}</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>• {t('Highest NPV')}: {
                    [...comparisons].sort((a, b) => (b.kpis?.npv || 0) - (a.kpis?.npv || 0))[0]?.scenarioName || 'N/A'
                  }</div>
                  <div>• {t('Highest IRR')}: {
                    [...comparisons].sort((a, b) => (b.kpis?.projectIRR || 0) - (a.kpis?.projectIRR || 0))[0]?.scenarioName || 'N/A'
                  }</div>
                  <div>• {t('Fastest Payback')}: {
                    [...comparisons].sort((a, b) => (a.kpis?.paybackMonths || Infinity) - (b.kpis?.paybackMonths || Infinity))[0]?.scenarioName || 'N/A'
                  }</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">{t('Risk Considerations')}</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>• {t('Lowest Peak Funding')}: {
                    [...comparisons].sort((a, b) => (a.kpis?.peakFunding || Infinity) - (b.kpis?.peakFunding || Infinity))[0]?.scenarioName || 'N/A'
                  }</div>
                  <div>• {t('Consider sensitivity analysis for scenario selection')}</div>
                  <div>• {t('Validate assumptions across all scenarios')}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}