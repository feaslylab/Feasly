import { useEffect, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { useDebounce } from '@/hooks/useDebounce';
import { useScenarioCalculation } from '@/hooks/useScenarioCalculation';
import { toast } from 'sonner';
import { FeaslyModelFormData } from '@/components/FeaslyModel/types';

// Transform grid data to engine format
const transformToEngineFormat = (formData: FeaslyModelFormData) => {
  const constructionItems = (formData.construction_items || []).map(item => ({
    baseCost: item.amount,
    startPeriod: item.start_month,
    endPeriod: item.end_month,
    escalationRate: item.escalation_percent / 100,
    retentionPercent: (item.retention_percent || 0) / 100,
    retentionReleaseLag: item.retention_release_lag || 0
  }));

  const saleLines = (formData.sale_lines || []).map(line => ({
    units: line.units,
    pricePerUnit: line.price_per_unit,
    startPeriod: line.start_month,
    endPeriod: line.end_month,
    escalation: line.annual_escalation_percent / 100
  }));

  const rentalLines = (formData.rental_lines || []).map(line => ({
    rooms: line.rooms,
    adr: line.adr,
    occupancyRate: line.occupancy_rate / 100,
    startPeriod: line.start_month,
    endPeriod: line.end_month,
    annualEscalation: line.annual_escalation_percent / 100
  }));

  const softCostItems = (formData.soft_cost_items || []).map(item => ({
    baseCost: item.amount,
    startPeriod: item.start_month,
    endPeriod: item.end_month,
    escalationRate: item.escalation_percent / 100,
    category: item.category
  }));

  const marketingCostItems = (formData.marketing_cost_items || []).map(item => ({
    baseCost: item.amount,
    startPeriod: item.start_month,
    endPeriod: item.end_month,
    escalationRate: item.escalation_percent / 100,
    campaignType: item.campaign_type
  }));

  const contingencyItems = (formData.contingency_items || []).map(item => ({
    percentageOfCosts: item.percentage_of_costs / 100,
    appliesTo: item.applies_to,
    triggerConditions: item.trigger_conditions
  }));

  return {
    constructionItems,
    softCostItems,
    marketingCostItems,
    contingencyItems,
    saleLines,
    rentalLines,
    horizon: 60 // Default 5 year horizon
  };
};

export function useGridCalculations(projectId: string | null, scenarioId: string | null) {
  const { watch } = useFormContext<FeaslyModelFormData>();
  const { calculateScenario, result, isCalculating, error, clearResult } = useScenarioCalculation(projectId, scenarioId);

  // Watch all grid fields
  const watchedData = watch([
    'construction_items',
    'soft_cost_items',
    'marketing_cost_items', 
    'contingency_items',
    'sale_lines', 
    'rental_lines'
  ]);

  // Create a stable data object for debouncing
  const gridData = {
    construction_items: watchedData[0] || [],
    soft_cost_items: watchedData[1] || [],
    marketing_cost_items: watchedData[2] || [],
    contingency_items: watchedData[3] || [],
    sale_lines: watchedData[4] || [],
    rental_lines: watchedData[5] || []
  };

  // Debounce the grid data changes
  const debouncedGridData = useDebounce(gridData, 400);

  // Trigger calculation when debounced data changes
  useEffect(() => {
    if (!projectId || !scenarioId) return;
    
    const hasData = 
      debouncedGridData.construction_items?.length > 0 ||
      debouncedGridData.soft_cost_items?.length > 0 ||
      debouncedGridData.marketing_cost_items?.length > 0 ||
      debouncedGridData.contingency_items?.length > 0 ||
      debouncedGridData.sale_lines?.length > 0 ||
      debouncedGridData.rental_lines?.length > 0;

    if (hasData) {
      try {
        const engineData = transformToEngineFormat(debouncedGridData as FeaslyModelFormData);
        calculateScenario(engineData);
      } catch (error) {
        console.error('Failed to transform grid data:', error);
        toast.error('Failed to prepare calculation data');
      }
    } else {
      clearResult();
    }
  }, [debouncedGridData, projectId, scenarioId, calculateScenario, clearResult]);

  // Handle calculation errors
  useEffect(() => {
    if (error) {
      toast.error(`Calculation failed: ${error}`);
    }
  }, [error]);

  // Get row counts for badges
  const getRowCounts = useCallback(() => ({
    constructionItems: gridData.construction_items?.length || 0,
    softCostItems: gridData.soft_cost_items?.length || 0,
    marketingCostItems: gridData.marketing_cost_items?.length || 0,
    contingencyItems: gridData.contingency_items?.length || 0,
    saleLines: gridData.sale_lines?.length || 0,
    rentalLines: gridData.rental_lines?.length || 0
  }), [gridData]);

  return {
    result,
    isCalculating,
    error,
    getRowCounts,
    hasData: getRowCounts().constructionItems > 0 || 
             getRowCounts().softCostItems > 0 ||
             getRowCounts().marketingCostItems > 0 ||
             getRowCounts().contingencyItems > 0 ||
             getRowCounts().saleLines > 0 || 
             getRowCounts().rentalLines > 0
  };
}