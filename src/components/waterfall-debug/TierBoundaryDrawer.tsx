import React, { useMemo, useState } from 'react';
import { fmtAED, safeNum } from '@/lib/format';
import { useEngineNumbers } from '@/lib/engine/EngineContext';

type EventRow = { t:number; cls:string; tierIdx:number; x:number; split_lp:number; split_gp:number; r_target_m:number };

export default function TierBoundaryDrawer() {
  const eq = useEngineNumbers()?.equity;
  const debug = eq?.detail?.class_ledgers?.debug ?? {};
  const [open, setOpen] = useState(false);

  const rows: EventRow[] = useMemo(() => {
    const list: EventRow[] = [];
    Object.entries(debug).forEach(([cls, payload]: any) => {
      const arr: any[] = payload?.tiers ?? [];
      arr.forEach((e) => {
        list.push({
          cls,
          t: Number(e?.t ?? 0),
          tierIdx: Number(e?.tierIdx ?? 0),
          x: safeNum(e?.x),
          split_lp: safeNum(e?.split_lp),
          split_gp: safeNum(e?.split_gp),
          r_target_m: safeNum(e?.r_target_m),
        });
      });
    });
    return list.sort((a,b)=> (a.t - b.t) || a.cls.localeCompare(b.cls) || (a.tierIdx - b.tierIdx));
  }, [debug]);

  if (!eq) return null;

  return (
    <div className="rounded-xl border">
      <div className="flex items-center justify-between p-3">
        <div className="text-sm font-semibold">Tier Boundaries</div>
        <button
          className="text-xs px-2 py-1 rounded-md border hover:bg-accent"
          onClick={() => setOpen(v => !v)}
        >
          {open ? 'Hide' : 'Show'}
        </button>
      </div>

      {open && (
        <div className="p-3 pt-0">
          {rows.length === 0 ? (
            <div className="text-xs text-muted-foreground">No tier boundary events recorded</div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-muted-foreground">
                    <th className="text-left py-1 pr-2">Period</th>
                    <th className="text-left py-1 pr-2">Class</th>
                    <th className="text-right py-1 pr-2">Tier</th>
                    <th className="text-right py-1 pr-2">x (allocated)</th>
                    <th className="text-right py-1 pr-2">LP Split</th>
                    <th className="text-right py-1 pr-2">GP Split</th>
                    <th className="text-right py-1">r* (monthly)</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={`${r.cls}-${r.t}-${r.tierIdx}-${i}`} className="border-t">
                      <td className="py-1 pr-2">M{r.t + 1}</td>
                      <td className="py-1 pr-2">{r.cls}</td>
                      <td className="py-1 pr-2 text-right">{r.tierIdx}</td>
                      <td className="py-1 pr-2 text-right">{fmtAED(r.x)}</td>
                      <td className="py-1 pr-2 text-right">{(r.split_lp * 100).toFixed(1)}%</td>
                      <td className="py-1 pr-2 text-right">{(r.split_gp * 100).toFixed(1)}%</td>
                      <td className="py-1 text-right">{(r.r_target_m * 100).toFixed(3)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="text-[11px] text-muted-foreground mt-2">
            r* is the monthly hurdle used in the binary search; allocations x observed are the safe-left amounts.
          </div>
        </div>
      )}
    </div>
  );
}