import Decimal from "decimal.js";

export type ZakatBlock = {
  base: Decimal[]; // chosen base series
  zakat: Decimal[]; // rate * base
  detail: Record<string, unknown>;
};

function zeros(T:number){ return Array.from({length:T}, () => new Decimal(0)); }

/**
 * Phase-1 Zakat:
 * - Method: "equity_in" or "nbv" (net book value proxy)
 * - base series chosen accordingly; rate applied monthly as (annual rate / 12)
 */
export function computeZakat(params: {
  method: "equity_in" | "nbv";
  rate_annual: number;
  equity_in?: Decimal[]; // +ve equity injections if available (else zeros)
  nbv?: Decimal[];       // NBV series from depreciation module
}): ZakatBlock {
  const T = (params.equity_in?.length || params.nbv?.length || 0);
  const base = zeros(T);
  const zakat = zeros(T);

  // pick base
  if (params.method === "equity_in" && params.equity_in) {
    for (let t=0;t<T;t++) base[t] = params.equity_in[t];
  } else if (params.method === "nbv" && params.nbv) {
    for (let t=0;t<T;t++) base[t] = Decimal.max(params.nbv[t], new Decimal(0));
  }

  const r_m = params.rate_annual / 12;
  for (let t=0;t<T;t++){
    zakat[t] = base[t].mul(r_m);
  }

  return { base, zakat, detail: { method: params.method, rate_pa: params.rate_annual } };
}