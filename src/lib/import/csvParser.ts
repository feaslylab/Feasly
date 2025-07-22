export interface ParsedProjectInput {
  project_name: string;
  asset_type: string;
  land_cost?: number;
  construction_cost?: number;
  soft_costs?: number;
  total_gfa_sqm?: number;
  average_sale_price?: number;
  duration_months?: number;
  start_date?: Date;
  location?: string;
  currency_code?: string;
  errors: string[];
  warnings: string[];
}

export interface CSVParseResult {
  success: boolean;
  data: ParsedProjectInput[];
  errors: string[];
  totalRows: number;
  validRows: number;
}

const REQUIRED_COLUMNS = [
  'project_name',
  'asset_type',
  'construction_cost',
  'total_gfa_sqm',
  'average_sale_price'
];

const EXPECTED_COLUMNS = {
  // Required columns
  'project_name': { type: 'string', required: true },
  'asset_type': { type: 'string', required: true },
  'construction_cost': { type: 'number', required: true },
  'total_gfa_sqm': { type: 'number', required: true },
  'average_sale_price': { type: 'number', required: true },
  
  // Optional columns
  'land_cost': { type: 'number', required: false },
  'soft_costs': { type: 'number', required: false },
  'duration_months': { type: 'number', required: false },
  'location': { type: 'string', required: false },
  'currency_code': { type: 'string', required: false },
  'start_date': { type: 'date', required: false }
};

/**
 * Parse CSV content into project data
 */
export function parseFeaslyCSV(csvContent: string): CSVParseResult {
  const result: CSVParseResult = {
    success: false,
    data: [],
    errors: [],
    totalRows: 0,
    validRows: 0
  };

  try {
    // Split into lines and handle different line endings
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim());
    
    if (lines.length < 2) {
      result.errors.push('CSV must contain at least a header row and one data row');
      return result;
    }

    // Parse header
    const headerLine = lines[0];
    const headers = parseCSVLine(headerLine).map(h => h.toLowerCase().trim());
    
    // Validate required columns
    const missingColumns = REQUIRED_COLUMNS.filter(col => !headers.includes(col));
    if (missingColumns.length > 0) {
      result.errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
      return result;
    }

    result.totalRows = lines.length - 1;

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines

      const rowData = parseCSVLine(line);
      const parsedRow = parseProjectRow(headers, rowData, i + 1);
      
      result.data.push(parsedRow);
      
      if (parsedRow.errors.length === 0) {
        result.validRows++;
      }
    }

    result.success = result.validRows > 0;

    if (result.validRows === 0) {
      result.errors.push('No valid rows found in CSV');
    }

  } catch (error) {
    result.errors.push(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
}

/**
 * Parse a single CSV line handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Handle escaped quotes
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

/**
 * Parse a single project row
 */
function parseProjectRow(headers: string[], values: string[], rowNumber: number): ParsedProjectInput {
  const parsed: ParsedProjectInput = {
    project_name: '',
    asset_type: '',
    errors: [],
    warnings: []
  };

  if (values.length !== headers.length) {
    parsed.errors.push(`Row ${rowNumber}: Column count mismatch. Expected ${headers.length}, got ${values.length}`);
    return parsed;
  }

  // Process each column
  headers.forEach((header, index) => {
    const value = values[index]?.trim() || '';
    const columnConfig = EXPECTED_COLUMNS[header as keyof typeof EXPECTED_COLUMNS];
    
    if (!columnConfig) {
      parsed.warnings.push(`Unknown column '${header}' ignored`);
      return;
    }

    // Check required fields
    if (columnConfig.required && !value) {
      parsed.errors.push(`Row ${rowNumber}: Missing required field '${header}'`);
      return;
    }

    if (!value && !columnConfig.required) {
      return; // Skip empty optional fields
    }

    // Parse and validate based on type
    try {
      switch (columnConfig.type) {
        case 'string':
          if (header === 'project_name' && value.length > 100) {
            parsed.errors.push(`Row ${rowNumber}: Project name too long (max 100 characters)`);
          } else if (header === 'asset_type') {
            const validAssetTypes = ['residential', 'commercial', 'retail', 'office', 'mixed', 'industrial'];
            if (!validAssetTypes.includes(value.toLowerCase())) {
              parsed.warnings.push(`Row ${rowNumber}: Unknown asset type '${value}', using 'mixed'`);
              (parsed as any)[header] = 'mixed';
            } else {
              (parsed as any)[header] = value.toLowerCase();
            }
          } else if (header === 'currency_code') {
            const validCurrencies = ['AED', 'SAR', 'USD', 'EUR'];
            if (!validCurrencies.includes(value.toUpperCase())) {
              parsed.warnings.push(`Row ${rowNumber}: Unknown currency '${value}', using 'AED'`);
              (parsed as any)[header] = 'AED';
            } else {
              (parsed as any)[header] = value.toUpperCase();
            }
          } else {
            (parsed as any)[header] = value;
          }
          break;

        case 'number':
          const numValue = parseFloat(value.replace(/,/g, ''));
          if (isNaN(numValue) || numValue < 0) {
            parsed.errors.push(`Row ${rowNumber}: Invalid number for '${header}': '${value}'`);
          } else {
            (parsed as any)[header] = numValue;
          }
          break;

        case 'date':
          const dateValue = new Date(value);
          if (isNaN(dateValue.getTime())) {
            parsed.errors.push(`Row ${rowNumber}: Invalid date for '${header}': '${value}'`);
          } else {
            (parsed as any)[header] = dateValue;
          }
          break;
      }
    } catch (error) {
      parsed.errors.push(`Row ${rowNumber}: Error parsing '${header}': ${value}`);
    }
  });

  // Business rule validations
  if (parsed.errors.length === 0) {
    // Check if total costs make sense
    const totalCosts = (parsed.land_cost || 0) + (parsed.construction_cost || 0) + (parsed.soft_costs || 0);
    const totalRevenue = (parsed.total_gfa_sqm || 0) * (parsed.average_sale_price || 0);
    
    if (totalCosts > totalRevenue * 0.9) {
      parsed.warnings.push(`Row ${rowNumber}: High cost-to-revenue ratio may indicate low profitability`);
    }

    if ((parsed.construction_cost || 0) < (parsed.land_cost || 0)) {
      parsed.warnings.push(`Row ${rowNumber}: Land cost higher than construction cost - unusual for most projects`);
    }

    if ((parsed.duration_months || 12) > 120) {
      parsed.warnings.push(`Row ${rowNumber}: Project duration over 10 years - very long timeline`);
    }
  }

  return parsed;
}

/**
 * Generate CSV template for download
 */
export function generateCSVTemplate(): string {
  const headers = [
    'project_name',
    'asset_type',
    'land_cost',
    'construction_cost',
    'soft_costs',
    'total_gfa_sqm',
    'average_sale_price',
    'duration_months',
    'location',
    'currency_code',
    'start_date'
  ];

  const sampleRow = [
    'Sample Mixed-Use Development',
    'mixed',
    '50000000',
    '120000000',
    '15000000',
    '25000',
    '8500',
    '36',
    'Dubai Marina',
    'AED',
    '2024-06-01'
  ];

  return [headers.join(','), sampleRow.join(',')].join('\n');
}

/**
 * Validate file before parsing
 */
export function validateCSVFile(file: File): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check file type
  if (!file.name.toLowerCase().endsWith('.csv')) {
    errors.push('File must be a CSV file');
  }

  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    errors.push('File size must be less than 5MB');
  }

  // Check if file is not empty
  if (file.size === 0) {
    errors.push('File cannot be empty');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}