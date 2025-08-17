import { runModel } from "@/engine/runModel";

// Helper to create test project
function createTestProject(overrides: any = {}) {
  return {
    project: { periods: 24, start_date: "2024-01-01" },
    index_buckets: [{ key: "base", rate_nominal_pa: 0.05 }],
    unit_types: [{
      key: "units",
      category: "residential",
      count: 100,
      sellable_area_sqm: 100,
      initial_price_sqm_sale: 5000,
      revenue_policy: "handover",
      delivery_month: 18,
      index_bucket_price: "base"
    }],
    cost_items: [{
      key: "construction",
      category: "hard",
      amount: 30000000,
      timing: Array(24).fill(0).map((_, i) => i < 18 ? 1/18 : 0)
    }],
    ...overrides
  };
}

async function main() {
  console.log("🏗️ Running Phase 8 Debt Enhancement Validation Tests");

  // Test A: Annuity loan - constant debt service
  console.log("\n📊 Test A: Annuity Loan");
  const projectA = createTestProject({
    debt: [{
      key: "Annuity_Loan",
      tenor_months: 12,
      amort_type: "annuity",
      availability_start_m: 0,
      availability_end_m: 18,
      draw_priority: 1,
      nominal_rate_pa: 0.08,
      upfront_fee_pct: 0.01,
      ongoing_fee_pct_pa: 0.005,
      commitment_fee_pct_pa: 0.002,
      dsra_months: 3,
      limit_ltc: 0.7
    }]
  });
  
  const resultA = runModel(projectA);
  const finA = resultA.financing;
  console.log("  Total drawn:", finA.draws.reduce((s, v) => s + v.toNumber(), 0).toLocaleString());
  console.log("  Final balance:", finA.balance[finA.balance.length - 1].toNumber().toLocaleString());
  console.log("  Total interest:", finA.interest.reduce((s, v) => s + v.toNumber(), 0).toLocaleString());
  console.log("  DSRA balance (last):", finA.dsra_balance[finA.dsra_balance.length - 1].toNumber().toLocaleString());

  // Test B: Bullet loan - interest-only then balloon
  console.log("\n🎯 Test B: Bullet Loan");
  const projectB = createTestProject({
    debt: [{
      key: "Bullet_Loan",
      tenor_months: 24,
      amort_type: "bullet",
      availability_start_m: 0,
      availability_end_m: 18,
      draw_priority: 1,
      nominal_rate_pa: 0.06,
      upfront_fee_pct: 0.005,
      ongoing_fee_pct_pa: 0.003,
      dsra_months: 3,
      limit_ltc: 0.8
    }]
  });
  
  const resultB = runModel(projectB);
  const finB = resultB.financing;
  console.log("  Total drawn:", finB.draws.reduce((s, v) => s + v.toNumber(), 0).toLocaleString());
  console.log("  Principal payments (first 23):", finB.principal.slice(0, 23).map(v => v.toNumber()).reduce((s, v) => s + v, 0));
  console.log("  Principal payment (last):", finB.principal[finB.principal.length - 1].toNumber().toLocaleString());
  console.log("  Interest payments avg:", (finB.interest.reduce((s, v) => s + v.toNumber(), 0) / finB.interest.length).toLocaleString());

  // Test C: DSRA 3 months - check dsra_balance matches target
  console.log("\n🏦 Test C: DSRA Mechanics");
  const projectC = createTestProject({
    debt: [{
      key: "DSRA_Test",
      tenor_months: 18,
      amort_type: "straight",
      availability_start_m: 0,
      availability_end_m: 12,
      draw_priority: 1,
      nominal_rate_pa: 0.07,
      dsra_months: 3,
      limit_ltc: 0.6
    }]
  });
  
  const resultC = runModel(projectC);
  const finC = resultC.financing;
  const dsraFunding = finC.dsra_funding.reduce((s, v) => s + v.toNumber(), 0);
  const dsraRelease = finC.dsra_release.reduce((s, v) => s + v.toNumber(), 0);
  console.log("  DSRA funding total:", dsraFunding.toLocaleString());
  console.log("  DSRA release total:", dsraRelease.toLocaleString());
  console.log("  DSRA net cost:", (dsraFunding - dsraRelease).toLocaleString());
  console.log("  Peak DSRA balance:", Math.max(...finC.dsra_balance.map(v => v.toNumber())).toLocaleString());

  // Test D: Commitment fees drop after facility drawn
  console.log("\n💰 Test D: Fee Structure");
  const projectD = createTestProject({
    debt: [{
      key: "Fee_Test",
      tenor_months: 12,
      amort_type: "bullet",
      availability_start_m: 6,
      availability_end_m: 18,
      draw_priority: 1,
      nominal_rate_pa: 0.05,
      upfront_fee_pct: 0.02,
      ongoing_fee_pct_pa: 0.01,
      commitment_fee_pct_pa: 0.005,
      limit_ltc: 0.75
    }]
  });
  
  const resultD = runModel(projectD);
  const finD = resultD.financing;
  const upfrontFees = finD.fees_upfront.reduce((s, v) => s + v.toNumber(), 0);
  const ongoingFees = finD.fees_ongoing.reduce((s, v) => s + v.toNumber(), 0);
  const commitmentFees = finD.fees_commitment.reduce((s, v) => s + v.toNumber(), 0);
  console.log("  Upfront fees:", upfrontFees.toLocaleString());
  console.log("  Ongoing fees:", ongoingFees.toLocaleString());
  console.log("  Commitment fees:", commitmentFees.toLocaleString());
  console.log("  Total fees:", (upfrontFees + ongoingFees + commitmentFees).toLocaleString());

  // Test E: LTC cap limits total debt
  console.log("\n📏 Test E: LTC Limits");
  const projectE = createTestProject({
    debt: [{
      key: "LTC_Test",
      tenor_months: 24,
      amort_type: "bullet",
      availability_start_m: 0,
      availability_end_m: 20,
      draw_priority: 1,
      nominal_rate_pa: 0.06,
      limit_ltc: 0.5  // 50% LTC - should limit borrowing
    }]
  });
  
  const resultE = runModel(projectE);
  const finE = resultE.financing;
  const totalCapex = resultE.costs.capex.reduce((s, v) => s + v.toNumber(), 0);
  const totalDrawn = finE.draws.reduce((s, v) => s + v.toNumber(), 0);
  const actualLTC = totalDrawn / totalCapex;
  console.log("  Total CAPEX:", totalCapex.toLocaleString());
  console.log("  Total drawn:", totalDrawn.toLocaleString());
  console.log("  Actual LTC:", (actualLTC * 100).toFixed(1) + "%");
  console.log("  LTC within limit:", actualLTC <= 0.51 ? "✅ Pass" : "❌ Fail");

  console.log("\n✅ All debt validation tests completed");
}

// Run validation if called directly
if (import.meta.main) {
  main().catch(console.error);
}

export { main as runDebtValidation };