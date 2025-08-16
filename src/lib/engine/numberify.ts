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
  return {
    ...fin,
    draws: numArr(fin.draws ?? []),
    interest: numArr(fin.interest ?? []),
    principal: numArr(fin.principal ?? []),
    balance: numArr(fin.balance ?? []),
    fees_upfront: numArr(fin.fees_upfront ?? []),
    fees_ongoing: numArr(fin.fees_ongoing ?? []),
    dsra_balance: numArr(fin.dsra_balance ?? []),
    dsra_funding: numArr(fin.dsra_funding ?? []),
    dsra_release: numArr(fin.dsra_release ?? []),
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