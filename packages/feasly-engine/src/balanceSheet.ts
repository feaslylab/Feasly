import Decimal from "decimal.js";
import { ProjectInputs } from "./types";

export function computeBalanceSheet(params: {
  T: number;
  revenue: {
    accounts_receivable: Decimal[];
  };
  depreciation: {
    nbv: Decimal[];
  };
  financing: {
    balance: Decimal[];
    dsra_balance: Decimal[];
  };
  tax: {
    vat_output: Decimal[]; // if you expose separately
    vat_input: Decimal[];  // optional
    vat_net: Decimal[];    // paid each period in cash
    vat_carry?: Decimal[]; // negative = asset, positive = liability
    carry_vat?: Decimal[]; // alternative name
  };
  cash: {
    project: Decimal[];         // net cash flow of project (already includes VAT, corp tax, zakat, fees)
    equity_cf: Decimal[];       // equity perspective CF (currently = project - draws)
  };
  pnl: {
    patmi: Decimal[];           // profit after tax & zakat for RE rollforward
  };
}): {
  cash: Decimal[];
  accounts_receivable: Decimal[];
  dsra_cash: Decimal[];
  nbv: Decimal[];
  vat_asset: Decimal[];
  debt: Decimal[];
  vat_liability: Decimal[];
  paid_in_equity: Decimal[];
  retained_earnings: Decimal[];
  assets_total: Decimal[];
  liab_equity_total: Decimal[];
  imbalance: Decimal[];
  detail: {
    tie_out_ok: boolean;
    retained_earnings_rollforward: boolean;
  };
} {
  const { T, revenue, depreciation, financing, tax, cash, pnl } = params;
  const z = (n:number)=>Array.from({length:n},()=>new Decimal(0));

  // 1) Cash balance: cumulative sum of project cash
  const cashBal = z(T);
  let c = new Decimal(0);
  for (let t=0;t<T;t++){ c = c.add(cash.project[t] || 0 as any); cashBal[t]=c; }

  // 2) AR from revenue
  const ar = revenue.accounts_receivable.slice();

  // 3) DSRA cash from financing
  const dsra = financing.dsra_balance.slice();

  // 4) NBV from depreciation
  const nbv = depreciation.nbv.slice();

  // 5) VAT asset/liability split from carry (if not present, derive as zeros)
  const carry = tax.vat_carry ?? tax.carry_vat ?? z(T);
  const vatAsset = z(T), vatLiab = z(T);
  for (let t=0;t<T;t++){
    const v = carry[t] || new Decimal(0);
    if (v.isNegative()) {
      vatAsset[t] = v.abs();
    } else {
      vatLiab[t] = (tax.vat_net[t] || new Decimal(0)).add(v);
    }
  }

  // 6) Debt from financing balance
  const debt = financing.balance.slice();

  // 7) Equity:
  //    a) Paid-in equity as positive injections. We'll infer it from equity_cf vs project cash:
  //       equity_cf ≈ project - (debt draws net)? Today equity_cf already represents equity perspective,
  //       but we want the actual "paid-in" cumulative when positive.
  const paidIn = z(T);
  let paidCum = new Decimal(0);
  for (let t=0;t<T;t++){
    const eq = cash.equity_cf[t] || new Decimal(0);
    const injection = Decimal.max(eq, new Decimal(0)); // positive = injections (Phase 1 simplification)
    paidCum = paidCum.add(injection);
    paidIn[t] = paidCum;
  }

  //    b) Retained earnings: rollforward from PATMI (no longer a plug)
  const re = z(T);
  let reCum = new Decimal(0);
  for (let t=0;t<T;t++){
    reCum = reCum.add(pnl.patmi[t] || new Decimal(0));
    re[t] = reCum;
  }

  // Calculate totals and diagnostics
  const assetsTotal = z(T);
  const liabEqTotal = z(T);
  const tieOutOK = Array(T).fill(true);

  for (let t=0;t<T;t++){
    const A = (cashBal[t]||new Decimal(0))
      .add(ar[t]||0 as any)
      .add(dsra[t]||0 as any)
      .add(nbv[t]||0 as any)
      .add(vatAsset[t]||0 as any);

    const L_E = (debt[t]||new Decimal(0))
      .add(vatLiab[t]||0 as any)
      .add(paidIn[t]||0 as any)
      .add(re[t]||0 as any);

    assetsTotal[t] = A;
    liabEqTotal[t] = L_E;
    
    // Check tie-out (within 0.01 tolerance)
    const imbal = A.minus(liabEqTotal[t]);
    tieOutOK[t] = imbal.abs().lt(0.01);
  }

  const allTieOutOK = tieOutOK.every(x => x);

  const imbalance = assetsTotal.map((a, i)=> a.minus(liabEqTotal[i]));

  return {
    cash: cashBal,
    accounts_receivable: ar,
    dsra_cash: dsra,
    nbv,
    vat_asset: vatAsset,
    debt,
    vat_liability: vatLiab,
    paid_in_equity: paidIn,
    retained_earnings: re,
    assets_total: assetsTotal,
    liab_equity_total: liabEqTotal,
    imbalance,
    detail: {
      tie_out_ok: allTieOutOK,
      retained_earnings_rollforward: true
    }
  };
}