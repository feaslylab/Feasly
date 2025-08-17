import Decimal from "decimal.js";

export const toNum = (x: unknown): number => {
  if (x instanceof Decimal) return x.toNumber();
  if (typeof x === "number") return x;
  if (x && typeof (x as any).toNumber === "function") return (x as any).toNumber();
  return Number(x ?? 0);
};

export const numArr = (arr: unknown[]): number[] =>
  (arr ?? []).map(toNum);

// Deep converter for common engine blocks
export function numberifyRevenue(rev: any) {
  return {
    ...rev,
    rev_sales: numArr(rev.rev_sales),
    rev_rent: numArr(rev.rev_rent),
    rev_cam: numArr(rev.rev_cam ?? []),
    vat_output: numArr(rev.vat_output),
    billings_total: numArr(rev.billings_total),
    recognized_sales: numArr(rev.recognized_sales ?? rev.rev_sales),
    allowed_release: numArr(rev.allowed_release ?? []),
    collections: numArr(rev.collections ?? []),
    accounts_receivable: numArr(rev.accounts_receivable ?? []),
  };
}

export function numberifyCosts(c: any) {
  return {
    ...c,
    capex: numArr(c.capex),
    opex: numArr(c.opex),
    opex_net_of_cam: numArr(c.opex_net_of_cam ?? c.opex),
    vat_input: numArr(c.vat_input),
  };
}

export function numberifyFin(fin: any) {
  const detailTranches = (fin?.detail?.tranches ?? []).map((tr: any) => ({
    ...tr,
    draws: numArr(tr?.draws ?? []),
    interest: numArr(tr?.interest ?? []),
    principal: numArr(tr?.principal ?? []),
    balance: numArr(tr?.balance ?? [])
  }));

  return {
    ...fin,
    draws: numArr(fin.draws ?? []),
    interest: numArr(fin.interest ?? []),
    principal: numArr(fin.principal ?? []),
    balance: numArr(fin.balance ?? []),
    fees_upfront: numArr(fin.fees_upfront ?? []),
    fees_commitment: numArr(fin.fees_commitment ?? []),
    fees_ongoing: numArr(fin.fees_ongoing ?? []),
    dsra_balance: numArr(fin.dsra_balance ?? []),
    dsra_funding: numArr(fin.dsra_funding ?? []),
    dsra_release: numArr(fin.dsra_release ?? []),
    detail: {
      ...fin?.detail,
      tranches: detailTranches
    }
  };
}

export function numberifyTax(t: any) {
  return {
    ...t,
    vat_output: numArr(t.vat_output ?? []),
    vat_input: numArr(t.vat_input ?? []),
    vat_net: numArr(t.vat_net ?? []),
    carry_vat: numArr(t.carry_vat ?? []),
    corp: numArr(t.corp ?? []),
    zakat: numArr(t.zakat ?? []),
  };
}

export function numberifyDep(d: any) {
  return {
    ...d,
    total: numArr(d.total ?? []),
    nbv: numArr(d.nbv ?? []),
  };
}

export function numberifyCash(c: any) {
  return {
    ...c,
    project_before_fin: numArr(c.project_before_fin ?? []),
    project: numArr(c.project ?? []),
    equity_cf: numArr(c.equity_cf ?? []),
  };
}

export function numberifyBalanceSheet(bs: any) {
  const num = (a: any[] = []) => a.map(toNum);
  return {
    ...bs,
    cash: num(bs.cash),
    accounts_receivable: num(bs.accounts_receivable),
    dsra_cash: num(bs.dsra_cash),
    nbv: num(bs.nbv),
    vat_asset: num(bs.vat_asset),
    debt: num(bs.debt),
    vat_liability: num(bs.vat_liability),
    paid_in_equity: num(bs.paid_in_equity),
    retained_earnings: num(bs.retained_earnings),
    assets_total: num(bs.assets_total),
    liab_equity_total: num(bs.liab_equity_total),
    imbalance: num(bs.imbalance),
  };
}

