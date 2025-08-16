import React from "react";
import { useEngineNumbers } from "@/lib/engine/EngineContext";

const fmt = (n?: number)=> n==null || !isFinite(n) ? "∞" : (Math.abs(n)>=100 ? n.toFixed(1) : n.toFixed(2));

export function CovenantsCard(){
  const { covenants } = useEngineNumbers();
  if(!covenants?.portfolio) return null;

  const T = covenants.portfolio.dscr.length;
  const last = T>0 ? T-1 : 0;

  const dscr = covenants.portfolio.dscr[last] ?? 0;
  const icr  = covenants.portfolio.icr[last] ?? 0;
  const breached = !!(covenants.breaches_any?.[last]);

  return (
    <div className="rounded-2xl shadow p-4 bg-card">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Debt Covenants</h3>
        <span className={`text-sm px-2 py-1 rounded ${breached ? "bg-destructive/10 text-destructive":"bg-green-100 text-green-800"}`}>
          {breached ? "Breach" : "OK"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="rounded-xl border border-border p-3">
          <div className="text-xs text-muted-foreground">Portfolio DSCR</div>
          <div className="text-2xl font-bold text-foreground">{fmt(dscr)}</div>
        </div>
        <div className="rounded-xl border border-border p-3">
          <div className="text-xs text-muted-foreground">Portfolio ICR</div>
          <div className="text-2xl font-bold text-foreground">{fmt(icr)}</div>
        </div>
      </div>

      {/* Simple period breach badges */}
      <div className="mt-4">
        <div className="text-xs text-muted-foreground mb-2">Timeline</div>
        <div className="flex flex-wrap gap-1">
          {Array.from({length:T}, (_,i)=> {
            const b = covenants.breaches_any?.[i];
            return <span key={i} className={`w-2 h-2 rounded-full ${b?"bg-destructive":"bg-green-500"}`} title={`t=${i+1}`}></span>
          })}
        </div>
      </div>
    </div>
  );
}