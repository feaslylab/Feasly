import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  generateCashflowGrid,
  loadCashflowFromDatabase,
  getScenarioSummary,
  type CashflowGrid,
  type MonthlyCashflow,
} from '@/lib/calculations';
import type { FeaslyModelFormData } from '@/components/FeaslyModel/types';

export function useFeaslyCalculation(projectId: string | undefined) {
  const queryClient = useQueryClient();
  const [isCalculating, setIsCalculating] = useState(false);

  // Query to load existing cashflow data
  const {
    data: cashflowGrid,
    isLoading: isLoadingCashflow,
    error: loadError,
  } = useQuery({
    queryKey: ['feasly-cashflow', projectId],
    queryFn: () => (projectId ? loadCashflowFromDatabase(projectId) : null),
    enabled: !!projectId,
  });

  // Mutation to generate new cashflow
  const generateCashflowMutation = useMutation({
    mutationFn: async ({ formData, projectId }: { formData: FeaslyModelFormData; projectId: string }) => {
      return generateCashflowGrid(formData, projectId);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['feasly-cashflow', projectId], data);
      toast.success('Cashflow calculated successfully');
    },
    onError: (error) => {
      console.error('Failed to generate cashflow:', error);
      toast.error('Failed to calculate cashflow. Please try again.');
    },
  });

  // Calculate cashflow with form data
  const calculateCashflow = useCallback(
    async (formData: FeaslyModelFormData) => {
      if (!projectId) {
        toast.error('No project selected');
        return;
      }

      setIsCalculating(true);
      try {
        await generateCashflowMutation.mutateAsync({ formData, projectId });
      } finally {
        setIsCalculating(false);
      }
    },
    [projectId, generateCashflowMutation]
  );

  // Get scenario data
  const getScenarioData = useCallback(
    (scenario: 'base' | 'optimistic' | 'pessimistic' | 'custom'): MonthlyCashflow[] => {
      if (!cashflowGrid) return [];
      const data = cashflowGrid[scenario];
      return Array.isArray(data) ? data : [];
    },
    [cashflowGrid]
  );

  // Get summary data for a scenario
  const getScenarioSummaryLocal = useCallback(
    (scenario: 'base' | 'optimistic' | 'pessimistic' | 'custom') => {
      const data = getScenarioData(scenario);
      if (data.length === 0) return null;

      // Use the new modular calculation engine
      const summary = getScenarioSummary(data);
      
      // Additional calculations for compatibility
      const totalZakat = data.reduce((sum, month) => sum + month.zakatDue, 0);
      const totalVatPaid = data.reduce((sum, month) => sum + month.vatOnCosts, 0);
      const totalVatRecovered = data.reduce((sum, month) => sum + month.vatRecoverable, 0);

      return {
        totalCosts: summary.totalCosts,
        totalRevenue: summary.totalRevenue,
        totalProfit: summary.netProfit,
        profitMargin: summary.profitMargin,
        finalCashBalance: summary.finalCashBalance,
        totalZakat,
        totalVatPaid,
        totalVatRecovered,
        timelineMonths: data.length,
        irr: summary.irr,
        roi: summary.roi,
        paybackPeriod: summary.paybackPeriod,
      };
    },
    [getScenarioData]
  );

  // Compare scenarios
  const compareScenarios = useCallback(() => {
    const scenarios: ('base' | 'optimistic' | 'pessimistic' | 'custom')[] = ['base', 'optimistic', 'pessimistic', 'custom'];
    
    return scenarios.map(scenario => ({
      scenario,
      summary: getScenarioSummaryLocal(scenario),
      data: getScenarioData(scenario),
    })).filter(s => s.summary !== null);
  }, [getScenarioData, getScenarioSummaryLocal]);

  return {
    // Data
    cashflowGrid,
    
    // Loading states
    isLoadingCashflow,
    isCalculating: isCalculating || generateCashflowMutation.isPending,
    
    // Error states
    error: loadError || generateCashflowMutation.error,
    
    // Actions
    calculateCashflow,
    
    // Utilities
    getScenarioData,
    getScenarioSummary: getScenarioSummaryLocal,
    compareScenarios,
    
    // Status checks
    hasData: !!cashflowGrid,
    isEmpty: !cashflowGrid || Object.values(cashflowGrid).every(arr => arr.length === 0),
  };
}