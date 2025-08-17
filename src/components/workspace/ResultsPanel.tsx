import { useEngineNumbers } from '@/lib/engine/EngineContext';

const pct = (v: number | null | undefined) =>
  v == null ? 'N/A' : `${(v * 100).toFixed(1)}%`;
const mult = (v: number | null | undefined) =>
  v == null ? 'N/A' : `${v.toFixed(2)}×`;
const fmtAED = (v: number) => `AED ${v.toLocaleString()}`;

function Sparkline({ data }: { data: number[] }) {
  if (!data?.length) return null;
  const w = 160;
  const h = 40;
  const max = Math.max(...data, 1);
  const step = w / Math.max(1, data.length - 1);
  const points = data
    .map((v, i) => `${i * step},${h - (Math.max(0, v) / max) * (h - 2) - 1}`)
    .join(' ');
  return (
    <svg width={w} height={h} className="text-primary">
      <polyline fill="none" stroke="currentColor" strokeWidth="2" points={points} />
    </svg>
  );
}

export default function ResultsPanel() {
  const numbers = useEngineNumbers();
  const eq = numbers?.equity ?? null;

  const irr = eq?.kpis?.irr_pa ?? null;
  const tvpi = eq?.kpis?.tvpi ?? null;
  const dpi = eq?.kpis?.dpi ?? null;
  const rvpi = eq?.kpis?.rvpi ?? null;
  const moic = eq?.kpis?.moic ?? null;

  const T = eq?.calls_total?.length ?? 0;
  const last = Math.max(0, T - 1);
  const claw = Number(eq?.gp_clawback?.[last] ?? 0);

  const dists = Array.isArray(eq?.dists_total) ? eq!.dists_total.map(Number) : [];
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Results</h2>
        <p className="text-sm text-muted-foreground">Financial projections and KPIs.</p>
      </div>

      {claw > 0 && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm">
          GP Clawback outstanding at end: <span className="font-semibold">{fmtAED(claw)}</span>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="rounded-lg border p-3">
          <div className="text-xs text-muted-foreground">IRR</div>
          <div className="text-xl font-semibold">{pct(irr)}</div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="text-xs text-muted-foreground">TVPI</div>
          <div className="text-xl font-semibold">{mult(tvpi)}</div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="text-xs text-muted-foreground">DPI</div>
          <div className="text-xl font-semibold">{mult(dpi)}</div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="text-xs text-muted-foreground">RVPI</div>
          <div className="text-xl font-semibold">{mult(rvpi)}</div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="text-xs text-muted-foreground">MOIC</div>
          <div className="text-xl font-semibold">{mult(moic)}</div>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <div className="text-sm font-medium mb-2">Distributions Timeline</div>
        {dists.length ? (
          <Sparkline data={dists} />
        ) : (
          <div className="text-sm text-muted-foreground">No distribution data yet.</div>
        )}
      </div>
    </div>
  );
}