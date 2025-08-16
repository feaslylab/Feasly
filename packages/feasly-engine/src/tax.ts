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
  for (let t = 0; t < T; t++) {
    let salesBase = new Decimal(0);
    let rentBase = new Decimal(0);

    // Process unit types for sales VAT
    for (const ut of inputs.unit_types) {
      if (ut.vat_class_output === "standard") {
        const area = new Decimal(ut.sellable_area_sqm ?? 0);
        const count = new Decimal(ut.count ?? 0);
        const price0 = new Decimal(ut.initial_price_sqm_sale ?? 0);
        const rent0 = new Decimal(ut.initial_rent_sqm_m ?? 0);

        // Get index escalation for this UT
        const priceIdx = inputs.index_buckets.find(b => b.key === ut.index_bucket_price);
        const rentIdx = inputs.index_buckets.find(b => b.key === ut.index_bucket_rent);
        const priceRate = priceIdx?.rate_nominal_pa ?? 0;
        const rentRate = rentIdx?.rate_nominal_pa ?? 0;

        // Simple index factor (monthly compounding)
        const priceIdxFactor = Math.pow(1 + priceRate/12, t);
        const rentIdxFactor = Math.pow(1 + rentRate/12, t);

        if (ut.curve?.meaning === "sell_through") {
          // Sales: use billings vs collections based on timing
          const curve = ut.curve?.values ?? [];
          const normalized = curve.length > 0 ? curve.map(v => (v || 0) / curve.reduce((a, b) => a + (b || 0), 0)) : [0];
          const curveT = normalized.length > t ? normalized[t] : 0;
          
          const utContribution = area.mul(count).mul(price0).mul(priceIdxFactor).mul(curveT);
          
          if (timing === "invoice") {
            salesBase = salesBase.add(utContribution);
          } else {
            // For cash timing, use collection curve if available
            const collCurve = ut.collection_curve?.values ?? [1]; // default immediate
            const collNorm = collCurve.length > 0 ? collCurve.map(v => (v || 0) / collCurve.reduce((a, b) => a + (b || 0), 0)) : [1];
            const collT = collNorm.length > t ? collNorm[t] : 0;
            const cashContribution = area.mul(count).mul(price0).mul(priceIdxFactor).mul(collT);
            salesBase = salesBase.add(cashContribution);
          }
        } else if (ut.curve?.meaning === "occupancy") {
          // Rent: always immediate cash
          const curve = ut.curve?.values ?? [];
          const curveT = curve.length > t ? (curve[t] || 0) : 0;
          const utRentContribution = area.mul(rent0).mul(rentIdxFactor).mul(curveT);
          rentBase = rentBase.add(utRentContribution);
        }
      }
    }

    // Apply VAT rate to standard-rated outputs
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