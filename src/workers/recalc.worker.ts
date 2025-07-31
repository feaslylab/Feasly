import { recalculateScenario, type ScenarioInput, type ScenarioResult } from '@/services/scenario';

export interface WorkerMessage {
  type: 'RECALCULATE';
  payload: {
    projectId: string;
    scenarioId: string;
    scenario: ScenarioInput;
  };
}

export interface WorkerResponse {
  type: 'CALCULATION_COMPLETE' | 'CALCULATION_ERROR';
  payload: ScenarioResult | { error: string };
}

self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { type, payload } = event.data;

  if (type === 'RECALCULATE') {
    try {
      console.log('Worker: Starting scenario recalculation');
      const result = await recalculateScenario(
        payload.projectId,
        payload.scenarioId,
        payload.scenario
      );
      
      const response: WorkerResponse = {
        type: 'CALCULATION_COMPLETE',
        payload: result
      };
      
      self.postMessage(response);
      
    } catch (error) {
      console.error('Worker: Calculation error:', error);
      
      const response: WorkerResponse = {
        type: 'CALCULATION_ERROR',
        payload: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
      
      self.postMessage(response);
    }
  }
};

export default null;