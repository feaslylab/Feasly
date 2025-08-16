import Decimal from "decimal.js";
import { ProfitAndLossBlock } from "./types";

function z(T:number){ return Array.from({length:T}, () => new Decimal(0)); }

export function computePnL(params: {
  T: number;
  recognized_sales: Decimal[];
  rev_rent: Decimal[];
  rev_cam: Decimal[];
  opex_net_of_cam: Decimal[];
  depreciation: Decimal[];
  interest: Decimal[];
  corp_tax: Decimal[];
  zakat: Decimal[];
}): ProfitAndLossBlock {
  const {
    T, recognized_sales, rev_rent, rev_cam,
    opex_net_of_cam, depreciation, interest, corp_tax, zakat
  } = params;

  const revenue = z(T), opex = z(T), depreciationOut = z(T),
        ebit = z(T), pbt = z(T), patmi = z(T);

  for (let t=0;t<T;t++){
    revenue[t]        = recognized_sales[t].add(rev_rent[t]).add(rev_cam[t] ?? 0);
    opex[t]           = opex_net_of_cam[t];
    depreciationOut[t]= depreciation[t];
    ebit[t]           = revenue[t].minus(opex[t]).minus(depreciationOut[t]);
    pbt[t]            = ebit[t].minus(interest[t]);
    patmi[t]          = pbt[t].minus(corp_tax[t]).minus(zakat[t]);
  }

  return {
    revenue, opex, depreciation: depreciationOut, ebit, interest,
    pbt, corp_tax, zakat, patmi, detail: {}
  };
}