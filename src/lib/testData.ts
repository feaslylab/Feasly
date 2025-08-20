import { DebtItemInput, UnitTypeInput, CostItemInput } from "@/schemas/inputs";

/**
 * Sample data generators for testing Sprint 2 features
 */

export function createSampleUnits(): UnitTypeInput[] {
  return [
    {
      id: "unit-1",
      name: "1BR Apartments",
      asset_subtype: "Residential",
      units: 50,
      unit_area_sqm: 75,
      revenue_mode: "sale",
      price_per_sqm: 10667,
      start_month: 18,
      duration_months: 12,
    },
    {
      id: "unit-2", 
      name: "2BR Apartments",
      asset_subtype: "Residential",
      units: 30,
      unit_area_sqm: 100,
      revenue_mode: "sale",
      price_per_sqm: 12000,
      start_month: 20,
      duration_months: 10,
    },
    {
      id: "unit-3",
      name: "Retail Units",
      asset_subtype: "Retail",
      units: 10,
      unit_area_sqm: 80,
      revenue_mode: "rent",
      rent_per_month: 25000,
      occupancy_rate: 0.85,
      lease_term_months: 36,
      start_month: 24,
      duration_months: 1,
    }
  ];
}

export function createSampleCosts(): CostItemInput[] {
  return [
    {
      id: "construction",
      label: "Construction",
      amount: 50000000,
      category: "construction",
      cost_code: "TEST-CONST",
      vat_input_eligible: true,
      is_capex: true,
      start_month: 6,
      duration_months: 18
    },
    {
      id: "land",
      label: "Land Purchase",
      amount: 15000000,
      category: "land",
      cost_code: "TEST-LAND",
      vat_input_eligible: false,
      is_capex: true,
      start_month: 0,
      duration_months: 1
    }
  ];
}

export function createSampleDebt(): DebtItemInput[] {
  return [
    {
      id: "debt-1",
      name: "Construction Loan",
      type: "senior",
      amount: 50000000,
      interest_rate: 5.5,
      payment_type: "capitalized",
      amortization: "bullet",
      drawdown_start: 0,
      drawdown_end: 18,
      fees: 500000,
    },
    {
      id: "debt-2",
      name: "Permanent Financing",
      type: "senior", 
      amount: 40000000,
      interest_rate: 4.8,
      payment_type: "paid",
      amortization: "linear",
      drawdown_start: 18,
      drawdown_end: 19,
      fees: 200000,
    },
    {
      id: "debt-3",
      name: "Mezzanine Capital",
      type: "mezzanine",
      amount: 15000000,
      interest_rate: 12.0,
      payment_type: "capitalized",
      amortization: "bullet",
      drawdown_start: 6,
      drawdown_end: 12,
      fees: 750000,
    }
  ];
}