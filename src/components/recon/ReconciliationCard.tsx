import React from "react";
import { useEngineNumbers } from "@/lib/engine/EngineContext";
import { SafeChart } from "@/components/common/SafeChart";

function fmt(x: number | undefined) {
  if (x === undefined || Number.isNaN(x)) return "—";
  return x.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function ReconciliationCard() {
  const { balance_sheet: bs, revenue, tax } = useEngineNumbers();

  const assets = bs?.assets_total ?? [];
  const liabEq  = bs?.liab_equity_total ?? [];
  const imbal   = bs?.imbalance ?? [];
  const ar      = bs?.accounts_receivable ?? [];
  const cash    = bs?.cash ?? [];
  const debt    = bs?.debt ?? [];
  const nbv     = bs?.nbv ?? [];
  const dsra    = bs?.dsra_cash ?? [];

  const clamped = !!(revenue?.detail?.collections_clamping_occurred);
  const inputRecovery = Array.isArray(tax?.detail?.input_recovery_ratio)
    ? tax.detail.input_recovery_ratio as number[]
    : [];

  const maxAbsImbalance = Math.max(0, ...imbal.map(v => Math.abs(v || 0)));
  const avgAssets = assets.length
    ? assets.reduce((a, b) => a + (b || 0), 0) / assets.length
    : 0;
  const tiePct = avgAssets > 0 ? (maxAbsImbalance / avgAssets) * 100 : 0;

  const rollforward = bs?.detail?.retained_earnings_rollforward;
  const tieOutOK = bs?.detail?.tie_out_ok;

  let status: "ok" | "warn" | "bad" = "ok";
  if (tiePct >= 0.1) status = "bad";
  else if (tiePct >= 0.01) status = "warn";

  const statusClasses =
    status === "ok" ? "bg-green-100 text-green-800"
      : status === "warn" ? "bg-amber-100 text-amber-800"
      : "bg-red-100 text-red-800";

  const tieMsg = rollforward && tieOutOK
    ? `BS ties without plug ✅ (max error ${fmt(tiePct)}%)`
    : `Tie-out max error: ${fmt(tiePct)}%`;

  return (
    <div className="rounded-2xl border p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Reconciliation</h3>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs ${statusClasses}`}>
            {tieMsg}
          </span>
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              clamped ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-700"
            }`}
            title="Shows if collections were capped by escrow"
          >
            {clamped ? "Collections clamped" : "No collections clamp"}
          </span>
        </div>
      </div>

      {/* Imbalance sparkline (safe wrapper) */}
      <SafeChart ready={imbal.length > 0}>
        <div className="text-sm text-gray-600">
          Imbalance sparkline hidden (chart-ready data length: {imbal.length})
        </div>
      </SafeChart>

      <div className="grid md:grid-cols-3 gap-4 text-sm">
        <div className="rounded-xl border p-3">
          <div className="font-medium mb-2">Assets</div>
          <div className="flex items-center justify-between"><span>Cash</span><span>{fmt(cash.at(-1))}</span></div>
          <div className="flex items-center justify-between"><span>AR</span><span>{fmt(ar.at(-1))}</span></div>
          <div className="flex items-center justify-between"><span>DSRA</span><span>{fmt(dsra.at(-1))}</span></div>
          <div className="flex items-center justify-between"><span>NBV</span><span>{fmt(nbv.at(-1))}</span></div>
          <div className="flex items-center justify-between mt-1 border-t pt-1">
            <span className="font-medium">Total</span><span className="font-medium">{fmt(assets.at(-1))}</span>
          </div>
        </div>
        <div className="rounded-xl border p-3">
          <div className="font-medium mb-2">Liabilities + Equity</div>
          <div className="flex items-center justify-between"><span>Debt</span><span>{fmt(debt.at(-1))}</span></div>
          <div className="flex items-center justify-between"><span>VAT (net)</span><span>{fmt((tax?.vat_net ?? []).at(-1))}</span></div>
          <div className="flex items-center justify-between mt-1 border-t pt-1">
            <span className="font-medium">Total</span><span className="font-medium">{fmt(liabEq.at(-1))}</span>
          </div>
        </div>
        <div className="rounded-xl border p-3">
          <div className="font-medium mb-2">Diagnostics</div>
          <div className="flex items-center justify-between"><span>Max |imbalance|</span><span>{fmt(maxAbsImbalance)}</span></div>
          <div className="flex items-center justify-between"><span>Avg assets</span><span>{fmt(avgAssets)}</span></div>
          <div className="flex items-center justify-between"><span>Tie-out error (%)</span><span>{fmt(tiePct)}</span></div>
          {inputRecovery.length > 0 && (
            <div className="flex items-center justify-between">
              <span>Avg VAT input recovery</span>
              <span>{fmt(inputRecovery.reduce((a,b)=>a+(b||0),0)/inputRecovery.length)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}