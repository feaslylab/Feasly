import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, Download, FileText, Calendar, Building2, TrendingUp, DollarSign } from 'lucide-react';
import { useEngine, useEngineNumbers } from '@/lib/engine/EngineContext';
import { useScenarioManager } from '@/hooks/useScenarioManager';
import { useCashSeries } from '@/hooks/useCashSeries';
import { CashChart } from '@/components/CashChart';
import { fmtCurrency } from '@/lib/utils';
import { ChartErrorBoundary } from '@/components/charts/ChartErrorBoundary';
import PptxGenJS from 'pptxgenjs';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
}

function KpiCard({ title, value, subtitle, icon: Icon, trend }: KpiCardProps) {
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-muted-foreground';
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className={`text-xs ${trendColor}`}>{subtitle}</p>
            )}
          </div>
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}

interface SourcesUsesRowProps {
  label: string;
  amount: number;
  percentage?: number;
}

function SourcesUsesRow({ label, amount, percentage }: SourcesUsesRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">{label}</TableCell>
      <TableCell className="text-right">{fmtCurrency(amount)}</TableCell>
      {percentage && (
        <TableCell className="text-right text-muted-foreground">
          {percentage.toFixed(1)}%
        </TableCell>
      )}
    </TableRow>
  );
}

export default function ExecutiveReportPanel() {
  const [isExporting, setIsExporting] = useState(false);
  const { inputs, output } = useEngine();
  const numbers = useEngineNumbers();
  const scenarioManager = useScenarioManager(inputs?.project_id || 'default');
  const cashSeries = useCashSeries();

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Check if we have enough data to generate a report
  const hasData = inputs && output && numbers;
  const currentScenario = scenarioManager.currentScenario;

  const handleExportToPowerPoint = async () => {
    if (!hasData) return;
    
    setIsExporting(true);
    try {
      const pptx = new PptxGenJS();
      
      // Slide 1: Title Slide
      const titleSlide = pptx.addSlide();
      titleSlide.addText('Feasly Executive Summary', {
        x: 1, y: 1.5, w: 8, h: 1,
        fontSize: 32, bold: true, color: '1f2937'
      });
      titleSlide.addText(`${currentScenario?.name || 'Baseline'} Scenario`, {
        x: 1, y: 2.5, w: 8, h: 0.5,
        fontSize: 18, color: '6b7280'
      });
      titleSlide.addText(`Generated on ${currentDate}`, {
        x: 1, y: 3, w: 8, h: 0.5,
        fontSize: 14, color: '9ca3af'
      });

      // Slide 2: Project Overview & KPIs
      const overviewSlide = pptx.addSlide();
      overviewSlide.addText('Project Overview & Key Metrics', {
        x: 0.5, y: 0.5, w: 9, h: 0.8,
        fontSize: 24, bold: true
      });

      // Add KPI table
      const kpiData = [
        ['Metric', 'Value'],
        ['IRR', `${(numbers.summary?.irr || 0).toFixed(1)}%`],
        ['TVPI', `${(numbers.summary?.tvpi || 0).toFixed(2)}x`],
        ['DPI', `${(numbers.summary?.dpi || 0).toFixed(2)}x`],
        ['MOIC', `${(numbers.summary?.moic || 0).toFixed(2)}x`]
      ];

      overviewSlide.addTable(kpiData, {
        x: 1, y: 1.5, w: 4, h: 3,
        border: { pt: 1, color: 'CFCFCF' },
        fill: { color: 'F8F9FA' }
      });

      // Slide 3: Sources & Uses
      const sourcesUsesSlide = pptx.addSlide();
      sourcesUsesSlide.addText('Sources & Uses of Funds', {
        x: 0.5, y: 0.5, w: 9, h: 0.8,
        fontSize: 24, bold: true
      });

      // Add sources and uses data
      const totalCosts = numbers.costs?.total || 0;
      const totalFinancing = numbers.financing?.total || 0;

      const sourcesUsesData = [
        ['Uses', 'Amount', 'Sources', 'Amount'],
        ['Construction', fmtCurrency(numbers.costs?.construction || 0), 'Equity', fmtCurrency(numbers.financing?.equity || 0)],
        ['Land', fmtCurrency(numbers.costs?.land || 0), 'Debt', fmtCurrency(numbers.financing?.debt || 0)],
        ['Total Uses', fmtCurrency(totalCosts), 'Total Sources', fmtCurrency(totalFinancing)]
      ];

      sourcesUsesSlide.addTable(sourcesUsesData, {
        x: 1, y: 1.5, w: 8, h: 4,
        border: { pt: 1, color: 'CFCFCF' }
      });

      // Save the presentation
      const fileName = `Feasly_Executive_Report_${currentScenario?.name || 'Baseline'}_${new Date().toISOString().split('T')[0]}.pptx`;
      await pptx.writeFile({ fileName });

    } catch (error) {
      console.error('Error exporting to PowerPoint:', error);
    } finally {
      setIsExporting(false);
    }
  };

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-96" data-section="executive_report">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-lg font-semibold">No Data Available</h3>
            <p className="text-muted-foreground">
              Run the model to generate the executive report
            </p>
          </div>
        </div>
      </div>
    );
  }

  const totalCosts = numbers.costs?.total || 0;
  const totalFinancing = numbers.financing?.total || 0;
  const equity = numbers.financing?.equity || 0;
  const debt = numbers.financing?.debt || 0;

  return (
    <div className="space-y-6" data-section="executive_report">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Feasly Executive Summary</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {currentDate}
            </div>
            <Badge variant="outline">{currentScenario?.name || 'Baseline'}</Badge>
          </div>
        </div>
        <Button 
          onClick={handleExportToPowerPoint}
          disabled={isExporting}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export to PowerPoint'}
        </Button>
      </div>

      <Separator />

      {/* Project Overview */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Project Overview
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard
            title="IRR"
            value={`${(numbers.summary?.irr || 0).toFixed(1)}%`}
            subtitle="Internal Rate of Return"
            icon={TrendingUp}
            trend="up"
          />
          <KpiCard
            title="TVPI"
            value={`${(numbers.summary?.tvpi || 0).toFixed(2)}x`}
            subtitle="Total Value to Paid-In"
            icon={DollarSign}
          />
          <KpiCard
            title="DPI"
            value={`${(numbers.summary?.dpi || 0).toFixed(2)}x`}
            subtitle="Distributions to Paid-In"
            icon={TrendingUp}
          />
          <KpiCard
            title="MOIC"
            value={`${(numbers.summary?.moic || 0).toFixed(2)}x`}
            subtitle="Multiple on Invested Capital"
            icon={DollarSign}
          />
        </div>
      </section>

      {/* Sources & Uses */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Sources & Uses of Funds</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Uses */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Uses</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <SourcesUsesRow
                    label="Construction"
                    amount={numbers.costs?.construction || 0}
                    percentage={((numbers.costs?.construction || 0) / totalCosts) * 100}
                  />
                  <SourcesUsesRow
                    label="Land"
                    amount={numbers.costs?.land || 0}
                    percentage={((numbers.costs?.land || 0) / totalCosts) * 100}
                  />
                  <SourcesUsesRow
                    label="Fees & Other"
                    amount={numbers.costs?.fees || 0}
                    percentage={((numbers.costs?.fees || 0) / totalCosts) * 100}
                  />
                  <TableRow className="border-t-2">
                    <TableCell className="font-bold">Total Uses</TableCell>
                    <TableCell className="text-right font-bold">
                      {fmtCurrency(totalCosts)}
                    </TableCell>
                    <TableCell className="text-right font-bold">100.0%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Sources */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <SourcesUsesRow
                    label="Equity"
                    amount={equity}
                    percentage={(equity / totalFinancing) * 100}
                  />
                  <SourcesUsesRow
                    label="Debt"
                    amount={debt}
                    percentage={(debt / totalFinancing) * 100}
                  />
                  <TableRow className="border-t-2">
                    <TableCell className="font-bold">Total Sources</TableCell>
                    <TableCell className="text-right font-bold">
                      {fmtCurrency(totalFinancing)}
                    </TableCell>
                    <TableCell className="text-right font-bold">100.0%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Cash Flow Chart */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Cash Flow Analysis</h2>
        <Card>
          <CardContent className="p-6">
            <ChartErrorBoundary>
              <CashChart data={cashSeries} className="h-80" />
            </ChartErrorBoundary>
          </CardContent>
        </Card>
      </section>

      {/* Waterfall Summary */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Waterfall Summary</h2>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8 bg-muted/30 rounded-lg">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Advanced Waterfall Analysis</h3>
              <p className="text-muted-foreground mb-4">
                Partner distributions, GP carry, and detailed waterfall logic available in Feasly Pro
              </p>
              <Button variant="outline" size="sm">
                Learn More
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Audit Trail */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Audit Trail</h2>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Generated:</span>
                <span>{currentDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Project ID:</span>
                <span className="font-mono">{inputs?.project_id || 'default'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Scenario:</span>
                <span>{currentScenario?.name || 'Baseline'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Scenario ID:</span>
                <span className="font-mono">{currentScenario?.id || 'baseline'}</span>
              </div>
            </div>
            <Separator className="my-4" />
            <p className="text-xs text-muted-foreground text-center">
              Generated by Feasly SaaS • Commercial Real Estate Financial Modeling Platform
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}