export type InputType = 'number' | 'percentage' | 'currency' | 'select' | 'switch' | 'date';
export type InputGroup = 'land_acquisition' | 'construction' | 'soft_costs' | 'revenue_segments' | 'escrow_contingency' | 'debt_financing' | 'zakat_tax' | 'escalation';

export interface FinancialInputConfig {
  id: string;
  label: string;
  placeholder?: string;
  tooltip?: string;
  type: InputType;
  unit?: string;
  group: InputGroup;
  defaultValue?: any;
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string; label: string }[];
  dependsOn?: string; // Field that must be true to show this field
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
  };
}

export const INPUT_GROUPS: Record<InputGroup, { title: string; description: string; icon: string }> = {
  land_acquisition: {
    title: 'Land & Acquisition',
    description: 'Land purchase, acquisition fees, and related costs',
    icon: '🏞️'
  },
  construction: {
    title: 'Construction & Development',
    description: 'Primary construction costs and development expenses',
    icon: '🏗️'
  },
  soft_costs: {
    title: 'Soft & Indirect Costs',
    description: 'Professional fees, permits, and indirect expenses',
    icon: '📋'
  },
  revenue_segments: {
    title: 'Revenue Segments',
    description: 'Segmented GFA and pricing by asset type',
    icon: '📊'
  },
  escrow_contingency: {
    title: 'Escrow & Contingency',
    description: 'Risk reserves and escrow requirements',
    icon: '🛡️'
  },
  debt_financing: {
    title: 'Debt & Financing',
    description: 'Loan terms, interest rates, and financing structure',
    icon: '💰'
  },
  zakat_tax: {
    title: 'Zakat & Tax',
    description: 'Islamic finance compliance and tax obligations',
    icon: '⚖️'
  },
  escalation: {
    title: 'Cost Escalation',
    description: 'Inflation and cost escalation parameters',
    icon: '📈'
  }
};

