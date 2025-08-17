import React, { useMemo } from 'react';
import { useTheme } from 'next-themes';
import { useEngineNumbers, useEngine } from '@/lib/engine/EngineContext';
import { fmtAED, fmtPct, safeNum, sum, approxEq } from '@/lib/format';
import CatchUpEventsPanel from '@/components/waterfall-debug/CatchUpEventsPanel';
import TierBoundaryDrawer from '@/components/waterfall-debug/TierBoundaryDrawer';

type ByStrNum = Record<string, number>;
type ByStrArr = Record<string, number[]>;

export default function WaterfallCard() {
  const { theme } = useTheme();
  const data = useEngineNumbers();
  const { inputs } = useEngine();

  if (!data?.equity) {
    return (
      <div className="rounded-2xl border p-4">
        <div className="font-semibold">Equity Waterfall</div>
        <div className="text-sm text-muted-foreground mt-2">No equity data available</div>
      </div>
    );
  }

  const { equity } = data;
  const T = equity.calls_total?.length ?? 0;
  const last = Math.max(0, T - 1);

  // ----- Dev-only reconciliation: sum investor dists == total dists -----
  if (process.env.NODE_ENV !== 'production' && T > 0) {
    try {
      for (let t = 0; t < T; t++) {
        const total = safeNum(equity.dists_total[t]);
        const invSum = Object.values(equity.dists_by_investor as ByStrArr)
          .reduce((s, arr) => s + safeNum(arr?.[t]), 0);
        if (!approxEq(invSum, total, 1e-6)) {
          // do not throw; warn only
          // eslint-disable-next-line no-console
          console.warn('[WaterfallCard] Totals mismatch @t=', t, { invSum, total });
        }
      }
    } catch {
      // ignore any runtime issues in dev-only check
    }
  }

  // ----- Build investor->class mapping from inputs (if available) -----
  const investorToClass: Record<string, string> = useMemo(() => {
    const map: Record<string, string> = {};
    const investors = inputs?.equity?.investors ?? [];
    investors.forEach((inv: any) => { 
      if (inv?.key && inv?.class_key) map[inv.key] = inv.class_key; 
    });
    return map;
  }, [inputs]);

  // ----- Derive per-class unreturned capital sums -----
  const byClassUnreturned: ByStrNum = useMemo(() => {
    const m: ByStrNum = {};
    const unret = equity.detail?.investor_ledgers?.unreturned_capital ?? {};
    Object.entries(unret).forEach(([invKey, amt]) => {
      const clsKey = investorToClass[invKey] ?? '__unknown__';
      m[clsKey] = safeNum(m[clsKey]) + safeNum(amt);
    });

    // Ensure we have keys found in pref_balance too (even if no investors mapped)
    const pref = equity.detail?.class_ledgers?.pref_balance ?? {};
    Object.keys(pref).forEach((clsKey) => {
      if (!(clsKey in m)) m[clsKey] = 0;
    });

    return m;
  }, [equity, investorToClass]);

  // ----- Read class pref balances -----
  const prefBalance: ByStrNum = equity.detail?.class_ledgers?.pref_balance ?? {};
  const classKeys: string[] = useMemo(() => {
    const keys = new Set<string>([
      ...Object.keys(prefBalance ?? {}),
      ...Object.keys(byClassUnreturned ?? {}),
    ]);
    // remove the synthetic key if present
    keys.delete('__unknown__');
    return Array.from(keys);
  }, [prefBalance, byClassUnreturned]);

  // ----- Baseline chip state per class -----
  type BaselineState = 'not_met' | 'roc' | 'roc_pref';
  const classBaseline: Record<string, BaselineState> = useMemo(() => {
    const out: Record<string, BaselineState> = {};
    for (const cls of classKeys) {
      const unret = safeNum(byClassUnreturned[cls]);
      const pref = safeNum(prefBalance[cls]);
      if (unret <= 1e-9 && pref <= 1e-9) out[cls] = 'roc_pref';
      else if (unret <= 1e-9) out[cls] = 'roc';
      else out[cls] = 'not_met';
    }
    return out;
  }, [classKeys, byClassUnreturned, prefBalance]);

  // ----- Clawback banner state -----
  const finalClawback = safeNum(equity.gp_clawback?.[last]);

  // ----- KPI values (safe) -----
  const k = equity.kpis ?? { irr_pa: null, tvpi: 0, dpi: 0, rvpi: 0, moic: 0 };
  const kIrr = k.irr_pa;
  const kTvpi = safeNum(k.tvpi);
  const kDpi = safeNum(k.dpi);
  const kRvpi = safeNum(k.rvpi);
  const kMoic = safeNum(k.moic);

  // ----- Totals for summary -----
  const totalCalled = sum(equity.calls_total);
  const totalDist = sum(equity.dists_total);
  const totalPromote = sum(equity.gp_promote);

  // ----- CSV export (extend with class baseline & cumulatives) -----
  const downloadCSV = () => {
    const lines: string[] = [];
    // Section 1: per-period summary (existing)
    lines.push('Period,Capital Calls,Distributions,GP Promote');
    for (let t = 0; t < T; t++) {
      lines.push([
        `M${t + 1}`,
        safeNum(equity.calls_total?.[t]),
        safeNum(equity.dists_total?.[t]),
        safeNum(equity.gp_promote?.[t]),
      ].join(','));
    }
    lines.push(''); lines.push('');

    // Section 2: Class Pref & Baseline Snapshot
    lines.push('Class Pref & Baseline Snapshot');
    lines.push('Class,Pref_Balance,Baseline_Status');
    classKeys.forEach((cls) => {
      const state = classBaseline[cls] === 'roc_pref'
        ? 'ROC+Pref'
        : classBaseline[cls] === 'roc'
          ? 'ROC'
          : 'NotMet';
      lines.push([cls, safeNum(prefBalance[cls]), state].join(','));
    });
    lines.push(''); lines.push('');

    // Section 3: Class Cumulatives (A/G/Promote)
    const cumul = equity.detail?.class_ledgers ?? {};
    const A = (cumul.excess_distributions_cum ?? {}) as ByStrNum;
    const G = (cumul.gp_catchup_cum ?? {}) as ByStrNum;
    const P = (cumul.gp_promote_cum ?? {}) as ByStrNum;
    lines.push('Class Cumulatives');
    lines.push('Class,Excess_Distributions_A,GP_Catchup_G,GP_Promote_Cum');
    classKeys.forEach((cls) => {
      lines.push([cls, safeNum(A[cls]), safeNum(G[cls]), safeNum(P[cls])].join(','));
    });

    // Section 4: Catch-up Events (A/G/Y)
    const dbg = equity.detail?.class_ledgers?.debug ?? {};
    lines.push('');
    lines.push('');
    lines.push('Catch-up Events (per row: period, class, A, G, Y)');
    lines.push('Period,Class,Excess_A,GP_G_cum,Catchup_Y');
    Object.entries(dbg).forEach(([cls, payload]: any) => {
      (payload?.catchup ?? []).forEach((e: any) => {
        const t = Number(e?.t ?? 0);
        lines.push([`M${t+1}`, cls, safeNum(e?.A), safeNum(e?.G), safeNum(e?.Y)].join(','));
      });
    });

    // Section 5: Tier Boundaries
    lines.push('');
    lines.push('Tier Boundary Allocations (x at boundary)');
    lines.push('Period,Class,TierIdx,Allocated_x,Split_LP,Split_GP,r_target_monthly');
    Object.entries(dbg).forEach(([cls, payload]: any) => {
      (payload?.tiers ?? []).forEach((e: any) => {
        const t = Number(e?.t ?? 0);
        lines.push([
          `M${t+1}`, cls, Number(e?.tierIdx ?? 0),
          safeNum(e?.x),
          safeNum(e?.split_lp),
          safeNum(e?.split_gp),
          safeNum(e?.r_target_m),
        ].join(','));
      });
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'equity-waterfall.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl border p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-semibold">Equity Waterfall</div>
          {/* Baseline chips */}
          <div className="flex flex-wrap gap-2 mt-2">
            {classKeys.map((cls) => {
              const state = classBaseline[cls];
              const text = state === 'roc_pref'
                ? 'Baseline: ROC+Pref met'
                : state === 'roc'
                  ? 'Baseline: ROC met'
                  : 'Baseline: Not met';
              const clsName = inputs?.equity?.classes?.find?.((c: any) => c?.key === cls)?.key ?? cls;
              const badge =
                state === 'roc_pref' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                state === 'roc' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-gray-50 text-gray-700 border-gray-200';
              return (
                <span key={cls} className={`inline-flex items-center text-xs px-2 py-1 rounded-full border ${badge}`}>
                  <span className="font-medium mr-1">{clsName}:</span> {text}
                </span>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Clawback banner if any (final period) */}
          {finalClawback > 0 && (
            <div className="text-xs px-2 py-1 rounded-md border bg-red-50 text-red-700 border-red-200">
              GP Clawback Outstanding: <span className="font-medium">{fmtAED(finalClawback)}</span>
            </div>
          )}
          <button
            onClick={downloadCSV}
            className="text-xs px-2 py-1 rounded-md border hover:bg-accent"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="rounded-lg border p-3">
          <div className="text-xs text-muted-foreground">Portfolio IRR</div>
          <div className="font-semibold">{fmtPct(kIrr)}</div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="text-xs text-muted-foreground">TVPI</div>
          <div className="font-semibold">{kTvpi.toFixed(2)}x</div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="text-xs text-muted-foreground">DPI</div>
          <div className={`font-semibold ${kDpi >= 1 ? 'text-emerald-600' : 'text-amber-600'}`}>{kDpi.toFixed(2)}x</div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="text-xs text-muted-foreground">RVPI</div>
          <div className="font-semibold">{kRvpi.toFixed(2)}x</div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="text-xs text-muted-foreground">MOIC</div>
          <div className="font-semibold">{kMoic.toFixed(2)}x</div>
        </div>
      </div>

      {/* Distribution Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-lg border p-3">
          <div className="text-xs text-muted-foreground">Total Called</div>
          <div className="font-semibold">{fmtAED(totalCalled)}</div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="text-xs text-muted-foreground">Total Distributed</div>
          <div className="font-semibold">{fmtAED(totalDist)}</div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="text-xs text-muted-foreground">GP Promote</div>
          <div className="font-semibold">{fmtAED(totalPromote)}</div>
        </div>
      </div>

      {/* --- 10B Debug Panels (compact) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <CatchUpEventsPanel />
        <TierBoundaryDrawer />
      </div>
    </div>
  );
}
