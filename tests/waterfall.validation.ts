import { runModel } from "@feasly/feasly-engine";

function createTestProject() {
  return {
    project: { 
      start_date: "2025-01-01", 
      periods: 60,
      periodicity: "monthly" as const
    },
    unit_types: [{
      key: "Residential",
      category: "residential" as const,
      count: 100,
      sellable_area_sqm: 80,
      delivery_month: 36,
      initial_price_sqm_sale: 5000,
      revenue_policy: "handover" as const,
      vat_class_output: "standard" as const
    }],
    cost_items: [{
      key: "construction",
      base_amount: 20000000,
      phasing: Array.from({length: 36}, (_, i) => i < 24 ? 1/24 : 0),
      is_opex: false,
      vat_input_eligible: true
    }],
    debt: [],
    equity: [],
    waterfall_config: {
      mode: "european" as const,
      hurdles: [],
      accrual_lot_level: true
    }
  };
}

// Case A: ROC only — No pref, no promote
export function testROCOnly() {
  console.log("🧪 Case A: ROC Only (No Preferred, No Promote)");
  
  const p = createTestProject();
  p.equity = [
    {
      key: "LP1",
      role: "lp" as const,
      commitment: 10000000,
      pr: { type: "rate_pa" as const, rate_pa: 0, compounding: "monthly" as const }
    }
  ];
  
  const r = runModel(p);
  const w = r.waterfall;
  
  const totalDCE = r.cash.equity_cf.reduce((sum, cf) => sum + Math.max(0, cf?.toNumber() || 0), 0);
  const totalDistributions = (w.lp_distributions || []).reduce((sum, d) => sum + d, 0) + 
                            (w.gp_distributions || []).reduce((sum, d) => sum + d, 0);
  
  console.log("  Total DCE:", totalDCE);
  console.log("  Total Distributions:", totalDistributions);
  console.log("  LP IRR:", w.lp?.irr_pa);
  console.log("  LP MOIC:", w.lp?.moic);
  console.log("  Carry Paid:", (w.carry_paid || []).reduce((sum, c) => sum + c, 0));
  console.log("  ✅ ROC only test complete");
  
  return { success: true, result: r };
}

// Case B: PR only (8% pa) — DCE first returns capital, then pays PR
export function testPROnly() {
  console.log("🧪 Case B: Preferred Return Only (8% PA)");
  
  const p = createTestProject();
  p.equity = [
    {
      key: "LP1", 
      role: "lp" as const,
      commitment: 10000000,
      pr: { type: "rate_pa" as const, rate_pa: 0.08, compounding: "monthly" as const }
    }
  ];
  
  const r = runModel(p);
  const w = r.waterfall;
  
  console.log("  LP IRR:", w.lp?.irr_pa);
  console.log("  LP MOIC:", w.lp?.moic);
  console.log("  Expected ~8% if PR exactly paid");
  console.log("  ✅ PR only test complete");
  
  return { success: true, result: r };
}

// Case C: PR + 80/20 Promote — After PR caught up, remaining DCE split 80/20
export function testPRAndPromote() {
  console.log("🧪 Case C: PR + 80/20 Promote");
  
  const p = createTestProject();
  p.equity = [
    {
      key: "LP1",
      role: "lp" as const, 
      commitment: 8000000,
      pr: { type: "rate_pa" as const, rate_pa: 0.08, compounding: "monthly" as const }
    },
    {
      key: "GP1",
      role: "gp" as const,
      commitment: 2000000,
      pr: { type: "rate_pa" as const, rate_pa: 0.08, compounding: "monthly" as const }
    }
  ];
  p.waterfall_config = {
    mode: "european" as const,
    hurdles: [{
      key: "tier_80_20",
      trigger: { irr_threshold: 0.0 },
      split_after_catchup: { lp: 0.8, gp: 0.2 },
      catchup: { enabled: false, gp_target_share_of_profits: 0.2 }
    }],
    accrual_lot_level: true
  };
  
  const r = runModel(p);
  const w = r.waterfall;
  
  const totalCarry = (w.carry_paid || []).reduce((sum, c) => sum + c, 0);
  console.log("  Total Carry:", totalCarry);
  console.log("  GP IRR:", w.gp?.irr_pa);
  console.log("  LP IRR:", w.lp?.irr_pa);
  console.log("  Expected: 20% of residual profits to GP");
  console.log("  ✅ PR + Promote test complete");
  
  return { success: true, result: r };
}

