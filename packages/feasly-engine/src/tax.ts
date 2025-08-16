import Decimal from "decimal.js";
import { ProjectInputs, VATClass } from "./types";

export type VATBlock = {
  output: Decimal[];      // VAT collected on outputs (sales/rent) this period
  inputEligible: Decimal[]; // VAT on eligible inputs (capex/opex)
  net: Decimal[];         // output - input (with carry fwd to keep net >= 0 if rules say so)
  carryForward: Decimal[]; // cumulative carry when input > output (refund rules vary by jurisdiction)
  detail: Record<string, unknown>;
};

function zeros(T: number) { return Array.from({ length: T }, () => new Decimal(0)); }

function vatRate(inputs: ProjectInputs): Decimal {
  return new Decimal(inputs.tax?.vat_rate ?? 0);
}

function outputVatForClass(vatClass: VATClass, base: Decimal, rate: Decimal): Decimal {
  switch (vatClass) {
    case "standard": return base.mul(rate);
    case "zero":     return new Decimal(0); // zero-rated outputs
    case "exempt":   return new Decimal(0); // exempt outputs (no output VAT, inputs often non-recoverable; policy varies)
    case "out_of_scope": return new Decimal(0);
    default: return new Decimal(0);
  }
}

/** For Phase 1 VAT: assume input VAT eligibility boolean per item; exempt outputs do not grant input recovery (common policy). */
export function computeVAT(
  inputs: ProjectInputs,
  recognized_sales: Decimal[],
  rent: Decimal[],
  capex: Decimal[],
  opex: Decimal[]
): VATBlock {
  const T = recognized_sales.length;
  const outVat = zeros(T);
  const inVat  = zeros(T);
  const net    = zeros(T);
  const carry  = zeros(T);

  if (!inputs.tax?.vat_enabled) {
    return { output: outVat, inputEligible: inVat, net, carryForward: carry, detail:{} };
  }

  const rate = vatRate(inputs);

  // OUTPUT VAT:
  // Sales: per unit type VAT class; here we approximate using total recognized_sales at standard rate
  // Rent: often standard or exempt by jurisdiction; use VAT class on unit types if you want per-use precision later.
  // For now, apply standard rate to recognized_sales and overall rent with one rate (we refine later per UT).
  // Simplification: use overall recognized_sales and overall rent with one rate (we refine later per UT).
  for (let t = 0; t < T; t++) {
    outVat[t] = recognized_sales[t].mul(rate).add(rent[t].mul(rate));
  }

  // INPUT VAT:
  // Sum item VAT where item.vat_input_eligible = true (proxy: apply to capex+opex proportionally)
  // For parity, we'll take a simple share: assume a global eligibility share based on items.
  let eligShare = 0;
  const eligCount = inputs.cost_items.filter(i => i.vat_input_eligible).length;
  if (inputs.cost_items.length > 0) {
    eligShare = eligCount / inputs.cost_items.length;
  }
  for (let t = 0; t < T; t++) {
    const base = capex[t].add(opex[t]);
    inVat[t] = base.mul(rate).mul(eligShare);
  }

  // NET VAT with carry-forward (no refunds paid out automatically in this phase):
  let cumCarry = new Decimal(0);
  for (let t = 0; t < T; t++) {
    const grossNet = outVat[t].minus(inVat[t]).minus(cumCarry); // apply carry to offset
    if (grossNet.greaterThanOrEqualTo(0)) {
      net[t] = grossNet;
      cumCarry = new Decimal(0);
    } else {
      net[t] = new Decimal(0);
      cumCarry = grossNet.abs(); // carry forward the excess input VAT
    }
    carry[t] = cumCarry;
  }

  return {
    output: outVat,
    inputEligible: inVat,
    net,
    carryForward: carry,
    detail: {
      assumptions: {
        rate: rate.toNumber(),
        inputEligibilityShare: eligShare,
        ruleset: inputs.tax?.vat_ruleset ?? "UAE_2025"
      }
    }
  };
}