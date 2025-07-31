import { useState, useEffect } from 'react';
import { getCachedScenarioResult } from '@/services/scenario';
import type { ScenarioResult } from '@/services/scenario';

export function useScenarioResults(projectId: string | null, scenarioId: string | null) {
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!projectId || !scenarioId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const cachedResult = await getCachedScenarioResult(projectId, scenarioId);
        
        if (cachedResult) {
          setResult(cachedResult);
        } else {
          setResult(null);
        }
      } catch (err) {
        console.error('Error fetching scenario results:', err);
        setError(err instanceof Error ? err.message : 'Failed to load results');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [projectId, scenarioId]);

  return {
    result,
    isLoading,
    error,
  };
}