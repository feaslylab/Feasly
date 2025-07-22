import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ScenarioOverride {
  id: string;
  project_id: string;
  scenario: string;
  field_name: string;
  override_value?: number;
  override_text?: string;
  created_at: string;
  updated_at: string;
}

export const useScenarioOverrides = (projectId: string, scenario: string = 'base') => {
  const [overrides, setOverrides] = useState<Record<string, ScenarioOverride>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchOverrides = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('scenario_overrides')
        .select('*')
        .eq('project_id', projectId)
        .eq('scenario', scenario);

      if (error) throw error;

      // Convert array to object keyed by field_name for easy access
      const overridesMap = (data || []).reduce((acc, override) => {
        acc[override.field_name] = override as unknown as ScenarioOverride;
        return acc;
      }, {} as Record<string, ScenarioOverride>);

      setOverrides(overridesMap);
    } catch (err) {
      console.error('Error fetching scenario overrides:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch scenario overrides');
    } finally {
      setIsLoading(false);
    }
  };

  const setOverride = async (fieldName: string, value: number | string | null) => {
    try {
      if (value === null || value === undefined || value === '') {
        // Remove override if value is null/empty
        return await removeOverride(fieldName);
      }

      const overrideData = {
        project_id: projectId,
        scenario,
        field_name: fieldName,
        override_value: typeof value === 'number' ? value : null,
        override_text: typeof value === 'string' ? value : null,
      };

      const { data, error } = await supabase
        .from('scenario_overrides')
        .upsert([overrideData], { 
          onConflict: 'project_id,scenario,field_name' 
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setOverrides(prev => ({
          ...prev,
          [fieldName]: data as unknown as ScenarioOverride
        }));
        
        toast({
          title: 'Override Applied',
          description: `${fieldName} has been overridden for ${scenario} scenario.`,
        });
      }

      return data;
    } catch (err) {
      console.error('Error setting override:', err);
      toast({
        title: 'Error',
        description: 'Failed to apply override. Please try again.',
        variant: 'destructive',
      });
      throw err;
    }
  };

  const removeOverride = async (fieldName: string) => {
    try {
      const { error } = await supabase
        .from('scenario_overrides')
        .delete()
        .eq('project_id', projectId)
        .eq('scenario', scenario)
        .eq('field_name', fieldName);

      if (error) throw error;

      setOverrides(prev => {
        const newOverrides = { ...prev };
        delete newOverrides[fieldName];
        return newOverrides;
      });

      toast({
        title: 'Override Removed',
        description: `${fieldName} override has been removed.`,
      });
    } catch (err) {
      console.error('Error removing override:', err);
      toast({
        title: 'Error',
        description: 'Failed to remove override. Please try again.',
        variant: 'destructive',
      });
      throw err;
    }
  };

  const getOverrideValue = (fieldName: string, originalValue: any): any => {
    const override = overrides[fieldName];
    if (!override) return originalValue;
    
    return override.override_value !== null ? override.override_value : override.override_text;
  };

  const isFieldOverridden = (fieldName: string): boolean => {
    return fieldName in overrides;
  };

  const getAllOverrides = (): ScenarioOverride[] => {
    return Object.values(overrides);
  };

  useEffect(() => {
    if (projectId && scenario) {
      fetchOverrides();
    }
  }, [projectId, scenario]);

  return {
    overrides,
    isLoading,
    error,
    setOverride,
    removeOverride,
    getOverrideValue,
    isFieldOverridden,
    getAllOverrides,
    refetch: fetchOverrides
  };
};