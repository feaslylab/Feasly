import { useFormContext } from 'react-hook-form';
import { useMemo } from 'react';
import { FeaslyModelFormData } from '@/components/FeaslyModel/types';
import { 
  constructionItemSchema, 
  softCostItemSchema, 
  marketingCostItemSchema, 
  contingencyItemSchema 
} from '@/components/FeaslyModel/grids/types';

export interface GridValidationStatus {
  sectionId: string;
  isValid: boolean;
  errorCount: number;
  warningCount: number;
  totalItems: number;
  validItems: number;
  badge: {
    variant: 'success' | 'warning' | 'error' | 'empty';
    text: string;
    icon: '✅' | '⚠️' | '❌' | '○';
  };
}

export interface ValidationCounts {
  grids: Record<string, GridValidationStatus>;
  overall: {
    isValid: boolean;
    totalErrors: number;
    totalWarnings: number;
    completedSections: number;
    totalSections: number;
  };
}

/**
 * Hook that aggregates validation counts across all LineItemGrids
 * Returns badge states for sidebar navigation and wizard gating
 */
export function useGridValidationCounts(): ValidationCounts {
  const { watch, formState } = useFormContext<FeaslyModelFormData>();
  
  // Watch all grid arrays
  const formData = watch();
  
  const validation = useMemo(() => {
    const grids: Record<string, GridValidationStatus> = {};
    
    // Construction Items Validation
    const constructionItems = formData.construction_items || [];
    const constructionValidation = validateItems(
      'construction-development',
      constructionItems,
      constructionItemSchema
    );
    grids['construction-development'] = constructionValidation;
    
    // Soft Cost Items Validation
    const softCostItems = formData.soft_cost_items || [];
    const softCostValidation = validateItems(
      'soft-costs',
      softCostItems,
      softCostItemSchema
    );
    grids['soft-costs'] = softCostValidation;
    
    // Marketing Cost Items Validation
    const marketingCostItems = formData.marketing_cost_items || [];
    const marketingValidation = validateItems(
      'marketing-costs',
      marketingCostItems,
      marketingCostItemSchema
    );
    grids['marketing-costs'] = marketingValidation;
    
    // Contingency Items Validation
    const contingencyItems = formData.contingency_items || [];
    const contingencyValidation = validateItems(
      'contingencies',
      contingencyItems,
      contingencyItemSchema
    );
    grids['contingencies'] = contingencyValidation;
    
    // Calculate overall status
    const gridStatuses = Object.values(grids);
    const totalErrors = gridStatuses.reduce((sum, grid) => sum + grid.errorCount, 0);
    const totalWarnings = gridStatuses.reduce((sum, grid) => sum + grid.warningCount, 0);
    const completedSections = gridStatuses.filter(grid => grid.isValid && grid.totalItems > 0).length;
    const totalSections = gridStatuses.length;
    const isValid = totalErrors === 0 && completedSections > 0;
    
    return {
      grids,
      overall: {
        isValid,
        totalErrors,
        totalWarnings,
        completedSections,
        totalSections
      }
    };
  }, [formData, formState.errors]);
  
  return validation;
}

/**
 * Validates an array of items against a Zod schema
 */
function validateItems(sectionId: string, items: any[], schema: any): GridValidationStatus {
  if (!items || items.length === 0) {
    return {
      sectionId,
      isValid: false,
      errorCount: 0,
      warningCount: 0,
      totalItems: 0,
      validItems: 0,
      badge: {
        variant: 'empty',
        text: 'Empty',
        icon: '○'
      }
    };
  }
  
  let errorCount = 0;
  let warningCount = 0;
  let validItems = 0;
  
  items.forEach(item => {
    try {
      schema.parse(item);
      validItems++;
    } catch (error: any) {
      if (error.errors) {
        // Count critical vs warning errors
        error.errors.forEach((err: any) => {
          if (isCriticalError(err)) {
            errorCount++;
          } else {
            warningCount++;
          }
        });
      }
    }
  });
  
  const isValid = errorCount === 0 && validItems === items.length;
  const hasWarnings = warningCount > 0;
  
  let badge: GridValidationStatus['badge'];
  
  if (isValid && !hasWarnings) {
    badge = {
      variant: 'success',
      text: `${validItems}/${items.length}`,
      icon: '✅'
    };
  } else if (errorCount > 0) {
    badge = {
      variant: 'error',
      text: `${errorCount} error${errorCount > 1 ? 's' : ''}`,
      icon: '❌'
    };
  } else if (hasWarnings) {
    badge = {
      variant: 'warning',
      text: `${warningCount} warning${warningCount > 1 ? 's' : ''}`,
      icon: '⚠️'
    };
  } else {
    badge = {
      variant: 'empty',
      text: 'Empty',
      icon: '○'
    };
  }
  
  return {
    sectionId,
    isValid,
    errorCount,
    warningCount,
    totalItems: items.length,
    validItems,
    badge
  };
}

/**
 * Determines if a Zod error is critical (blocks submission) vs warning
 */
function isCriticalError(error: any): boolean {
  const criticalFields = [
    'description',
    'amount',
    'start_month',
    'end_month',
    'percentage_of_costs'
  ];
  
  const criticalMessages = [
    'required',
    'positive',
    'min',
    'max'
  ];
  
  // Check if error is on a critical field
  if (criticalFields.includes(error.path?.[0])) {
    return true;
  }
  
  // Check if error message indicates a critical issue
  const message = error.message?.toLowerCase() || '';
  return criticalMessages.some(keyword => message.includes(keyword));
}

/**
 * Helper hook for individual grid validation (used within LineItemGrid)
 */
export function useGridValidation(sectionId: string) {
  const validation = useGridValidationCounts();
  return validation.grids[sectionId] || {
    sectionId,
    isValid: false,
    errorCount: 0,
    warningCount: 0,
    totalItems: 0,
    validItems: 0,
    badge: { variant: 'empty' as const, text: 'Empty', icon: '○' as const }
  };
}