import type { UnitTypeInput } from "@/schemas/inputs";

export interface RevenueCalculation {
  totalRevenue: number;
  monthlyRevenue: number[];
  breakdown: {
    sales: number;
    rental: number;
  };
  unitBreakdown: Array<{
    unitId: string;
    name: string;
    mode: "sale" | "rent";
    revenue: number;
    monthlyRevenue: number[];
  }>;
}

/**
 * Calculate revenue from unit types with dynamic sale/rent modes
 * This replaces hardcoded demo data with real unit-based calculations
 */
export function calculateRevenue(
  unitTypes: UnitTypeInput[],
  totalMonths: number = 60
): RevenueCalculation {
  let totalSalesRevenue = 0;
  let totalRentalRevenue = 0;
  const monthlyRevenue = new Array(totalMonths).fill(0);
  const unitBreakdown: RevenueCalculation['unitBreakdown'] = [];

  for (const unit of unitTypes) {
    const unitMonthlyRevenue = new Array(totalMonths).fill(0);
    let unitTotalRevenue = 0;

    if (unit.revenue_mode === 'sale' && unit.price) {
      // Sale revenue: total contract value spread over duration
      const totalContractValue = unit.units * unit.price;
      const monthlyAmount = totalContractValue / unit.duration_months;
      
      // Apply revenue over the specified duration starting from start_month
      for (let month = unit.start_month; month < Math.min(unit.start_month + unit.duration_months, totalMonths); month++) {
        unitMonthlyRevenue[month] = monthlyAmount;
        monthlyRevenue[month] += monthlyAmount;
      }
      
      unitTotalRevenue = totalContractValue;
      totalSalesRevenue += totalContractValue;
      
    } else if (unit.revenue_mode === 'rent' && unit.rent_per_month && unit.occupancy_rate && unit.lease_term_months) {
      // Rental revenue: monthly rent * occupancy rate * units, repeating over lease terms
      const monthlyRent = unit.units * unit.rent_per_month * unit.occupancy_rate;
      
      // Apply rental revenue over the project duration, considering lease terms
      let currentMonth = unit.start_month;
      while (currentMonth < totalMonths) {
        const leaseEndMonth = Math.min(currentMonth + unit.lease_term_months, totalMonths);
        
        for (let month = currentMonth; month < leaseEndMonth; month++) {
          unitMonthlyRevenue[month] = monthlyRent;
          monthlyRevenue[month] += monthlyRent;
          unitTotalRevenue += monthlyRent;
        }
        
        // Move to next lease cycle (assuming continuous leasing)
        currentMonth = leaseEndMonth;
      }
      
      totalRentalRevenue += unitTotalRevenue;
    }

    unitBreakdown.push({
      unitId: unit.id,
      name: unit.name,
      mode: unit.revenue_mode,
      revenue: unitTotalRevenue,
      monthlyRevenue: unitMonthlyRevenue,
    });
  }

  return {
    totalRevenue: totalSalesRevenue + totalRentalRevenue,
    monthlyRevenue,
    breakdown: {
      sales: totalSalesRevenue,
      rental: totalRentalRevenue,
    },
    unitBreakdown,
  };
}

/**
 * Convert unit types to the format expected by the feasly engine
 */
export function mapUnitsToEngineFormat(unitTypes: UnitTypeInput[]) {
  return unitTypes.map(unit => {
    if (unit.revenue_mode === 'sale') {
      return {
        key: unit.id,
        name: unit.name,
        category: 'residential', // Default category
        count: unit.units,
        sellable_area_sqm: 1, // Normalized to 1 since price is per unit
        initial_price_sqm_sale: unit.price || 0,
        initial_rent_sqm_m: 0,
        delivery_month: unit.start_month,
        curve: {
          meaning: 'sell_through',
          values: Array(unit.duration_months).fill(1 / unit.duration_months)
        }
      };
    } else {
      return {
        key: unit.id,
        name: unit.name,
        category: 'residential',
        count: unit.units,
        sellable_area_sqm: 1,
        initial_price_sqm_sale: 0,
        initial_rent_sqm_m: (unit.rent_per_month || 0) * (unit.occupancy_rate || 0),
        delivery_month: unit.start_month,
        curve: {
          meaning: 'occupancy',
          values: Array(unit.lease_term_months || 12).fill(unit.occupancy_rate || 0.8)
        }
      };
    }
  });
}