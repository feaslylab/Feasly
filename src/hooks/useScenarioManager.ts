import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  loadScenarios, 
  createScenario, 
  updateScenario, 
  deleteScenario,
  loadScenarioInputs,
  saveScenarioInputs
} from '@/lib/storage/scenarioStorage';
import { Scenario, ScenarioId } from '@/types/scenario';

export function useScenarioManager(projectId: string | null) {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [currentScenarioId, setCurrentScenarioId] = useState<ScenarioId>('baseline');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load scenarios on mount or project change
  useEffect(() => {
    if (!projectId) {
      setScenarios([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const loadedScenarios = loadScenarios(projectId);
      setScenarios(loadedScenarios);
      
      // Ensure current scenario exists
      if (!loadedScenarios.find(s => s.id === currentScenarioId)) {
        setCurrentScenarioId('baseline');
      }
    } catch (error) {
      console.error('Failed to load scenarios:', error);
      toast({
        title: "Error loading scenarios",
        description: "Failed to load project scenarios",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [projectId, currentScenarioId, toast]);

  const refreshScenarios = useCallback(() => {
    if (!projectId) return;
    
    const loadedScenarios = loadScenarios(projectId);
    setScenarios(loadedScenarios);
  }, [projectId]);

  const createNewScenario = useCallback(async (name: string, cloneFromId?: string): Promise<Scenario | null> => {
    if (!projectId) return null;

    try {
      // Validate name
      if (!name.trim()) {
        toast({
          title: "Invalid name",
          description: "Scenario name cannot be empty",
          variant: "destructive"
        });
        return null;
      }

      // Check for duplicate names
      if (scenarios.some(s => s.name.toLowerCase() === name.toLowerCase())) {
        toast({
          title: "Duplicate name",
          description: "A scenario with this name already exists",
          variant: "destructive"
        });
        return null;
      }

      const newScenario = createScenario(projectId, name, cloneFromId);
      refreshScenarios();
      
      toast({
        title: "Scenario created",
        description: `Created scenario "${name}"${cloneFromId ? ` cloned from existing scenario` : ''}`,
      });

      return newScenario;
    } catch (error) {
      console.error('Failed to create scenario:', error);
      toast({
        title: "Error creating scenario",
        description: "Failed to create new scenario",
        variant: "destructive"
      });
      return null;
    }
  }, [projectId, scenarios, refreshScenarios, toast]);

  const renameScenario = useCallback(async (scenarioId: string, newName: string): Promise<boolean> => {
    if (!projectId) return false;

    try {
      if (!newName.trim()) {
        toast({
          title: "Invalid name",
          description: "Scenario name cannot be empty",
          variant: "destructive"
        });
        return false;
      }

      // Check for duplicate names (excluding current scenario)
      if (scenarios.some(s => s.id !== scenarioId && s.name.toLowerCase() === newName.toLowerCase())) {
        toast({
          title: "Duplicate name",
          description: "A scenario with this name already exists",
          variant: "destructive"
        });
        return false;
      }

      const success = updateScenario(projectId, scenarioId, { name: newName });
      
      if (success) {
        refreshScenarios();
        toast({
          title: "Scenario renamed",
          description: `Renamed scenario to "${newName}"`,
        });
      }

      return success;
    } catch (error) {
      console.error('Failed to rename scenario:', error);
      toast({
        title: "Error renaming scenario",
        description: "Failed to rename scenario",
        variant: "destructive"
      });
      return false;
    }
  }, [projectId, scenarios, refreshScenarios, toast]);

  const removeScenario = useCallback(async (scenarioId: string): Promise<boolean> => {
    if (!projectId) return false;

    try {
      if (scenarioId === 'baseline') {
        toast({
          title: "Cannot delete baseline",
          description: "The baseline scenario cannot be deleted",
          variant: "destructive"
        });
        return false;
      }

      const success = deleteScenario(projectId, scenarioId);
      
      if (success) {
        // Switch to baseline if we deleted the current scenario
        if (currentScenarioId === scenarioId) {
          setCurrentScenarioId('baseline');
        }
        
        refreshScenarios();
        toast({
          title: "Scenario deleted",
          description: "Scenario has been deleted",
        });
      }

      return success;
    } catch (error) {
      console.error('Failed to delete scenario:', error);
      toast({
        title: "Error deleting scenario",
        description: "Failed to delete scenario",
        variant: "destructive"
      });
      return false;
    }
  }, [projectId, currentScenarioId, refreshScenarios, toast]);

  const switchScenario = useCallback((scenarioId: string) => {
    if (scenarios.find(s => s.id === scenarioId)) {
      setCurrentScenarioId(scenarioId);
    }
  }, [scenarios]);

  const loadInputsForScenario = useCallback((scenarioId: string) => {
    if (!projectId) return null;
    return loadScenarioInputs(projectId, scenarioId);
  }, [projectId]);

  const saveInputsForScenario = useCallback((scenarioId: string, inputs: any) => {
    if (!projectId) return;
    saveScenarioInputs(projectId, scenarioId, inputs);
  }, [projectId]);

  const currentScenario = scenarios.find(s => s.id === currentScenarioId) || scenarios[0];

  return {
    scenarios,
    currentScenario,
    currentScenarioId,
    loading,
    switchScenario,
    createNewScenario,
    renameScenario,
    removeScenario,
    loadInputsForScenario,
    saveInputsForScenario,
    refreshScenarios
  };
}