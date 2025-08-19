import { fmtPct, fmtMult, fmtCurrency } from '@/lib/formatters';
import { useEngineNumbers } from '@/lib/engine/EngineContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TrendingUp, TrendingDown, Download, FileText, BarChart3 } from 'lucide-react';
import { ExportToolsPanel } from './results/ExportToolsPanel';

function Sparkline({ data }: { data: Array<number | null | undefined> }) {
  const valid = (data ?? []).filter(
    (v): v is number => typeof v === 'number' && Number.isFinite(v)
  );
  if (valid.length === 0) return null;

  const w = 160;
  const h = 40;

  // Single point: render a dot instead of a line
  if (valid.length === 1) {
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label="single data point">
        <circle cx={w / 2} cy={h / 2} r="3" fill="currentColor" />
      </svg>
    );
  }

  const max = valid.reduce((a, b) => (b > a ? b : a), 1);
  const min = valid.reduce((a, b) => (b < a ? b : a), 0);
  const range = max - min || 1;

  const step = valid.length > 1 ? w / (valid.length - 1) : 0;

  const points = valid
    .map((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / range) * (h - 4) - 2; // 2px vertical padding
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');

  if (!points) return null;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label="trend">
      <polyline fill="none" stroke="currentColor" strokeWidth="1.5" points={points} />
    </svg>
  );
}

function Metric({ label, value, tooltip }: { label: string; value: string; tooltip?: string }) {
  const content = (
    <div className="rounded-md border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-base font-semibold">{value}</div>
    </div>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">📉 No Results Yet</h3>
      <p className="text-muted-foreground">
        Run the model to see financial projections and KPIs.
      </p>
    </div>
  );
}

function CashFlowTable({ numbers }: { numbers: any }) {
  const cashflow = numbers?.cashflow ?? [];
  
  if (!Array.isArray(cashflow) || cashflow.length === 0) {
    return <div className="text-sm text-muted-foreground">No cash flow data available.</div>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Cash flow breakdown over project lifecycle</p>
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-3 text-left">Period</th>
              <th className="p-3 text-right">Net Cash Flow</th>
              <th className="p-3 text-right">Equity Calls</th>
              <th className="p-3 text-right">Distributions</th>
            </tr>
          </thead>
          <tbody>
            {cashflow.slice(0, 10).map((row: any, i: number) => (
              <tr key={i} className="border-b">
                <td className="p-3">{row?.month || `Period ${i + 1}`}</td>
                <td className="p-3 text-right">{fmtCurrency(row?.netCashflow, 'AED')}</td>
                <td className="p-3 text-right">{fmtCurrency(row?.equityInjected, 'AED')}</td>
                <td className="p-3 text-right">{fmtCurrency(row?.revenue, 'AED')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FinancingDetails({ numbers }: { numbers: any }) {
  const debt = numbers?.debt ?? {};
  const totalDraws = debt?.draws_total ?? [];
  
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Financing structure and repayment over time</p>
      
      {totalDraws.length > 0 ? (
        <div className="space-y-3">
          <div className="rounded-md border p-3">
            <div className="text-xs text-muted-foreground">Total Loan Draws</div>
            <div className="text-base font-semibold">{fmtCurrency(totalDraws.reduce((a: number, b: number) => a + (b || 0), 0), 'AED')}</div>
          </div>
          
          <div>
            <div className="text-sm font-medium mb-2">Loan Principal Curve</div>
            <Sparkline data={totalDraws} />
          </div>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">No financing data available.</div>
      )}
    </div>
  );
}


function ResultsPanelContent({ currency = 'AED' }: { currency?: string }) {
  const numbers = useEngineNumbers();
  const eq = numbers?.equity ?? null;

  const irr = eq?.kpis?.irr_pa ?? null;
  const tvpi = eq?.kpis?.tvpi ?? null;
  const dpi = eq?.kpis?.dpi ?? null;
  const rvpi = eq?.kpis?.rvpi ?? null;
  const moic = eq?.kpis?.moic ?? null;

  const T = Array.isArray(eq?.calls_total) ? eq!.calls_total.length : 0;
  const last = Math.max(0, T - 1);
  const claw = Number(eq?.gp_clawback?.[last] ?? 0);

  const dists = Array.isArray(eq?.dists_total) ? eq!.dists_total.map(Number) : [];

  if (!numbers || !eq) {
    return (
      <div className="space-y-6" data-section="results">
        <div>
          <h2 className="text-lg font-semibold">Results</h2>
          <p className="text-sm text-muted-foreground">View projected financial outcomes and performance KPIs.</p>
        </div>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-section="results">
      <div>
        <h2 className="text-lg font-semibold">Results</h2>
        <p className="text-sm text-muted-foreground">View projected financial outcomes and performance KPIs.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Metric 
          label="IRR (pa)" 
          value={fmtPct(irr)} 
          tooltip="Internal Rate of Return - the annualized return on equity investment"
        />
        <Metric 
          label="TVPI" 
          value={fmtMult(tvpi)} 
          tooltip="Total Value to Paid-In - total value relative to invested capital"
        />
        <Metric 
          label="DPI" 
          value={fmtMult(dpi)} 
          tooltip="Distributions to Paid-In - cash returned relative to invested capital"
        />
        <Metric 
          label="RVPI" 
          value={fmtMult(rvpi)} 
          tooltip="Residual Value to Paid-In - remaining value relative to invested capital"
        />
        <Metric 
          label="MOIC" 
          value={fmtMult(moic)} 
          tooltip="Multiple of Invested Capital - total return multiple on investment"
        />
        {claw > 0 && (
          <Metric 
            label="GP Clawback" 
            value={fmtCurrency(claw, currency)} 
            tooltip="Outstanding GP clawback amount at project end"
          />
        )}
      </div>

      {/* Distributions Timeline */}
      <section className="space-y-2">
        <div className="text-sm font-medium">Distribution Timeline</div>
        {dists.length > 0 ? (
          <Sparkline data={dists} />
        ) : (
          <div className="text-sm text-muted-foreground">No distribution data yet.</div>
        )}
      </section>

      {/* Tabbed Detailed Results */}
      <Tabs defaultValue="returns" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="returns">Returns</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          <TabsTrigger value="financing">Financing</TabsTrigger>
          <TabsTrigger value="export">Export / AI Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="returns" className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Detailed Return Metrics</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Detailed return metrics over the project lifecycle
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Metric label="IRR (pa)" value={fmtPct(irr)} />
              <Metric label="TVPI" value={fmtMult(tvpi)} />
              <Metric label="MOIC" value={fmtMult(moic)} />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="cashflow">
          <CashFlowTable numbers={numbers} />
        </TabsContent>
        
        <TabsContent value="financing">
          <FinancingDetails numbers={numbers} />
        </TabsContent>
        
        <TabsContent value="export">
          <ExportToolsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ResultsPanel({ currency = 'AED' }: { currency?: string }) {
  return (
    <ErrorBoundary>
      <ResultsPanelContent currency={currency} />
    </ErrorBoundary>
  );
}