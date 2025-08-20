// Use the form data structure directly instead of engine types
interface ProjectInputs {
  project?: {
    start_date?: string;
    periods?: number;
    periodicity?: string;
    project_type?: string;
    developer_name?: string;
    project_location?: string;
    currency?: string;
    duration_months?: number;
    masterplan_mode?: boolean;
  };
  unit_types?: Array<{
    id: string;
    name: string;
    asset_subtype: string;
    revenue_mode: 'sale' | 'rent';
    units: number;
    unit_area_sqm: number;
    price_per_sqm?: number;
    rent_per_month?: number;
    occupancy_rate?: number;
    lease_term_months?: number;
    start_month?: number;
    duration_months?: number;
    curve?: {
      meaning: 'sell_through' | 'occupancy';
      values: number[];
    };
  }>;
  cost_items?: Array<{
    id: string;
    label: string;
    amount: number;
    category: 'construction' | 'land' | 'soft' | 'infra' | 'marketing' | 'other';
    cost_code?: string;
    vat_input_eligible?: boolean;
    is_capex?: boolean;
    start_month?: number;
    duration_months?: number;
    curve?: {
      meaning: 'phasing';
      values: number[];
    };
  }>;
  financing_slices?: Array<{
    id: string;
    type: 'equity' | 'senior_debt' | 'mezzanine_debt';
    label: string;
    amount: number;
    interest_rate?: number;
    tenor_months?: number;
    dscr_min?: number;
    is_interest_only?: boolean;
    start_month?: number;
    curve?: {
      meaning: 'drawdown';
      values: number[];
    };
  }>;
}

export type Warning = {
  id: string;
  message: string;
  severity: "info" | "warning" | "error";
  location?: "project" | "costs" | "revenue" | "financing";
  field?: string;
};

export type FeasibilityGrade = 'A' | 'B' | 'C' | 'D';

export interface FeasibilityResult {
  warnings: Warning[];
  grade: FeasibilityGrade;
  summary: string;
  hasBlockingIssues: boolean;
}

