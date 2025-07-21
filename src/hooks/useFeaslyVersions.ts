import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  generateCashflowGrid,
  loadCashflowFromDatabase,
  getProjectVersions,
  type CashflowGrid,
  type MonthlyCashflow,
} from '@/lib/feaslyCalculationEngine';
import type { FeaslyModelFormData } from '@/components/FeaslyModel/types';

export function useFeaslyVersions(projectId: string | undefined) {
  const queryClient = useQueryClient();
  const [selectedVersion, setSelectedVersion] = useState<string | undefined>();
  const [isCalculating, setIsCalculating] = useState(false);

  // Query to load available versions
  const {
    data: availableVersions = [],
    isLoading: isLoadingVersions,
  } = useQuery({
    queryKey: ['feasly-versions', projectId],
    queryFn: () => (projectId ? getProjectVersions(projectId) : []),
    enabled: !!projectId,
  });

  // Query to load cashflow data for selected version
  const {
    data: cashflowGrid,
    isLoading: isLoadingCashflow,
    error: loadError,
  } = useQuery({
    queryKey: ['feasly-cashflow', projectId, selectedVersion],
    queryFn: () => (projectId ? loadCashflowFromDatabase(projectId, selectedVersion) : null),
    enabled: !!projectId,
  });

  // Mutation to generate new cashflow with version
  const generateCashflowMutation = useMutation({
    mutationFn: async ({ 
      formData, 
      projectId, 
      versionLabel 
    }: { 
      formData: FeaslyModelFormData; 
      projectId: string; 
      versionLabel?: string;
    }) => {
      return generateCashflowGrid(formData, projectId, versionLabel);
    },
    onSuccess: (data) => {
      // Invalidate and refetch versions list
      queryClient.invalidateQueries({ queryKey: ['feasly-versions', projectId] });
      // Update current cashflow data
      queryClient.setQueryData(['feasly-cashflow', projectId, selectedVersion], data);
      toast.success('Cashflow calculated successfully');
    },
    onError: (error) => {
      console.error('Failed to generate cashflow:', error);
      toast.error('Failed to calculate cashflow. Please try again.');
    },
  });

  // Calculate cashflow with version label
  const calculateCashflow = useCallback(
    async (formData: FeaslyModelFormData, versionLabel?: string) => {
      if (!projectId) {
        toast.error('No project selected');
        return;
      }

      setIsCalculating(true);
      try {
        await generateCashflowMutation.mutateAsync({ formData, projectId, versionLabel });
      } finally {
        setIsCalculating(false);
      }
    },
    [projectId, generateCashflowMutation]
  );

  // Switch to a different version
  const switchToVersion = useCallback(
    (versionLabel: string | undefined) => {
      setSelectedVersion(versionLabel);
    },
    []
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
  const getScenarioSummary = useCallback(
    (scenario: 'base' | 'optimistic' | 'pessimistic' | 'custom') => {
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
    const scenarios: ('base' | 'optimistic' | 'pessimistic' | 'custom')[] = ['base', 'optimistic', 'pessimistic', 'custom'];
    
    return scenarios.map(scenario => ({
      scenario,
      summary: getScenarioSummary(scenario),
      data: getScenarioData(scenario),
    })).filter(s => s.summary !== null);
  }, [getScenarioData, getScenarioSummary]);

  return {
    // Data
    cashflowGrid,
    availableVersions,
    selectedVersion,
    currentVersionLabel: cashflowGrid?.version_label,
    
    // Loading states
    isLoadingCashflow,
    isLoadingVersions,
    isCalculating: isCalculating || generateCashflowMutation.isPending,
    
    // Error states
    error: loadError || generateCashflowMutation.error,
    
    // Actions
    calculateCashflow,
    switchToVersion,
    
    // Utilities
    getScenarioData,
    getScenarioSummary,
    compareScenarios,
    
    // Status checks
    hasData: !!cashflowGrid,
    isEmpty: !cashflowGrid || Object.values(cashflowGrid).filter(item => Array.isArray(item)).every(arr => arr.length === 0),
  };
}