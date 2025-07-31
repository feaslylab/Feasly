import { useCallback, useEffect, useRef, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import type { ScenarioInput, ScenarioResult } from '@/services/scenario';
import type { WorkerMessage, WorkerResponse } from '@/workers/recalc.worker';

export function useScenarioCalculation(projectId: string | null, scenarioId: string | null) {
  const workerRef = useRef<Worker | null>(null);
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Debounced calculation trigger
  const [pendingScenario, setPendingScenario] = useState<ScenarioInput | null>(null);
  const debouncedScenario = useDebounce(pendingScenario, 400);

  // Initialize worker
  useEffect(() => {
    const worker = new Worker(
      new URL('../workers/recalc.worker.ts', import.meta.url),
      { type: 'module' }
    );
    
    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const { type, payload } = event.data;
      
      if (type === 'CALCULATION_COMPLETE') {
        setResult(payload as ScenarioResult);
        setIsCalculating(false);
        setError(null);
      } else if (type === 'CALCULATION_ERROR') {
        setError((payload as { error: string }).error);
        setIsCalculating(false);
      }
    };
    
    worker.onerror = (error) => {
      console.error('Worker error:', error);
      setError('Calculation worker error');
      setIsCalculating(false);
    };
    
    workerRef.current = worker;
    
    return () => {
      worker.terminate();
    };
  }, []);

  // Trigger calculation when debounced scenario changes
  useEffect(() => {
    if (debouncedScenario && projectId && scenarioId && workerRef.current) {
      setIsCalculating(true);
      setError(null);
      
      const message: WorkerMessage = {
        type: 'RECALCULATE',
        payload: {
          projectId,
          scenarioId,
          scenario: debouncedScenario
        }
      };
      
      workerRef.current.postMessage(message);
    }
  }, [debouncedScenario, projectId, scenarioId]);

  const calculateScenario = useCallback((scenario: ScenarioInput) => {
    setPendingScenario(scenario);
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
    setPendingScenario(null);
  }, []);

  return {
    result,
    isCalculating,
    error,
    calculateScenario,
    clearResult
  };
}