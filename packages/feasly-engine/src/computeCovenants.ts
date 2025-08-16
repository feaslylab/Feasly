import Decimal from "decimal.js";
import { CovenantsBlock, ProjectInputs } from "./types";

const z = (T:number)=> Array.from({length:T}, ()=> new Decimal(0));
const W = 12; // LTM window size

function rollingRatio(
  num: Decimal[], den: Decimal[], window = W
): Decimal[] {
  const T = num.length;
  const out = z(T);
  let sumN = new Decimal(0), sumD = new Decimal(0);
  for (let t=0; t<T; t++){
    sumN = sumN.add(num[t] ?? 0);
    sumD = sumD.add(den[t] ?? 0);
    if (t >= window){
      sumN = sumN.sub(num[t-window] ?? 0);
      sumD = sumD.sub(den[t-window] ?? 0);
    }
    if (t >= window-1) {
      out[t] = sumD.isZero() ? new Decimal(Infinity) : sumN.div(sumD);
    } else {
      out[t] = new Decimal(NaN); // not enough history
    }
  }
  return out;
}

export function computeCovenants(params: {
  T: number;
  inputs: ProjectInputs;
  financing: {
    interest: Decimal[];
    principal: Decimal[];
    fees_ongoing: Decimal[];
    detail: Record<string, unknown>;
  };
  pnl: {
    ebit: Decimal[];
    interest: Decimal[]; // same as financing.interest but kept for clarity
  };
  cf: {
    from_operations: Decimal[]; // CFADS proxy
  };
}): CovenantsBlock {
  const { T, inputs, financing, pnl, cf } = params;
  const cfads = cf.from_operations;
  const interest = financing.interest;
  const principal = financing.principal;
  const fees = financing.fees_ongoing;
  const ebit = pnl.ebit;

  // Portfolio thresholds (min across tranches that define one)
  const minDSCR = inputs.debt?.reduce((m,tr)=>Math.min(m, tr.covenants?.dscr_min ?? Infinity), Infinity) ?? Infinity;
  const minICR  = inputs.debt?.reduce((m,tr)=>Math.min(m, tr.covenants?.icr_min  ?? Infinity), Infinity) ?? Infinity;
  const dscrMin = Number.isFinite(minDSCR) ? new Decimal(minDSCR) : null;
  const icrMin  = Number.isFinite(minICR)  ? new Decimal(minICR)  : null;

  // Portfolio test basis + grace: choose most lenient grace for portfolio (max)
  // and "most-demanding" basis if mixed (both).
  const allBasis = (inputs.debt ?? [])
    .map(d => d.covenants?.test_basis ?? "point");
  const basis: "point"|"ltm"|"both" = allBasis.includes("both")
    ? "both"
    : allBasis.includes("ltm")
      ? (allBasis.includes("point") ? "both" : "ltm")
      : "point";

  const grace = Math.max(0, ...(inputs.debt ?? [])
    .map(d => d.covenants?.grace_period_m ?? 0));

  // Whether any tranche wants strict DSCR; portfolio exposes both series anyway
  const anyStrict = (inputs.debt ?? [])
    .some(d => d.covenants?.strict_dscr);

  // Classic DSCR/Strict DSCR/ICR
  const debtSvcClassic = Array.from({length:T}, (_,t)=>
    (interest[t]||new Decimal(0)).add(principal[t]||new Decimal(0)));
  const debtSvcStrict = Array.from({length:T}, (_,t)=>
    debtSvcClassic[t].add(fees[t] || new Decimal(0)));

  const dscr = Array.from({length:T}, (_,t)=>{
    const den = debtSvcClassic[t] ?? new Decimal(0);
    return den.isZero() ? new Decimal(Infinity) : (cfads[t]||new Decimal(0)).div(den);
  });
  const dscr_strict = Array.from({length:T}, (_,t)=>{
    const den = debtSvcStrict[t] ?? new Decimal(0);
    return den.isZero() ? new Decimal(Infinity) : (cfads[t]||new Decimal(0)).div(den);
  });
  const icr = Array.from({length:T}, (_,t)=>{
    const den = (interest[t]||new Decimal(0));
    return den.isZero() ? new Decimal(Infinity) : (ebit[t]||new Decimal(0)).div(den);
  });

  // LTM variants (NaN until enough history)
  const dscr_ltm        = rollingRatio(cfads, debtSvcClassic, W);
  const dscr_strict_ltm = rollingRatio(cfads, debtSvcStrict, W);
  const icr_ltm         = rollingRatio(ebit,  interest,       W);

  // Headroom
  const dscr_headroom        = dscr.map(v => dscrMin ? v.sub(dscrMin) : new Decimal(NaN));
  const dscr_strict_headroom = dscr_strict.map(v => dscrMin ? v.sub(dscrMin) : new Decimal(NaN));
  const icr_headroom         = icr.map(v => icrMin ? v.sub(icrMin) : new Decimal(NaN));

  // Point-in-time breaches (classic)
  const dscr_breach_pt = dscr.map(v => dscrMin ? v.lt(dscrMin) : false);
  const icr_breach_pt  = icr.map(v => icrMin  ? v.lt(icrMin)   : false);

  // LTM breaches (classic)
  const dscr_breach_ltm = dscr_ltm.map(v => (dscrMin && v.isFinite()) ? v.lt(dscrMin) : false);
  const icr_breach_ltm  = icr_ltm.map(v  => (icrMin  && v.isFinite()) ? v.lt(icrMin)  : false);

  // Combine breaches by basis
  const combineByBasis = (pt: boolean[], ltm: boolean[])=>{
    if (basis === "point") return pt;
    if (basis === "ltm")   return ltm;
    return pt.map((b,i)=> b || ltm[i]); // both
  };
  const dscr_breach = combineByBasis(dscr_breach_pt, dscr_breach_ltm);
  const icr_breach  = combineByBasis(icr_breach_pt,  icr_breach_ltm);

  // Grace logic on portfolio: a breach only "counts" if consecutive streak >= grace
  const breaches_any_raw = dscr_breach.map((b,i)=> b || icr_breach[i]);
  const breaches_any = (() => {
    if (!grace) return breaches_any_raw.slice();
    const out = Array(T).fill(false);
    let streak = 0;
    for (let t=0; t<T; t++){
      if (breaches_any_raw[t]) {
        streak += 1;
      } else {
        streak = 0;
      }
      out[t] = streak >= grace;
    }
    return out;
  })();

  const total_breach_periods = breaches_any.reduce((a,b)=> a+(b?1:0), 0);
  const first_breach_index = breaches_any.findIndex(Boolean);
  const fbi = first_breach_index >= 0 ? first_breach_index : null;

  // Per-tranche series (classic only for simplicity; you can extend similarly)
  const by_tranche: Record<string, any> = {};
  const trList = (financing.detail?.tranches as any[]) ?? [];
  for (const tr of trList) {
    const k = tr.key as string;
    const i = (tr.interest  ?? []).map((x:number)=> new Decimal(x));
    const p = (tr.principal ?? []).map((x:number)=> new Decimal(x));
    const svcClassic = i.map((iv:Decimal,idx:number)=> iv.add(p[idx] || new Decimal(0)));
    const dscr_tr = svcClassic.map((den:Decimal, t:number)=>
      den.isZero() ? new Decimal(Infinity) : (cfads[t]||new Decimal(0)).div(den)
    );
    const ebitDen = i;
    const icr_tr  = ebitDen.map((den:Decimal, t:number)=>
      den.isZero() ? new Decimal(Infinity) : (ebit[t]||new Decimal(0)).div(den)
    );
    const trCfg = (inputs.debt ?? []).find(d=>d.key===k)?.covenants ?? {};
    const trD = (trCfg.dscr_min != null) ? new Decimal(trCfg.dscr_min) : null;
    const trI = (trCfg.icr_min  != null) ? new Decimal(trCfg.icr_min)  : null;

    const dscr_b = dscr_tr.map(v => trD ? v.lt(trD) : false);
    const icr_b  = icr_tr.map(v => trI ? v.lt(trI)  : false);

    by_tranche[k] = {
      dscr: dscr_tr,
      dscr_strict: z(T),            // optional per-tranche strict; left empty for now
      icr: icr_tr,
      dscr_ltm: rollingRatio(cfads, svcClassic, W),
      dscr_strict_ltm: z(T),        // optional per-tranche strict LTM
      icr_ltm: rollingRatio(ebit, i, W),
      dscr_breach: dscr_b,
      icr_breach: icr_b,
      dscr_headroom: dscr_tr.map(v => trD ? v.sub(trD) : new Decimal(NaN)),
      icr_headroom:  icr_tr.map(v => trI ? v.sub(trI) : new Decimal(NaN)),
      dscr_strict_headroom: z(T),
      detail: {}
    };
  }

  return {
    portfolio: {
      dscr, dscr_strict, icr,
      dscr_ltm, dscr_strict_ltm, icr_ltm,
      dscr_breach, icr_breach,
      dscr_headroom, icr_headroom, dscr_strict_headroom,
      detail: {
        any_strict_requested: anyStrict
      }
    },
    by_tranche,
    breaches_any,
    breaches_summary: {
      total_breach_periods,
      first_breach_index: fbi
    },
    detail: {
      test_basis: basis,
      grace_period_m: grace,
      dscr_threshold: dscrMin?.toNumber() ?? null,
      icr_threshold: icrMin?.toNumber() ?? null,
      notes: "DSCR classic = CFADS/(Int+Prin), strict adds ongoing fees; LTM sums 12-month numerators/denominators."
    }
  };
}