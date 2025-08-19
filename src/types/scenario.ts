export interface Scenario {
  id: string; // e.g. 'baseline', 'optimistic', 'pessimistic'
  name: string; // Display name
  createdAt: string; // ISO timestamp
  clonedFrom?: string; // ID of source scenario if cloned
}

export type ScenarioId = string;

export interface ScenarioData {
  scenario: Scenario;
  inputs?: any; // Engine inputs for this scenario
  lastModified: string;
}