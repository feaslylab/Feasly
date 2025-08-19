import { ProjectInputs } from "../../packages/feasly-engine/src/types";

export function mapFormToProjectInputs(form: any): ProjectInputs {
  const periods = form?.project?.periods ?? 120;
  const start_date = form?.project?.start_date ?? new Date().toISOString().slice(0,10);

  // Transform cost items from form format to engine format
  const transformCostItems = (formCostItems: any[] = []) => {
    return formCostItems.map((item: any) => {
      // Create phasing array based on start_month and duration
      const phasing = Array(periods).fill(0);
      const startMonth = item.start_month || 0;
      const duration = item.duration_months || 1;
      const monthlyAmount = (item.amount || 0) / duration;
      
      for (let i = startMonth; i < Math.min(startMonth + duration, periods); i++) {
        phasing[i] = monthlyAmount;
      }
      
      return {
        key: item.id || item.name || `cost_${Math.random().toString(36).substr(2, 9)}`,
        base_amount: item.amount || 0,
        phasing,
        is_opex: false,
        vat_input_eligible: false
      };
    });
  };

  // Transform unit types from form format to engine format  
  const transformUnitTypes = (formUnitTypes: any[] = []) => {
    return formUnitTypes.map((unit: any) => ({
      key: unit.id || unit.name || `unit_${Math.random().toString(36).substr(2, 9)}`,
      category: "other" as const,
      count: unit.units || 0,
      sellable_area_sqm: 100, // Default area
      delivery_month: unit.start_month || 0,
      initial_price_sqm_sale: (unit.price || 0) / 100, // Convert to per sqm
      revenue_policy: "handover" as const,
      vat_class_output: "out_of_scope" as const
    }));
  };

  // Transform debt items from form format to engine format
  const transformDebtItems = (formDebtItems: any[] = []) => {
    return formDebtItems.map((debt: any) => ({
      key: debt.id || debt.name || `debt_${Math.random().toString(36).substr(2, 9)}`,
      limit_ltc: 1.0, // 100% of total cost
      tenor_months: debt.term_months || 12,
      amort_type: "bullet" as const,
      nominal_rate_pa: (debt.interest_rate || 0) / 100,
      availability_start_m: debt.start_month || 0,
      availability_end_m: (debt.start_month || 0) + (debt.term_months || 12),
      draw_priority: 1
    }));
  };

  return {
    project: { start_date, periods, periodicity: "monthly" },
    engineMode: "excel_parity",
    index_buckets: form?.index_buckets ?? [],
    unit_types: transformUnitTypes(form?.unit_types),
    cost_items: transformCostItems(form?.cost_items),
    debt: transformDebtItems(form?.debt),
    tax: form?.tax ?? { vat_enabled:false, vat_rate:0, corp_tax_enabled:false, corp_tax_rate:0, zakat_enabled:false, interest_cap_pct_ebitda:1, allow_nol_carryforward:true, vat_ruleset:"UAE_2025" },
    escrow: form?.escrow ?? { wafi_enabled:false, collection_cap:{alpha:1,beta:1}, release_rules:"alpha_beta", milestones:[] },
    valuation: form?.valuation ?? { selling_cost_pct:0, cap_rate_pa_income:0, stabilize_month:24 },
    waterfall: form?.waterfall ?? { enabled:false, pref_rate_pa:0.08, promote_split:{lp:0.8,gp:0.2}, mode:"pref_rate" },
    plots: form?.plots ?? []
  };
}