export const FINANCIAL_INPUTS: FinancialInputConfig[] = [
  // Land & Acquisition
  {
    id: 'land_cost',
    label: 'Land Cost',
    placeholder: '0.00',
    tooltip: 'Total cost of land acquisition including transaction fees',
    type: 'currency',
    group: 'land_acquisition',
    defaultValue: 0,
    min: 0,
    step: 0.01
  },

  // Construction & Development
  {
    id: 'construction_cost',
    label: 'Construction Cost',
    placeholder: '0.00',
    tooltip: 'Primary construction and development costs',
    type: 'currency',
    group: 'construction',
    defaultValue: 0,
    min: 0,
    step: 0.01
  },

  // Soft & Indirect Costs
  {
    id: 'soft_costs',
    label: 'Soft Costs',
    placeholder: '0.00',
    tooltip: 'Professional fees, permits, design costs',
    type: 'currency',
    group: 'soft_costs',
    defaultValue: 0,
    min: 0,
    step: 0.01
  },
  {
    id: 'marketing_cost',
    label: 'Marketing Cost',
    placeholder: '0.00',
    tooltip: 'Sales and marketing expenses',
    type: 'currency',
    group: 'soft_costs',
    defaultValue: 0,
    min: 0,
    step: 0.01
  },

  // Revenue Segments (Segmented GFA)
  {
    id: 'use_segmented_revenue',
    label: 'Use Segmented Revenue',
    tooltip: 'Enable revenue breakdown by asset type (residential, retail, office)',
    type: 'switch',
    group: 'revenue_segments',
    defaultValue: false
  },
  {
    id: 'gfa_residential',
    label: 'Residential GFA',
    placeholder: '0',
    tooltip: 'Gross floor area for residential units',
    type: 'number',
    unit: 'sqm',
    group: 'revenue_segments',
    defaultValue: 0,
    min: 0,
    dependsOn: 'use_segmented_revenue'
  },
  {
    id: 'sale_price_residential',
    label: 'Residential Sale Price',
    placeholder: '0.00',
    tooltip: 'Price per sqm for residential units',
    type: 'currency',
    unit: '/sqm',
    group: 'revenue_segments',
    defaultValue: 0,
    min: 0,
    dependsOn: 'use_segmented_revenue'
  },
  {
    id: 'gfa_retail',
    label: 'Retail GFA',
    placeholder: '0',
    tooltip: 'Gross floor area for retail spaces',
    type: 'number',
    unit: 'sqm',
    group: 'revenue_segments',
    defaultValue: 0,
    min: 0,
    dependsOn: 'use_segmented_revenue'
  },
  {
    id: 'sale_price_retail',
    label: 'Retail Sale Price',
    placeholder: '0.00',
    tooltip: 'Price per sqm for retail spaces',
    type: 'currency',
    unit: '/sqm',
    group: 'revenue_segments',
    defaultValue: 0,
    min: 0,
    dependsOn: 'use_segmented_revenue'
  },
  {
    id: 'gfa_office',
    label: 'Office GFA',
    placeholder: '0',
    tooltip: 'Gross floor area for office spaces',
    type: 'number',
    unit: 'sqm',
    group: 'revenue_segments',
    defaultValue: 0,
    min: 0,
    dependsOn: 'use_segmented_revenue'
  },
  {
    id: 'sale_price_office',
    label: 'Office Sale Price',
    placeholder: '0.00',
    tooltip: 'Price per sqm for office spaces',
    type: 'currency',
    unit: '/sqm',
    group: 'revenue_segments',
    defaultValue: 0,
    min: 0,
    dependsOn: 'use_segmented_revenue'
  },
  // Fallback fields for non-segmented revenue
  {
    id: 'total_gfa_sqm',
    label: 'Total GFA',
    placeholder: '0',
    tooltip: 'Total gross floor area',
    type: 'number',
    unit: 'sqm',
    group: 'revenue_segments',
    defaultValue: 0,
    min: 0
  },
  {
    id: 'average_sale_price',
    label: 'Average Sale Price',
    placeholder: '0.00',
    tooltip: 'Average price per sqm across all asset types',
    type: 'currency',
    unit: '/sqm',
    group: 'revenue_segments',
    defaultValue: 0,
    min: 0
  },

  // Escrow & Contingency
  {
    id: 'contingency_percent',
    label: 'Contingency %',
    placeholder: '5.0',
    tooltip: 'Percentage of total costs held as contingency',
    type: 'percentage',
    group: 'escrow_contingency',
    defaultValue: 5,
    min: 0,
    max: 50,
    step: 0.1
  },
  {
    id: 'escrow_required',
    label: 'Escrow Required',
    tooltip: 'Enable escrow reserves for the project (Saudi compliance)',
    type: 'switch',
    group: 'escrow_contingency',
    defaultValue: false
  },
  {
    id: 'escrow_percent',
    label: 'Escrow Reserve %',
    placeholder: '20.0',
    tooltip: 'Percentage of project revenue held in escrow (Saudi default: 20%)',
    type: 'percentage',
    group: 'escrow_contingency',
    defaultValue: 20,
    min: 0,
    max: 100,
    step: 0.1,
    dependsOn: 'escrow_required'
  },

  // Debt & Financing
  {
    id: 'funding_type',
    label: 'Funding Type',
    tooltip: 'Primary funding structure for the project',
    type: 'select',
    group: 'debt_financing',
    defaultValue: 'mixed',
    options: [
      { value: 'equity', label: '100% Equity' },
      { value: 'debt', label: '100% Debt' },
      { value: 'mixed', label: 'Mixed (Equity + Debt)' },
      { value: 'islamic', label: 'Islamic Financing' }
    ]
  },
  {
    id: 'total_funding',
    label: 'Total Funding',
    placeholder: '0.00',
    tooltip: 'Total project funding requirement',
    type: 'currency',
    group: 'debt_financing',
    defaultValue: 0,
    min: 0,
    step: 0.01
  },
  {
    id: 'equity_contribution',
    label: 'Equity Contribution',
    placeholder: '0.00',
    tooltip: 'Total equity investment',
    type: 'currency',
    group: 'debt_financing',
    defaultValue: 0,
    min: 0,
    step: 0.01
  },
  {
    id: 'loan_amount',
    label: 'Loan Amount',
    placeholder: '0.00',
    tooltip: 'Total debt financing amount',
    type: 'currency',
    group: 'debt_financing',
    defaultValue: 0,
    min: 0,
    step: 0.01
  },
  {
    id: 'interest_rate',
    label: 'Interest Rate',
    placeholder: '5.0',
    tooltip: 'Annual interest rate for debt financing',
    type: 'percentage',
    group: 'debt_financing',
    defaultValue: 5,
    min: 0,
    max: 100,
    step: 0.01
  },
  {
    id: 'loan_term_years',
    label: 'Loan Term',
    placeholder: '10',
    tooltip: 'Loan duration in years',
    type: 'number',
    unit: 'years',
    group: 'debt_financing',
    defaultValue: 10,
    min: 1,
    max: 50,
    step: 1
  },
  {
    id: 'grace_period_months',
    label: 'Grace Period',
    placeholder: '12',
    tooltip: 'Interest-only period in months',
    type: 'number',
    unit: 'months',
    group: 'debt_financing',
    defaultValue: 12,
    min: 0,
    max: 120,
    step: 1
  },
  {
    id: 'loan_repayment_type',
    label: 'Repayment Type',
    tooltip: 'Loan repayment structure',
    type: 'select',
    group: 'debt_financing',
    defaultValue: 'equal_installments',
    options: [
      { value: 'equal_installments', label: 'Equal Installments' },
      { value: 'bullet', label: 'Bullet Payment' },
      { value: 'interest_only', label: 'Interest Only' },
      { value: 'graduated', label: 'Graduated Payment' }
    ]
  },

  // Zakat & Tax
  {
    id: 'zakat_applicable',
    label: 'Zakat Applicable',
    tooltip: 'Apply Islamic Zakat calculations (Saudi compliance)',
    type: 'switch',
    group: 'zakat_tax',
    defaultValue: false
  },
  {
    id: 'zakat_rate_percent',
    label: 'Zakat Rate',
    placeholder: '2.5',
    tooltip: 'Zakat rate percentage (standard Islamic rate is 2.5%)',
    type: 'percentage',
    group: 'zakat_tax',
    defaultValue: 2.5,
    min: 0,
    max: 100,
    step: 0.01,
    dependsOn: 'zakat_applicable'
  },
  {
    id: 'vat_applicable',
    label: 'VAT Applicable',
    tooltip: 'Apply VAT on construction and soft costs',
    type: 'switch',
    group: 'zakat_tax',
    defaultValue: false
  },
  {
    id: 'vat_rate',
    label: 'VAT Rate',
    placeholder: '5.0',
    tooltip: 'VAT rate percentage (Saudi VAT is 15%)',
    type: 'percentage',
    group: 'zakat_tax',
    defaultValue: 15,
    min: 0,
    max: 100,
    step: 0.01,
    dependsOn: 'vat_applicable'
  },

  // Cost Escalation
  {
    id: 'enable_escalation',
    label: 'Enable Cost Escalation',
    tooltip: 'Apply inflation and cost escalation over time',
    type: 'switch',
    group: 'escalation',
    defaultValue: false
  },
  {
    id: 'construction_escalation_percent',
    label: 'Construction Escalation %',
    placeholder: '4.0',
    tooltip: 'Annual construction cost escalation rate',
    type: 'percentage',
    group: 'escalation',
    defaultValue: 4,
    min: 0,
    max: 50,
    step: 0.1,
    dependsOn: 'enable_escalation'
  },
  {
    id: 'escalation_start_month',
    label: 'Escalation Start Month',
    placeholder: '6',
    tooltip: 'Month when escalation begins (from project start)',
    type: 'number',
    unit: 'month',
    group: 'escalation',
    defaultValue: 6,
    min: 0,
    max: 120,
    step: 1,
    dependsOn: 'enable_escalation'
  },
  {
    id: 'escalation_duration_months',
    label: 'Escalation Duration',
    placeholder: '12',
    tooltip: 'Duration of escalation period in months',
    type: 'number',
    unit: 'months',
    group: 'escalation',
    defaultValue: 12,
    min: 1,
    max: 120,
    step: 1,
    dependsOn: 'enable_escalation'
  }
];

export const getInputsByGroup = (group: InputGroup): FinancialInputConfig[] => {
  return FINANCIAL_INPUTS.filter(input => input.group === group);
};

export const getInputConfig = (id: string): FinancialInputConfig | undefined => {
  return FINANCIAL_INPUTS.find(input => input.id === id);
};

// Currency and unit formatting utilities
export const CURRENCY_CODES = [
  { value: 'AED', label: 'AED (UAE Dirham)' },
  { value: 'SAR', label: 'SAR (Saudi Riyal)' },
  { value: 'USD', label: 'USD (US Dollar)' },
  { value: 'EUR', label: 'EUR (Euro)' },
  { value: 'GBP', label: 'GBP (British Pound)' }
];

export const UNIT_SYSTEMS = [
  { value: 'sqm', label: 'Square Meters (sqm)' },
  { value: 'sqft', label: 'Square Feet (sqft)' },
  { value: 'units', label: 'Units' }
];

export const formatCurrency = (value: number, currencyCode: string = 'AED'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatUnit = (value: number, unit: string): string => {
  const formattedValue = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
  
  return `${formattedValue} ${unit}`;
};