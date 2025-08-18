import { fmtPct, fmtMult, fmtCurrency } from '@/lib/formatters';
import { useEngineNumbers } from '@/lib/engine/EngineContext';

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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-base font-semibold">{value}</div>
    </div>
  );
}

export default function ResultsPanel({ currency = 'AED' }: { currency?: string }) {
  const numbers = useEngineNumbers?.() ?? null;
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
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Results</h2>
          <p className="text-sm text-muted-foreground">Financial projections and KPIs.</p>
        </div>
        <div className="text-sm text-muted-foreground">
          No calculation results yet. Run the model to see results.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Results</h2>
        <p className="text-sm text-muted-foreground">Financial projections and KPIs.</p>
      </div>

      {claw > 0 && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm">
          GP Clawback outstanding at end: <span className="font-semibold">{fmtCurrency(claw, currency)}</span>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Metric label="IRR" value={fmtPct(irr)} />
        <Metric label="TVPI" value={fmtMult(tvpi)} />
        <Metric label="DPI" value={fmtMult(dpi)} />
        <Metric label="RVPI" value={fmtMult(rvpi)} />
        <Metric label="MOIC" value={fmtMult(moic)} />
      </div>

      <section className="space-y-2">
        <div className="text-sm font-medium">Distributions Timeline</div>
        {dists.length > 0 ? (
          <Sparkline data={dists} />
        ) : (
          <div className="text-sm text-muted-foreground">No distribution data yet.</div>
        )}
      </section>
    </div>
  );
}