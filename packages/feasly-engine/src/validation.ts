// Comprehensive validation tests for VAT timing, CAM, and edge cases
import { runModel } from "./index";
import { ProjectInputs } from "./types";

function createTestProject(): any {
  return {
    project: {
      start_date: "2025-01-01",
      periods: 12,
      periodicity: "monthly"
    },
    engineMode: "feasly_enhanced",
    unit_types: [
      {
        key: "residential",
        category: "residential",
        count: 100,
        sellable_area_sqm: 100,
        initial_price_sqm_sale: 10000,
        vat_class_output: "standard",
        curve: {
          meaning: "sell_through",
          values: [0, 0, 0.2, 0.3, 0.3, 0.2, 0, 0, 0, 0, 0, 0] // billings months 3-6
        },
        collection_curve: {
          meaning: "sell_through", 
          values: [0, 0, 0, 0, 0, 0, 0.1, 0.4, 0.5, 0, 0, 0] // collections months 7-9
        }
      }
    ],
    cost_items: [
      {
        key: "capex",
        base_amount: 50000000,
        phasing: [0.5, 0.3, 0.2, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        is_opex: false,
        vat_input_eligible: true
      }
    ],
    tax: {
      vat_enabled: true,
      vat_rate: 0.05, // 5%
      vat_timing: "invoice" // will test both
    },
    escrow: {
      wafi_enabled: true,
      collection_cap: { alpha: 1, beta: 1 },
      release_rules: "alpha_beta"
    },
    cam: { enabled: false },
    debt: [],
    plots: []
  };
}

function createCAMTestProject(): any {
  return {
    project: {
      start_date: "2025-01-01",
      periods: 12,
      periodicity: "monthly"
    },
    engineMode: "feasly_enhanced",
    unit_types: [
      {
        key: "retail",
        category: "retail",
        sellable_area_sqm: 5000,
        initial_rent_sqm_m: 100,
        vat_class_output: "standard",
        curve: { 
          meaning: "occupancy", 
          values: [0, 0.2, 0.4, 0.6, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8] // 80% by month 5
        }
      }
    ],
    cost_items: [
      {
        key: "opex_recoverable",
        base_amount: 1200000, // 100k per month
        phasing: Array(12).fill(1/12),
        is_opex: true,
        recoverable: true,
        vat_input_eligible: true
      }
    ],
    tax: {
      vat_enabled: true,
      vat_rate: 0.05,
      vat_timing: "cash",
      input_recovery_method: "fixed_share",
      input_recovery_fixed_share: 1.0 // 100% eligible for simplicity
    },
    cam: { 
      enabled: true,
      gross_up_threshold: 0.95 // Gross up when occupancy < 95%
    },
    escrow: { wafi_enabled: false },
    debt: [],
    plots: []
  };
}

function runValidationTest() {
  console.log("🧪 Running Comprehensive VAT Validation...");
  
  const results: any = {};
  
  // Test A: Invoice timing
  console.log("\n📊 Test A: Invoice Timing");
  const invoiceProject = createTestProject();
  invoiceProject.tax.vat_timing = "invoice";
  
  const invoiceResult = runModel(invoiceProject);
  const invoiceTotalVATOut = invoiceResult.tax.vat_output.reduce((sum, val) => sum + val.toNumber(), 0);
  const totalBillings = invoiceResult.revenue.billings_total.reduce((sum, val) => sum + val.toNumber(), 0);
  const expectedInvoiceVAT = totalBillings * 0.05;
  
  console.log(`VAT Output: ${invoiceTotalVATOut.toFixed(2)}, Expected: ${expectedInvoiceVAT.toFixed(2)}`);
  console.log(`✅ Invoice timing match: ${Math.abs(invoiceTotalVATOut - expectedInvoiceVAT) < 1}`);
  
  // Test B: Cash timing  
  console.log("\n💰 Test B: Cash Timing");
  const cashProject = createTestProject();
  cashProject.tax.vat_timing = "cash";
  
  const cashResult = runModel(cashProject);
  const cashTotalVATOut = cashResult.tax.vat_output.reduce((sum, val) => sum + val.toNumber(), 0);
  const totalCollections = cashResult.revenue.collections.reduce((sum, val) => sum + val.toNumber(), 0);
  const expectedCashVAT = totalCollections * 0.05;
  
  console.log(`VAT Output: ${cashTotalVATOut.toFixed(2)}, Expected: ${expectedCashVAT.toFixed(2)}`);
  console.log(`✅ Cash timing match: ${Math.abs(cashTotalVATOut - expectedCashVAT) < 1}`);
  
  // Test C: AR rollforward
  console.log("\n📋 Test C: AR Rollforward");
  const finalAR = cashResult.revenue.accounts_receivable[11].toNumber();
  const expectedAR = totalBillings - totalCollections;
  
  console.log(`Final AR: ${finalAR.toFixed(2)}, Expected: ${expectedAR.toFixed(2)}`);
  console.log(`✅ AR rollforward correct: ${Math.abs(finalAR - expectedAR) < 0.01}`);
  
  // Test D: Collections ≤ Allowed Release
  console.log("\n🔒 Test D: Escrow Cap Invariant");
  let cumCollections = 0;
  let cumAllowed = 0;
  let escrowInvariantHolds = true;
  
  for (let t = 0; t < 12; t++) {
    cumCollections += cashResult.revenue.collections[t].toNumber();
    cumAllowed += cashResult.revenue.allowed_release[t].toNumber();
    if (cumCollections > cumAllowed + 0.01) {
      escrowInvariantHolds = false;
      console.log(`❌ Escrow invariant broken at month ${t+1}: ${cumCollections} > ${cumAllowed}`);
    }
  }
  
  console.log(`✅ Escrow invariant holds: ${escrowInvariantHolds}`);
  
  // Test E: CAM VAT Integration
  console.log("\n🏢 Test E: CAM VAT Integration");
  const camProject = createCAMTestProject();
  const camResult = runModel(camProject);
  
  const totalCAMRev = camResult.revenue.rev_cam.reduce((sum, val) => sum + val.toNumber(), 0);
  const camVATContribution = totalCAMRev * 0.05;
  const totalVATOut = camResult.tax.vat_output.reduce((sum, val) => sum + val.toNumber(), 0);
  
  console.log(`CAM Revenue: ${totalCAMRev.toFixed(2)}`);
  console.log(`CAM VAT Contribution: ${camVATContribution.toFixed(2)}`);
  console.log(`Total VAT Output: ${totalVATOut.toFixed(2)}`);
  console.log(`✅ CAM included in VAT: ${totalVATOut > camVATContribution}`);
  
  // Test F: Input Recovery Methods
  console.log("\n⚙️ Test F: Input Recovery Methods");
  
  // Fixed share method
  const fixedProject = createTestProject();
  fixedProject.tax.input_recovery_method = "fixed_share";
  fixedProject.tax.input_recovery_fixed_share = 0.8;
  
  const fixedResult = runModel(fixedProject);
  const totalInputFixed = fixedResult.tax.vat_input.reduce((sum, val) => sum + val.toNumber(), 0);
  
  // Proportional method (all taxable so should be 100%)
  const propProject = createTestProject();
  propProject.tax.input_recovery_method = "proportional_to_taxable_outputs";
  
  const propResult = runModel(propProject);
  const totalInputProp = propResult.tax.vat_input.reduce((sum, val) => sum + val.toNumber(), 0);
  
  console.log(`Fixed share (80%) input VAT: ${totalInputFixed.toFixed(2)}`);
  console.log(`Proportional (100%) input VAT: ${totalInputProp.toFixed(2)}`);
  console.log(`✅ Proportional > Fixed: ${totalInputProp > totalInputFixed}`);
  
  // Test F2: Partial exemption test
  console.log("\n🏢 Test F2: Partial Exemption");
  const partialExemptProject = createTestProject();
  partialExemptProject.tax.input_recovery_method = "proportional_to_taxable_outputs";
  
  // Add exempt office space
  partialExemptProject.unit_types.push({
    key: "exempt_office",
    category: "office", 
    sellable_area_sqm: 1000,
    initial_rent_sqm_m: 50,
    vat_class_output: "exempt",
    curve: { meaning: "occupancy", values: Array(12).fill(0.8) }
  });
  
  const partialResult = runModel(partialExemptProject);
  const avgRecoveryRatio = partialResult.tax.detail?.input_recovery_ratio ?? 1;
  
  console.log(`Recovery ratio with exempt: ${avgRecoveryRatio.toFixed(3)}`);
  console.log(`✅ Recovery ratio < 1.0: ${avgRecoveryRatio < 1.0}`);
  
  // Test G: Cash source verification
  console.log("\n💵 Test G: Cash Source Verification");
  const cashStr = JSON.stringify(cashResult.cash);
  const usesBillings = cashStr.includes('billings');
  const usesRecognized = cashStr.includes('recognized');
  
  console.log(`✅ Cash uses collections (not billings/recognized): ${!usesBillings && !usesRecognized}`);
  
  console.log("\n✅ All validations complete!");
  
  return {
    invoiceVATMatch: Math.abs(invoiceTotalVATOut - expectedInvoiceVAT) < 1,
    cashVATMatch: Math.abs(cashTotalVATOut - expectedCashVAT) < 1,
    arCorrect: Math.abs(finalAR - expectedAR) < 0.01,
    escrowInvariantHolds,
    camVATIncluded: totalVATOut > camVATContribution,
    inputRecoveryDifferent: totalInputProp > totalInputFixed,
    cashUsesCollections: !usesBillings && !usesRecognized,
    partialExemptionWorks: avgRecoveryRatio < 1.0
  };
}

// Export for potential testing
export { runValidationTest, createTestProject };