import React from 'react';
import { useEngineNumbers } from '@/lib/engine/EngineContext';
import { fmtAED, fmtPct, safeNum } from '@/lib/format';

export default function CapTableCard() {
  const data = useEngineNumbers();
  const eq = data?.equity;
  if (!eq?.kpis?.by_investor) {
    return (
      <div className="rounded-2xl border p-4">
        <div className="font-semibold">Cap Table</div>
        <div className="text-sm text-muted-foreground mt-2">No investor data available</div>
      </div>
    );
  }

  const investors = Object.keys(eq.kpis.by_investor);

  return (
    <div className="rounded-2xl border p-4">
      <div className="font-semibold mb-3">Cap Table</div>

      <div className="grid gap-3">
        {investors.map((key) => {
          const k = eq.kpis.by_investor[key];
          const irr = k?.irr_pa ?? null;
          const dpi = safeNum(k?.dpi);
          const tvpi = safeNum(k?.tvpi);
          const nav = safeNum(k?.nav);
          const contrib = safeNum(k?.contributed);
          const dist = safeNum(k?.distributed);

          return (
            <div key={key} className="rounded-lg border p-3 grid grid-cols-2 sm:grid-cols-6 gap-2 items-center">
              <div className="font-medium">{key}</div>
              <div className="text-xs">
                <div className="text-muted-foreground">IRR</div>
                <div className="font-semibold">{fmtPct(irr)}</div>
              </div>
              <div className="text-xs">
                <div className="text-muted-foreground">DPI</div>
                <div className={`font-semibold ${dpi >= 1 ? 'text-emerald-600' : 'text-amber-600'}`}>{dpi.toFixed(2)}x</div>
              </div>
              <div className="text-xs">
                <div className="text-muted-foreground">TVPI</div>
                <div className="font-semibold">{tvpi.toFixed(2)}x</div>
              </div>
              <div className="text-xs">
                <div className="text-muted-foreground">NAV</div>
                <div className="font-semibold">{fmtAED(nav)}</div>
              </div>
              <div className="text-xs">
                <div className="text-muted-foreground">C/D</div>
                <div className="font-semibold">
                  <span className="mr-1">↑ {fmtAED(contrib)}</span>
                  <span>↓ {fmtAED(dist)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {investors.length === 0 && (
        <div className="text-sm text-muted-foreground mt-2">No investors configured</div>
      )}
    </div>
  );
}