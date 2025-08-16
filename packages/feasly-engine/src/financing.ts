import Decimal from "decimal.js";
import { ProjectInputs } from "./types";

export type FinancingBlock = {
  draws: Decimal[];          // +ve cash in
  interest: Decimal[];       // cash interest paid (for now)
  principal: Decimal[];      // repayments (annuity/bullet)
  balance: Decimal[];        // end-of-period outstanding
  detail: Record<string, unknown>;
};

function zeros(T: number) { return Array.from({ length: T }, () => new Decimal(0)); }

/** PMT-style annuity payment per month: rate_m, tenor_m, principal */
function pmtMonthly(rate_m: Decimal, n: number, pv: Decimal): Decimal {
  if (rate_m.eq(0)) return pv.div(n);
  const one = new Decimal(1);
  const num = rate_m.mul(pv);
  const den = one.minus(one.plus(rate_m).pow(-n));
  return num.div(den);
}

/** naive LTC-based draw plan: capex (and optionally opex) net of equity → debt up to LTC */
function planDrawsFromCapex(capex: Decimal[], ltc: number): Decimal[] {
  // Assume debt funds LTC * capex each period; equity funds the rest (no cash balance yet)
  const T = capex.length;
  const out = zeros(T);
  for (let t = 0; t < T; t++) {
    out[t] = capex[t].mul(ltc);
  }
  return out;
}

/** Build one tranche schedule given draws, tenor, amort type, and monthly rate */
function trancheSchedule(
  draws: Decimal[],        // exogenous or planned
  tenor_m: number,
  amort_type: "bullet" | "annuity",
  rate_m: Decimal
) {
  const T = draws.length;
  const interest = zeros(T);
  const principal = zeros(T);
  const balance = zeros(T);

  // Running outstanding
  let bal = new Decimal(0);

  // 1) Build outstanding through time with interest accrual
  // 2) Apply repayments depending on amort type (annuity after "availability" assumed starts once balance > 0)
  // Simplification: if annuity, start an annuity stream once the draw window is over (= after last non-zero draw)
  const lastDrawIdx = (() => {
    let idx = -1;
    for (let t = 0; t < T; t++) if (!draws[t].isZero()) idx = t;
    return idx;
  })();

  for (let t = 0; t < T; t++) {
    // receive draw
    bal = bal.add(draws[t]);

    // interest on opening balance (post-draw– we'll approximate interest on current bal)
    const int_t = bal.mul(rate_m);
    interest[t] = int_t;
    bal = bal.add(int_t);

    // repayments
    if (amort_type === "bullet") {
      // bullet: repay at maturity (lastDrawIdx + tenor_m - 1), guard bounds
      const mat = Math.min(lastDrawIdx + tenor_m, T - 1);
      if (t === mat) {
        principal[t] = bal; // repay everything
        bal = new Decimal(0);
      }
    } else {
      // annuity: constant payment from start t0 = lastDrawIdx+1 until t0+tenor_m-1
      const t0 = lastDrawIdx + 1;
      if (t === t0) {
        // compute payment based on balance at t0
        const remaining = Math.max(tenor_m, 1);
        const payment = pmtMonthly(rate_m, remaining, bal);
        // Store on detail for reference
      }
      // If in annuity window, compute a constant payment (recompute each t0)
      const t0a = lastDrawIdx + 1;
      if (t >= t0a && t < t0a + tenor_m) {
        const payment = pmtMonthly(rate_m, tenor_m, balanceAtStart(draws, interest, t0a)); // helper below
        // Payment first covers interest then principal
        const interestPortion = Decimal.min(payment, bal.mul(rate_m)); // approximate current-period interest
        const principalPortion = payment.minus(interestPortion).max(0);
        principal[t] = principalPortion;
        bal = bal.minus(principalPortion);
      }
    }

    balance[t] = bal.max(0);
  }

  return { interest, principal, balance };
}

/** compute balance at period start for annuity start (approximate with cumulative draws and interest to t0-1) */
function balanceAtStart(draws: Decimal[], interest: Decimal[], t0: number): Decimal {
  let b = new Decimal(0);
  for (let t = 0; t < t0; t++) b = b.add(draws[t]).add(interest[t]);
  return b;
}

export function computeFinancing(inputs: ProjectInputs, capex: Decimal[]): FinancingBlock {
  const T = inputs.project.periods;
  const draws = zeros(T);
  const interest = zeros(T);
  const principal = zeros(T);
  const balance = zeros(T);
  const detail: Record<string, unknown> = { tranches: [] };

  if (!inputs.debt?.length) {
    return { draws, interest, principal, balance, detail };
  }

  // For Prompt 4: single synthetic draw plan from capex and first tranche LTC; extend later for multi-tranche
  const first = inputs.debt[0];
  const ltc = (first.limit_ltc ?? 0);
  const tenor_m = first.tenor_months;
  const rate_pa = (first.fee_commitment_pct_pa ?? 0) + 0; // Placeholder: you likely have a nominal rate field; wire it when available
  const rate_m = new Decimal(rate_pa).div(12);            // If you already store nominal rate, use it here.

  // plan draws
  const plannedDraws = planDrawsFromCapex(capex, ltc);

  // tranche schedule
  const { interest: i1, principal: p1, balance: b1 } = trancheSchedule(plannedDraws, tenor_m, (first.amort_type as any) ?? "bullet", rate_m);

  // aggregate into engine-level arrays (single tranche for now)
  for (let t = 0; t < T; t++) {
    draws[t] = draws[t].add(plannedDraws[t]);
    interest[t] = interest[t].add(i1[t]);
    principal[t] = principal[t].add(p1[t]);
    balance[t] = balance[t].add(b1[t]);
  }

  (detail.tranches as any[]) = [{
    key: first.key,
    draws: plannedDraws.map(d => d.toNumber()),
    interest: i1.map(d => d.toNumber()),
    principal: p1.map(d => d.toNumber()),
    balance: b1.map(d => d.toNumber())
  }];

  return { draws, interest, principal, balance, detail };
}