export function validateFeasibility(inputs: any): FeasibilityResult {
  const warnings: Warning[] = [];
  
  // Helper function to safely get array values
  const safeArray = (arr: any[]): number[] => {
    if (!Array.isArray(arr)) return [];
    return arr.filter(v => typeof v === 'number' && !isNaN(v));
  };

  // Calculate totals for validation
  const totalCosts = (inputs.cost_items || []).reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalRevenue = (inputs.unit_types || []).reduce((sum, unit) => {
    if (unit.revenue_mode === 'sale') {
      return sum + ((unit.price_per_sqm || 0) * (unit.unit_area_sqm || 0) * (unit.units || 0));
    } else {
      return sum + ((unit.rent_per_month || 0) * (unit.lease_term_months || 12) * (unit.units || 0));
    }
  }, 0);

  const totalDebt = (inputs.financing_slices || [])
    .filter(slice => slice.type !== 'equity')
    .reduce((sum, slice) => sum + (slice.amount || 0), 0);

  const totalEquity = (inputs.financing_slices || [])
    .filter(slice => slice.type === 'equity')
    .reduce((sum, slice) => sum + (slice.amount || 0), 0);

  const totalCapital = totalDebt + totalEquity;
  const ltcRatio = totalCosts > 0 ? totalDebt / totalCosts : 0;

  // Rule 1: Basic cash flow validation
  if (totalRevenue < totalCosts && totalCosts > 0) {
    warnings.push({
      id: 'revenue_less_than_cost',
      message: 'Total estimated revenue is less than total project cost',
      severity: 'error',
      location: 'revenue'
    });
  }

  // Rule 2: Capital stack gap
  if (totalCapital < totalCosts && totalCosts > 0) {
    const gap = totalCosts - totalCapital;
    warnings.push({
      id: 'funding_gap_detected',
      message: `Funding gap detected: ${gap.toLocaleString()} missing from capital stack`,
      severity: 'error',
      location: 'financing'
    });
  }

  // Rule 3: LTC ratio validation
  if (ltcRatio > 0.85) {
    warnings.push({
      id: 'high_ltc_ratio',
      message: `Loan-to-Cost ratio (${(ltcRatio * 100).toFixed(1)}%) exceeds recommended 85%`,
      severity: 'warning',
      location: 'financing'
    });
  }

  // Rule 4: DSCR validation for debt items
  (inputs.financing_slices || []).forEach((slice, index) => {
    if (slice.type !== 'equity' && slice.dscr_min && slice.dscr_min < 1.2) {
      warnings.push({
        id: `low_dscr_${slice.id}`,
        message: `${slice.label} has DSCR (${slice.dscr_min.toFixed(2)}) below recommended 1.2`,
        severity: 'error',
        location: 'financing',
        field: `financing_slices[${index}].dscr_min`
      });
    }
  });

  // Rule 5: Timeline validation
  const projectPeriods = inputs.project?.periods || 0;
  (inputs.unit_types || []).forEach((unit, index) => {
    const unitDuration = unit.duration_months || 1;
    const unitStart = unit.start_month || 0;
    
    if (unit.revenue_mode === 'rent') {
      // Check occupancy curve reaches reasonable levels
      if (unit.curve?.values) {
        const maxOccupancy = Math.max(...safeArray(unit.curve.values));
        if (maxOccupancy < 0.7) {
          warnings.push({
            id: `low_occupancy_${unit.id}`,
            message: `${unit.name} occupancy never reaches 70% (max: ${(maxOccupancy * 100).toFixed(1)}%)`,
            severity: 'warning',
            location: 'revenue',
            field: `unit_types[${index}].curve`
          });
        }
      }
    }

    // Check if revenue period aligns with construction
    const constructionEndMonth = Math.max(
      ...(inputs.cost_items || [])
        .filter(item => item.category === 'construction')
        .map(item => (item.start_month || 0) + (item.duration_months || 1))
    );

    if (unitStart < constructionEndMonth && unit.revenue_mode === 'sale') {
      warnings.push({
        id: `early_sales_${unit.id}`,
        message: `${unit.name} sales start before construction completion`,
        severity: 'warning',
        location: 'revenue',
        field: `unit_types[${index}].start_month`
      });
    }
  });

  // Rule 6: Missing data validations
  (inputs.cost_items || []).forEach((item, index) => {
    if (!item.category) {
      warnings.push({
        id: `missing_category_${item.id}`,
        message: `Cost item "${item.label}" is missing category`,
        severity: 'warning',
        location: 'costs',
        field: `cost_items[${index}].category`
      });
    }

    if (item.vat_input_eligible === undefined) {
      warnings.push({
        id: `missing_vat_${item.id}`,
        message: `Cost item "${item.label}" VAT eligibility not specified`,
        severity: 'info',
        location: 'costs',
        field: `cost_items[${index}].vat_input_eligible`
      });
    }

    if (!item.curve?.values && item.duration_months && item.duration_months > 1) {
      warnings.push({
        id: `missing_curve_${item.id}`,
        message: `Cost item "${item.label}" has no phasing curve defined`,
        severity: 'info',
        location: 'costs',
        field: `cost_items[${index}].curve`
      });
    }
  });

  // Rule 7: Financing validation
  (inputs.financing_slices || []).forEach((slice, index) => {
    if (slice.type !== 'equity' && !slice.curve?.values) {
      warnings.push({
        id: `missing_drawdown_${slice.id}`,
        message: `${slice.label} has no drawdown curve defined`,
        severity: 'info',
        location: 'financing',
        field: `financing_slices[${index}].curve`
      });
    }
  });

  // Calculate feasibility grade
  const errorCount = warnings.filter(w => w.severity === 'error').length;
  const warningCount = warnings.filter(w => w.severity === 'warning').length;
  
  let grade: FeasibilityGrade = 'A';
  let summary = 'Project shows strong feasibility';
  
  if (errorCount > 0) {
    grade = 'D';
    summary = 'Critical issues detected requiring immediate attention';
  } else if (warningCount > 2) {
    grade = 'C';
    summary = 'Multiple concerns identified - review recommended';
  } else if (warningCount > 0) {
    grade = 'B';
    summary = 'Good feasibility with minor considerations';
  }

  const hasBlockingIssues = errorCount > 0;

  return {
    warnings,
    grade,
    summary,
    hasBlockingIssues
  };
}