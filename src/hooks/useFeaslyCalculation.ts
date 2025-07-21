import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  generateCashflowGrid,
  loadCashflowFromDatabase,
  type CashflowGrid,
  type MonthlyCashflow,
} from '@/lib/feaslyCalculationEngine';
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
    (scenario: keyof CashflowGrid): MonthlyCashflow[] => {
      return cashflowGrid?.[scenario] || [];
    },
    [cashflowGrid]
  );

  // Get summary data for a scenario
  const getScenarioSummary = useCallback(
    (scenario: keyof CashflowGrid) => {
      const data = getScenarioData(scenario);
      if (data.length === 0) return null;

      const lastMonth = data[data.length - 1];
      const totalCosts = data.reduce((sum, month) => 
        sum + month.constructionCost + month.landCost + month.softCosts, 0
      );
      const totalRevenue = data.reduce((sum, month) => sum + month.revenue, 0);
      const totalProfit = totalRevenue - totalCosts;
      const totalZakat = data.reduce((sum, month) => sum + month.zakatDue, 0);
      const totalVatPaid = data.reduce((sum, month) => sum + month.vatOnCosts, 0);
      const totalVatRecovered = data.reduce((sum, month) => sum + month.vatRecoverable, 0);

      return {
        totalCosts,
        totalRevenue,
        totalProfit,
        profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
        finalCashBalance: lastMonth.cashBalance,
        totalZakat,
        totalVatPaid,
        totalVatRecovered,
        timelineMonths: data.length,
      };
    },
    [getScenarioData]
  );

  // Compare scenarios
  const compareScenarios = useCallback(() => {
    const scenarios: (keyof CashflowGrid)[] = ['base', 'optimistic', 'pessimistic', 'custom'];
    
    return scenarios.map(scenario => ({
      scenario,
      summary: getScenarioSummary(scenario),
      data: getScenarioData(scenario),
    })).filter(s => s.summary !== null);
  }, [getScenarioData, getScenarioSummary]);

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
    getScenarioSummary,
    compareScenarios,
    
    // Status checks
    hasData: !!cashflowGrid,
    isEmpty: !cashflowGrid || Object.values(cashflowGrid).every(arr => arr.length === 0),
  };
}