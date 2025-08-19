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
        { id: '1', name: '1BR', units: 40, price: 900000, start_month: 12, duration_months: 12 },
        { id: '2', name: '2BR', units: 60, price: 1200000, start_month: 12, duration_months: 12 }
      ],
      cost_items: [
        { id: '1', name: 'Construction', amount: 30000000, start_month: 6, duration_months: 24 },
        { id: '2', name: 'Design Fees', amount: 1500000, start_month: 0, duration_months: 6 }
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
        { id: '1', name: 'Retail Lot', units: 25, price: 2500000, start_month: 10, duration_months: 18 }
      ],
      cost_items: [
        { id: '1', name: 'Construction', amount: 20000000, start_month: 5, duration_months: 18 },
        { id: '2', name: 'Marketing', amount: 1000000, start_month: 20, duration_months: 4 }
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
        { id: '1', name: 'Studio', units: 30, price: 750000, start_month: 18, duration_months: 8 },
        { id: '2', name: '1BR', units: 45, price: 950000, start_month: 18, duration_months: 8 },
        { id: '3', name: 'Retail Space', units: 8, price: 1800000, start_month: 12, duration_months: 6 }
      ],
      cost_items: [
        { id: '1', name: 'Foundation & Structure', amount: 25000000, start_month: 3, duration_months: 18 },
        { id: '2', name: 'MEP Systems', amount: 12000000, start_month: 12, duration_months: 12 },
        { id: '3', name: 'Finishing', amount: 8000000, start_month: 20, duration_months: 8 }
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
        { id: '1', name: 'Penthouse', units: 4, price: 3500000, start_month: 24, duration_months: 6 },
        { id: '2', name: '2BR Premium', units: 20, price: 1800000, start_month: 20, duration_months: 8 },
        { id: '3', name: '3BR Premium', units: 16, price: 2400000, start_month: 20, duration_months: 8 }
      ],
      cost_items: [
        { id: '1', name: 'Premium Construction', amount: 45000000, start_month: 6, duration_months: 30 },
        { id: '2', name: 'Luxury Finishes', amount: 8000000, start_month: 24, duration_months: 12 },
        { id: '3', name: 'Amenities & Common Areas', amount: 5000000, start_month: 18, duration_months: 18 }
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