export function numberifyPnL(p: any) {
  const num = (a: unknown[]) => (a ?? []).map(toNum);
  return {
    ...p,
    revenue: num(p.revenue ?? []),
    opex: num(p.opex ?? []),
    depreciation: num(p.depreciation ?? []),
    ebit: num(p.ebit ?? []),
    interest: num(p.interest ?? []),
    pbt: num(p.pbt ?? []),
    corp_tax: num(p.corp_tax ?? []),
    zakat: num(p.zakat ?? []),
    patmi: num(p.patmi ?? []),
  };
}

export function numberifyCashFlow(cf: any) {
  const num = (a: unknown[]) => (a ?? []).map(toNum);
  return {
    ...cf,
    from_operations: num(cf.from_operations ?? []),
    from_investing: num(cf.from_investing ?? []),
    from_financing: num(cf.from_financing ?? []),
    net_change: num(cf.net_change ?? []),
    cash_closing: num(cf.cash_closing ?? []),
  };
}

export function numberifyCovenants(c: any) {
  const toN = (x:any)=> typeof x === "number" ? x : (x?.toNumber?.() ?? (isFinite(x) ? Number(x) : x));
  const num = (a: unknown[]) => (a ?? []).map(toN);
  const numSeries = (s:any)=>({
    ...s,
    dscr: num(s?.dscr ?? []),
    dscr_strict: num(s?.dscr_strict ?? []),
    icr: num(s?.icr ?? []),
    dscr_ltm: num(s?.dscr_ltm ?? []),
    dscr_strict_ltm: num(s?.dscr_strict_ltm ?? []),
    icr_ltm: num(s?.icr_ltm ?? []),
    dscr_breach: (s?.dscr_breach ?? []).map(Boolean),
    icr_breach:  (s?.icr_breach  ?? []).map(Boolean),
    dscr_headroom: num(s?.dscr_headroom ?? []),
    icr_headroom:  num(s?.icr_headroom  ?? []),
    dscr_strict_headroom: num(s?.dscr_strict_headroom ?? []),
  });

  const byTr: Record<string, any> = {};
  for (const k of Object.keys(c?.by_tranche ?? {})) {
    byTr[k] = numSeries(c.by_tranche[k]);
  }
  return {
    ...c,
    portfolio: numSeries(c.portfolio ?? {}),
    by_tranche: byTr,
    breaches_any: (c?.breaches_any ?? []).map(Boolean),
    breaches_summary: c?.breaches_summary ?? {},
    detail: c?.detail ?? {}
  };
}

export function numberifyWaterfall(w: any) {
  const num = (a: unknown[]) => (a ?? []).map(toNum);
  const capitalAccounts: Record<string, any> = {};
  
  for (const [key, account] of Object.entries(w?.capital_accounts ?? {})) {
    const acc = account as any;
    capitalAccounts[key] = {
      contributed: num(acc?.contributed ?? []),
      returned_capital: num(acc?.returned_capital ?? []),
      pr_accrued: num(acc?.pr_accrued ?? []),
      pr_paid: num(acc?.pr_paid ?? []),
      profit_distributions: num(acc?.profit_distributions ?? []),
      ending_unreturned_capital: num(acc?.ending_unreturned_capital ?? []),
    };
  }
  
  const auditTiers = (w?.audit?.tiers ?? []).map((tier: any) => ({
    ...tier,
    allocations: (tier?.allocations ?? []).map((alloc: any) => ({
      period: alloc?.period ?? 0,
      lp: toNum(alloc?.lp ?? 0),
      gp: toNum(alloc?.gp ?? 0),
    }))
  }));
  
  return {
    ...w,
    lp_distributions: num(w?.lp_distributions ?? []),
    gp_distributions: num(w?.gp_distributions ?? []),
    carry_paid: num(w?.carry_paid ?? []),
    lp: {
      irr_pa: w?.lp?.irr_pa != null ? toNum(w.lp.irr_pa) : null,
      moic: w?.lp?.moic != null ? toNum(w.lp.moic) : null,
      dpi: w?.lp?.dpi != null ? toNum(w.lp.dpi) : null,
      tvpi: w?.lp?.tvpi != null ? toNum(w.lp.tvpi) : null,
    },
    gp: {
      irr_pa: w?.gp?.irr_pa != null ? toNum(w.gp.irr_pa) : null,
      moic: w?.gp?.moic != null ? toNum(w.gp.moic) : null,
      dpi: w?.gp?.dpi != null ? toNum(w.gp.dpi) : null,
      tvpi: w?.gp?.tvpi != null ? toNum(w.gp.tvpi) : null,
    },
    capital_accounts: capitalAccounts,
    audit: {
      tiers: auditTiers
    },
    detail: w?.detail ?? {}
  };
}

