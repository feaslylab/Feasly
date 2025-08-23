/**
 * Hook for managing consolidation mode functionality
 * Handles child project management and consolidated calculations
 */

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  ConsolidatedResult, 
  ChildProjectMetrics, 
  ConsolidationSettings
} from '@/types/consolidation';
import { consolidateProjects, DEFAULT_CONSOLIDATION_SETTINGS } from '@/lib/consolidation/consolidationEngine';
import { KPIMetrics } from '@/components/results/KPIOverviewPanel';
import { useToast } from '@/hooks/use-toast';

interface UseConsolidationProps {
  projectId: string;
  enabled?: boolean;
}

export function useConsolidation({ projectId, enabled = true }: UseConsolidationProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch parent project to check if it's a consolidation project
  const { data: parentProject } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, project_type, consolidation_settings')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: enabled && !!projectId
  });

  const isConsolidationProject = parentProject?.project_type === 'consolidation';

  // Fetch child projects if this is a consolidation project
  const { data: childProjects, isLoading: isLoadingChildren } = useQuery({
    queryKey: ['child-projects', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          id, 
          name, 
          description,
          start_date,
          end_date,
          currency_code,
          gfa_residential,
          gfa_retail,
          gfa_office
        `)
        .eq('parent_project_id', projectId);

      if (error) throw error;
      return data || [];
    },
    enabled: enabled && isConsolidationProject
  });

  // Get consolidation settings
  const consolidationSettings: ConsolidationSettings = useMemo(() => {
    if (!parentProject?.consolidation_settings || typeof parentProject.consolidation_settings !== 'object') {
      return DEFAULT_CONSOLIDATION_SETTINGS;
    }
    
    return {
      ...DEFAULT_CONSOLIDATION_SETTINGS,
      ...(parentProject.consolidation_settings as Partial<ConsolidationSettings>)
    };
  }, [parentProject?.consolidation_settings]);

  // Fetch KPIs for each child project
  const { data: childKPIs, isLoading: isLoadingKPIs } = useQuery({
    queryKey: ['child-kpis', childProjects?.map(p => p.id)],
    queryFn: async () => {
      if (!childProjects?.length) return [];

      const kpiPromises = childProjects.map(async (project) => {
        // Fetch latest KPI snapshot for each child project
        const { data: kpiData, error } = await supabase
          .from('kpi_snapshot')
          .select('*')
          .eq('project_id', project.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') { // Not found error is acceptable
          console.warn(`Failed to fetch KPIs for project ${project.id}:`, error);
        }

        // Calculate total GFA
        const totalGFA = (project.gfa_residential || 0) + 
                        (project.gfa_retail || 0) + 
                        (project.gfa_office || 0);

        return {
          projectId: project.id,
          name: project.name,
          metrics: kpiData ? {
            npv: kpiData.npv,
            irr_pa: kpiData.irr || 0,
            equity_multiple: 0, // TODO: Calculate from KPI data
            profit_pct: 0, // TODO: Calculate from KPI data
            project_value: 0, // TODO: Calculate from KPI data
            total_cost: 0, // TODO: Calculate from KPI data
            roi: 0 // TODO: Calculate from KPI data
          } as KPIMetrics : {
            npv: 0,
            irr_pa: 0,
            equity_multiple: 0,
            profit_pct: 0,
            project_value: 0,
            total_cost: 0,
            roi: 0
          } as KPIMetrics,
          warnings: [], // TODO: Fetch warnings from child projects
          contribution: {
            revenue: 0, // TODO: Calculate from project data
            cost: 0, // TODO: Calculate from project data
            equity: 0, // TODO: Calculate from project data
            gfa: totalGFA
          }
        } as ChildProjectMetrics;
      });

      return Promise.all(kpiPromises);
    },
    enabled: enabled && !!childProjects?.length
  });

  // Calculate consolidated result
  const consolidatedResult: ConsolidatedResult | null = useMemo(() => {
    if (!isConsolidationProject || !childKPIs?.length) {
      return null;
    }

    return consolidateProjects(childKPIs, consolidationSettings);
  }, [isConsolidationProject, childKPIs, consolidationSettings]);

  // Mutation to update consolidation settings
  const updateConsolidationSettings = useMutation({
    mutationFn: async (newSettings: Partial<ConsolidationSettings>) => {
      const { error } = await supabase
        .from('projects')
        .update({
          consolidation_settings: {
            ...consolidationSettings,
            ...newSettings
          }
        })
        .eq('id', projectId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast({
        title: "Settings Updated",
        description: "Consolidation settings have been saved successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update consolidation settings.",
        variant: "destructive"
      });
      console.error('Failed to update consolidation settings:', error);
    }
  });

  // Mutation to add child project
  const addChildProject = useMutation({
    mutationFn: async (childProjectData: {
      name: string;
      description?: string;
      start_date?: string;
      end_date?: string;
    }) => {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...childProjectData,
          parent_project_id: projectId,
          project_type: 'normal',
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['child-projects', projectId] });
      toast({
        title: "Child Project Added",
        description: "New child project has been created successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Creation Failed",
        description: "Failed to create child project.",
        variant: "destructive"
      });
      console.error('Failed to add child project:', error);
    }
  });

  // Mutation to remove child project
  const removeChildProject = useMutation({
    mutationFn: async (childProjectId: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', childProjectId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['child-projects', projectId] });
      toast({
        title: "Child Project Removed",
        description: "Child project has been deleted successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Deletion Failed",
        description: "Failed to delete child project.",
        variant: "destructive"
      });
      console.error('Failed to remove child project:', error);
    }
  });

  return {
    // State
    isConsolidationProject,
    childProjects: childProjects || [],
    consolidatedResult,
    consolidationSettings,
    
    // Loading states
    isLoading: isLoadingChildren || isLoadingKPIs,
    isLoadingChildren,
    isLoadingKPIs,
    
    // Mutations
    updateConsolidationSettings: updateConsolidationSettings.mutate,
    addChildProject: addChildProject.mutate,
    removeChildProject: removeChildProject.mutate,
    
    // Mutation states
    isUpdatingSettings: updateConsolidationSettings.isPending,
    isAddingChild: addChildProject.isPending,
    isRemovingChild: removeChildProject.isPending
  };
}