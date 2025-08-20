import { UnitTypeInput, CostItemInput } from "@/schemas/inputs";

export interface FeaslyPreset {
  id: string;
  name: string;
  description: string;
  category: 'residential' | 'retail' | 'mixed_use';
  inputs: {
    unit_types: UnitTypeInput[];
    cost_items: CostItemInput[];
  };
}

export const PRESETS: FeaslyPreset[] = [
  {
    id: 'residential-basic',
    name: 'Basic Residential',
    description: 'Simple residential tower with 2 unit types and soft costs',
    category: 'residential',
    inputs: {
      unit_types: [
        { id: '1', name: '1BR', asset_subtype: 'Residential', revenue_mode: 'sale', units: 40, unit_area_sqm: 75, price_per_sqm: 12000, start_month: 12, duration_months: 12 },
        { id: '2', name: '2BR', asset_subtype: 'Residential', revenue_mode: 'sale', units: 60, unit_area_sqm: 100, price_per_sqm: 12000, start_month: 12, duration_months: 12 }
      ],
      cost_items: [
        { id: '1', label: 'Construction', amount: 30000000, category: 'construction', cost_code: 'CONST-001', vat_input_eligible: true, is_capex: true, start_month: 6, duration_months: 24 },
        { id: '2', label: 'Design Fees', amount: 1500000, category: 'soft', cost_code: 'SOFT-001', vat_input_eligible: true, is_capex: true, start_month: 0, duration_months: 6 }
      ]
    }
  },
  {
    id: 'retail-mall',
    name: 'Retail Mall',
    description: 'Retail strip mall with single unit type and basic costs',
    category: 'retail',
    inputs: {
      unit_types: [
        { id: '1', name: 'Retail Lot', asset_subtype: 'Retail', revenue_mode: 'sale', units: 25, unit_area_sqm: 100, price_per_sqm: 25000, start_month: 10, duration_months: 18 }
      ],
      cost_items: [
        { id: '1', label: 'Construction', amount: 20000000, category: 'construction', cost_code: 'CONST-002', vat_input_eligible: true, is_capex: true, start_month: 5, duration_months: 18 },
        { id: '2', label: 'Marketing', amount: 1000000, category: 'marketing', cost_code: 'MKT-001', vat_input_eligible: true, is_capex: false, start_month: 20, duration_months: 4 }
      ]
    }
  },
  {
    id: 'mixed-use-tower',
    name: 'Mixed-Use Tower',
    description: 'High-rise with residential and retail components',
    category: 'mixed_use',
    inputs: {
      unit_types: [
        { id: '1', name: 'Studio', asset_subtype: 'Residential', revenue_mode: 'sale', units: 30, unit_area_sqm: 50, price_per_sqm: 15000, start_month: 18, duration_months: 8 },
        { id: '2', name: '1BR', asset_subtype: 'Residential', revenue_mode: 'sale', units: 45, unit_area_sqm: 75, price_per_sqm: 12667, start_month: 18, duration_months: 8 },
        { id: '3', name: 'Retail Space', asset_subtype: 'Retail', revenue_mode: 'sale', units: 8, unit_area_sqm: 80, price_per_sqm: 22500, start_month: 12, duration_months: 6 }
      ],
      cost_items: [
        { id: '1', label: 'Foundation & Structure', amount: 25000000, category: 'construction', cost_code: 'CONST-003', vat_input_eligible: true, is_capex: true, start_month: 3, duration_months: 18 },
        { id: '2', label: 'MEP Systems', amount: 12000000, category: 'construction', cost_code: 'MEP-001', vat_input_eligible: true, is_capex: true, start_month: 12, duration_months: 12 },
        { id: '3', label: 'Finishing', amount: 8000000, category: 'construction', cost_code: 'FINISH-001', vat_input_eligible: true, is_capex: true, start_month: 20, duration_months: 8 }
      ]
    }
  },
  {
    id: 'luxury-residential',
    name: 'Luxury Residential',
    description: 'Premium residential development with high-end finishes',
    category: 'residential',
    inputs: {
      unit_types: [
        { id: '1', name: 'Penthouse', asset_subtype: 'Luxury Residential', revenue_mode: 'sale', units: 4, unit_area_sqm: 200, price_per_sqm: 17500, start_month: 24, duration_months: 6 },
        { id: '2', name: '2BR Premium', asset_subtype: 'Luxury Residential', revenue_mode: 'sale', units: 20, unit_area_sqm: 120, price_per_sqm: 15000, start_month: 20, duration_months: 8 },
        { id: '3', name: '3BR Premium', asset_subtype: 'Luxury Residential', revenue_mode: 'sale', units: 16, unit_area_sqm: 150, price_per_sqm: 16000, start_month: 20, duration_months: 8 }
      ],
      cost_items: [
        { id: '1', label: 'Premium Construction', amount: 45000000, category: 'construction', cost_code: 'CONST-004', vat_input_eligible: true, is_capex: true, start_month: 6, duration_months: 30 },
        { id: '2', label: 'Luxury Finishes', amount: 8000000, category: 'construction', cost_code: 'FINISH-002', vat_input_eligible: true, is_capex: true, start_month: 24, duration_months: 12 },
        { id: '3', label: 'Amenities & Common Areas', amount: 5000000, category: 'construction', cost_code: 'AMENITY-001', vat_input_eligible: true, is_capex: true, start_month: 18, duration_months: 18 }
      ]
    }
  }
];

export function getPresetsByCategory(category?: 'residential' | 'retail' | 'mixed_use'): FeaslyPreset[] {
  if (!category) return PRESETS;
  return PRESETS.filter(preset => preset.category === category);
}

export function getPresetById(id: string): FeaslyPreset | undefined {
  return PRESETS.find(preset => preset.id === id);
}