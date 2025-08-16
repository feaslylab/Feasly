import { runModel } from "@feasly/feasly-engine";

function createTestProject() {
  return {
    project: { 
      start_date: "2025-01-01", 
      periods: 60,
      periodicity: "monthly" as const
    },
    unit_types: [{
      key: "T1",
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
    debt: []
  };
}

export function covenantValidationAdvanced() {
  const p = createTestProject();
  p.debt = [{
    key: "T1",
    tenor_months: 24,
    amort_type: "annuity" as const,
    limit_ltc: 0.6,
    upfront_fee_pct: 0.01,
    ongoing_fee_pct_pa: 0.005,
    dsra_months: 3,
    nominal_rate_pa: 0.08,
    availability_start_m: 0,
    availability_end_m: 36,
    fee_commitment_pct_pa: 0.005,
    draw_priority: 1,
    covenants: {
      dscr_min: 1.20,
      icr_min: 2.00,
      test_basis: "both" as const,
      grace_period_m: 2,
      strict_dscr: true
    }
  }];
  
  try {
    const r = runModel(p);
    
    // Test all the new features
    const dscrLast = r.covenants.portfolio.dscr.at(-1)?.toNumber?.() ?? r.covenants.portfolio.dscr.at(-1);
    const dscrStrictLast = r.covenants.portfolio.dscr_strict.at(-1)?.toNumber?.() ?? r.covenants.portfolio.dscr_strict.at(-1);
    const icrLast = r.covenants.portfolio.icr.at(-1)?.toNumber?.() ?? r.covenants.portfolio.icr.at(-1);
    const dscrLtmLast = r.covenants.portfolio.dscr_ltm.at(-1)?.toNumber?.() ?? r.covenants.portfolio.dscr_ltm.at(-1);
    const icrLtmLast = r.covenants.portfolio.icr_ltm.at(-1)?.toNumber?.() ?? r.covenants.portfolio.icr_ltm.at(-1);
    
    const breached = r.covenants.breaches_any.some(Boolean);
    
    console.log("🧪 Enhanced Covenant Validation:");
    console.log("  Classic DSCR (last):", dscrLast);
    console.log("  Strict DSCR (last):", dscrStrictLast);
    console.log("  ICR (last):", icrLast);
    console.log("  DSCR LTM (last):", dscrLtmLast);
    console.log("  ICR LTM (last):", icrLtmLast);
    console.log("  Any breach (after grace):", breached);
    
    // Test headroom calculations
    const dscrHeadroom = r.covenants.portfolio.dscr_headroom.at(-1)?.toNumber?.() ?? NaN;
    const dscrStrictHeadroom = r.covenants.portfolio.dscr_strict_headroom.at(-1)?.toNumber?.() ?? NaN;
    const icrHeadroom = r.covenants.portfolio.icr_headroom.at(-1)?.toNumber?.() ?? NaN;
    
    console.log("📊 Headroom Analysis:");
    console.log("  DSCR Headroom:", dscrHeadroom);
    console.log("  DSCR Strict Headroom:", dscrStrictHeadroom);
    console.log("  ICR Headroom:", icrHeadroom);
    
    // Test configuration
    console.log("⚙️ Configuration:");
    console.log("  Test Basis:", r.covenants.detail.test_basis);
    console.log("  Grace Period:", r.covenants.detail.grace_period_m, "months");
    console.log("  DSCR Threshold:", r.covenants.detail.dscr_threshold);
    console.log("  ICR Threshold:", r.covenants.detail.icr_threshold);
    
    // Summary
    console.log("📋 Summary:", {
      totalBreachPeriods: r.covenants.breaches_summary.total_breach_periods,
      firstBreachIndex: r.covenants.breaches_summary.first_breach_index,
      hasStrictDSCR: dscrStrictLast !== dscrLast,
      ltmDataAvailable: !Number.isNaN(dscrLtmLast)
    });
    
    console.log(breached ? "⚠️ Breach detected (after grace period)" : "✅ All covenants OK");
    
    return { success: true, result: r };
  } catch (error) {
    console.error("❌ Advanced covenant validation failed:", error);
    return { success: false, error };
  }
}

// Auto-run validation if this file is executed directly
if (typeof window === 'undefined' && require.main === module) {
  covenantValidationAdvanced();
}