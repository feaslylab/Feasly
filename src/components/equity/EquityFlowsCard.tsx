import React, { useMemo } from 'react';
import { useEngineNumbers } from '@/lib/engine/EngineContext';
import { fmtAED, safeNum } from '@/lib/format';

export default function EquityFlowsCard() {
  const data = useEngineNumbers();
  const eq = data?.equity;

  if (!eq) {
    return (
      <div className="rounded-2xl border p-4">
        <div className="font-semibold">Equity Flows</div>
        <div className="text-sm text-muted-foreground mt-2">No equity flow data available</div>
      </div>
    );
  }

  const totalCalls = useMemo(() => (eq?.calls_total ?? []).reduce((s, v) => s + safeNum(v), 0), [eq]);
  const totalDists = useMemo(() => (eq?.dists_total ?? []).reduce((s, v) => s + safeNum(v), 0), [eq]);
  const netFlow = safeNum(totalCalls) - safeNum(totalDists);

  return (
    <div className="rounded-2xl border p-4 space-y-3">
      <div className="font-semibold">Equity Flows</div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-lg border p-3">
          <div className="text-xs text-muted-foreground">Total Called</div>
          <div className="font-semibold">↑ {fmtAED(totalCalls)}</div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="text-xs text-muted-foreground">Total Distributed</div>
          <div className="font-semibold">↓ {fmtAED(totalDists)}</div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="text-xs text-muted-foreground">Net Flow</div>
          <div className={`font-semibold ${netFlow >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {netFlow >= 0 ? '↑' : '↓'} {fmtAED(Math.abs(netFlow))}
          </div>
        </div>
      </div>
    </div>
  );
}
