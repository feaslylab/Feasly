import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ComparisonData {
  scenarioId: string;
  scenarioName: string;
  kpis: any;
  error?: string;
}

interface UseScenarioComparisonResult {
  compareScenarios: (projectId: string, scenarioIds: string[]) => Promise<ComparisonData[]>;
  isLoading: boolean;
  error: string | null;
}

export function useScenarioComparison(): UseScenarioComparisonResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const compareScenarios = useCallback(async (
    projectId: string, 
    scenarioIds: string[]
  ): Promise<ComparisonData[]> => {
    if (!projectId || scenarioIds.length === 0) {
      throw new Error('Project ID and scenario IDs are required');
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('compare', {
        body: {
          projectId,
          scenarioIds
        }
      });

      if (error) {
        throw error;
      }

      if (!data || !data.comparisons) {
        throw new Error('Invalid response format');
      }

      return data.comparisons;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      
      toast({
        title: 'Comparison Failed',
        description: errorMessage,
        variant: 'destructive'
      });
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    compareScenarios,
    isLoading,
    error
  };
}