import { ProjectInputs } from "../../packages/feasly-engine/src/types";

export function mapFormToProjectInputs(form: any): ProjectInputs {
  const periods = form?.project?.periods ?? 120;
  const start_date = form?.project?.start_date ?? new Date().toISOString().slice(0,10);

  return {
    project: { start_date, periods, periodicity: "monthly" },
    engineMode: "excel_parity",
    index_buckets: form?.index_buckets ?? [],
    unit_types: form?.unit_types ?? [],
    cost_items: form?.cost_items ?? [],
    debt: form?.debt ?? [],
    tax: form?.tax ?? { vat_enabled:false, vat_rate:0, corp_tax_enabled:false, corp_tax_rate:0, zakat_enabled:false, interest_cap_pct_ebitda:1, allow_nol_carryforward:true, vat_ruleset:"UAE_2025" },
    escrow: form?.escrow ?? { wafi_enabled:false, collection_cap:{alpha:1,beta:1}, release_rules:"alpha_beta", milestones:[] },
    valuation: form?.valuation ?? { selling_cost_pct:0, cap_rate_pa_income:0, stabilize_month:24 },
    waterfall: form?.waterfall ?? { enabled:false, pref_rate_pa:0.08, promote_split:{lp:0.8,gp:0.2}, mode:"pref_rate" },
    plots: form?.plots ?? []
  };
}