export function numberifyEquity(equity: any) {
  const num = (a: unknown[]) => (a ?? []).map(toNum);
  
  // Handle KPIs by investor
  const by_investor: Record<string, any> = {};
  if (equity?.kpis?.by_investor) {
    Object.entries(equity.kpis.by_investor).forEach(([key, kpi]: [string, any]) => {
      by_investor[key] = {
        irr_pa: kpi?.irr_pa != null ? toNum(kpi.irr_pa) : null,
        tvpi: toNum(kpi?.tvpi ?? 0),
        dpi: toNum(kpi?.dpi ?? 0),
        rvpi: toNum(kpi?.rvpi ?? 0),
        moic: toNum(kpi?.moic ?? 0),
        contributed: toNum(kpi?.contributed ?? 0),
        distributed: toNum(kpi?.distributed ?? 0),
        nav: toNum(kpi?.nav ?? 0),
      };
    });
  }

  // Handle calls and distributions by investor
  const calls_by_investor: Record<string, number[]> = {};
  const dists_by_investor: Record<string, number[]> = {};
  
  if (equity?.calls_by_investor) {
    Object.entries(equity.calls_by_investor).forEach(([key, arr]: [string, any]) => {
      calls_by_investor[key] = num(arr);
    });
  }
  
  if (equity?.dists_by_investor) {
    Object.entries(equity.dists_by_investor).forEach(([key, arr]: [string, any]) => {
      dists_by_investor[key] = num(arr);
    });
  }

  // Handle detail ledgers
  const detail = equity?.detail ?? {};
  const class_ledgers = detail?.class_ledgers ?? {};
  const investor_ledgers = detail?.investor_ledgers ?? {};

  // Convert class ledger records
  const numRecord = (rec: Record<string, any>) => {
    const result: Record<string, number> = {};
    Object.entries(rec).forEach(([key, val]) => {
      result[key] = toNum(val);
    });
    return result;
  };

  return {
    ...equity,
    calls_total: num(equity?.calls_total ?? []),
    dists_total: num(equity?.dists_total ?? []),
    gp_promote: num(equity?.gp_promote ?? []),
    gp_clawback: num(equity?.gp_clawback ?? []),
    calls_by_investor,
    dists_by_investor,
    kpis: {
      ...equity?.kpis,
      irr_pa: equity?.kpis?.irr_pa != null ? toNum(equity.kpis.irr_pa) : null,
      tvpi: toNum(equity?.kpis?.tvpi ?? 0),
      dpi: toNum(equity?.kpis?.dpi ?? 0),
      rvpi: toNum(equity?.kpis?.rvpi ?? 0),
      moic: toNum(equity?.kpis?.moic ?? 0),
      by_investor,
    },
    detail: {
      ...detail,
      class_ledgers: {
        ...class_ledgers,
        pref_balance: numRecord(class_ledgers?.pref_balance ?? {}),
        excess_distributions_cum: numRecord(class_ledgers?.excess_distributions_cum ?? {}),
        gp_catchup_cum: numRecord(class_ledgers?.gp_catchup_cum ?? {}),
        gp_promote_cum: numRecord(class_ledgers?.gp_promote_cum ?? {}),
        debug: class_ledgers?.debug ?? {},
      },
      investor_ledgers: {
        ...investor_ledgers,
        unreturned_capital: numRecord(investor_ledgers?.unreturned_capital ?? {}),
      },
    },
  };
}