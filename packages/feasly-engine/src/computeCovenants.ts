import Decimal from "decimal.js";
import { CovenantsBlock, ProjectInputs } from "./types";

const z = (T:number)=>Array.from({length:T},()=>new Decimal(0));

/**
 * Definitions
 * - CFADS (proxy): cash_flow.from_operations[t]
 *   (PATMI + dep + WC adj; already indirect ops CF).
 * - Debt Service: interest + principal (exclude fees for classic DSCR).
 *   (We'll also compute a "strict" version incl. ongoing fees for diagnostics.)
 * - EBIT: from profit_and_loss.ebit[t].
 * - Interest: financing.interest[t] (cash interest).
 */
export function computeCovenants(params: {
  T: number;
  inputs: ProjectInputs;
  financing: {
    interest: Decimal[];
    principal: Decimal[];
    fees_ongoing: Decimal[];
    detail: Record<string, unknown>; // contains tranche schedules if needed
  };
  pnl: {
    ebit: Decimal[];
    interest: Decimal[];
  };
  cf: {
    from_operations: Decimal[];
  };
}): CovenantsBlock {
  const { T, inputs, financing, pnl, cf } = params;

  // Portfolio
  const dscr = z(T);
  const icr  = z(T);
  const dscr_breach: boolean[] = Array(T).fill(false);
  const icr_breach:  boolean[] = Array(T).fill(false);

  // Helpers
  const debtService = (t:number) =>
    (financing.interest[t] || new Decimal(0)).add(financing.principal[t] || new Decimal(0));
  const ebit = (t:number) => pnl.ebit[t] || new Decimal(0);
  const interestOnly = (t:number) => financing.interest[t] || new Decimal(0);
  const cfads = (t:number) => cf.from_operations[t] || new Decimal(0);

  // Portfolio thresholds: if multiple tranches have thresholds, use the MIN of each metric as portfolio covenant
  const minDSCR = inputs.debt?.reduce((m,tr)=> Math.min(m, tr.covenants?.dscr_min ?? Infinity), Infinity);
  const minICR  = inputs.debt?.reduce((m,tr)=> Math.min(m, tr.covenants?.icr_min  ?? Infinity), Infinity);
  const dscrMin = Number.isFinite(minDSCR) ? new Decimal(minDSCR) : null;
  const icrMin  = Number.isFinite(minICR)  ? new Decimal(minICR)  : null;

  for (let t=0; t<T; t++) {
    const ds  = debtService(t);
    const cfv = cfads(t);
    dscr[t] = ds.isZero() ? new Decimal(Infinity) : cfv.div(ds);

    const intv = interestOnly(t);
    const e    = ebit(t);
    icr[t] = intv.isZero() ? new Decimal(Infinity) : e.div(intv);

    dscr_breach[t] = !!(dscrMin && dscr[t].lt(dscrMin));
    icr_breach[t]  = !!(icrMin  && icr[t].lt(icrMin));
  }

  // Per-tranche: if you have per-tranche interest/principal in financing.detail.tranches[]
  const by_tranche: Record<string, any> = {};
  const trDetail = (financing.detail?.tranches as Array<any>) || [];
  for (const tr of trDetail) {
    const k = tr.key as string;
    const dscr_t = z(T);
    const icr_t  = z(T);
    const dscr_b: boolean[] = Array(T).fill(false);
    const icr_b:  boolean[] = Array(T).fill(false);

    // series are numbers in detail; wrap with Decimal
    const i = (tr.interest || []).map((x:number)=> new Decimal(x));
    const p = (tr.principal|| []).map((x:number)=> new Decimal(x));

    const dscrMinTr = inputs.debt?.find(d=>d.key===k)?.covenants?.dscr_min ?? null;
    const icrMinTr  = inputs.debt?.find(d=>d.key===k)?.covenants?.icr_min  ?? null;
    const dMin = dscrMinTr != null ? new Decimal(dscrMinTr) : null;
    const iMin = icrMinTr  != null ? new Decimal(icrMinTr)  : null;

    for (let t=0; t<T; t++) {
      const ds = (i[t] || new Decimal(0)).add(p[t] || new Decimal(0));
      const cfv = cfads(t);
      dscr_t[t] = ds.isZero() ? new Decimal(Infinity) : cfv.div(ds);

      const intv = i[t] || new Decimal(0);
      icr_t[t] = intv.isZero() ? new Decimal(Infinity) : ebit(t).div(intv);

      dscr_b[t] = !!(dMin && dscr_t[t].lt(dMin));
      icr_b[t]  = !!(iMin  && icr_t[t].lt(iMin));
    }

    by_tranche[k] = {
      dscr: dscr_t,
      icr: icr_t,
      dscr_breach: dscr_b,
      icr_breach: icr_b,
      detail: {}
    };
  }

  // Rollup diagnostics
  const breaches_any = Array.from({length:T}, (_,t)=> dscr_breach[t] || icr_breach[t]);
  const total_breach_periods = breaches_any.reduce((a,b)=> a + (b?1:0), 0);
  const first_breach_index = breaches_any.findIndex(b=>b) ?? -1;

  return {
    portfolio: { dscr, icr, dscr_breach, icr_breach, detail: {} },
    by_tranche,
    breaches_any,
    breaches_summary: {
      total_breach_periods,
      first_breach_index: first_breach_index >= 0 ? first_breach_index : null
    },
    detail: {
      notes: "DSCR based on CFADS=operating cash flow; DebtService=interest+principal. ICR=EBIT/Interest."
    }
  };
}