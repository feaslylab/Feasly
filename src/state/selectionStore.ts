import { create } from "zustand";

interface SelectionState {
  projectId:  string|null;
  setProject: (id: string|null)=>void;
  scenarioId: string|null;
  setScenario:(id: string|null)=>void;
}

export const useSelectionStore = create<SelectionState>((set)=>({
  projectId:  null,
  scenarioId: null,
  setProject:  (id)=>set({ projectId:id,  scenarioId:null }), // reset scenario
  setScenario: (id)=>set({ scenarioId:id }),
}));