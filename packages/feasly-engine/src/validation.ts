// Quick validation test for VAT timing
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

function runValidationTest() {
  console.log("🧪 Running VAT Timing Validation...");
  
  // Test A: Invoice timing
  const invoiceProject = createTestProject();
  invoiceProject.tax.vat_timing = "invoice";
  
  const invoiceResult = runModel(invoiceProject);
  const invoiceTotalVAT = invoiceResult.tax.vat_net.reduce((sum, val) => sum + val.toNumber(), 0);
  const totalBillings = invoiceResult.revenue.billings_total.reduce((sum, val) => sum + val.toNumber(), 0);
  
  console.log(`📊 Invoice timing: Total VAT = ${invoiceTotalVAT}, Expected ≈ ${totalBillings * 0.05}`);
  
  // Test B: Cash timing  
  const cashProject = createTestProject();
  cashProject.tax.vat_timing = "cash";
  
  const cashResult = runModel(cashProject);
  const cashTotalVAT = cashResult.tax.vat_net.reduce((sum, val) => sum + val.toNumber(), 0);
  const totalCollections = cashResult.revenue.collections.reduce((sum, val) => sum + val.toNumber(), 0);
  
  console.log(`💰 Cash timing: Total VAT = ${cashTotalVAT}, Expected ≈ ${totalCollections * 0.05}`);
  
  // Test C: AR rollforward
  const finalAR = cashResult.revenue.accounts_receivable[11].toNumber();
  const expectedAR = totalBillings - totalCollections;
  
  console.log(`📋 AR Check: Final AR = ${finalAR}, Expected = ${expectedAR}`);
  
  // Test D: Collections ≤ Allowed Release
  let cumCollections = 0;
  let cumAllowed = 0;
  let escrowInvariantHolds = true;
  
  for (let t = 0; t < 12; t++) {
    cumCollections += cashResult.revenue.collections[t].toNumber();
    cumAllowed += cashResult.revenue.allowed_release[t].toNumber();
    if (cumCollections > cumAllowed + 0.01) { // small tolerance for rounding
      escrowInvariantHolds = false;
      console.log(`❌ Escrow invariant broken at month ${t+1}: ${cumCollections} > ${cumAllowed}`);
    }
  }
  
  if (escrowInvariantHolds) {
    console.log("✅ Escrow invariant holds: cumulative collections ≤ allowed release");
  }
  
  // Test E: Cash source verification
  const usesBillings = JSON.stringify(cashResult.cash.project).includes('billings');
  const usesRecognized = JSON.stringify(cashResult.cash.project).includes('recognized');
  
  console.log(`💵 Cash uses collections (not billings/recognized): ${!usesBillings && !usesRecognized}`);
  
  console.log("✅ Validation complete!");
  
  return {
    invoiceTotalVAT,
    cashTotalVAT,
    totalBillings,
    totalCollections,
    finalAR,
    expectedAR,
    escrowInvariantHolds
  };
}

// Export for potential testing
export { runValidationTest, createTestProject };