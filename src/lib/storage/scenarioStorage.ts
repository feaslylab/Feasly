import { Scenario, ScenarioData, ScenarioId } from '@/types/scenario';

/**
 * Scenario storage utilities using localStorage with project/scenario isolation
 */

// Storage key generators
export const getScenarioListKey = (projectId: string) => `scenarios:${projectId}`;
export const getScenarioInputsKey = (projectId: string, scenarioId: string) => `inputs:${projectId}:${scenarioId}`;
export const getScenarioAutosaveKey = (projectId: string, scenarioId: string) => `autosave:${projectId}:${scenarioId}`;
export const getScenarioSnapshotKey = (projectId: string, scenarioId: string, snapshotId: string) => 
  `snapshot:${projectId}:${scenarioId}:${snapshotId}`;

// Scenario CRUD operations
export function loadScenarios(projectId: string): Scenario[] {
  try {
    const stored = localStorage.getItem(getScenarioListKey(projectId));
    if (!stored) {
      // Create default baseline scenario
      const baseline: Scenario = {
        id: 'baseline',
        name: 'Baseline',
        createdAt: new Date().toISOString()
      };
      saveScenarios(projectId, [baseline]);
      return [baseline];
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load scenarios:', error);
    return [{
      id: 'baseline',
      name: 'Baseline', 
      createdAt: new Date().toISOString()
    }];
  }
}

export function saveScenarios(projectId: string, scenarios: Scenario[]): void {
  try {
    localStorage.setItem(getScenarioListKey(projectId), JSON.stringify(scenarios));
  } catch (error) {
    console.error('Failed to save scenarios:', error);
  }
}

export function createScenario(projectId: string, name: string, clonedFrom?: string): Scenario {
  const scenarios = loadScenarios(projectId);
  
  // Generate unique ID
  const id = name.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 20) + '_' + Date.now();
  
  const scenario: Scenario = {
    id,
    name,
    createdAt: new Date().toISOString(),
    clonedFrom
  };
  
  // Clone inputs if source scenario specified
  if (clonedFrom) {
    try {
      const sourceInputs = loadScenarioInputs(projectId, clonedFrom);
      if (sourceInputs) {
        saveScenarioInputs(projectId, id, sourceInputs);
      }
    } catch (error) {
      console.error('Failed to clone scenario inputs:', error);
    }
  }
  
  scenarios.push(scenario);
  saveScenarios(projectId, scenarios);
  
  return scenario;
}

export function updateScenario(projectId: string, scenarioId: string, updates: Partial<Scenario>): boolean {
  try {
    const scenarios = loadScenarios(projectId);
    const index = scenarios.findIndex(s => s.id === scenarioId);
    
    if (index === -1) return false;
    
    scenarios[index] = { ...scenarios[index], ...updates };
    saveScenarios(projectId, scenarios);
    return true;
  } catch (error) {
    console.error('Failed to update scenario:', error);
    return false;
  }
}

export function deleteScenario(projectId: string, scenarioId: string): boolean {
  try {
    // Don't allow deleting baseline
    if (scenarioId === 'baseline') return false;
    
    const scenarios = loadScenarios(projectId);
    const filtered = scenarios.filter(s => s.id !== scenarioId);
    
    if (filtered.length === scenarios.length) return false; // Not found
    
    saveScenarios(projectId, filtered);
    
    // Clean up related storage
    clearScenarioData(projectId, scenarioId);
    
    return true;
  } catch (error) {
    console.error('Failed to delete scenario:', error);
    return false;
  }
}

// Input storage operations
export function loadScenarioInputs(projectId: string, scenarioId: string): any | null {
  try {
    const stored = localStorage.getItem(getScenarioInputsKey(projectId, scenarioId));
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to load scenario inputs:', error);
    return null;
  }
}

export function saveScenarioInputs(projectId: string, scenarioId: string, inputs: any): void {
  try {
    localStorage.setItem(getScenarioInputsKey(projectId, scenarioId), JSON.stringify(inputs));
  } catch (error) {
    console.error('Failed to save scenario inputs:', error);
  }
}

// Cleanup operations
export function clearScenarioData(projectId: string, scenarioId: string): void {
  try {
    // Remove inputs, autosave, and any snapshots for this scenario
    localStorage.removeItem(getScenarioInputsKey(projectId, scenarioId));
    localStorage.removeItem(getScenarioAutosaveKey(projectId, scenarioId));
    
    // Find and remove all snapshots for this scenario
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(`snapshot:${projectId}:${scenarioId}:`)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Failed to clear scenario data:', error);
  }
}

export function getAllScenarioKeys(projectId: string): string[] {
  const keys: string[] = [];
  Object.keys(localStorage).forEach(key => {
    if (key.includes(`:${projectId}:`)) {
      keys.push(key);
    }
  });
  return keys;
}