import Decimal from "decimal.js";

export function computeCashFlow(params: {
  T: number;
  pnl: {
    patmi: Decimal[];
  };
  revenue: {
    accounts_receivable: Decimal[];
  };
  costs: {
    capex: Decimal[];
  };
  depreciation: {
    total: Decimal[];
  };
  financing: {
    draws: Decimal[];
    principal: Decimal[];
    fees_upfront: Decimal[];
    fees_ongoing: Decimal[];
    dsra_funding: Decimal[];
    dsra_release: Decimal[];
  };
  tax: {
    carry_vat: Decimal[];
  };
  balance_sheet: {
    cash: Decimal[];
  };
  cash: {
    equity_cf: Decimal[];
  };
}): {
  from_operations: Decimal[];
  from_investing: Decimal[];
  from_financing: Decimal[];
  net_change: Decimal[];
  cash_closing: Decimal[];
  detail: {
    tie_out_ok_cash: boolean;
    max_cash_error: number;
  };
} {
  const { T, pnl, revenue, costs, depreciation, financing, tax, balance_sheet, cash } = params;
  
  function z(n: number): Decimal[] {
    return Array.from({ length: n }, () => new Decimal(0));
  }

  const ops = z(T);
  const inv = z(T);
  const fin = z(T);
  const net = z(T);
  const cashClose = z(T);

  for (let t = 0; t < T; t++) {
    // Operating Cash Flow: PATMI + Depreciation + Working Capital adjustments
    const patmi = pnl.patmi[t] || new Decimal(0);
    const depreciationAddBack = depreciation.total[t] || new Decimal(0);
    
    // ΔAR adjustment: decrease in AR is positive for cash (collections > sales)
    const prevAR = t > 0 ? (revenue.accounts_receivable[t-1] || new Decimal(0)) : new Decimal(0);
    const currAR = revenue.accounts_receivable[t] || new Decimal(0);
    const deltaAR = currAR.minus(prevAR);
    const arAdjustment = deltaAR.negated(); // -(current - previous)
    
    // ΔVAT carry adjustment: decrease in VAT carry is positive for cash
    const prevVATCarry = t > 0 ? (tax.carry_vat[t-1] || new Decimal(0)) : new Decimal(0);
    const currVATCarry = tax.carry_vat[t] || new Decimal(0);
    const deltaVATCarry = currVATCarry.minus(prevVATCarry);
    const vatAdjustment = deltaVATCarry.negated(); // -(current - previous)

    ops[t] = patmi
      .add(depreciationAddBack)
      .add(arAdjustment)
      .add(vatAdjustment);

    // Investing Cash Flow: CAPEX outflows (negative)
    const capexOutflow = costs.capex[t] || new Decimal(0);
    inv[t] = capexOutflow.negated(); // capex is an outflow

    // Financing Cash Flow: draws(+), principal(-), fees(-), DSRA movements, equity
    const draws = financing.draws[t] || new Decimal(0);
    const principal = financing.principal[t] || new Decimal(0);
    const feesUpfront = financing.fees_upfront[t] || new Decimal(0);
    const feesOngoing = financing.fees_ongoing[t] || new Decimal(0);
    const dsraFunding = financing.dsra_funding[t] || new Decimal(0);
    const dsraRelease = financing.dsra_release[t] || new Decimal(0);
    
    // Equity injections (positive parts of equity_cf)
    const equityCF = cash.equity_cf[t] || new Decimal(0);
    const equityInjection = Decimal.max(equityCF, new Decimal(0));

    fin[t] = draws
      .minus(principal)
      .minus(feesUpfront)
      .minus(feesOngoing)
      .minus(dsraFunding)
      .add(dsraRelease)
      .add(equityInjection);

    // Net Change
    net[t] = ops[t].add(inv[t]).add(fin[t]);

    // Cash Closing (cumulative)
    const prevCash = t > 0 ? cashClose[t-1] : new Decimal(0);
    cashClose[t] = prevCash.add(net[t]);
  }

  // Diagnostics: compare our computed cash closing to balance sheet cash
  const cashErrors = cashClose.map((computed, t) => {
    const bsCash = balance_sheet.cash[t] || new Decimal(0);
    return computed.minus(bsCash).abs();
  });

  const maxCashError = Math.max(...cashErrors.map(e => e.toNumber()));
  const tieOutOKCash = maxCashError < 0.01;

  return {
    from_operations: ops,
    from_investing: inv,
    from_financing: fin,
    net_change: net,
    cash_closing: cashClose,
    detail: {
      tie_out_ok_cash: tieOutOKCash,
      max_cash_error: maxCashError
    }
  };
}