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

export function covenantValidation() {
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
    covenants: { dscr_min: 1.1, icr_min: 2.0 }
  }];
  
  try {
    const r = runModel(p);
    const dscrLast = r.covenants.portfolio.dscr.at(-1)?.toNumber?.() ?? r.covenants.portfolio.dscr.at(-1);
    const icrLast  = r.covenants.portfolio.icr.at(-1)?.toNumber?.()  ?? r.covenants.portfolio.icr.at(-1);
    const breached = r.covenants.breaches_any.some(Boolean);
    
    console.log("🧪 DSCR last:", dscrLast, "ICR last:", icrLast, "Any breach:", breached);
    console.log(breached ? "⚠️ Breach detected" : "✅ Covenants OK");
    
    // Additional validation
    console.log("📊 Covenant Summary:", {
      totalBreachPeriods: r.covenants.breaches_summary.total_breach_periods,
      firstBreachIndex: r.covenants.breaches_summary.first_breach_index,
      portfolioDSCR: dscrLast,
      portfolioICR: icrLast
    });
    
    return { success: true, result: r };
  } catch (error) {
    console.error("❌ Covenant validation failed:", error);
    return { success: false, error };
  }
}

// Auto-run validation if this file is executed directly
if (typeof window === 'undefined' && require.main === module) {
  covenantValidation();
}