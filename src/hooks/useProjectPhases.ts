import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProjectPhase {
  id: string;
  project_id: string;
  phase_name: string;
  start_month: number;
  duration_months: number;
  cost_percentage: number;
  phase_order: number;
  created_at: string;
  updated_at: string;
}

export const useProjectPhases = (projectId: string) => {
  const [phases, setPhases] = useState<ProjectPhase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Default phases for new projects
  const DEFAULT_PHASES: Omit<ProjectPhase, 'id' | 'project_id' | 'created_at' | 'updated_at'>[] = [
    {
      phase_name: 'Foundation',
      start_month: 0,
      duration_months: 6,
      cost_percentage: 25,
      phase_order: 1
    },
    {
      phase_name: 'Structure',
      start_month: 6,
      duration_months: 12,
      cost_percentage: 50,
      phase_order: 2
    },
    {
      phase_name: 'Finishing',
      start_month: 18,
      duration_months: 8,
      cost_percentage: 25,
      phase_order: 3
    }
  ];

  const fetchPhases = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('project_phases')
        .select('*')
        .eq('project_id', projectId)
        .order('phase_order');

      if (error) throw error;

      // If no phases exist, create default phases
      if (!data || data.length === 0) {
        await createDefaultPhases();
      } else {
        setPhases(data);
      }
    } catch (err) {
      console.error('Error fetching phases:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch phases');
    } finally {
      setIsLoading(false);
    }
  };

  const createDefaultPhases = async () => {
    try {
      const phasesToInsert = DEFAULT_PHASES.map(phase => ({
        ...phase,
        project_id: projectId
      }));

      const { data, error } = await supabase
        .from('project_phases')
        .insert(phasesToInsert)
        .select();

      if (error) throw error;

      if (data) {
        setPhases(data);
      }
    } catch (err) {
      console.error('Error creating default phases:', err);
      setError(err instanceof Error ? err.message : 'Failed to create default phases');
    }
  };

  const addPhase = async (phaseData: Omit<ProjectPhase, 'id' | 'project_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('project_phases')
        .insert([{ ...phaseData, project_id: projectId }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setPhases(prev => [...prev, data].sort((a, b) => a.phase_order - b.phase_order));
        toast({
          title: 'Phase Added',
          description: `${phaseData.phase_name} has been added to the project.`,
        });
      }

      return data;
    } catch (err) {
      console.error('Error adding phase:', err);
      toast({
        title: 'Error',
        description: 'Failed to add phase. Please try again.',
        variant: 'destructive',
      });
      throw err;
    }
  };

  const updatePhase = async (phaseId: string, updates: Partial<ProjectPhase>) => {
    try {
      const { data, error } = await supabase
        .from('project_phases')
        .update(updates)
        .eq('id', phaseId)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setPhases(prev => 
          prev.map(phase => phase.id === phaseId ? data : phase)
            .sort((a, b) => a.phase_order - b.phase_order)
        );
        toast({
          title: 'Phase Updated',
          description: 'Phase has been updated successfully.',
        });
      }

      return data;
    } catch (err) {
      console.error('Error updating phase:', err);
      toast({
        title: 'Error',
        description: 'Failed to update phase. Please try again.',
        variant: 'destructive',
      });
      throw err;
    }
  };

  const deletePhase = async (phaseId: string) => {
    try {
      const { error } = await supabase
        .from('project_phases')
        .delete()
        .eq('id', phaseId);

      if (error) throw error;

      setPhases(prev => prev.filter(phase => phase.id !== phaseId));
      toast({
        title: 'Phase Deleted',
        description: 'Phase has been removed from the project.',
      });
    } catch (err) {
      console.error('Error deleting phase:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete phase. Please try again.',
        variant: 'destructive',
      });
      throw err;
    }
  };

  const validatePhases = (phasesToValidate: ProjectPhase[] = phases): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Check if percentages add up to 100
    const totalPercentage = phasesToValidate.reduce((sum, phase) => sum + phase.cost_percentage, 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
      errors.push(`Total cost percentage is ${totalPercentage.toFixed(1)}%. It should equal 100%.`);
    }

    // Check for overlapping phases
    const sortedPhases = [...phasesToValidate].sort((a, b) => a.start_month - b.start_month);
    for (let i = 0; i < sortedPhases.length - 1; i++) {
      const currentEnd = sortedPhases[i].start_month + sortedPhases[i].duration_months;
      const nextStart = sortedPhases[i + 1].start_month;
      if (currentEnd > nextStart) {
        errors.push(`Phase "${sortedPhases[i].phase_name}" overlaps with "${sortedPhases[i + 1].phase_name}".`);
      }
    }

    // Check for negative values
    phasesToValidate.forEach(phase => {
      if (phase.start_month < 0) {
        errors.push(`Phase "${phase.phase_name}" cannot start at a negative month.`);
      }
      if (phase.duration_months <= 0) {
        errors.push(`Phase "${phase.phase_name}" must have a positive duration.`);
      }
      if (phase.cost_percentage < 0 || phase.cost_percentage > 100) {
        errors.push(`Phase "${phase.phase_name}" cost percentage must be between 0% and 100%.`);
      }
    });

    return { isValid: errors.length === 0, errors };
  };

  useEffect(() => {
    if (projectId) {
      fetchPhases();
    }
  }, [projectId]);

  return {
    phases,
    isLoading,
    error,
    addPhase,
    updatePhase,
    deletePhase,
    validatePhases,
    refetch: fetchPhases
  };
};