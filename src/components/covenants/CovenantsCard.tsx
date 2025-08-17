import React from "react";
import { useEngineNumbers } from "@/lib/engine/EngineContext";

const fmt = (n: number) => {
  if (n === Infinity) return "∞";
  if (Number.isNaN(n)) return "—";
  return (Math.abs(n) >= 100 ? n.toFixed(1) : n.toFixed(2));
};

export function CovenantsCard() {
  const { covenants } = useEngineNumbers();
  
  // Add comprehensive safety checks
  if (!covenants || !covenants.portfolio || !covenants.portfolio.dscr || covenants.portfolio.dscr.length === 0) {
    return null;
  }

  // UI state toggles
  const [useStrict, setUseStrict] = React.useState<boolean>(false);
  const [basis, setBasis] = React.useState<"point"|"ltm">("point");

  const P = covenants.portfolio;
  const T = P.dscr?.length ?? 0;
  const last = Math.max(0, T-1);

  const dscrSeries       = basis === "point" ? (useStrict ? P.dscr_strict : P.dscr) : (useStrict ? P.dscr_strict_ltm : P.dscr_ltm);
  const icrSeries        = basis === "point" ? P.icr : P.icr_ltm;
  const dscrHeadroom     = useStrict ? P.dscr_strict_headroom : P.dscr_headroom;
  const dscrThreshold    = covenants.detail?.dscr_threshold ?? null;
  const icrThreshold     = covenants.detail?.icr_threshold ?? null;

  const dscrNow = dscrSeries?.[last] ?? NaN;
  const icrNow  = icrSeries?.[last]  ?? NaN;
  const hdrNow  = dscrHeadroom?.[last] ?? NaN;

  const breachedNow = !!(covenants?.breaches_any?.[last]);
  const breachBadge = breachedNow ? "Breach" : "OK";

  // CSV export
  const downloadCSV = () => {
    const lines = [
      [
        "Period",
        "DSCR",
        "DSCR_Strict",
        "ICR",
        "DSCR_LTM",
        "DSCR_Strict_LTM",
        "ICR_LTM",
        "DSCR_Headroom",
        "DSCR_Strict_Headroom",
        "ICR_Headroom",
        "Breach_ANY",
        "DSCR_Threshold",
        "ICR_Threshold"
      ].join(",")
    ];
    for (let t=0; t<T; t++){
      lines.push([
        t+1,
        P.dscr?.[t] ?? "",
        P.dscr_strict?.[t] ?? "",
        P.icr?.[t] ?? "",
        P.dscr_ltm?.[t] ?? "",
        P.dscr_strict_ltm?.[t] ?? "",
        P.icr_ltm?.[t] ?? "",
        P.dscr_headroom?.[t] ?? "",
        P.dscr_strict_headroom?.[t] ?? "",
        P.icr_headroom?.[t] ?? "",
        covenants?.breaches_any?.[t] ? 1 : 0,
        dscrThreshold ?? "",
        icrThreshold ?? ""
      ].join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "covenants.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl p-4 shadow border bg-card" suppressHydrationWarning>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-foreground">Debt Covenants</h3>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded ${breachedNow ? "bg-destructive/10 text-destructive" : "bg-green-100 text-green-700"}`}>
            {breachBadge}
          </span>
          <button 
            onClick={downloadCSV} 
            className="text-xs px-3 py-1 rounded bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Toggles */}
      <div className="flex gap-3 mb-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Basis:</span>
          <button
            className={`text-xs px-2 py-1 rounded transition-colors ${basis==="point"?"bg-primary text-primary-foreground":"bg-muted hover:bg-muted/80"}`}
            onClick={()=>setBasis("point")}
          >Point-in-time</button>
          <button
            className={`text-xs px-2 py-1 rounded transition-colors ${basis==="ltm"?"bg-primary text-primary-foreground":"bg-muted hover:bg-muted/80"}`}
            onClick={()=>setBasis("ltm")}
          >LTM (12M)</button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">DSCR flavor:</span>
          <button
            className={`text-xs px-2 py-1 rounded transition-colors ${!useStrict?"bg-primary text-primary-foreground":"bg-muted hover:bg-muted/80"}`}
            onClick={()=>setUseStrict(false)}
          >Classic</button>
          <button
            className={`text-xs px-2 py-1 rounded transition-colors ${useStrict?"bg-primary text-primary-foreground":"bg-muted hover:bg-muted/80"}`}
            onClick={()=>setUseStrict(true)}
          >Strict</button>
        </div>
      </div>

      {/* Current snapshot */}
      <div className="grid grid-cols-3 gap-4">
        <div className="border border-border rounded-xl p-3">
          <div className="text-xs text-muted-foreground">Portfolio DSCR ({basis}{useStrict? ", strict": ""})</div>
          <div className="text-2xl font-semibold text-foreground">{fmt(dscrNow)}</div>
          {dscrThreshold!=null && (
            <div className={`text-xs mt-1 ${hdrNow<0 ? "text-destructive":"text-green-700"}`}>
              Headroom: {fmt(hdrNow)}
            </div>
          )}
        </div>
        <div className="border border-border rounded-xl p-3">
          <div className="text-xs text-muted-foreground">Portfolio ICR ({basis})</div>
          <div className="text-2xl font-semibold text-foreground">{fmt(icrNow)}</div>
          {icrThreshold!=null && (
            <div className={`text-xs mt-1 ${(icrNow-icrThreshold)<0 ? "text-destructive":"text-green-700"}`}>
              Headroom: {fmt(icrNow - icrThreshold)}
            </div>
          )}
        </div>
        <div className="border border-border rounded-xl p-3">
          <div className="text-xs text-muted-foreground">Config</div>
          <div className="text-sm text-foreground">
            Basis: <b>{covenants?.detail?.test_basis ?? "point"}</b><br/>
            Grace: <b>{covenants?.detail?.grace_period_m ?? 0} mo</b>
          </div>
        </div>
      </div>

      {/* Timeline dots */}
      <div className="mt-4">
        <div className="text-xs text-muted-foreground mb-1">Timeline (breach after grace)</div>
        <div className="flex gap-1 flex-wrap">
          {Array.from({length:T}, (_,i) => {
            const b = covenants.breaches_any?.[i];
            return (
              <span key={i}
                className={`inline-block h-2 w-2 rounded-full ${b?"bg-destructive":"bg-green-400"}`}
                title={`Period ${i+1}: ${b ? "breach" : "ok"}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}