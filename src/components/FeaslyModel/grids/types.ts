import { z } from 'zod';

// Base interface for all line items
export interface LineItemBase {
  id: string;
  description: string;
  start_month: number;
  end_month: number;
  escalation_percent: number;
}

// Construction line item (existing but enhanced)
export const constructionItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, "Description is required"),
  amount: z.number().min(0, "Amount must be positive"),
  start_month: z.number().min(0, "Start month must be positive"),
  end_month: z.number().min(0, "End month must be positive"),
  escalation_percent: z.number().min(0).max(100, "Escalation must be 0-100%"),
  phase: z.string().optional(),
  contractor: z.string().optional(),
}).refine(data => data.end_month >= data.start_month, {
  message: "End month must be after start month",
  path: ["end_month"]
});

// Soft cost line item
export const softCostItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, "Description is required"),
  amount: z.number().min(0, "Amount must be positive"),
  start_month: z.number().min(0, "Start month must be positive"),
  end_month: z.number().min(0, "End month must be positive"),
  escalation_percent: z.number().min(0).max(100, "Escalation must be 0-100%"),
  category: z.enum(['professional_fees', 'permits', 'insurance', 'financing', 'other']),
  percentage_of_construction: z.number().min(0).max(100).optional(),
}).refine(data => data.end_month >= data.start_month, {
  message: "End month must be after start month",
  path: ["end_month"]
});

// Marketing cost line item
export const marketingCostItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, "Description is required"),
  amount: z.number().min(0, "Amount must be positive"),
  start_month: z.number().min(0, "Start month must be positive"),
  end_month: z.number().min(0, "End month must be positive"),
  escalation_percent: z.number().min(0).max(100, "Escalation must be 0-100%"),
  campaign_type: z.enum(['digital', 'print', 'outdoor', 'events', 'other']),
  target_demographic: z.string().optional(),
}).refine(data => data.end_month >= data.start_month, {
  message: "End month must be after start month",
  path: ["end_month"]
});

// Contingency line item
export const contingencyItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, "Description is required"),
  percentage_of_costs: z.number().min(0).max(50, "Contingency must be 0-50%"),
  applies_to: z.enum(['construction', 'soft_costs', 'marketing', 'all']),
  trigger_conditions: z.string().optional(),
});

// Revenue line item
export const revenueItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, "Description is required"),
  revenue_type: z.enum(['sale', 'lease', 'other']),
  amount: z.number().min(0, "Amount must be positive"),
  start_month: z.number().min(0, "Start month must be positive"),
  end_month: z.number().min(0, "End month must be positive"),
  escalation_percent: z.number().min(0).max(100, "Escalation must be 0-100%"),
  
  // Sale-specific fields
  units_count: z.number().min(0).optional(),
  price_per_unit: z.number().min(0).optional(),
  sales_velocity_percent: z.number().min(0).max(100).optional(),
  
  // Lease-specific fields
  occupancy_rate: z.number().min(0).max(100).optional(),
  lease_duration_months: z.number().min(1).optional(),
  rent_free_months: z.number().min(0).optional(),
}).refine(data => data.end_month >= data.start_month, {
  message: "End month must be after start month",
  path: ["end_month"]
});

// TypeScript types
export type ConstructionItem = z.infer<typeof constructionItemSchema>;
export type SoftCostItem = z.infer<typeof softCostItemSchema>;
export type MarketingCostItem = z.infer<typeof marketingCostItemSchema>;
export type ContingencyItem = z.infer<typeof contingencyItemSchema>;
export type RevenueItem = z.infer<typeof revenueItemSchema>;

// Grid configuration interface
export interface GridConfig<T> {
  columns: GridColumn<T>[];
  allowAdd: boolean;
  allowDelete: boolean;
  allowReorder: boolean;
  allowBulkEdit: boolean;
  allowImport: boolean;
  allowExport: boolean;
  virtualized: boolean;
  maxRows?: number;
}

// Column configuration
export interface GridColumn<T> {
  key: keyof T;
  title: string;
  type: 'text' | 'number' | 'select' | 'date' | 'percent' | 'currency';
  width?: number;
  required?: boolean;
  readonly?: boolean;
  options?: { value: string; label: string }[];
  validation?: (value: any) => string | null;
  format?: (value: any) => string;
}

// Grid state interface
export interface GridState<T> {
  items: T[];
  selectedIds: Set<string>;
  editingId: string | null;
  sortColumn: keyof T | null;
  sortDirection: 'asc' | 'desc';
  filter: string;
  errors: Record<string, Record<string, string>>;
}

// Bulk action types
export type BulkAction = 
  | { type: 'delete'; ids: string[] }
  | { type: 'duplicate'; ids: string[] }
  | { type: 'move_phase'; ids: string[]; phase: string }
  | { type: 'adjust_escalation'; ids: string[]; adjustment: number };

// Import/Export types
export interface ImportResult<T> {
  success: boolean;
  items: T[];
  errors: string[];
  warnings: string[];
}

export interface ExportOptions {
  format: 'csv' | 'excel';
  includeHeaders: boolean;
  selectedOnly: boolean;
}

// Validation result
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}