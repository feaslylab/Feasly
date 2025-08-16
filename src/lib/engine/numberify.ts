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
    vat_output: numArr(rev.vat_output),
    billings_total: numArr(rev.billings_total),
    recognized_sales: numArr(rev.recognized_sales ?? rev.rev_sales),
    allowed_release: numArr(rev.allowed_release ?? []),
  };
}

export function numberifyCosts(c: any) {
  return {
    ...c,
    capex: numArr(c.capex),
    opex: numArr(c.opex),
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
    vat_net: numArr(t.vat_net ?? []),
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