// Case D: Catch-Up Enabled — 100% to GP until GP achieves 20% of profits above PR
export function testCatchUp() {
  console.log("🧪 Case D: Catch-Up Enabled");
  
  const p = createTestProject();
  p.equity = [
    {
      key: "LP1",
      role: "lp" as const,
      commitment: 8000000,
      pr: { type: "rate_pa" as const, rate_pa: 0.08, compounding: "monthly" as const }
    },
    {
      key: "GP1", 
      role: "gp" as const,
      commitment: 1000000,
      pr: { type: "rate_pa" as const, rate_pa: 0.08, compounding: "monthly" as const }
    }
  ];
  p.waterfall_config = {
    mode: "european" as const,
    hurdles: [{
      key: "tier_catchup",
      trigger: { irr_threshold: 0.0 },
      split_after_catchup: { lp: 0.8, gp: 0.2 },
      catchup: { enabled: true, gp_target_share_of_profits: 0.2 }
    }],
    accrual_lot_level: true
  };
  
  const r = runModel(p);
  const w = r.waterfall;
  
  console.log("  GP Catch-up mechanics would apply here");
  console.log("  GP IRR:", w.gp?.irr_pa);
  console.log("  ✅ Catch-up test complete");
  
  return { success: true, result: r };
}

// Case E: Multi-tranche LP1/LP2/GP with differing contributions
export function testMultiTranche() {
  console.log("🧪 Case E: Multi-Tranche (LP1, LP2, GP)");
  
  const p = createTestProject();
  p.equity = [
    {
      key: "LP1",
      role: "lp" as const,
      commitment: 5000000,
      pr: { type: "rate_pa" as const, rate_pa: 0.08, compounding: "monthly" as const }
    },
    {
      key: "LP2", 
      role: "lp" as const,
      commitment: 3000000,
      pr: { type: "rate_pa" as const, rate_pa: 0.08, compounding: "monthly" as const }
    },
    {
      key: "GP1",
      role: "gp" as const,
      commitment: 2000000,
      pr: { type: "rate_pa" as const, rate_pa: 0.08, compounding: "monthly" as const }
    }
  ];
  
  const r = runModel(p);
  const w = r.waterfall;
  
  console.log("  Capital Accounts:");
  Object.entries(w.capital_accounts || {}).forEach(([key, account]: [string, any]) => {
    const contributed = (account.contributed || []).reduce((sum: number, val: number) => sum + val, 0);
    const returned = (account.returned_capital || []).reduce((sum: number, val: number) => sum + val, 0);
    console.log(`    ${key}: Contributed ${contributed}, Returned ${returned}`);
  });
  console.log("  ✅ Multi-tranche test complete");
  
  return { success: true, result: r };
}

// Run all tests
export function waterfallValidation() {
  console.log("🌊 Running Waterfall Validation Suite");
  console.log("=====================================");
  
  try {
    testROCOnly();
    console.log("");
    testPROnly();
    console.log("");
    testPRAndPromote();
    console.log("");
    testCatchUp();
    console.log("");
    testMultiTranche();
    
    console.log("=====================================");
    console.log("✅ All waterfall validation tests completed");
    
  } catch (error) {
    console.error("❌ Waterfall validation failed:", error);
    return { success: false, error };
  }
  
  return { success: true };
}

// Auto-run validation if this file is executed directly
if (typeof window === 'undefined' && require.main === module) {
  waterfallValidation();
}