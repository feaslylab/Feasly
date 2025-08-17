import React from "react";
import { useEngineNumbers } from "@/lib/engine/EngineContext";
import { fmtAED, safeNum } from "@/lib/format";

const fmt = (n: number) => {
  if (n === Infinity) return "∞";
  if (Number.isNaN(n)) return "—";
  return n.toLocaleString("en", { maximumFractionDigits: 0 });
};

const pct = (n: number) => {
  if (Number.isNaN(n)) return "—";
  return `${(n * 100).toFixed(2)}%`;
};

export function FinancingCard() {
  const { financing, covenants } = useEngineNumbers();
  
  if (!financing) return null;

  const T = financing.draws?.length ?? 0;
  const last = Math.max(0, T - 1);

  // Current period values
  const outstandingBalance = financing.balance?.[last] ?? 0;
  const dsraBalance = financing.dsra_balance?.[last] ?? 0;
  const currentInterest = financing.interest?.[last] ?? 0;
  const currentFees = (financing.fees_ongoing?.[last] ?? 0) + (financing.fees_commitment?.[last] ?? 0);

  // Totals over life
  const totalDrawn = financing.draws?.reduce((sum, val) => sum + (val || 0), 0) ?? 0;
  const totalInterest = financing.interest?.reduce((sum, val) => sum + (val || 0), 0) ?? 0;
  const totalFees = financing.fees_upfront?.reduce((sum, val) => sum + (val || 0), 0) ?? 0;

  // Covenant status
  const breachedNow = !!(covenants?.breaches_any?.[last]);
  const breachBadge = breachedNow ? "Breach" : "OK";

  // Per-tranche details
  const tranches = financing.detail?.tranches ?? [];

  const downloadCSV = () => {
    const lines = [
      ["Period", "Draws", "Interest", "Principal", "Balance", "Fees_Upfront", "Fees_Commitment", "Fees_Ongoing", "DSRA_Balance"].join(",")
    ];
    
    for (let t = 0; t < T; t++) {
      lines.push([
        t + 1,
        financing.draws?.[t] ?? 0,
        financing.interest?.[t] ?? 0,
        financing.principal?.[t] ?? 0,
        financing.balance?.[t] ?? 0,
        financing.fees_upfront?.[t] ?? 0,
        financing.fees_commitment?.[t] ?? 0,
        financing.fees_ongoing?.[t] ?? 0,
        financing.dsra_balance?.[t] ?? 0
      ].join(","));
    }
    
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "financing.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl p-4 shadow border bg-white">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Debt Financing</h3>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded ${breachedNow ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
            Covenants: {breachBadge}
          </span>
          <button 
            onClick={downloadCSV} 
            className="text-xs px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="border rounded-xl p-3">
          <div className="text-xs text-gray-500">Outstanding Balance</div>
          <div className="text-xl font-semibold">{fmt(outstandingBalance)}</div>
        </div>
        <div className="border rounded-xl p-3">
          <div className="text-xs text-gray-500">DSRA Balance</div>
          <div className="text-xl font-semibold">{fmt(dsraBalance)}</div>
        </div>
        <div className="border rounded-xl p-3">
          <div className="text-xs text-gray-500">Current Interest</div>
          <div className="text-xl font-semibold">{fmt(currentInterest)}</div>
        </div>
        <div className="border rounded-xl p-3">
          <div className="text-xs text-gray-500">Current Fees</div>
          <div className="text-xl font-semibold">{fmt(currentFees)}</div>
        </div>
      </div>

      {/* Lifetime totals */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="border rounded-xl p-3">
          <div className="text-xs text-gray-500">Total Drawn</div>
          <div className="text-lg font-semibold">{fmt(totalDrawn)}</div>
        </div>
        <div className="border rounded-xl p-3">
          <div className="text-xs text-gray-500">Total Interest</div>
          <div className="text-lg font-semibold">{fmt(totalInterest)}</div>
        </div>
        <div className="border rounded-xl p-3">
          <div className="text-xs text-gray-500">Total Fees</div>
          <div className="text-lg font-semibold">{fmt(totalFees)}</div>
        </div>
      </div>

      {/* Per-tranche table */}
      {tranches.length > 0 && (
        <div className="mt-4">
          <div className="text-sm font-medium mb-2">By Tranche (Current Period)</div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Tranche</th>
                  <th className="text-right p-2">Draws</th>
                  <th className="text-right p-2">Principal</th>
                  <th className="text-right p-2">Balance</th>
                  <th className="text-right p-2">Interest</th>
                </tr>
              </thead>
              <tbody>
                {tranches.map((tr: any, idx: number) => (
                  <tr key={idx} className="border-b last:border-b-0">
                    <td className="p-2 font-medium">{tr.key}</td>
                    <td className="text-right p-2">{fmt(tr.draws?.[last] ?? 0)}</td>
                    <td className="text-right p-2">{fmt(tr.principal?.[last] ?? 0)}</td>
                    <td className="text-right p-2">{fmt(tr.balance?.[last] ?? 0)}</td>
                    <td className="text-right p-2">{fmt(tr.interest?.[last] ?? 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Debt service timeline dots */}
      <div className="mt-4">
        <div className="text-xs text-gray-500 mb-1">Debt Service Timeline</div>
        <div className="flex gap-1 flex-wrap">
          {Array.from({ length: T }, (_, i) => {
            const debtService = (financing.interest?.[i] ?? 0) + (financing.principal?.[i] ?? 0);
            const level = debtService === 0 ? 0 : debtService < 50000 ? 1 : debtService < 100000 ? 2 : 3;
            const colors = ["bg-gray-200", "bg-yellow-400", "bg-orange-500", "bg-red-600"];
            return (
              <span
                key={i}
                className={`inline-block h-2 w-2 rounded-full ${colors[level]}`}
                title={`Period ${i + 1}: ${fmt(debtService)} debt service`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}