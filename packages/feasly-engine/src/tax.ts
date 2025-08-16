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
  rev_cam: Decimal[],
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
  const inputRecoveryMethod = inputs.tax.input_recovery_method ?? "fixed_share";
  const fixedRecoveryShare = new Decimal(inputs.tax.input_recovery_fixed_share ?? 0.5);
  const rounding = inputs.tax.rounding ?? "period";
  const decimals = inputs.tax.decimals ?? 2;
  
  const output = zeros(T);
  const input = zeros(T);

  // Track taxable vs total output bases for proportional recovery
  let totalTaxableOutput = new Decimal(0);
  let totalOutput = new Decimal(0);

  // Build output VAT base respecting timing and VAT classes
  for (let t = 0; t < T; t++) {
    let outputBase = new Decimal(0);
    let taxableBase = new Decimal(0);

    // Sales base (respects timing)
    const salesBase = timing === "invoice" ? billings_total[t] : collections[t];
    
    // For now, treat all sales as standard-rated (TODO: per-UT class filtering)
    outputBase = outputBase.add(salesBase);
    taxableBase = taxableBase.add(salesBase);
    
    // Add rent revenue (always cash timing, treat as standard-rated)
    outputBase = outputBase.add(rev_rent[t]);
    taxableBase = taxableBase.add(rev_rent[t]);
    
    // Add CAM revenue if enabled (standard-rated)
    outputBase = outputBase.add(rev_cam[t]);
    taxableBase = taxableBase.add(rev_cam[t]);

    // Apply VAT rate to taxable outputs
    let vatOutput = taxableBase.mul(vatRate);
    
    // Apply rounding if enabled
    if (rounding === "period") {
      vatOutput = new Decimal(vatOutput.toFixed(decimals));
    }
    
    output[t] = vatOutput;
    
    // Track totals for input recovery calculation
    totalTaxableOutput = totalTaxableOutput.add(taxableBase);
    totalOutput = totalOutput.add(outputBase);

    // Input VAT calculation
    const totalCosts = capex[t].add(opex[t]);
    let inputRecoveryRatio = fixedRecoveryShare;
    
    if (inputRecoveryMethod === "proportional_to_taxable_outputs" && !totalOutput.isZero()) {
      inputRecoveryRatio = totalTaxableOutput.div(totalOutput);
    }
    
    const inputBase = totalCosts.mul(inputRecoveryRatio);
    let vatInput = inputBase.mul(vatRate);
    
    // Apply rounding if enabled
    if (rounding === "period") {
      vatInput = new Decimal(vatInput.toFixed(decimals));
    }
    
    input[t] = vatInput;
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
      let netPayment = afterCarry;
      
      // Apply rounding if enabled
      if (rounding === "period") {
        netPayment = new Decimal(netPayment.toFixed(decimals));
      }
      
      net[t] = netPayment;
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
      input_recovery_method: inputRecoveryMethod,
      input_recovery_ratio: inputRecoveryMethod === "proportional_to_taxable_outputs" 
        ? (totalOutput.isZero() ? 0 : totalTaxableOutput.div(totalOutput).toNumber())
        : fixedRecoveryShare.toNumber(),
      rounding,
      decimals,
      enabled: true
    }
  };
}