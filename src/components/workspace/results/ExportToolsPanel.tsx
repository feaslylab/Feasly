import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useEngine, useEngineNumbers } from '@/lib/engine/EngineContext';
import { FileDown, Save, Sparkles } from 'lucide-react';

export function ExportToolsPanel() {
  const { toast } = useToast();
  const { inputs } = useEngine();
  const numbers = useEngineNumbers();

  // Helper function to convert data to CSV format
  const convertToCSV = (data: any) => {
    if (!data || !data.equity || !data.cashflow) {
      return null;
    }

    const headers = ['Period', 'Net Cash Flow', 'Equity Calls', 'Distributions', 'Cumulative Equity', 'IRR'];
    const rows = [];

    const cashflow = Array.isArray(data.cashflow) ? data.cashflow : [];
    const equityCalls = Array.isArray(data.equity?.calls_total) ? data.equity.calls_total : [];
    const distributions = Array.isArray(data.equity?.dists_total) ? data.equity.dists_total : [];

    // Get the longest array to ensure all data is included
    const maxLength = Math.max(cashflow.length, equityCalls.length, distributions.length);

    for (let i = 0; i < maxLength; i++) {
      const period = i + 1;
      const netCashFlow = cashflow[i]?.netCashflow || 0;
      const equityCall = equityCalls[i] || 0;
      const distribution = distributions[i] || 0;
      const cumulativeEquity = equityCalls.slice(0, i + 1).reduce((sum: number, val: number) => sum + (val || 0), 0);
      const irr = data.equity?.kpis?.irr_pa || 0;

      rows.push([
        period,
        netCashFlow.toFixed(2),
        equityCall.toFixed(2),
        distribution.toFixed(2),
        cumulativeEquity.toFixed(2),
        i === 0 ? irr.toFixed(4) : '' // Only show IRR in first row
      ]);
    }

    // Convert to CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  };

  // Helper function to create snapshot data
  const createSnapshotData = () => {
    if (!inputs || !numbers) {
      return null;
    }

    const eq = numbers?.equity;
    const snapshot = {
      id: `snapshot_${Date.now()}`,
      name: `Export Snapshot ${new Date().toLocaleDateString()}`,
      createdAt: new Date().toISOString(),
      projectId: 'current_project',
      inputs,
      summary: {
        irr_pa: eq?.kpis?.irr_pa || null,
        tvpi: eq?.kpis?.tvpi || 0,
        dpi: eq?.kpis?.dpi || 0,
        rvpi: eq?.kpis?.rvpi || 0,
        moic: eq?.kpis?.moic || 0,
        gp_clawback_last: eq?.gp_clawback?.[eq?.gp_clawback.length - 1] || 0
      },
      traces: numbers
    };

    return snapshot;
  };

  // Download CSV handler
  const handleDownloadCSV = () => {
    try {
      if (!numbers || !numbers.equity) {
        toast({
          title: 'Export Failed',
          description: 'No financial data available to export. Please run the model first.',
          variant: 'destructive',
        });
        return;
      }

      const csvData = convertToCSV(numbers);
      if (!csvData) {
        toast({
          title: 'Export Failed',
          description: 'Unable to convert data to CSV format.',
          variant: 'destructive',
        });
        return;
      }

      // Create and download file
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'feasly-results.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'CSV Downloaded',
        description: 'Financial results exported successfully',
      });

      // Analytics event
      console.log('[Analytics] export_csv');
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'An error occurred while exporting CSV data.',
        variant: 'destructive',
      });
      console.error('CSV export error:', error);
    }
  };

  // Export snapshot handler
  const handleExportSnapshot = () => {
    try {
      if (!inputs || !numbers) {
        toast({
          title: 'Export Failed',
          description: 'No data available to export. Please run the model first.',
          variant: 'destructive',
        });
        return;
      }

      const snapshotData = createSnapshotData();
      if (!snapshotData) {
        toast({
          title: 'Export Failed',
          description: 'Unable to create snapshot data.',
          variant: 'destructive',
        });
        return;
      }

      // Create and download file
      const jsonString = JSON.stringify(snapshotData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'feasly-snapshot.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Snapshot Exported',
        description: 'Model snapshot downloaded successfully',
      });

      // Analytics event
      console.log('[Analytics] export_snapshot');
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'An error occurred while exporting snapshot data.',
        variant: 'destructive',
      });
      console.error('Snapshot export error:', error);
    }
  };

  // Check if data is available for exports
  const hasData = numbers && numbers.equity;
  const hasInputs = inputs && Object.keys(inputs).length > 0;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Export results and insights</p>
      
      {/* Export Actions */}
      <div className="flex flex-wrap gap-3">
        <Button 
          variant="outline" 
          onClick={handleDownloadCSV}
          disabled={!hasData}
          aria-label="Download financial results as CSV file"
        >
          <FileDown className="h-4 w-4 mr-2" />
          Download CSV
        </Button>
        <Button 
          variant="outline" 
          onClick={handleExportSnapshot}
          disabled={!hasInputs || !hasData}
          aria-label="Export current model state as JSON snapshot"
        >
          <Save className="h-4 w-4 mr-2" />
          Export Snapshot
        </Button>
      </div>

      {/* Status Information */}
      {!hasData && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm">
          <p className="text-amber-800">
            Run the model to generate data for export.
          </p>
        </div>
      )}
      
      {/* AI Insights Placeholder */}
      <Card className="border-dashed border-muted-foreground/30 bg-muted/20 hover:bg-muted/40 transition-colors">
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="rounded-full bg-muted p-3">
              <Sparkles className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h4 className="font-medium text-muted-foreground">
                AI-Generated Insights (Coming Soon)
              </h4>
              <p className="text-sm text-muted-foreground max-w-md">
                Soon you'll get narrative reports based on your financial results, 
                including automated analysis and recommendations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}