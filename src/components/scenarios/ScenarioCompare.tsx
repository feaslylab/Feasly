import { useMemo } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  loadScenarios,
  computeDeltas,
  exportComparisonCSV,
  type ScenarioId,
  type ScenarioSnapshot
} from '@/lib/scenarios';

interface ScenarioCompareProps {
  selectedIds: ScenarioId[];
}

export function ScenarioCompare({ selectedIds }: ScenarioCompareProps) {
  const { toast } = useToast();
  
  const scenarios = useMemo(() => {
    const state = loadScenarios();
    return selectedIds
      .map(id => state.items.find(item => item.id === id))
      .filter((item): item is ScenarioSnapshot => item !== undefined);
  }, [selectedIds]);

  const deltas = useMemo(() => {
    if (scenarios.length < 2) return [];
    
    const baseline = scenarios[0];
    return scenarios.slice(1).map(scenario => computeDeltas(baseline, scenario));
  }, [scenarios]);

  const formatNumber = (num: number | null, decimals = 2, suffix = '') => {
    if (num === null) return 'N/A';
    return num.toFixed(decimals) + suffix;
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  const formatDelta = (num: number | null, isPercentage = false, isCurrency = false) => {
    if (num === null) return 'N/A';
    
    const sign = num >= 0 ? '+' : '';
    const formatted = isCurrency 
      ? formatCurrency(Math.abs(num))
      : isPercentage 
        ? `${Math.abs(num).toFixed(1)}%`
        : Math.abs(num).toFixed(2);
    
    const colorClass = num >= 0 ? 'text-green-600' : 'text-red-600';
    
    return (
      <span className={colorClass}>
        {sign}{num < 0 ? '-' : ''}{formatted}
      </span>
    );
  };

  const handleExportCSV = () => {
    try {
      const csv = exportComparisonCSV(scenarios);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `scenario-comparison-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Export successful',
        description: 'Comparison exported to CSV file.'
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Unable to export comparison.',
        variant: 'destructive'
      });
    }
  };

  if (scenarios.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <div className="text-lg font-medium mb-2">No scenarios selected</div>
        <div className="text-sm">Select 1-3 scenarios from the list to compare them.</div>
      </div>
    );
  }

  const maxT = Math.max(...scenarios.map(s => s.traces.T));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Comparing {scenarios.length} scenario{scenarios.length > 1 ? 's' : ''}
        </h3>
        <Button onClick={handleExportCSV} variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* KPI Comparison Table */}
      <div>
        <h4 className="text-md font-medium mb-3">Key Performance Indicators</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              {scenarios.map((scenario, index) => (
                <TableHead key={scenario.id} className="text-right">
                  {scenario.name}
                  {index === 0 && scenarios.length > 1 && (
                    <div className="text-xs text-muted-foreground font-normal">(Baseline)</div>
                  )}
                </TableHead>
              ))}
              {deltas.map((_, index) => (
                <TableHead key={`delta-${index}`} className="text-right">
                  Δ vs Baseline
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">IRR (%)</TableCell>
              {scenarios.map(scenario => (
                <TableCell key={scenario.id} className="text-right">
                  {formatNumber(scenario.summary.irr_pa, 1, '%')}
                </TableCell>
              ))}
              {deltas.map((delta, index) => (
                <TableCell key={`delta-irr-${index}`} className="text-right">
                  {formatDelta(delta.kpi.irr_pa, true)}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">TVPI</TableCell>
              {scenarios.map(scenario => (
                <TableCell key={scenario.id} className="text-right">
                  {formatNumber(scenario.summary.tvpi, 2, 'x')}
                </TableCell>
              ))}
              {deltas.map((delta, index) => (
                <TableCell key={`delta-tvpi-${index}`} className="text-right">
                  {formatDelta(delta.kpi.tvpi)}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">DPI</TableCell>
              {scenarios.map(scenario => (
                <TableCell key={scenario.id} className="text-right">
                  {formatNumber(scenario.summary.dpi, 2, 'x')}
                </TableCell>
              ))}
              {deltas.map((delta, index) => (
                <TableCell key={`delta-dpi-${index}`} className="text-right">
                  {formatDelta(delta.kpi.dpi)}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">RVPI</TableCell>
              {scenarios.map(scenario => (
                <TableCell key={scenario.id} className="text-right">
                  {formatNumber(scenario.summary.rvpi, 2, 'x')}
                </TableCell>
              ))}
              {deltas.map((delta, index) => (
                <TableCell key={`delta-rvpi-${index}`} className="text-right">
                  {formatDelta(delta.kpi.rvpi)}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">MOIC</TableCell>
              {scenarios.map(scenario => (
                <TableCell key={scenario.id} className="text-right">
                  {formatNumber(scenario.summary.moic, 2, 'x')}
                </TableCell>
              ))}
              {deltas.map((delta, index) => (
                <TableCell key={`delta-moic-${index}`} className="text-right">
                  {formatDelta(delta.kpi.moic)}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">GP Clawback (Last)</TableCell>
              {scenarios.map(scenario => (
                <TableCell key={scenario.id} className="text-right">
                  {formatCurrency(scenario.summary.gp_clawback_last)}
                </TableCell>
              ))}
              {deltas.map((delta, index) => (
                <TableCell key={`delta-clawback-${index}`} className="text-right">
                  {formatDelta(delta.kpi.gp_clawback_last, false, true)}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Series Preview */}
      {maxT > 0 && (
        <div>
          <h4 className="text-md font-medium mb-3">Series Overview (First 12 Periods)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['calls_total', 'dists_total', 'gp_promote', 'gp_clawback'].map(seriesType => (
              <div key={seriesType} className="border rounded-lg p-4">
                <h5 className="font-medium mb-2 capitalize">
                  {seriesType.replace('_', ' ')}
                </h5>
                <div className="space-y-2 text-sm">
                  {scenarios.slice(0, 3).map(scenario => {
                    const series = scenario.traces[seriesType as keyof typeof scenario.traces] as number[];
                    const preview = series.slice(0, 12);
                    const sum = preview.reduce((a, b) => a + b, 0);
                    
                    return (
                      <div key={scenario.id} className="flex justify-between">
                        <span className="truncate">{scenario.name}</span>
                        <span className="font-mono">
                          {formatCurrency(sum)}
                        </span>
                      </div>
                    );
                  })}
                  
                  {deltas.length > 0 && (
                    <div className="border-t pt-2">
                      {deltas.map((delta, index) => {
                        const series = delta.series[seriesType as keyof typeof delta.series];
                        const preview = series.slice(0, 12);
                        const sum = preview.reduce((a, b) => a + b, 0);
                        
                        return (
                          <div key={`delta-${index}`} className="flex justify-between">
                            <span className="text-muted-foreground">Δ {scenarios[index + 1].name}</span>
                            <span className="font-mono">
                              {formatDelta(sum, false, true)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}