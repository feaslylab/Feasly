import Decimal from "decimal.js";
import { ProjectInputs } from "./types";

export type VATBlock = {
  output: Decimal[];     // VAT on sales/rent outputs
  input: Decimal[];      // VAT on eligible costs
  net: Decimal[];        // output - input (with carryforward logic)
  carry: Decimal[];      // accumulated input/output carry balances
  detail: Record<string, unknown>;
};

const zeros = (T: number) => Array.from({ length: T }, () => new Decimal(0));

/**
 * Compute VAT with proper timing (invoice vs cash) and respect VAT classes
 */
export function computeVAT(
  inputs: ProjectInputs,
  billings_total: Decimal[],
  collections: Decimal[],
  rev_rent: Decimal[],
  capex: Decimal[],
  opex: Decimal[]
): VATBlock {
  const T = billings_total.length;
  if (!inputs.tax?.vat_enabled) {
    return {
      output: zeros(T),
      input: zeros(T),
      net: zeros(T),
      carry: zeros(T),
      detail: { enabled: false }
    };
  }

  const vatRate = new Decimal(inputs.tax.vat_rate ?? 0);
  const timing = inputs.tax.vat_timing ?? "invoice";
  
  const output = zeros(T);
  const input = zeros(T);

  // Build output VAT base based on timing and VAT classes
  // For now, apply standard rate to all billings/collections (per-UT class refinement later)
  for (let t = 0; t < T; t++) {
    let salesBase = new Decimal(0);
    let rentBase = new Decimal(0);

    if (timing === "invoice") {
      // Use billings for invoice timing
      salesBase = billings_total[t];
    } else {
      // Use collections for cash timing
      salesBase = collections[t];
    }
    
    // Rent is always immediate cash (occupancy-based)
    rentBase = rev_rent[t];

    // Apply VAT rate to standard-rated outputs (simplified: treat all as standard for now)
    // TODO: Implement per-UT VAT class filtering
    output[t] = salesBase.add(rentBase).mul(vatRate);

    // Input VAT: eligible share of costs (timing: cash for now)
    const inputBase = capex[t].add(opex[t]).mul(0.5); // 50% eligible assumption for Phase 1
    input[t] = inputBase.mul(vatRate);
  }

  // Net VAT with carryforward logic
  const net = zeros(T);
  const carry = zeros(T);
  let carryBalance = new Decimal(0);

  for (let t = 0; t < T; t++) {
    const periodNet = output[t].minus(input[t]);
    const afterCarry = periodNet.add(carryBalance);
    
    if (afterCarry.isNegative()) {
      // Carry forward the negative (input excess)
      net[t] = new Decimal(0);
      carryBalance = afterCarry;
    } else {
      // Pay the net VAT
      net[t] = afterCarry;
      carryBalance = new Decimal(0);
    }
    
    carry[t] = carryBalance;
  }

  return {
    output,
    input,
    net,
    carry,
    detail: {
      timing,
      rate: vatRate.toNumber(),
      enabled: true
    }
  };
}