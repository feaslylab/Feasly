import React, { useMemo } from 'react';
import { fmtAED, safeNum } from '@/lib/format';
import { useEngineNumbers } from '@/lib/engine/EngineContext';

type Row = { t: number; cls: string; A: number; G: number; Y: number };

export default function CatchUpEventsPanel() {
  const data = useEngineNumbers();
  const eq = data?.equity;
  const debug = eq?.detail?.class_ledgers?.debug ?? {};
  const T = eq?.calls_total?.length ?? 0;

  const rows: Row[] = useMemo(() => {
    const list: Row[] = [];
    Object.entries(debug).forEach(([cls, payload]: any) => {
      const arr: any[] = payload?.catchup ?? [];
      arr.forEach((e) => {
        const t = Number(e?.t ?? 0);
        const A = safeNum(e?.A);
        const G = safeNum(e?.G);
        const Y = safeNum(e?.Y);
        if (t >= 0) list.push({ t, cls, A, G, Y });
      });
    });
    // sort by time then class
    return list.sort((a, b) => (a.t - b.t) || a.cls.localeCompare(b.cls));
  }, [debug]);

  if (!eq || rows.length === 0) {
    return (
      <div className="rounded-xl border p-3">
        <div className="text-sm font-semibold">GP Catch-up Events</div>
        <div className="text-xs text-muted-foreground mt-1">No catch-up events recorded</div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold">GP Catch-up Events</div>
        <div className="text-xs text-muted-foreground">Total periods: {T}</div>
      </div>
      <div className="overflow-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-muted-foreground">
              <th className="text-left py-1 pr-2">Period</th>
              <th className="text-left py-1 pr-2">Class</th>
              <th className="text-right py-1 pr-2">Excess A</th>
              <th className="text-right py-1 pr-2">GP G (cum)</th>
              <th className="text-right py-1">Catch-Up Y (paid)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={`${r.cls}-${r.t}-${i}`} className="border-t">
                <td className="py-1 pr-2">M{r.t + 1}</td>
                <td className="py-1 pr-2">{r.cls}</td>
                <td className="py-1 pr-2 text-right">{fmtAED(r.A)}</td>
                <td className="py-1 pr-2 text-right">{fmtAED(r.G)}</td>
                <td className="py-1 text-right font-medium">{fmtAED(r.Y)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* tiny legend */}
      <div className="text-[11px] text-muted-foreground mt-2">
        Formula: Y = max(0, (τ·A − G) / (1 − τ)); shown values reflect engine inputs per event.
      </div>
    </div>
  );
}